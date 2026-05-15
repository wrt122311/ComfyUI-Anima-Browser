import os
import json
import requests
from concurrent.futures import ThreadPoolExecutor

CDN_BASE = "https://cdn.mooshieblob.com"
RELEASE = "20260325_anima_all_artists"
MANIFEST_URL = f"{CDN_BASE}/{RELEASE}/indices/manifest.json"


class AnimaDataManager:
    def __init__(self):
        base = os.path.dirname(os.path.abspath(__file__))
        self.cache_dir = os.path.join(base, "cache")
        self.images_dir = os.path.join(self.cache_dir, "images")
        os.makedirs(self.images_dir, exist_ok=True)

        self.manifest = None
        self.artists = []
        self.loaded = False
        self.loading = False
        self.shard_count = 0
        self.total_count = 0
        self.error = None
        self._progress = {"current": 0, "total": 0, "status": "idle"}

        self._executor = ThreadPoolExecutor(max_workers=4)
        self._search_cache = {}
        self._search_cache_order = []
        self._search_cache_limit = 128
        self._load_manifest()
        self._try_load_cache()

    def _clear_search_cache(self):
        self._search_cache.clear()
        self._search_cache_order.clear()

    def _normalize_query(self, search):
        return search.lower().replace(" ", "_") if search else ""

    def _prepare_artists(self, artists):
        for artist in artists:
            slug = artist.get("slug", "")
            artist["_slug_l"] = slug.lower()
        return artists

    def _cache_get_filtered(self, cache_key):
        if cache_key in self._search_cache:
            try:
                self._search_cache_order.remove(cache_key)
            except ValueError:
                pass
            self._search_cache_order.append(cache_key)
            return self._search_cache[cache_key]
        return None

    def _cache_find_best_prefix_base(self, query):
        if not query:
            return self.artists

        best = None
        best_len = -1
        for key in self._search_cache_order:
            key_query = key[0]
            if key_query and query.startswith(key_query) and len(key_query) > best_len:
                best = self._search_cache.get(key)
                best_len = len(key_query)
        return best

    def _cache_set_filtered(self, cache_key, filtered):
        if cache_key in self._search_cache:
            try:
                self._search_cache_order.remove(cache_key)
            except ValueError:
                pass
        self._search_cache[cache_key] = filtered
        self._search_cache_order.append(cache_key)

        while len(self._search_cache_order) > self._search_cache_limit:
            old_key = self._search_cache_order.pop(0)
            self._search_cache.pop(old_key, None)

    # ---------------------------------------------------------------
    # paths
    # ---------------------------------------------------------------
    def _cache_path(self, name):
        return os.path.join(self.cache_dir, name)

    # ---------------------------------------------------------------
    # manifest (always loaded, < 2 KB)
    # ---------------------------------------------------------------
    def _load_manifest(self):
        cache_path = self._cache_path("manifest.json")
        try:
            if os.path.exists(cache_path):
                with open(cache_path, "r", encoding="utf-8") as f:
                    self.manifest = json.load(f)
            else:
                resp = requests.get(MANIFEST_URL, timeout=15)
                resp.raise_for_status()
                self.manifest = resp.json()
                with open(cache_path, "w", encoding="utf-8") as f:
                    json.dump(self.manifest, f)
        except Exception as e:
            self.error = f"Failed to load manifest: {e}"
            return

        self.total_count = self.manifest.get("artistCount", 0)
        self.shard_count = len(self.manifest.get("shards", []))

    # ---------------------------------------------------------------
    # cache
    # ---------------------------------------------------------------
    def _try_load_cache(self):
        path = self._cache_path("artists.json")
        if not os.path.exists(path):
            return  # don't auto-download, wait for user action

        try:
            with open(path, "r", encoding="utf-8") as f:
                self.artists = self._prepare_artists(json.load(f))
            self._clear_search_cache()
            self.loaded = True
            self._progress = {
                "current": len(self.artists),
                "total": len(self.artists),
                "status": "ready",
            }
        except Exception:
            self.error = None  # stale cache, will re-download on demand

    # ---------------------------------------------------------------
    # download  (triggered by user opening the browser)
    # ---------------------------------------------------------------
    def _start_download(self):
        if self.loading or self.loaded:
            return
        if not self.manifest:
            self._load_manifest()
            if not self.manifest:
                return
        self.loading = True
        self._progress["status"] = "downloading"
        self._progress["total"] = self.manifest.get("artistCount", 0)
        self._executor.submit(self._download_data)

    def _download_data(self):
        try:
            shards = self.manifest.get("shards", [])
            artists = []
            for shard in shards:
                shard_url = f"{CDN_BASE}/{RELEASE}/indices/{shard['path']}"
                r = requests.get(shard_url, timeout=30)
                r.raise_for_status()
                data = r.json()
                for _, entry in data.get("entries", {}).items():
                    artists.append(
                        {
                            "slug": entry["slug"],
                            "tag": entry["tag"],
                            "imageId": entry["imageId"],
                            "imageUrl": entry.get(
                                "imageUrl",
                                f"{CDN_BASE}/{RELEASE}/images/{entry['imageId']}.webp",
                            ),
                            "postCount": entry.get("postCount", 0),
                        }
                    )
                self._progress["current"] += shard.get("count", 0)

            artists.sort(key=lambda x: x["postCount"], reverse=True)
            self.artists = self._prepare_artists(artists)
            self._clear_search_cache()

            with open(self._cache_path("artists.json"), "w", encoding="utf-8") as f:
                json.dump(artists, f, ensure_ascii=False)

            self.loaded = True
            self._progress["status"] = "ready"
        except Exception as e:
            self.error = str(e)
            self._progress["status"] = "error"
        finally:
            self.loading = False

    # ---------------------------------------------------------------
    # API helpers
    # ---------------------------------------------------------------
    def get_artists(self, page, size, search, fav_only, favs):
        if not self.loaded:
            return {
                "artists": [],
                "total": 0,
                "loaded": False,
                "loading": self.loading,
                "progress": self._progress,
                "shardCount": self.shard_count,
            }

        q = self._normalize_query(search)
        cache_key = (q,)

        filtered = self._cache_get_filtered(cache_key)
        if filtered is None:
            filtered = self._cache_find_best_prefix_base(q) or self.artists
            if q:
                filtered = [a for a in filtered if q in a["_slug_l"]]

            self._cache_set_filtered(cache_key, filtered)

        if fav_only and favs:
            fav_set = set(favs)
            filtered = [a for a in filtered if a["slug"] in fav_set]

        total = len(filtered)
        start = (page - 1) * size
        end = start + size

        page_items = [
            {
                "slug": a["slug"],
                "tag": a["tag"],
                "imageId": a["imageId"],
                "imageUrl": a.get("imageUrl"),
                "postCount": a.get("postCount", 0),
            }
            for a in filtered[start:end]
        ]

        return {
            "artists": page_items,
            "total": total,
            "page": page,
            "size": size,
            "totalPages": max(1, (total + size - 1) // size),
            "loaded": True,
            "progress": self._progress,
            "shardCount": self.shard_count,
        }

    def get_image(self, image_id):
        cache_path = os.path.join(self.images_dir, image_id)
        if not os.path.exists(cache_path):
            try:
                url = f"{CDN_BASE}/{RELEASE}/images/{image_id}"
                resp = requests.get(url, timeout=30)
                resp.raise_for_status()
                with open(cache_path, "wb") as f:
                    f.write(resp.content)
            except Exception:
                return None
        return cache_path

    def progress(self):
        return self._progress

    def get_tag_by_slug(self, slug):
        if not hasattr(self, "_slug_to_tag"):
            self._slug_to_tag = {a["slug"]: a["tag"] for a in self.artists}
        return self._slug_to_tag.get(slug, "")


data_manager = AnimaDataManager()
