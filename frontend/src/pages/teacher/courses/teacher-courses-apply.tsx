import { TeacherSidebar } from '../../../shared/ui/teacher_sidebar/teacher-sidebar';
import '../../../shared/ui/teacher_sidebar/teacher-sidebar-styles.css';
import './teacher-courses-styles.css';
import { TeacherCoursesSubnav } from './teacher-courses-subnav';

export const TeacherCoursesApplyPage = () => {
  return (
    <div className="courses-layout">
      <TeacherSidebar />
      <TeacherCoursesSubnav />

      <main className="courses-content">
        <div className="courses-content-inner">
          <h1 className="courses-title">Курсы</h1>

          <form className="courses-form">
            <div>
              <label>Название курса</label>
              <input type="text" defaultValue="Биология" />
            </div>

            <div>
              <label>Ссылка на силлабус</label>
              <input type="text" defaultValue="www.untitledui.com" />
            </div>

            <div>
              <label>Описание</label>
              <textarea defaultValue="I'm a Product Designer based in Melbourne, Australia. I specialise in UX/UI design, brand strategy, and Webflow development." />
              <div style={{ fontSize: '12px', color: '#98A2B3', marginTop: '6px' }}>275 characters left</div>
            </div>

            <div>
              <label>Тип курса</label>
              <select defaultValue="Author">
                <option value="Author">Авторский</option>
                <option value="Olympiad">Олимпиадный</option>
              </select>
            </div>

            <div>
              <label>Ограничения по количеству людей на курсе</label>
              <input type="text" defaultValue="25" />
            </div>

            {["23.07", "25.07", "26.07", "27.07", "28.07", "24.07", "28.07"].map((date) => (
              <div key={date} className="courses-form-row">
                <div>
                  <label>Дата</label>
                  <input type="text" defaultValue={date} />
                </div>
                <div>
                  <label>Время</label>
                  <select defaultValue="">
                    <option value="">Выберите время</option>
                    <option value="10:00">10:00</option>
                    <option value="12:00">12:00</option>
                    <option value="14:00">14:00</option>
                  </select>
                </div>
              </div>
            ))}

            <div className="courses-action-bar">
              <button type="button" className="btn-outline">Удалить</button>
              <button type="button" className="btn-primary">Опубликовать</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
