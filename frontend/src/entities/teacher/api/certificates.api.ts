import { apiClient } from "../../../shared/api/client";
import { CertificateDownload, TeacherCertificate } from "../model/certificate.types";

export async function getMyTeacherCertificates() {
  return await apiClient.get<TeacherCertificate[]>("/certificates/teachers/my")
    .then((response) => response.data);
}

export async function getTeacherCertificateDownload(certificateId: number) {
  return await apiClient.get<CertificateDownload>(`/certificates/teachers/${certificateId}/download`)
    .then((response) => response.data);
}
