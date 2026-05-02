import { app } from "../../scripts/app.js";
import { calculateVisiblePageSize } from "./layout.js";

// ---------------------------------------------------------------
// CSS (injected once)
// ---------------------------------------------------------------
const STYLE_ID = "anima-node-styles-v3";
function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `
.anima-node-inner {
  width: 100%; height: 100%; display: flex; flex-direction: column;
  background: #1a1a2e; box-sizing: border-box; overflow: hidden;
  font-family: sans-serif;
}
/* header */
.anima-hdr {
  display: flex; gap: 5px; align-items: center; flex-wrap: wrap;
  padding: 5px 6px; flex-shrink: 0;
  background: #222236; border-bottom: 1px solid #333;
}
.anima-hdr input {
  flex:1; min-width: 60px; padding: 5px 10px;
  background: #2a2a3e; border:1px solid #444; border-radius: 5px;
  color: #ccc; font-size: 12px; outline: none;
}
.anima-hdr input:focus { border-color: #6c8cff; }
.anima-hdr button {
  padding: 4px 10px; background: #2a2a3e;
  border: 1px solid #444; border-radius: 4px;
  color: #ccc; cursor: pointer; font-size: 12px;
  white-space: nowrap; line-height: 1.2;
}
.anima-hdr button:hover { background: #3a3a4e; }
.anima-hdr button.active { background: #4a5a8e; border-color: #6c8cff; }
.anima-hdr .anima-total {
  color: #888; font-size: 11px; white-space: nowrap;
  min-width: 0; overflow: hidden; text-overflow: ellipsis;
}
/* progress */
.anima-progress-row {
  display: flex; align-items: center; gap: 8px;
  padding: 4px 6px; flex-shrink: 0; background: #1a1a2e; display: none;
}
.anima-progress { width: 100%; height: 8px; }
.anima-progress-lbl { font-size: 11px; color: #888; }
/* main */
.anima-main {
  display: flex; flex: 1; overflow: hidden; min-height: 0;
}
.anima-grid {
  flex: 1; overflow: auto; padding: 6px; min-height: 0;
  display: grid;
  grid-template-columns: repeat(var(--anima-cols, 2), minmax(0, 1fr));
  gap: 5px; align-content: start;
  scrollbar-width: none; /* hide standard scrollbar */
}
.anima-grid::-webkit-scrollbar { display: none; }

/* card */
.anima-card {
  background: #27273a; border-radius: 6px; overflow: hidden;
  cursor: pointer; border: 2px solid transparent;
  position: relative; transition: transform .1s;
}
.anima-card:hover { transform: translateY(-1px); }
.anima-card.sel { border-color: #6c8cff !important; background: #1e1e40; }
.anima-sel-mark {
  display: none;
  position: absolute; bottom: 0; right: 0; z-index: 5;
  padding: 1px 5px 2px; background: #6c8cff;
  border-top-left-radius: 5px;
  color: #fff; font-size: 11px; font-weight: bold;
  pointer-events: none;
}
.anima-card.sel .anima-sel-mark { display: block; }
.anima-card img {
  width: 100%; aspect-ratio: 1 / 1; object-fit: contain;
  display: block; background: #1a1a2e;
}
.anima-card .card-body { padding: 3px 6px 5px; }
.anima-card .card-tag {
  color: #bbb; font-size: 10px; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}
.anima-card .card-count { color: #777; font-size: 9px; }
.anima-heart {
  position: absolute; top: 2px; right: 2px; z-index: 2;
  background: none; border: none; cursor: pointer;
  font-size: 14px; padding: 1px 3px; line-height: 1;
}
.anima-check {
  position: absolute; top: 2px; left: 2px; z-index: 2;
  width: 14px; height: 14px; accent-color: #6c8cff; margin: 0;
}
/* scrollbar */
.anima-scrollbar {
  width: 12px; background: #1e1e30;
  position: relative; flex-shrink: 0; cursor: pointer;
}
.anima-thumb {
  position: absolute; left: 2px; right: 2px;
  background: #555; border-radius: 4px;
  min-height: 20px;
}
.anima-thumb:hover { background: #777; }
/* footer */
.anima-footer {
  display: flex; align-items: center; justify-content: center;
  gap: 8px; padding: 4px 6px; flex-shrink: 0;
  background: #222236; border-top: 1px solid #333;
}
.anima-footer button {
  padding: 3px 10px; background: #2a2a3e;
  border: 1px solid #444; border-radius: 4px;
  color: #ccc; cursor: pointer; font-size: 11px;
}
.anima-footer button:hover { background: #3a3a4e; }
.anima-footer button:disabled { opacity: 0.4; cursor: default; }
.anima-footer .page-info { color: #888; font-size: 11px; }
/* states */
.anima-state {
  color: #888; padding: 40px; text-align: center;
  font-size: 12px; grid-column: 1 / -1;
}
.anima-state.error { color: #e74c3c; }
.anima-state button {
  margin-top: 8px; padding: 5px 16px; background: #6c8cff;
  border: none; border-radius: 5px; color: #fff; cursor: pointer;
  font-size: 12px;
}
.anima-sel-badge {
  background: #6c8cff; color: #fff; border-radius: 8px;
  padding: 1px 7px; font-size: 10px; display: none;
  margin-left: 2px;
}
.anima-sel-badge.on { display: inline; }
/* modal */
.anima-modal {
  position: fixed; inset: 0; z-index: 99999;
  display: none; align-items: center; justify-content: center;
}
.anima-modal.open { display: flex; }
.anima-modal-backdrop {
  position: absolute; inset: 0;
  background: rgba(5, 8, 16, 0.72);
}
.anima-modal-panel {
  position: relative; z-index: 1;
  width: min(1320px, calc(100vw - 40px));
  height: min(900px, calc(100vh - 40px));
  border: 1px solid #3a3a52;
  background: #141422;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
  border-radius: 10px;
  overflow: hidden;
}
.anima-modal-close {
  position: absolute; right: 10px; top: 8px; z-index: 2;
  width: 28px; height: 28px;
  border: 1px solid #505070; border-radius: 6px;
  background: #1f2034; color: #cfd3ff; cursor: pointer;
  font-size: 16px; line-height: 1;
}
.anima-modal-close:hover { background: #2c2d46; }
.anima-modal-body {
  width: 100%; height: 100%;
}
`;
  document.head.appendChild(s);
}

