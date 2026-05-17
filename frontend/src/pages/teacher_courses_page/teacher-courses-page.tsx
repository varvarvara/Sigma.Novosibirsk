import React, { useState } from 'react';
import { TeacherSidebar } from '../../shared/ui/teacher_sidebar/teacher-sidebar';
import '../../shared/ui/teacher_sidebar/teacher-sidebar-styles.css';
import './teacher-courses-styles.css';
import { TeacherCoursesSubnav } from './teacher-courses-subnav';

const StarIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3.5L14.6 8.76L20.4 9.6L16.2 13.7L17.2 19.5L12 16.7L6.8 19.5L7.8 13.7L3.6 9.6L9.4 8.76L12 3.5Z" fill="#FDB022" />
    </svg>
);

type Course = {
  id: string;
  title: string;
  season: string;
  description: string;
  stars: number;
  students: number;
  type: 'Олимпиадный' | 'Обычный';
  avatars?: string[];
};

const teacherCoursesStorageKey = 'teacherCourses';

const defaultCourses: Course[] = [
    {
        id: 'bio',
        title: 'Биология',
        season: 'Сезон 2026',
        description: 'Интенсивный курс по биологии с практическими заданиями и разбором олимпиадных задач.',
        stars: 5,
        students: 12,
        type: 'Олимпиадный',
        avatars: ['/teacher/sidebar/avatar.png','/teacher/sidebar/avatar.png','/teacher/sidebar/avatar.png']
    },
    {
        id: 'cs',
        title: 'Программирование',
        season: 'Сезон 2026',
        description: 'Курс по основам программирования и алгоритмам для начинающих и продолжающих.',
        stars: 4,
        students: 24,
        type: 'Обычный',
        avatars: ['/teacher/sidebar/avatar.png','/teacher/sidebar/avatar.png']
    },
    {
        id: 'philosophy',
        title: 'Философия',
        season: 'Сезон 2026',
        description: 'Курс по истории философии и критическому мышлению с обсуждениями и эссе.',
        stars: 3,
        students: 8,
        type: 'Обычный',
        avatars: ['/teacher/sidebar/avatar.png']
    }
];

const getCourses = (): Course[] => {
    const savedCourses = JSON.parse(localStorage.getItem(teacherCoursesStorageKey) ?? '[]') as Course[];

    return [...defaultCourses, ...savedCourses];
};

export function TeacherCoursesPage() {
    const [courses] = useState<Course[]>(getCourses);

    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

    const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? null;

    const getDetailAvatars = (course: Course) => {
      const avatars = course.avatars && course.avatars.length > 0 ? course.avatars : [];
      const placeholder = '/teacher/sidebar/avatar.png';
      const shownCount = Math.min(5, course.students || 0);
      const shownAvatars: string[] = [];
      for (let i = 0; i < shownCount; i++) {
        if (i < avatars.length) shownAvatars.push(avatars[i]);
        else shownAvatars.push(placeholder);
      }
      const remaining = Math.max(0, course.students - shownAvatars.length);
      return { shownAvatars, remaining };
    };

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
                        {courses.map((c) => (
                            <div key={c.id} className="course-mini-card">
                                <h3>{c.title}</h3>
                                <p>{c.season}</p>
                                <button
                                    type="button"
                                    onClick={() => setSelectedCourseId(c.id)}
                                >
                                    Подробнее
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="course-divider"></div>

                    {selectedCourse && (() => {
                      const { shownAvatars, remaining } = getDetailAvatars(selectedCourse);
                      return (
                        <div className="course-detail-card">
                          <div className="course-detail-header">
                            <div>
                              <h3>{selectedCourse.title}</h3>
                              <div className="course-detail-desc">{selectedCourse.description}</div>
                              <div className="course-syllabus-link">Ссылка на силлабус</div>
                              <div className="course-detail-actions-row">
                                <div className="course-students-row">
                                  <span className="course-tag">{selectedCourse.type}</span>
                                  <span className="students-count">{selectedCourse.students} учеников</span>

                                  <div className="course-avatars">
                                    {shownAvatars.map((src, idx) => (
                                      <img key={idx} src={src} alt="" />
                                    ))}
                                    {remaining > 0 && <span className="avatar-more">+{remaining}</span>}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="course-detail-collapse-btn"
                                  onClick={() => setSelectedCourseId(null)}
                                >
                                  Свернуть
                                </button>
                              </div>
                             </div>
                            <div className="course-detail-rating">
                              {Array.from({ length: selectedCourse.stars }).map((_, i) => (
                                <StarIcon key={i} />
                              ))}
                            </div>
                          </div>

                          <div className="course-detail-body">
                          </div>
                        </div>
                      );
                    })()}

                </div>
            </main>
        </div>
    );
}
