import { getAccessToken, request } from '../auth';

export type TeacherCertificate = {
  id: number;
  user_id: number;
  course_id: number;
  issued_by: number | null;
  issued_at: string | null;
  certificate_url: string;
  certificate_status: string;
};

export type CertificateDownload = {
  download_url: string;
};

function authHeaders() {
  const accessToken = getAccessToken();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
}

export function getMyTeacherCertificates() {
  return request<TeacherCertificate[]>('/certificates/teachers/my', {
    headers: authHeaders(),
  });
}

export function getTeacherCertificateDownload(certificateId: number) {
  return request<CertificateDownload>(`/certificates/teachers/${certificateId}/download`, {
    headers: authHeaders(),
  });
}