// ---------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------
function apiA(page, size, search, favOnly, favs) {
  const p = new URLSearchParams();
  p.set("page", page);
  p.set("size", size);
  if (search) p.set("search", search);
  if (favOnly) p.set("favOnly", "1");
  if (favOnly && favs?.length) p.set("favs", JSON.stringify(favs));
  return `/anima-browser/artists?${p}`;
}
function apiImg(id) {
  return `/anima-browser/image/${encodeURIComponent(id)}`;
}

// ---------------------------------------------------------------
// AnimaNodeUI  –  embedded gallery inside node DOM widget
// ---------------------------------------------------------------
class AnimaNodeUI {
  constructor(container, widget) {
    this.container = container;
    this.widget = widget;
    this.page = 1;
    this.pageSize = 50;
    this.searchQuery = "";
    this.multi = false;
    this.favOnly = false;
    this.totalPages = 1;
    this.ready = false;
    this._requestSeq = 0;
    this._abortController = null;

    this.favs = this._loadFavs();
    this.selected = widget.value
      ? widget.value.split("\n").filter(Boolean)
      : [];

    injectStyles();
    this._build();
    this._bind();
    this._init();
  }

  // ---- local-storage -------------------------------------------
  _loadFavs() {
    try { return JSON.parse(localStorage.getItem("anima-favs") || "[]"); }
    catch { return []; }
  }
  _saveFavs() {
    localStorage.setItem("anima-favs", JSON.stringify(this.favs));
  }

