from enum import Enum

from fastapi import Depends, HTTPException, status

from app.security.dependecies import get_current_user

STAFF_ROLE_TEACHER = "Teacher"
STAFF_ROLE_ADMIN = "Admin"


class Permission(str, Enum):
    USER_READ_ME = "user:read_me"
    STUDENT_SIGNUP = "student:signup"

    COURSE_READ_PUBLISHED = "course:read_published"
    COURSE_READ_OWN = "course:read_own"
    COURSE_READ_ALL = "course:read_all"
    COURSE_CREATE = "course:create"
    COURSE_UPDATE_OWN = "course:update_own"
    COURSE_UPDATE_ANY = "course:update_any"
    COURSE_DELETE_ANY = "course:delete_any"

    ADMIN_REVIEW_PRE_REGISTRATIONS = "admin:review_pre_registrations"
    ADMIN_APPROVE_PRE_REGISTRATIONS = "admin:approve_pre_registrations"
    ADMIN_REJECT_PRE_REGISTRATIONS = "admin:reject_pre_registrations"
    ADMIN_MANAGE_STAFF = "admin:manage_staff"


ROLE_PERMISSIONS: dict[tuple[str, str | None], set[Permission]] = {
    ("staff", STAFF_ROLE_ADMIN): {
        Permission.USER_READ_ME,
        Permission.COURSE_READ_PUBLISHED,
        Permission.COURSE_READ_OWN,
        Permission.COURSE_READ_ALL,
        Permission.COURSE_CREATE,
        Permission.COURSE_UPDATE_OWN,
        Permission.COURSE_UPDATE_ANY,
        Permission.COURSE_DELETE_ANY,
        Permission.ADMIN_REVIEW_PRE_REGISTRATIONS,
        Permission.ADMIN_APPROVE_PRE_REGISTRATIONS,
        Permission.ADMIN_REJECT_PRE_REGISTRATIONS,
        Permission.ADMIN_MANAGE_STAFF,
    },
    ("staff", STAFF_ROLE_TEACHER): {
        Permission.USER_READ_ME,
        Permission.COURSE_READ_PUBLISHED,
        Permission.COURSE_READ_OWN,
        Permission.COURSE_CREATE,
        Permission.COURSE_UPDATE_OWN,
    },
    ("student", None): {
        Permission.USER_READ_ME,
        Permission.STUDENT_SIGNUP,
        Permission.COURSE_READ_PUBLISHED,
    },
}


def _get_permissions(current_user: dict) -> set[Permission]:
    role_key = (current_user.get("user_type"), current_user.get("staff_role"))
    permissions = ROLE_PERMISSIONS.get(role_key)
    if permissions is not None:
        return permissions
    return ROLE_PERMISSIONS.get((current_user.get("user_type"), None), set())


def require_permissions(*required_permissions: Permission):
    def _checker(current_user=Depends(get_current_user)):
        user_permissions = _get_permissions(current_user=current_user)
        missing = [perm.value for perm in required_permissions if perm not in user_permissions]
        if missing:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing permissions: {', '.join(missing)}",
            )
        current_user["permissions"] = [permission.value for permission in user_permissions]
        return current_user

    return _checker


def require_any_permission(*any_permissions: Permission):
    def _checker(current_user=Depends(get_current_user)):
        user_permissions = _get_permissions(current_user=current_user)
        if not any(permission in user_permissions for permission in any_permissions):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission denied",
            )
        current_user["permissions"] = [permission.value for permission in user_permissions]
        return current_user

    return _checker


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


def require_teacher(current_user=Depends(require_permissions(Permission.COURSE_READ_OWN))):
    if current_user["user_type"] != "staff" or current_user.get("staff_role") != STAFF_ROLE_TEACHER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Teacher access required")
    return current_user


def require_admin(current_user=Depends(require_permissions(Permission.ADMIN_MANAGE_STAFF))):
    if current_user["user_type"] != "staff" or current_user.get("staff_role") != STAFF_ROLE_ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


def require_teacher_or_admin(
    current_user=Depends(require_any_permission(Permission.COURSE_READ_OWN, Permission.COURSE_READ_ALL)),
):
    if current_user["user_type"] != "staff":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Teacher/Admin access required")

    role = current_user.get("staff_role")
    if role not in {STAFF_ROLE_TEACHER, STAFF_ROLE_ADMIN}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Teacher/Admin access required")

    return current_user
