import type { CSSProperties } from 'react';
import './route-fallbacks.css';

type RouteFallbackProps = {
  title: string;
  label?: string;
  padding?: string;
  maxWidth?: string;
  titleVariant?: RouteFallbackTitleVariant;
};

export type RouteFallbackTitleVariant =
  | 'hero'
  | 'studentTopbar'
  | 'studentMedium'
  | 'studentLarge'
  | 'teacherPage'
  | 'organizerPage'
  | 'organizerLarge';

function createFallbackStyle(padding?: string, maxWidth?: string) {
  return {
    ...(padding ? { '--route-fallback-padding': padding } : null),
    ...(maxWidth ? { '--route-fallback-max-width': maxWidth } : null),
  } as CSSProperties;
}

function RouteFallbackContent({
  title,
  label = 'Загружаем раздел',
  titleVariant = 'hero',
}: Pick<RouteFallbackProps, 'title' | 'label' | 'titleVariant'>) {
  return (
    <>
      <header className="route-fallback__header">
        <p className="route-fallback__eyebrow">{label}</p>
        <h1 className={`route-fallback__title route-fallback__title--${titleVariant}`}>{title}</h1>
        <div className="route-fallback__line route-fallback__line--wide route-fallback__pulse" />
      </header>

      <div className="route-fallback__hero route-fallback__pulse" />

      <div className="route-fallback__grid">
        <div className="route-fallback__card route-fallback__pulse" />
        <div className="route-fallback__card route-fallback__card--compact route-fallback__pulse" />
        <div className="route-fallback__card route-fallback__card--compact route-fallback__pulse" />
      </div>
    </>
  );
}

export function StudentRouteFallback({ title, label, padding, titleVariant }: RouteFallbackProps) {
  return (
    <main
      className="route-fallback route-fallback--student"
      style={createFallbackStyle(padding)}
      aria-busy="true"
      aria-live="polite"
    >
      <RouteFallbackContent title={title} label={label} titleVariant={titleVariant} />
    </main>
  );
}

export function TeacherRouteFallback({ title, label, padding, maxWidth, titleVariant }: RouteFallbackProps) {
  return (
    <section
      className={`route-fallback route-fallback--teacher${maxWidth ? ' route-fallback--standalone' : ''}`}
      style={createFallbackStyle(padding, maxWidth)}
      aria-busy="true"
      aria-live="polite"
    >
      <RouteFallbackContent title={title} label={label} titleVariant={titleVariant} />
    </section>
  );
}

export function OrganizerRouteFallback({ title, label, padding, titleVariant }: RouteFallbackProps) {
  return (
    <section
      className="org-layout__workspace route-fallback route-fallback--organizer"
      style={createFallbackStyle(padding)}
      aria-busy="true"
      aria-live="polite"
    >
      <RouteFallbackContent title={title} label={label} titleVariant={titleVariant} />
    </section>
  );
}
