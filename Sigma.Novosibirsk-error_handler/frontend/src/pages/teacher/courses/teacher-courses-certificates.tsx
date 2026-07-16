import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getMyTeacherCertificates,
  getTeacherCertificateDownload,
} from '../../../entities/teacher/api/certificates.api';
import type { TeacherCertificate } from '../../../entities/teacher/model/certificate.types';
import { TeacherAppShell } from '../../../shared/ui/teacher_sidebar/teacher-app-shell';
import './teacher-courses-styles.css';

type FileRow = {
  id: number;
  title: string;
  date: string;
  icon: string;
  source: TeacherCertificate;
};

function getFilenameFromUrl(url: string) {
  const cleanUrl = url.split('?')[0] ?? url;
  const filename = cleanUrl.split('/').filter(Boolean).pop();
  if (!filename) {
    return 'Сертификат';
  }

  const decoded = decodeURIComponent(filename);
  const extension = decoded.includes('.') ? decoded.split('.').pop() : '';
  return extension ? `Сертификат.${extension}` : 'Сертификат';
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Дата не указана';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function getIcon(url: string) {
  return /\.(png|jpg|jpeg)$/i.test(url.split('?')[0] ?? '') ? '/teacher/courses/image-icon.png' : '/teacher/courses/file-icon.png';
}

export const TeacherCoursesCertificatesPage = () => {
  const [certificates, setCertificates] = useState<TeacherCertificate[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const headerCheckboxRef = useRef<HTMLInputElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCertificates() {
      try {
        setIsLoading(true);
        setError(null);
        const items = await getMyTeacherCertificates();
        if (isMounted) {
          setCertificates(items);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить сертификаты');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadCertificates();

    return () => {
      isMounted = false;
    };
  }, []);

  const files = useMemo<FileRow[]>(() => certificates.map((certificate) => ({
    id: certificate.id,
    title: getFilenameFromUrl(certificate.certificate_url),
    date: formatDate(certificate.issued_at),
    icon: getIcon(certificate.certificate_url),
    source: certificate,
  })), [certificates]);

  const selectedCount = Object.values(selected).filter(Boolean).length;

  useEffect(() => {
    const total = files.length;
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = selectedCount > 0 && selectedCount < total;
      headerCheckboxRef.current.checked = selectedCount === total && total > 0;
    }
  }, [selectedCount, files.length]);

  useEffect(() => {
    if (openMenuId === null) {
      return undefined;
    }

    const closeMenu = (event: MouseEvent) => {
      if (menuRef.current && event.target instanceof Node && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', closeMenu);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('mousedown', closeMenu);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [openMenuId]);

  const toggleSelectAll = () => {
    if (selectedCount === files.length) {
      setSelected({});
      return;
    }

    setSelected(Object.fromEntries(files.map((file) => [file.id, true])));
  };

  const toggleRow = (id: number) => {
    setSelected((current) => ({ ...current, [id]: !current[id] }));
  };

  const downloadFile = useCallback(async (file: FileRow) => {
    const { download_url: downloadUrl } = await getTeacherCertificateDownload(file.id);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, []);

  const downloadSelected = async () => {
    const selectedFiles = files.filter((file) => selected[file.id]);
    if (!selectedFiles.length) {
      return;
    }

    try {
      setIsDownloading(true);
      setError(null);
      for (const file of selectedFiles) {
        await downloadFile(file);
      }
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : 'Не удалось скачать сертификат');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <TeacherAppShell className="courses-layout">
      <main className="courses-content">
        <div className="courses-content-inner courses-content-inner--fluid">
          <h1 className="courses-title">Сертификаты</h1>

          {error ? <p className="teacher-courses-status teacher-courses-status--error">{error}</p> : null}

          <div className="certificates-card">
            <div className="certificates-header">
              <strong>Файлы</strong>
              <button
                type="button"
                className="btn-primary"
                onClick={() => void downloadSelected()}
                disabled={selectedCount === 0 || isDownloading}
              >
                {isDownloading ? 'Скачиваю...' : 'Скачать'}
              </button>
            </div>

            <div className="certificates-table-wrap">
              <table className="certificates-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        ref={headerCheckboxRef}
                        checked={files.length > 0 && selectedCount === files.length}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th>Название файла</th>
                    <th>Дата загрузки</th>
                    <th aria-label="Действия" />
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="certificates-empty">Загружаю сертификаты...</td>
                    </tr>
                  ) : files.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="certificates-empty">Здесь пока пусто</td>
                    </tr>
                  ) : files.map((file) => (
                    <tr key={file.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={!!selected[file.id]}
                          onChange={() => toggleRow(file.id)}
                        />
                      </td>
                      <td>
                        <div className="certificates-file">
                          <img src={file.icon} alt="" />
                          <div>
                            <div className="certificates-file-title">{file.title}</div>
                            <div className="certificates-file-size">{file.source.certificate_status}</div>
                          </div>
                        </div>
                      </td>
                      <td>{file.date}</td>
                      <td className="certificates-actions">
                        <div
                          ref={openMenuId === file.id ? menuRef : null}
                          className="certificates-actions-menu"
                        >
                          <button
                            type="button"
                            className="certificates-actions-trigger"
                            aria-label="Действия с сертификатом"
                            aria-expanded={openMenuId === file.id}
                            onClick={() => setOpenMenuId((current) => (current === file.id ? null : file.id))}
                          >
                            <img src="/more-vertical.svg" alt="" />
                          </button>
                          {openMenuId === file.id ? (
                            <div className="certificates-actions-popover" role="menu">
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  void downloadFile(file).catch((downloadError: unknown) => {
                                    setError(downloadError instanceof Error ? downloadError.message : 'Не удалось скачать сертификат');
                                  });
                                }}
                              >
                                Скачать
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </TeacherAppShell>
  );
};
