import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
    variant = 'primary', 
    size = 'md', 
    children, 
    style,
    ...props 
}) => {
    const baseStyle: React.CSSProperties = {
        borderRadius: '8px',
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        border: '1px solid transparent',
    };

    const variants: Record<string, React.CSSProperties> = {
        primary: {
            backgroundColor: '#7F56D9',
            color: 'white',
            borderColor: '#7F56D9',
        },
        secondary: {
            backgroundColor: 'white',
            color: '#344054',
            borderColor: '#D0D5DD',
        },
        ghost: {
            backgroundColor: 'transparent',
            color: '#667085',
        }
    };

    const sizes: Record<string, React.CSSProperties> = {
        sm: { padding: '8px 14px', fontSize: '14px' },
        md: { padding: '10px 16px', fontSize: '14px' },
        lg: { padding: '12px 20px', fontSize: '16px' },
    };

    return (
        <button 
            style={{ ...baseStyle, ...variants[variant], ...sizes[size], ...style }} 
            {...props}
        >
            {children}
        </button>
    );
};