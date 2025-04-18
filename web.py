"""create an ASGI app using FastAPI to serve the API"""

import os

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse

from wirecutter import find_recommendations


def make_app():
    app = FastAPI()

    @app.get("/")
    async def read_root():
        return FileResponse("./static/index.html")

    @app.get("/api/search/{query}")
    async def search(query: str):
        result = find_recommendations(query)
        if not result:
            raise HTTPException(status_code=404, detail="Nothing found")
        return result

    @app.get("/{file_path:path}")
    async def read_file(file_path: str):
        file_full_path = os.path.join("static", file_path)
        if not os.path.isfile(file_full_path):
            raise HTTPException(status_code=404, detail="File not found")
        return FileResponse(file_full_path)

    return app
