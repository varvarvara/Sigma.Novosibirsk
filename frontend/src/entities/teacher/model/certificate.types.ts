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
