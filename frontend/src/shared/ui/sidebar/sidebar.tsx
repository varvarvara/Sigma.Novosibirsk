import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

interface NavItem {
    id: string;
    label: string;
    path: string;
    icon: React.ReactNode;
}

interface SidebarProps {
    items: NavItem[];
    activePath?: string;
}

export function Sidebar({ items, activePath = "" }: SidebarProps) {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    const handleNavigate = (path: string) => {
        navigate({ to: path as any });
        setIsExpanded(false);
    };

    const MenuIcon = () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 5H21V7H3V5ZM3 11H21V13H3V11ZM3 17H21V19H3V17Z" fill="currentColor"/>
        </svg>
    );

    const CloseIcon = () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
        </svg>
    );

    return (
        <>
            <div
                style={{
                    width: isExpanded ? "280px" : "80px",
                    flexShrink: 0,
                    transition: "width 0.3s ease"
                }}
            />
            <aside
                style={{
                    position: "fixed",
                    left: 0,
                    top: 0,
                    height: "100vh",
                    width: isExpanded ? "280px" : "80px",
                    backgroundColor: "#6941C6",
                    color: "white",
                    padding: "24px 16px",
                    display: "flex",
                    flexDirection: "column",
                    transition: "width 0.3s ease",
                    zIndex: 100,
                    boxSizing: "border-box"
                }}
            >
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "32px"
                }}>
                    {isExpanded && (
                        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Sigma</h2>
                    )}
                    <button
                        onClick={toggleExpanded}
                        style={{
                            background: "rgba(255,255,255,0.15)",
                            border: "none",
                            color: "white",
                            cursor: "pointer",
                            padding: "8px",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "40px",
                            height: "40px",
                            transition: "background 0.2s"
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.25)";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.15)";
                        }}
                    >
                        {isExpanded ? <CloseIcon /> : <MenuIcon />}
                    </button>
                </div>

                <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                    {items.map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleNavigate(item.path)}
                            style={{
                                background: activePath === item.path ? "rgba(255,255,255,0.25)" : "transparent",
                                border: "none",
                                color: "white",
                                cursor: "pointer",
                                padding: "12px 16px",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                gap: "16px",
                                transition: "background 0.2s ease",
                                fontSize: "14px",
                                fontWeight: 500,
                                width: "100%",
                                boxSizing: "border-box"
                            }}
                            onMouseEnter={(e) => {
                                if (activePath !== item.path) {
                                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.15)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activePath !== item.path) {
                                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                }
                            }}
                        >
                            <span style={{ display: "flex", alignItems: "center", width: "24px", height: "24px" }}>
                                {item.icon}
                            </span>
                            {isExpanded && (
                                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {item.label}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </aside>

            {isExpanded && (
                <div
                    onClick={() => setIsExpanded(false)}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: "280px",
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.3)",
                        zIndex: 99
                    }}
                />
            )}
        </>
    );
}