  // ---- DOM ----------------------------------------------------
  _build() {
    this.container.innerHTML = `
      <div class="anima-node-inner">
        <div class="anima-hdr">
          <input class="anima-search" type="text" placeholder="Search...">
          <button class="anima-random" title="Random">🎲</button>
          <button class="anima-fav" title="Favourites">⭐</button>
          <button class="anima-multi" title="Multi-select">☐</button>
          <span class="anima-sel-badge"></span>
          <span class="anima-total"></span>
        </div>
        <div class="anima-progress-row">
          <progress class="anima-progress" max="100" value="0"></progress>
          <span class="anima-progress-lbl">0%</span>
        </div>
        <div class="anima-main">
          <div class="anima-grid"></div>
          <div class="anima-scrollbar"><div class="anima-thumb"></div></div>
        </div>
        <div class="anima-footer">
          <button class="anima-prev">◀</button>
          <span class="page-info">1 / 1</span>
          <button class="anima-next">▶</button>
        </div>
      </div>`;

    // element refs
    const $ = (sel) => this.container.querySelector(sel);
    this.$search   = $(".anima-search");
    this.$grid     = $(".anima-grid");
    this.$scrollbar = $(".anima-scrollbar");
    this.$thumb    = $(".anima-thumb");
    this.$total    = $(".anima-total");
    this.$pageInfo = $(".page-info");
    this.$prev     = $(".anima-prev");
    this.$next     = $(".anima-next");
    this.$favBtn   = $(".anima-fav");
    this.$multiBtn = $(".anima-multi");
    this.$selBadge = $(".anima-sel-badge");
    this.$progRow  = $(".anima-progress-row");
    this.$progBar  = $(".anima-progress");
    this.$progLbl  = $(".anima-progress-lbl");

    this._updateBtns();
  }

  _updateResponsiveColumns() {
    const width = Math.max(260, this.container.clientWidth || 260);
    // target card width ~130px
    const cols = Math.max(1, Math.floor((width - 24) / 135));
    this.$grid.style.setProperty("--anima-cols", String(cols));
  }

  _updateBtns() {
    this.$multiBtn.textContent = this.multi ? "☑" : "☐";
    this.$multiBtn.classList.toggle("active", this.multi);
    this.$selBadge.classList.toggle("on", this.multi);
    this.$selBadge.textContent = `${this.selected.length}`;
    this.$favBtn.classList.toggle("active", this.favOnly);
  }

