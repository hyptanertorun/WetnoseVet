from fastapi import FastAPI
from fastapi.responses import RedirectResponse
import httpx

app = FastAPI()

# Proxy all API requests to Next.js on port 3000
@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
async def proxy_api(path: str):
    async with httpx.AsyncClient() as client:
        import os
        from starlette.requests import Request
        from starlette.responses import Response
        
        # Forward to Next.js
        url = f"http://localhost:3000/api/{path}"
        
        # Get the current request
        from starlette.requests import Request as StarletteRequest
        
        # Simple proxy - just redirect for now
        return RedirectResponse(url=url, status_code=307)

@app.get("/health")
async def health():
    return {"status": "ok", "service": "api-proxy"}
