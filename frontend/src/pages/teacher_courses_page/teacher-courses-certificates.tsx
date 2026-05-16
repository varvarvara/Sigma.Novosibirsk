import { TeacherSidebar } from '../../shared/ui/teacher_sidebar/teacher-sidebar';
import '../../shared/ui/teacher_sidebar/teacher-sidebar-styles.css';
import './teacher-courses-styles.css';
import { TeacherCoursesSubnav } from './teacher-courses-subnav';

export const TeacherCoursesCertificatesPage = () => {
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
                  <th><input type="checkbox" /></th>
                  <th>Название файла</th>
                  <th>Размер</th>
                  <th>Дата загрузки</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><input type="checkbox" /></td>
                  <td>
                    <div className="certificates-file">
                      <img src="/teacher/courses/file-icon.png" alt="" />
                      <div>
                        <div style={{ color: '#101828', fontWeight: 600 }}>Сертификат</div>
                        <div>200 KB</div>
                      </div>
                    </div>
                  </td>
                  <td>200 KB</td>
                  <td>Jan 4, 2025</td>
                  <td className="certificates-actions">⋮</td>
                </tr>
                <tr>
                  <td><input type="checkbox" /></td>
                  <td>
                    <div className="certificates-file">
                      <img src="/teacher/courses/file-icon.png" alt="" />
                      <div>
                        <div style={{ color: '#101828', fontWeight: 600 }}>UX Design Guidelines.docx</div>
                        <div>400 KB</div>
                      </div>
                    </div>
                  </td>
                  <td>400 KB</td>
                  <td>Jan 8, 2025</td>
                  <td className="certificates-actions">⋮</td>
                </tr>
                <tr>
                  <td><input type="checkbox" /></td>
                  <td>
                    <div className="certificates-file">
                      <img src="/teacher/courses/image-icon.png" alt="" />
                      <div>
                        <div style={{ color: '#101828', fontWeight: 600 }}>App inspiration.png</div>
                        <div>800 KB</div>
                      </div>
                    </div>
                  </td>
                  <td>800 KB</td>
                  <td>Jan 4, 2025</td>
                  <td className="certificates-actions">⋮</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