  // ---- events -------------------------------------------------
  _bind() {
    // prevent canvas from stealing events inside the widget
    this.container.addEventListener("mousedown", e => e.stopPropagation());
    this.container.addEventListener("pointerdown", e => e.stopPropagation());
    this.container.addEventListener("wheel", e => e.stopPropagation(), { passive: false });

    // search
    let t;
    this.$search.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(() => {
        this.searchQuery = this.$search.value.trim();
        this.page = 1;
        this._loadPage();
      }, 250);
    });

    this.$search.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.$search.blur();
      e.stopPropagation();
    });

    // random
    this.container.querySelector(".anima-random").addEventListener("click", () => {
      if (this.totalPages > 1) {
        this.page = Math.floor(Math.random() * this.totalPages) + 1;
        this._loadPage();
      }
    });

    // fav toggle
    this.$favBtn.addEventListener("click", () => {
      this.favOnly = !this.favOnly;
      this.$favBtn.classList.toggle("active", this.favOnly);
      this.page = 1;
      this._loadPage();
    });

    // multi toggle
    this.$multiBtn.addEventListener("click", () => {
      this.multi = !this.multi;
      this._updateBtns();
      this._loadPage();
    });

    // pagination
    this.$prev.addEventListener("click", () => {
      if (this.page > 1) { this.page--; this._loadPage(); }
    });
    this.$next.addEventListener("click", () => {
      if (this.page < this.totalPages) { this.page++; this._loadPage(); }
    });

    // grid delegation
    this.$grid.addEventListener("click", (e) => {
      const heart = e.target.closest(".anima-heart");
      if (heart) {
        e.stopPropagation();
        this._toggleFav(heart.dataset.slug);
        return;
      }
      const card = e.target.closest(".anima-card");
      if (!card) return;
      if (this.multi) {
        this._toggleSelect(card.dataset.slug);
      } else {
        this._selectSingle(card.dataset.slug);
      }
    });

    // scrollbar — controls grid scroll within current page
    this._scrollDragging = false;
    const doGridScroll = (clientY) => {
      const r = this.$scrollbar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientY - r.top) / r.height));
      this.$grid.scrollTop = ratio * (this.$grid.scrollHeight - this.$grid.clientHeight);
    };
    this.$thumb.addEventListener("mousedown", (e) => {
      this._scrollDragging = true;
      e.preventDefault();
    });
    this.$scrollbar.addEventListener("mousedown", (e) => {
      this._scrollDragging = true;
      doGridScroll(e.clientY);
    });
    this._onMove = (e) => { if (this._scrollDragging) doGridScroll(e.clientY); };
    this._onUp   = () => { this._scrollDragging = false; };
    document.addEventListener("mousemove", this._onMove);
    document.addEventListener("mouseup",   this._onUp);

    // keep thumb in sync as grid scrolls
    this.$grid.addEventListener("scroll", () => this._updateThumb(), { passive: true });

    if ("ResizeObserver" in window) {
      this._resizeObserver = new ResizeObserver(() => this._onGridResize());
      this._resizeObserver.observe(this.$grid);
    }
    this._lastGridSizeKey = this._getGridSizeKey();
    this._layoutWatch = window.setInterval(() => {
      const key = this._getGridSizeKey();
      if (key !== this._lastGridSizeKey) {
        this._lastGridSizeKey = key;
        this._onGridResize();
      }
    }, 250);
  }

  // ---- data ---------------------------------------------------
  async _init() {
    try {
      const r = await fetch("/anima-browser/status");
      const s = await r.json();

      if (!s.loaded) {
        if (!s.loading) {
          await fetch("/anima-browser/init", { method: "POST" });
        }
        this._showLoading("Downloading artist data...");
        await this._poll();
      }

      this.ready = true;
      this._syncPageSize({ preservePosition: false });
      this._loadPage();
    } catch (err) {
      this._showError(`Connect error: ${err.message}`);
    }
  }

  async _poll() {
    this.$progRow.style.display = "flex";
    for (let i = 0; i < 120; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      try {
        const r = await fetch("/anima-browser/status");
        const s = await r.json();
        if (s.loaded) { 
          this.ready = true; 
          this.$progRow.style.display = "none";
          this._loadPage(); 
          return; 
        }
        if (s.error)  { 
          this.$progRow.style.display = "none";
          this._showError(s.error); 
          return; 
        }
        if (s.progress?.total > 0) {
          const pct = Math.round((s.progress.current / s.progress.total) * 100);
          this.$progBar.value = pct;
          this.$progLbl.textContent = `${pct}%`;
          this.$grid.innerHTML =
            `<div class="anima-state">Downloading... ${s.progress.current.toLocaleString()} / ${s.progress.total.toLocaleString()}</div>`;
        }
      } catch (_) {}
    }
    this.$progRow.style.display = "none";
    this._showError("Timed out. Try again.");
  }

  // ---- page loading -------------------------------------------
  async _loadPage() {
    if (!this.ready) return;
    this._requestSeq += 1;
    const requestSeq = this._requestSeq;
    if (this._abortController) this._abortController.abort();
    this._abortController = new AbortController();

    this._syncPageSize();
    this.$grid.innerHTML = `<div class="anima-state">Loading...</div>`;
    this.$prev.disabled = true;
    this.$next.disabled = true;

    try {
      const url = apiA(this.page, this.pageSize, this.searchQuery, this.favOnly, this.favs);
      const r = await fetch(url, { signal: this._abortController.signal });
      if (requestSeq !== this._requestSeq) return;
      const d = await r.json();
      if (requestSeq !== this._requestSeq) return;

      if (!d.loaded) {
        this.$grid.innerHTML = `<div class="anima-state">Data loading... please wait</div>`;
        this._init();
        return;
      }

      this.totalPages = d.totalPages;
      this.$total.textContent = `${d.total.toLocaleString()}`;
      this.$pageInfo.textContent = `${this.page} / ${this.totalPages}`;
      this.$prev.disabled = this.page <= 1;
      this.$next.disabled = this.page >= this.totalPages;

      this._render(d.artists);
      this.$grid.scrollTop = 0;
      this._updateThumb();
    } catch (err) {
      if (err?.name === "AbortError") return;
      this._showError(`Load error: ${err.message}`);
    } finally {
      if (requestSeq === this._requestSeq) {
        this._abortController = null;
      }
    }
  }

  _measurePageSize() {
    const r = this.$grid.getBoundingClientRect();
    const width = r.width || this.$grid.clientWidth || 0;
    const height = r.height || this.$grid.clientHeight || 0;
    return calculateVisiblePageSize(width, height);
  }

  _getGridSizeKey() {
    const r = this.$grid.getBoundingClientRect();
    return `${Math.round(r.width)}x${Math.round(r.height)}`;
  }

  _syncPageSize({ preservePosition = true } = {}) {
    const nextSize = this._measurePageSize();
    if (nextSize === this.pageSize) return false;

    const firstVisible = (this.page - 1) * this.pageSize;
    this.pageSize = nextSize;
    if (preservePosition) {
      this.page = Math.floor(firstVisible / this.pageSize) + 1;
    }
    return true;
  }

  _onGridResize() {
    clearTimeout(this._layoutTimer);
    this._layoutTimer = setTimeout(() => {
      this._updateResponsiveColumns();
      if (!this.ready) {
        this._syncPageSize({ preservePosition: false });
        return;
      }
      if (this._syncPageSize()) {
        this._loadPage();
      } else {
        this._updateThumb();
      }
    }, 120);
  }

  _render(artists) {
    this.$grid.innerHTML = "";

    if (artists.length === 0) {
      const msg = this.favOnly
        ? "No favourites. Click 🤍 to add."
        : this.searchQuery
          ? `No results for "${this.searchQuery}"`
          : "No artists";
      this.$grid.innerHTML = `<div class="anima-state">${msg}</div>`;
      return;
    }

    const sel = new Set(this.selected);
    const fav = new Set(this.favs);
    const f = document.createDocumentFragment();

    for (const a of artists) {
      const c = document.createElement("div");
      c.className = "anima-card" + (sel.has(a.slug) ? " sel" : "");
      c.dataset.slug = a.slug;

      c.innerHTML = [
        this.multi ? `<input type="checkbox" class="anima-check" ${sel.has(a.slug)?"checked":""}>` : "",
        `<div class="anima-sel-mark">✓</div>`,
        `<button class="anima-heart" data-slug="${a.slug}">${fav.has(a.slug)?"❤️":"🤍"}</button>`,
        `<img src="${apiImg(a.imageId + '.webp')}">`,
        `<div class="card-body">`,
          `<div class="card-tag" title="${this._esc(a.tag)}">${this._esc(a.tag)}</div>`,
          `<div class="card-count">${a.postCount.toLocaleString()}</div>`,
        `</div>`,
      ].join("");

      f.appendChild(c);
    }
    this.$grid.appendChild(f);
    this._syncSelectionStateInGrid();
  }

  _esc(s) {
    const e = document.createElement("span");
    e.textContent = s;
    return e.innerHTML;
  }

  _updateThumb() {
    const scrollH = this.$grid.scrollHeight;
    const clientH = this.$grid.clientHeight;
    if (scrollH <= clientH) {
      this.$thumb.style.top = "0%";
      this.$thumb.style.height = "100%";
      return;
    }
    const thumbPct = Math.max(8, (clientH / scrollH) * 100);
    const ratio = this.$grid.scrollTop / (scrollH - clientH);
    this.$thumb.style.height = `${thumbPct}%`;
    this.$thumb.style.top = `${ratio * (100 - thumbPct)}%`;
  }

  _showLoading(msg) {
    this.$grid.innerHTML = `<div class="anima-state">${msg}</div>`;
    this.$total.textContent = "";
    this.$pageInfo.textContent = "...";
  }

  _showError(msg) {
    this.$grid.innerHTML = `<div class="anima-state error">${msg}<br><button>Retry</button></div>`;
    this.$grid.querySelector("button").addEventListener("click", () => this._init());
  }

  // ---- selection / favourites ---------------------------------
  _syncSelectionStateInGrid() {
    const selectedSet = new Set(this.selected);
    this.$grid.querySelectorAll(".anima-card").forEach((card) => {
      const isSelected = selectedSet.has(card.dataset.slug);
      card.classList.toggle("sel", isSelected);
      const checkbox = card.querySelector(".anima-check");
      if (checkbox) checkbox.checked = isSelected;
    });
  }

  _selectSingle(slug) {
    this.selected = [slug];
    this._writeWidget();
    this._updateBtns();
    this._syncSelectionStateInGrid();
  }

  _toggleSelect(slug) {
    const i = this.selected.indexOf(slug);
    if (i >= 0) this.selected.splice(i, 1);
    else this.selected.push(slug);
    this._writeWidget();
    this._updateBtns();
    this._syncSelectionStateInGrid();
  }

  _toggleFav(slug) {
    const i = this.favs.indexOf(slug);
    if (i >= 0) this.favs.splice(i, 1);
    else this.favs.push(slug);
    this._saveFavs();

    this.$grid.querySelectorAll(`.anima-heart[data-slug="${slug}"]`)
      .forEach((h) => { h.textContent = this.favs.includes(slug) ? "❤️" : "🤍"; });

    if (this.favOnly) this._loadPage();
  }

  _writeWidget() {
    this.widget.value = this.selected.join("\n");
  }

  // ---- cleanup ------------------------------------------------
  destroy() {
    if (this._abortController) this._abortController.abort();
    clearTimeout(this._layoutTimer);
    if (this._layoutWatch) window.clearInterval(this._layoutWatch);
    if (this._resizeObserver) this._resizeObserver.disconnect();
    if (this._onMove) document.removeEventListener("mousemove", this._onMove);
    if (this._onUp)   document.removeEventListener("mouseup",   this._onUp);
  }
}

