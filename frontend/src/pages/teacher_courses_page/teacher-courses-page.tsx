import { TeacherSidebar } from '../../shared/ui/teacher_sidebar/teacher-sidebar';
import '../../shared/ui/teacher_sidebar/teacher-sidebar-styles.css';
import './teacher-courses-styles.css';
import { TeacherCoursesSubnav } from './teacher-courses-subnav';

const StarIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3.5L14.6 8.76L20.4 9.6L16.2 13.7L17.2 19.5L12 16.7L6.8 19.5L7.8 13.7L3.6 9.6L9.4 8.76L12 3.5Z" fill="#FDB022" />
    </svg>
);

export function TeacherCoursesPage() {
    return (
        <div className="courses-layout">
            <TeacherSidebar />
            <TeacherCoursesSubnav />

            <main className="courses-content">
                <div className="courses-content-inner">
                    <h1 className="courses-title">Курсы</h1>

                    <div className="courses-tabs">
                        <button className="courses-tab active">Созданные</button>
                        <button className="courses-tab">Опубликованные</button>
                        <button className="courses-tab">В архиве</button>
                    </div>

                    <div className="courses-mini-grid">
                        {['Биология', 'Биология', 'Биология'].map((title, index) => (
                            <div key={`${title}-${index}`} className="course-mini-card">
                                <h3>{title}</h3>
                                <p>Сезон 2026</p>
                                <button type="button">Подробнее</button>
                            </div>
                        ))}
                    </div>

                    <div className="course-divider"></div>

                    <div className="course-detail-card">
                        <div className="course-detail-header">
                            <div>
                                <h3>Биология</h3>
                                <p>Описание</p>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <StarIcon />
                                <StarIcon />
                                <StarIcon />
                                <StarIcon />
                                <StarIcon />
                            </div>
                        </div>

                        <div className="course-detail-body">
                            Описание на&nbsp;&nbsp;2 абзаце
                            <br />
                            <a href="/" style={{ color: '#475467' }}>
                                Ссылка на силлабус
                            </a>
                        </div>

                        <div className="course-tags">
                            <span className="course-tag">Олимпиадный</span>
                            <span>10 учеников</span>
                            <div className="course-avatars">
                                {['/teacher/sidebar/avatar.png', '/teacher/sidebar/avatar.png', '/teacher/sidebar/avatar.png', '/teacher/sidebar/avatar.png', '/teacher/sidebar/avatar.png'].map((src, idx) => (
                                    <img key={`${src}-${idx}`} src={src} alt="" />
                                ))}
                                <span style={{ color: '#7F56D9', fontWeight: 600 }}>+5</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
