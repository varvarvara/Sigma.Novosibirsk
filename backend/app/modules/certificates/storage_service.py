import os
from pathlib import Path

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from dotenv import load_dotenv
from typing import Optional, BinaryIO, Dict
from fastapi import UploadFile
import uuid
from urllib.parse import quote, urlparse
from zoneinfo import ZoneInfo

# Load env explicitly for this module to avoid dependency on import order.
BACKEND_DIR = Path(__file__).resolve().parents[3]
load_dotenv(BACKEND_DIR / ".env")


class S3StorageService:
    
    def __init__(
        self,
        endpoint_url: Optional[str] = None,
        aws_access_key_id: Optional[str] = None,
        aws_secret_access_key: Optional[str] = None,
        bucket_name: Optional[str] = None,
        region_name: str = "us-east-1",
        timezone_name: str = "Europe/Moscow",
        public_base_url: Optional[str] = None,
    ):
        self.endpoint_url = self._normalize_endpoint_url(endpoint_url=endpoint_url, bucket_name=bucket_name)
        self.bucket_name = bucket_name
        self.region_name = region_name
        self.aws_access_key_id = aws_access_key_id
        self.aws_secret_access_key = aws_secret_access_key
        self.public_base_url = self._resolve_public_base_url(public_base_url=public_base_url)
        self.timezone = self._resolve_timezone(timezone_name=timezone_name)

        self.s3_client = self._create_s3_client(
            endpoint_url=self.endpoint_url,
            addressing_style="path",
        )
        self._virtual_s3_client = (
            self._create_s3_client(
                endpoint_url=self.public_base_url,
                addressing_style="virtual",
            )
            if self.public_base_url
            else None
        )

    def _create_s3_client(self, endpoint_url: Optional[str], addressing_style: str):
        return boto3.client(
            "s3",
            endpoint_url=endpoint_url,
            aws_access_key_id=self.aws_access_key_id,
            aws_secret_access_key=self.aws_secret_access_key,
            region_name=self.region_name,
            config=Config(
                signature_version="s3v4",
                s3={"addressing_style": addressing_style},
                retries={"max_attempts": 5, "mode": "standard"},
                connect_timeout=5,
                read_timeout=30,
            ),
        )

    @staticmethod
    def _resolve_timezone(timezone_name: str) -> ZoneInfo:
        try:
            return ZoneInfo(timezone_name)
        except Exception:
            return ZoneInfo("UTC")

    def _resolve_public_base_url(self, public_base_url: Optional[str]) -> Optional[str]:
        if public_base_url:
            return public_base_url.rstrip("/")
        if self.endpoint_url and self.bucket_name:
            parsed = urlparse(self.endpoint_url)
            if parsed.scheme and parsed.netloc:
                if parsed.netloc == "s3.cloud.ru":
                    return f"{parsed.scheme}://{self.bucket_name}.s3.cloud.ru"
        return None

    @staticmethod
    def _normalize_endpoint_url(endpoint_url: Optional[str], bucket_name: Optional[str]) -> Optional[str]:
        if not endpoint_url:
            return endpoint_url

        cleaned = endpoint_url.strip().rstrip("/")
        parsed = urlparse(cleaned)
        if not parsed.scheme or not parsed.netloc:
            return cleaned

        # Users often paste endpoint like https://s3.cloud.ru/<bucket>.
        path = parsed.path.strip("/")
        if bucket_name and path == bucket_name:
            return f"{parsed.scheme}://{parsed.netloc}"

        if not path:
            return f"{parsed.scheme}://{parsed.netloc}"

        return cleaned

    def _object_url(self, object_name: str) -> str:
        safe_key = quote(object_name, safe="/")
        if self.public_base_url:
            return f"{self.public_base_url}/{safe_key}"
        if self.endpoint_url:
            base = self.endpoint_url.rstrip("/")
            return f"{base}/{self.bucket_name}/{safe_key}"
        return f"https://{self.bucket_name}.s3.amazonaws.com/{safe_key}"

    def public_url_for_key(self, object_key: str) -> str:
        return self._object_url(object_name=object_key)

    def is_configured(self) -> bool:
        return bool(self.endpoint_url and self.bucket_name)

    def create_bucket(self) -> bool:
        if not self.bucket_name:
            return False

        # Bucket exists and is accessible.
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
            return True
        except ClientError as exc:
            error_code = str(exc.response.get("Error", {}).get("Code", ""))
            if error_code not in {"404", "NoSuchBucket", "NotFound"}:
                # AccessDenied and other auth/network errors.
                return False

        try:
            create_kwargs = {"Bucket": self.bucket_name}
            if (not self.endpoint_url) and self.region_name and self.region_name != "us-east-1":
                create_kwargs["CreateBucketConfiguration"] = {"LocationConstraint": self.region_name}

            self.s3_client.create_bucket(**create_kwargs)
            return True
        except ClientError as e:
            if e.response["Error"]["Code"] in {"BucketAlreadyOwnedByYou", "BucketAlreadyExists"}:
                return True
            return False
    
    def upload_file(
        self, 
        file: BinaryIO, 
        object_name: str,
        content_type: str = "application/octet-stream"
    ) -> Optional[str]:
        try:
            if not self.bucket_name:
                return None
            self.s3_client.upload_fileobj(
                file,
                self.bucket_name,
                object_name,
                ExtraArgs={"ContentType": content_type},
            )
            return self._object_url(object_name=object_name)
                
        except ClientError as e:
            print(f"Error uploading file: {e}")
            return None
    
    def upload_from_uploadfile(
        self, 
        file: UploadFile, 
        folder: str = "uploads",
        generate_unique_name: bool = True
    ) -> Optional[Dict]:
        try:
            if generate_unique_name:
                file_extension = os.path.splitext(file.filename)[1]
                object_name = f"{folder}/{uuid.uuid4()}{file_extension}"
            else:
                object_name = f"{folder}/{file.filename}"
            
            file_url = self.upload_file(
                file.file,
                object_name,
                content_type=file.content_type or "application/octet-stream"
            )
            
            if file_url:
                return {
                    "url": file_url,
                    "filename": file.filename,
                    "object_name": object_name,
                    "content_type": file.content_type
                }
            return None
            
        finally:
            file.file.seek(0)
    
    def download_file(self, object_name: str, file_path: str) -> bool:
        try:
            self.s3_client.download_file(
                self.bucket_name,
                object_name,
                file_path
            )
            return True
        except ClientError as e:
            print(f"Error downloading file: {e}")
            return False
    
    def get_file(self, object_name: str) -> Optional[bytes]:
        try:
            response = self.s3_client.get_object(
                Bucket=self.bucket_name,
                Key=object_name
            )
            return response['Body'].read()
        except ClientError as e:
            print(f"Error getting file: {e}")
            return None
    
    def delete_file(self, object_name: str) -> bool:
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=object_name
            )
            return True
        except ClientError as e:
            print(f"Error deleting file: {e}")
            return False
    
    def list_files(self, prefix: str = "") -> list:
        try:
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix
            )
            
            if 'Contents' in response:
                return [
                    {
                        'key': obj['Key'],
                        'size': obj['Size'],
                        'last_modified': obj['LastModified'].astimezone(self.timezone).isoformat(),
                        'last_modified_utc': obj['LastModified'].isoformat(),
                    }
                    for obj in response['Contents']
                ]
            return []
            
        except ClientError as e:
            print(f"Error listing files: {e}")
            return []
    
    def generate_presigned_url(
        self,
        object_name: str,
        expiration: int = 3600,
    ) -> Optional[str]:
        if not self.bucket_name:
            return None

        params = {
            "Bucket": self.bucket_name,
            "Key": object_name,
        }

        clients = [client for client in (self.s3_client, self._virtual_s3_client) if client is not None]
        last_error: ClientError | None = None

        for client in clients:
            try:
                return client.generate_presigned_url(
                    "get_object",
                    Params=params,
                    ExpiresIn=expiration,
                )
            except ClientError as error:
                last_error = error

        if last_error is not None:
            print(f"Error generating presigned URL: {last_error}")

        return None

    def generate_presigned_upload_url(
        self,
        object_name: str,
        content_type: str = "application/octet-stream",
        expiration: int = 900,
    ) -> Optional[str]:
        try:
            if not self.bucket_name:
                return None
            return self.s3_client.generate_presigned_url(
                "put_object",
                Params={
                    "Bucket": self.bucket_name,
                    "Key": object_name,
                    "ContentType": content_type,
                },
                ExpiresIn=expiration,
            )
        except ClientError as e:
            print(f"Error generating presigned upload URL: {e}")
            return None