// ---------------------------------------------------------------
// Extension registration
// ---------------------------------------------------------------
app.registerExtension({
  name: "Comfy.AnimaBrowser",

  async beforeRegisterNodeDef(nodeType, nodeData) {
    if (nodeData.name !== "AnimaBrowser") return;

    nodeType.prototype.onNodeCreated = function () {
      injectStyles();

      // Hide the raw text widget — keep it for serialization only
      const widget = this.widgets?.find((w) => w.name === "artist_slug");
      if (widget) {
        widget.computeSize = () => [0, -4];
      }

      if (widget) {
        const wrap = document.createElement("div");
        wrap.style.width = "100%";
        wrap.style.height = "100%";
        wrap.style.boxSizing = "border-box";
        
        this._animaUI = new AnimaNodeUI(wrap, widget);

        this.addDOMWidget("anima_browser", "anima_browser", wrap, {
          getMinHeight: () => 390,
          getMaxHeight: () => 9999,
          getHeight: () => 430,
        });
      }

      this.size = [360, 480];
    };

    // Cleanup when node removed
    const origRemoved = nodeType.prototype.onRemoved;
    nodeType.prototype.onRemoved = function () {
      if (this._animaUI) {
        this._animaUI.destroy();
        this._animaUI = null;
      }
      return origRemoved?.apply(this, arguments);
    };
  },
});
