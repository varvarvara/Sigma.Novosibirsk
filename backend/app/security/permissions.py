from fastapi import Depends, HTTPException, status

from app.security.dependecies import get_current_user

STAFF_ROLE_TEACHER = "Teacher"
STAFF_ROLE_ADMIN = "Admin"

def require_authenticated(current_user=Depends(get_current_user)):
    return current_user

def require_student(current_user=Depends(get_current_user)):
    if current_user["user_type"] != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student access required")
    return current_user


def require_staff(current_user=Depends(get_current_user)):
    if current_user["user_type"] != "staff":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Staff access required")
    return current_user


def require_teacher(current_user=Depends(get_current_user)):
    if current_user["user_type"] != "staff" or current_user.get("staff_role") != STAFF_ROLE_TEACHER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Teacher access required")
    return current_user


def require_admin(current_user=Depends(get_current_user)):
    if current_user["user_type"] != "staff" or current_user.get("staff_role") != STAFF_ROLE_ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


def require_teacher_or_admin(current_user=Depends(get_current_user)):
    if current_user["user_type"] != "staff":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Teacher/Admin access required")

    role = current_user.get("staff_role")
    if role not in {STAFF_ROLE_TEACHER, STAFF_ROLE_ADMIN}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Teacher/Admin access required")

    return current_user
