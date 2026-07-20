import { useState, useEffect, useRef } from 'react';
import { Link } from '@tanstack/react-router';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // управляет классом is-open
  const menuRef = useRef(null);
  const burgerRef = useRef(null);

  const toggleMenu = () => {
    if (isMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const openMenu = () => {
    setIsMenuOpen(true);
    setIsClosing(false);
    setIsOpen(false); // сначала без is-open
    // после рендера даём браузеру время применить начальное состояние, затем добавляем is-open
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsOpen(true);
      });
    });
  };

  const closeMenu = () => {
    setIsClosing(true);
    setIsOpen(false); // убираем is-open, чтобы началась анимация закрытия
    setTimeout(() => {
      setIsMenuOpen(false);
      setIsClosing(false);
    }, 350);
  };

  // Закрытие по клику вне
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isMenuOpen || isClosing) return;
      if (burgerRef.current && burgerRef.current.contains(event.target)) return;
      if (menuRef.current && menuRef.current.contains(event.target)) return;
      closeMenu();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen, isClosing]);

  // Блокировка скролла
  useEffect(() => {
    document.body.style.overflow = (isMenuOpen && !isClosing) ? 'hidden' : 'auto';
    return () => (document.body.style.overflow = 'auto');
  }, [isMenuOpen, isClosing]);

  return (
    <>
      <header className="site-header" id="top">
        <div className="container header-bar">
          <a className="brand" href="#top">
            <img src="/icons/logo.svg" alt="Сигма" style={{ height: '12px', width: 'auto' }} />
          </a>
          <nav className="header-nav" aria-label="Основная навигация">
            <a href="#about">О Сигме</a>
            <a href="#history">История</a>
            <a href="#reviews">Отзывы</a>
            <a href="#faq">FAQ</a>
            <a href="#contacts">Контакты</a>
            <Link className="header-nav__login" to="/enter">Вход</Link>
          </nav>
          <button
            className="burger"
            onClick={toggleMenu}
            ref={burgerRef}
            aria-label="Меню"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <img src="/icons/bclose.svg" alt="Закрыть" width="28" height="28" />
            ) : (
              <img src="/icons/burger.svg" alt="Открыть меню" width="28" height="28" />
            )}
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <>
          <div
            className={`menu-overlay ${isClosing ? 'is-closing' : ''}`}
            onClick={closeMenu}
          ></div>
          <div
            className={`mobile-menu ${isOpen ? 'is-open' : ''} ${isClosing ? 'is-closing' : ''}`}
            ref={menuRef}
          >
            <nav className="mobile-nav" aria-label="Мобильная навигация">
              <a href="#about" onClick={closeMenu}>О Сигме</a>
              <a href="#history" onClick={closeMenu}>История</a>
              <a href="#reviews" onClick={closeMenu}>Отзывы</a>
              <a href="#faq" onClick={closeMenu}>FAQ</a>
              <a href="#contacts" onClick={closeMenu}>Контакты</a>
              <Link className="header-nav__login" to="/enter" onClick={closeMenu}>Вход</Link>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
