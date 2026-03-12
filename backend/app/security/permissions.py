from fastapi import Depends, HTTPException, status
from app.security.dependecies import get_current_user


def require_student(current_user = Depends(get_current_user)):
    if current_user["user_type"] != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student access required")
    return current_user


def require_staff(current_user = Depends(get_current_user)):
    if current_user["user_type"] != "staff":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Staff access required")
    return current_user


def require_admin(current_user = Depends(get_current_user)):
    if current_user["user_type"] != "staff" or current_user["staff_role"] != "Admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user