_storage_service: Optional[S3StorageService] = None


def get_storage_service() -> S3StorageService:
    global _storage_service
    if _storage_service is None:
        access_key = os.getenv("S3_ACCESS_KEY")
        tenant_id = os.getenv("S3_TENANT_ID")
        key_id = os.getenv("S3_KEY_ID")
        if not access_key and tenant_id and key_id:
            access_key = f"{tenant_id}:{key_id}"
        elif access_key and ":" not in access_key and tenant_id:
            # Allow using plain key_id in S3_ACCESS_KEY + tenant in S3_TENANT_ID.
            access_key = f"{tenant_id}:{access_key}"

        _storage_service = S3StorageService(
            endpoint_url=os.getenv("S3_ENDPOINT_URL"),
            aws_access_key_id=access_key,
            aws_secret_access_key=os.getenv("S3_SECRET_KEY"),
            bucket_name=os.getenv("S3_BUCKET_NAME", "sigma-storage"),
            region_name=os.getenv("S3_REGION", "us-east-1"),
            timezone_name=os.getenv("APP_TIMEZONE", "Europe/Moscow"),
            public_base_url=os.getenv("S3_PUBLIC_BASE_URL"),
        )
        auto_create = os.getenv("S3_AUTO_CREATE_BUCKET", "false").lower() in {"1", "true", "yes"}
        if auto_create:
            _storage_service.create_bucket()
    return _storage_service
