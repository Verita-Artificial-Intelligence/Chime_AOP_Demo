import os
import requests
from fastapi import HTTPException, status

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
CLERK_API_BASE = os.getenv("CLERK_API_BASE", "https://api.clerk.dev")


def verify_session(token: str):
    if not CLERK_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Clerk secret not configured")
    headers = {"Authorization": f"Bearer {CLERK_SECRET_KEY}"}
    url = f"{CLERK_API_BASE}/v1/sessions/{token}"
    resp = requests.get(url, headers=headers)
    if resp.status_code != 200:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session")
    return resp.json()
