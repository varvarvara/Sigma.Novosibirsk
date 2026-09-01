import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '../../../shared/ui/button/button';
import { Card } from '../../../shared/ui/card/card';

export default function TeacherCourseEditContent() {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: 'Алгоритмы и структуры данных',
        description: 'Курс охватывает основные алгоритмы, структуры данных и их применение',
        bio: 'Более 10 лет преподавания Computer Science',
        syllabus: 'https://example.com/syllabus'
    });
    const [schedule, setSchedule] = useState({
        monday: [{ from: '10:00', to: '11:30', selected: true }],
        wednesday: [{ from: '14:00', to: '15:30', selected: true }],
        friday: [{ from: '10:00', to: '11:30', selected: false }]
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleScheduleToggle = (day: string, index: number) => {
        setSchedule(prev => ({
            ...prev,
            [day]: prev[day as keyof typeof schedule].map((slot, i) => 
                i === index ? { ...slot, selected: !slot.selected } : slot
            )
        }));
    };

    const handleSave = () => {
        setShowModal(true);
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ marginBottom: '32px' }}>
                <button onClick={() => navigate({ to: '/teacher/courses' })} style={{ 
                    background: 'none', border: 'none', color: '#7F56D9', cursor: 'pointer', fontSize: '14px', fontWeight: 600
                }}>← Вернуться к курсам</button>
            </div>

            <h1 style={{ margin: '0 0 8px 0', fontSize: '30px', color: '#101828' }}>Редактирование курса</h1>
            <p style={{ margin: '0 0 32px 0', color: '#475467', fontSize: '16px' }}>Заполните информацию о вашем курсе и выберите доступные слоты</p>

            <Card style={{ marginBottom: '24px' }}>
                <h3 style={{ marginTop: 0, marginBottom: '24px' }}>Основная информация</h3>
                <div style={{ display: 'grid', gap: '24px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#101828' }}>Название курса</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} 
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid #EAECF0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#101828' }}>Описание курса</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={4}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid #EAECF0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#101828' }}>Информация о себе</label>
                        <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid #EAECF0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#101828' }}>Ссылка на силлабус</label>
                        <input type="url" name="syllabus" value={formData.syllabus} onChange={handleChange}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid #EAECF0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
                    </div>
                </div>
            </Card>

            <Card style={{ marginBottom: '24px' }}>
                <h3 style={{ marginTop: 0, marginBottom: '24px' }}>Доступные слоты в расписании</h3>
                <p style={{ color: '#667085', fontSize: '14px', marginBottom: '24px' }}>Выберите дни и время, когда вы можете вести занятия</p>
                
                <div style={{ display: 'grid', gap: '20px' }}>
                    {['Понедельник', 'Среда', 'Пятница'].map((day, idx) => {
                        const dayKey = ['monday', 'wednesday', 'friday'][idx] as keyof typeof schedule;
                        return (
                            <div key={day} style={{ borderBottom: '1px solid #EAECF0', paddingBottom: '20px' }}>
                                <p style={{ margin: '0 0 12px 0', fontWeight: 600, color: '#101828' }}>{day}</p>
                                {schedule[dayKey].map((slot, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                        <input type="checkbox" checked={slot.selected} onChange={() => handleScheduleToggle(dayKey, i)} 
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                                        <span style={{ color: '#475467', fontSize: '14px' }}>{slot.from} — {slot.to}</span>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </Card>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <Button variant="secondary" onClick={() => navigate({ to: '/teacher/courses' })}>Отменить</Button>
                <Button variant="primary" onClick={handleSave}>Сохранить изменения</Button>
            </div>

            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <Card style={{ maxWidth: '400px', textAlign: 'center' }}>
                        <h3 style={{ marginTop: 0, color: '#101828' }}>Ваш курс находится на обработке</h3>
                        <p style={{ color: '#475467', marginBottom: '24px' }}>Организаторы скоро утвердят ваше расписание</p>
                        <Button variant="primary" onClick={() => {
                            setShowModal(false);
                            navigate({ to: '/teacher/courses' });
                        }} style={{ width: '100%' }}>Ок</Button>
                    </Card>
                </div>
            )}
        </div>
    );
}
