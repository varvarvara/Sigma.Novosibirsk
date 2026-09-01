import { useEffect, useMemo, useState } from "react";
import "./course-cover-thumb.css";

export const DEFAULT_COURSE_COVER_SRC = "/course-cover-default.svg";

type CourseCoverThumbProps = {
    src?: string | null;
    className?: string;
    fallbackSrc?: string;
};

export function CourseCoverThumb({
    src,
    className = "",
    fallbackSrc = DEFAULT_COURSE_COVER_SRC,
}: CourseCoverThumbProps) {
    const normalizedSrc = src?.trim() || null;
    const normalizedFallback = fallbackSrc?.trim() || null;

    const preferredSrc = useMemo(
        () => normalizedSrc ?? normalizedFallback,
        [normalizedSrc, normalizedFallback],
    );

    const [activeSrc, setActiveSrc] = useState(preferredSrc);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        setActiveSrc(preferredSrc);
        setFailed(false);
    }, [preferredSrc]);

    const frameClasses = ["course-cover-thumb-frame", className].filter(Boolean).join(" ");

    const imageClasses = "course-cover-thumb";

    const handleError = () => {
        if (activeSrc && normalizedFallback && activeSrc !== normalizedFallback) {
            setActiveSrc(normalizedFallback);
            return;
        }

        setFailed(true);
    };

    return (
        <div className={frameClasses} aria-hidden="true">
            {!activeSrc || failed ? (
                <div className="course-cover-thumb--placeholder" />
            ) : (
                <img
                    className={imageClasses}
                    src={activeSrc}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onError={handleError}
                />
            )}
        </div>
    );
}
