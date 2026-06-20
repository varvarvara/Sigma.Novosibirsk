import React from 'react';

interface CardProps {
    children: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, style, className, onClick }) => {
    return (
        <div 
            className={className}
            onClick={onClick}
            style={{
                backgroundColor: 'white',
                border: '1px solid #EAECF0',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'box-shadow 0.2s',
                ...style
            }}
        >
            {children}
        </div>
    );
};