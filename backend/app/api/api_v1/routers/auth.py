from fastapi import APIRouter, Request, HTTPException
from app.core.clerk import verify_session

auth_router = APIRouter()


@auth_router.get("/session")
async def read_session(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = auth_header.split(" ")[1]
    session = verify_session(token)
    return {"session": session}


@auth_router.post("/clerk/webhook")
async def clerk_webhook():
    # Placeholder for webhook processing
    return {"status": "received"}
