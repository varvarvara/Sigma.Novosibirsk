import { useEffect } from 'react';

export default function RegistrationModal({ isOpen, isClosing, onClose }) {
  // Блокировка скролла и компенсация смещения
  useEffect(() => {
    if (isOpen && !isClosing) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.paddingRight = '';
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.paddingRight = '';
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, isClosing]);

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isClosing ? 'is-closing' : ''}`} onClick={onClose}>
      <div
        className={`modal-content ${isClosing ? 'is-closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="modal-title">Регистрация на сезон завершена! Следите за обновлениями!</h2>
        <button className="modal-button" onClick={onClose}>
          Хорошо, буду знать!
        </button>
      </div>
    </div>
  );
}