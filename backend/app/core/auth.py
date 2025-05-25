import os
from fastapi import Depends, HTTPException, Request, status
# from app.core.clerk import verify_session  # Temporarily disabled due to requests dependency issue


async def get_current_user(request: Request):
    # Temporarily return a mock user for development
    return {"id": "dev_user", "email": "dev@example.com"}
    # auth_header = request.headers.get("Authorization")
    # if not auth_header or not auth_header.startswith("Bearer "):
    #     raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid Authorization header")
    # token = auth_header.split(" ")[1]
    # session = verify_session(token)
    # return session.get("user")


async def get_current_active_user(user: dict = Depends(get_current_user)):
    return user


async def get_current_active_superuser(user: dict = Depends(get_current_user)):
    if not user or not user.get("public_metadata", {}).get("role") == "admin":
        raise HTTPException(status_code=403, detail="The user doesn't have enough privileges")
    return user
