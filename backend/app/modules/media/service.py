import os
from typing import BinaryIO

from fastapi import HTTPException, UploadFile, status

from app.config import settings
from app.modules.certificates.storage_service import get_storage_service

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_IMAGE_BYTES = 5 * 1024 * 1024

CONTENT_TYPE_BY_EXT = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
}


class MediaAssetService:
    def __init__(self) -> None:
        self.storage = get_storage_service()
        self.media_folder = (settings.MEDIA_FOLDER or "media").strip("/")
        self.profiles_folder = (settings.PROFILES_FOLDER or "profiles").strip("/")

    def ensure_configured(self) -> None:
        if not self.storage.is_configured():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Object storage is not configured",
            )

    @staticmethod
    def extension(filename: str | None) -> str:
        if not filename or "." not in filename:
            return ""
        return "." + filename.rsplit(".", 1)[-1].lower()

    def validate_image(self, file: UploadFile) -> str:
        ext = self.extension(file.filename)
        if ext not in ALLOWED_IMAGE_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Image must be JPG, PNG or WebP",
            )

        file.file.seek(0, os.SEEK_END)
        size = file.file.tell()
        file.file.seek(0)
        if size > MAX_IMAGE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Image size must not exceed 5 MB",
            )
        return ext

    def resolve_url(self, object_key: str | None) -> str | None:
        if not object_key:
            return None

        if not self.storage.is_configured():
            return None

        presigned_url = self.storage.generate_presigned_url(object_key, expiration=3600)
        if presigned_url:
            return presigned_url

        # Прямые ссылки работают только для явно публичного бакета (S3_PUBLIC_BASE_URL).
        if self.storage.public_base_url:
            return self.storage.public_url_for_key(object_key)

        return None

    def delete_object(self, object_key: str | None) -> None:
        if not object_key or not self.storage.is_configured():
            return
        self.storage.delete_file(object_key)

    def upload_bytes(
        self,
        *,
        file_obj: BinaryIO,
        object_key: str,
        content_type: str,
    ) -> str:
        self.ensure_configured()
        uploaded = self.storage.upload_file(
            file=file_obj,
            object_name=object_key,
            content_type=content_type,
        )
        if not uploaded:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to upload file to storage",
            )
        return object_key

    def upload_image(self, file: UploadFile, object_key: str) -> str:
        ext = self.validate_image(file)
        content_type = CONTENT_TYPE_BY_EXT.get(ext) or file.content_type or "application/octet-stream"
        file.file.seek(0)
        return self.upload_bytes(
            file_obj=file.file,
            object_key=object_key,
            content_type=content_type,
        )

    def course_cover_key(self, season_id: int, course_id: int, extension: str) -> str:
        return f"{self.media_folder}/courses/{season_id}/{course_id}/cover{extension}"

    def student_avatar_key(self, student_id: int, extension: str) -> str:
        return f"{self.profiles_folder}/students/{student_id}/avatar{extension}"

    def staff_avatar_key(self, staff_id: int, extension: str) -> str:
        return f"{self.profiles_folder}/staff/{staff_id}/avatar{extension}"


_media_service: MediaAssetService | None = None


def get_media_service() -> MediaAssetService:
    global _media_service
    if _media_service is None:
        _media_service = MediaAssetService()
    return _media_service
