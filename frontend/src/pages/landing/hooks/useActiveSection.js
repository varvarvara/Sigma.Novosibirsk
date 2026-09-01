import { useState, useEffect } from 'react';

// id секций, которые мы отслеживаем
const SECTION_IDS = ['about', 'history', 'reviews', 'faq', 'contacts'];

export function useActiveSection() {
  const [activeId, setActiveId] = useState('about');

  useEffect(() => {
    const observers = SECTION_IDS.map((id) => {
      const element = document.getElementById(id);
      if (!element) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveId(id);
          }
        },
        {
          threshold: 0.3, // 30% видимости секции достаточно, чтобы считать её активной
        }
      );

      observer.observe(element);
      return observer;
    });

    return () => {
      observers.forEach((obs) => obs?.disconnect());
    };
  }, []);

  return activeId;
}