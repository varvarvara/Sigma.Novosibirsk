import type { ReactNode } from "react";
import "./org-panel-state.css";

type OrgPanelStateBaseProps = {
    className?: string;
};

type OrgPanelStateLoadingProps = OrgPanelStateBaseProps & {
    variant: "loading";
    title?: string;
};

type OrgPanelStateErrorProps = OrgPanelStateBaseProps & {
    variant: "error";
    title?: string;
    message: string;
    onRetry?: () => void;
    retryLabel?: string;
};

type OrgPanelStateEmptyProps = OrgPanelStateBaseProps & {
    variant: "empty";
    title: string;
    message?: string;
    action?: ReactNode;
};

export type OrgPanelStateProps =
    | OrgPanelStateLoadingProps
    | OrgPanelStateErrorProps
    | OrgPanelStateEmptyProps;

function ErrorIcon() {
    return (
        <svg className="org-panel-state__icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M12 8.25v4.5M12 16.5h.008"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
            />
            <path
                d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function EmptyIcon() {
    return (
        <svg className="org-panel-state__icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.75" />
            <path
                d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function OrgPanelState(props: OrgPanelStateProps) {
    const className = ["org-panel-state", props.className].filter(Boolean).join(" ");

    if (props.variant === "loading") {
        return (
            <section className={className} aria-busy="true" aria-live="polite">
                <div className="org-panel-state__card">
                    <div className="org-panel-state__spinner" aria-hidden="true" />
                    <p className="org-panel-state__title">{props.title ?? "Загрузка…"}</p>
                </div>
            </section>
        );
    }

    if (props.variant === "error") {
        return (
            <section className={className} role="alert" aria-live="assertive">
                <div className="org-panel-state__card org-panel-state__card--error">
                    <div className="org-panel-state__icon org-panel-state__icon--error">
                        <ErrorIcon />
                    </div>
                    <h2 className="org-panel-state__title">{props.title ?? "Что-то пошло не так"}</h2>
                    <p className="org-panel-state__message">{props.message}</p>
                    {props.onRetry ? (
                        <button
                            className="org-panel-state__button org-panel-state__button--primary"
                            type="button"
                            onClick={props.onRetry}
                        >
                            {props.retryLabel ?? "Повторить"}
                        </button>
                    ) : null}
                </div>
            </section>
        );
    }

    return (
        <section className={className}>
            <div className="org-panel-state__card org-panel-state__card--empty">
                <div className="org-panel-state__icon org-panel-state__icon--empty">
                    <EmptyIcon />
                </div>
                <h2 className="org-panel-state__title">{props.title}</h2>
                {props.message ? <p className="org-panel-state__message">{props.message}</p> : null}
                {props.action ? <div className="org-panel-state__actions">{props.action}</div> : null}
            </div>
        </section>
    );
}
