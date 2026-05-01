import json

from aiohttp import web

from server import PromptServer

from .nodes import NODE_CLASS_MAPPINGS, NODE_DISPLAY_NAME_MAPPINGS
from .data_manager import data_manager

WEB_DIRECTORY = "js"
__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]


@PromptServer.instance.routes.get("/anima-browser/status")
async def api_status(request):
    return web.json_response(
        {
            "loaded": data_manager.loaded,
            "loading": data_manager.loading,
            "total": data_manager.total_count,
            "error": data_manager.error,
            "progress": data_manager.progress(),
        }
    )


@PromptServer.instance.routes.post("/anima-browser/init")
async def api_init(request):
    data_manager._start_download()
    return web.json_response({"status": "ok"})


@PromptServer.instance.routes.get("/anima-browser/artists")
async def api_artists(request):
    page = max(1, int(request.query.get("page", "1")))
    size = max(10, min(100, int(request.query.get("size", "50"))))
    search = request.query.get("search", "").strip()
    fav_only = request.query.get("favOnly", "0") == "1"

    favs_json = request.query.get("favs", "[]")
    try:
        favs = json.loads(favs_json)
        if not isinstance(favs, list):
            favs = []
    except (json.JSONDecodeError, TypeError):
        favs = []

    result = data_manager.get_artists(page, size, search, fav_only, favs)
    return web.json_response(result)


@PromptServer.instance.routes.get("/anima-browser/image/{image_id}")
async def api_image(request):
    image_id = request.match_info.get("image_id", "")
    if not image_id:
        return web.Response(status=400, text="missing image_id")
    path = data_manager.get_image(image_id)
    if path is None:
        return web.Response(status=404, text="image not found")
    return web.FileResponse(path)
