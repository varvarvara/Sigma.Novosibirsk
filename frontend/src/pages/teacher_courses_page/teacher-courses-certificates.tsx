import React, { useState, useRef, useEffect } from 'react';
import { TeacherSidebar } from '../../shared/ui/teacher_sidebar/teacher-sidebar';
import '../../shared/ui/teacher_sidebar/teacher-sidebar-styles.css';
import './teacher-courses-styles.css';
import { TeacherCoursesSubnav } from './teacher-courses-subnav';

type FileRow = {
  id: string;
  title: string;
  size: string;
  date: string;
  icon: string;
};

export const TeacherCoursesCertificatesPage = () => {
  const [files] = useState<FileRow[]>([
    { id: 'f1', title: 'Сертификат', size: '200 KB', date: 'Jan 4, 2025', icon: '/teacher/courses/file-icon.png' },
    { id: 'f2', title: 'UX Design Guidelines.docx', size: '400 KB', date: 'Jan 8, 2025', icon: '/teacher/courses/file-icon.png' },
    { id: 'f3', title: 'App inspiration.png', size: '800 KB', date: 'Jan 4, 2025', icon: '/teacher/courses/image-icon.png' }
  ]);

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const headerCheckboxRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const total = files.length;
    const selectedCount = Object.values(selected).filter(Boolean).length;
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = false;
      headerCheckboxRef.current.checked = selectedCount === total && total > 0;
    }
  }, [selected, files]);

  const toggleSelectAll = () => {
    const total = files.length;
    const selectedCount = Object.values(selected).filter(Boolean).length;
    if (selectedCount === total) {
      // clear
      setSelected({});
    } else {
      const all: Record<string, boolean> = {};
      files.forEach(f => (all[f.id] = true));
      setSelected(all);
    }
  };

  const toggleRow = (id: string) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="courses-layout">
      <TeacherSidebar />
      <TeacherCoursesSubnav />

      <main className="courses-content">
        <div className="courses-content-inner">
          <h1 className="courses-title">Сертификаты</h1>

          <div className="certificates-card">
            <div className="certificates-header">
              <strong>Файлы</strong>
              <button type="button" className="btn-primary">Скачать</button>
            </div>

            <table className="certificates-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      ref={headerCheckboxRef}
                      checked={files.length > 0 && files.every((file) => selected[file.id])}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>Название файла</th>
                  <th>Размер</th>
                  <th>Дата загрузки</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {files.map(f => (
                  <tr key={f.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={!!selected[f.id]}
                        onChange={() => toggleRow(f.id)}
                      />
                    </td>
                    <td>
                      <div className="certificates-file">
                        <img src={f.icon} alt="" />
                        <div>
                          <div className="certificates-file-title">{f.title}</div>
                          <div className="certificates-file-size">{f.size}</div>
                        </div>
                      </div>
                    </td>
                    <td>{f.size}</td>
                    <td>{f.date}</td>
                    <td className="certificates-actions">
                      <img src="/more-vertical.svg" alt="More" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
