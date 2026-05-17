import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import './setup-teacher-styles.css';

export function SetupTeacherSuccessPage() {
  const navigate = useNavigate();

  const handleReload = () => {
    navigate({ to: '/select-role' });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
      <div style={{ textAlign: 'center', maxWidth: '600px', padding: '40px' }}>
        {/* Иконка молнии */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
          <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 1L1 13H10L9 21L19 9H10L11 1Z" stroke="#7F56D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Заголовок */}
        <h1 style={{ fontSize: '28px', fontFamily: 'Inter SemiBold', fontWeight: 600, lineHeight: '36px', color: '#101828', margin: '0 0 16px 0' }}>
          Регистрация прошла успешно!
        </h1>

        {/* Подзаголовок */}
        <p style={{ fontSize: '16px', lineHeight: '24px', color: '#667085', margin: '0 0 32px 0' }}>
          В течение нескольких дней с вами свяжется организатор
        </p>

        {/* Кнопка */}
        <button
          onClick={handleReload}
          style={{
            padding: '12px 24px',
            background: '#7848FF',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 600,
            lineHeight: '24px',
            cursor: 'pointer',
            width: '100%',
            transition: 'all 0.2s ease',
            fontFamily: 'Inter SemiBold',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#6b38cc';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(120, 72, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#7848FF';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Перезагрузить страницу
        </button>
      </div>
    </div>
  );
}
