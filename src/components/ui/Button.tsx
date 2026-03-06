import React, { forwardRef, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            variant = 'primary',
            size = 'md',
            isLoading = false,
            leftIcon,
            rightIcon,
            fullWidth = false,
            className = '',
            disabled,
            style,
            ...props
        },
        ref
    ) => {
        const baseStyles = `
      inline-flex items-center justify-center font-semibold 
      rounded-full transition-all duration-200 
      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-95
    `;

        // Use standard Tailwind classes that will definitely work
        const variants: Record<string, { classes: string; inlineStyle?: React.CSSProperties }> = {
            primary: {
                classes: 'text-white hover:shadow-lg',
                inlineStyle: { background: 'linear-gradient(135deg, #FF6B35 0%, #E64A19 100%)' },
            },
            secondary: {
                classes: 'text-white hover:shadow-lg',
                inlineStyle: { background: 'linear-gradient(135deg, #7B1FA2 0%, #4A148C 100%)' },
            },
            outline: {
                classes: 'border-2 border-orange-400 text-orange-500 hover:bg-orange-50',
            },
            ghost: {
                classes: 'text-gray-600 hover:bg-gray-100',
            },
            danger: {
                classes: 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg',
            },
        };

        const sizes = {
            sm: 'px-4 py-2 text-sm gap-1.5',
            md: 'px-6 py-3 text-base gap-2',
            lg: 'px-8 py-4 text-lg gap-2.5',
        };

        const variantConfig = variants[variant];

        return (
            <button
                ref={ref}
                className={`
          ${baseStyles}
          ${variantConfig.classes}
          ${sizes[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
                style={{ ...variantConfig.inlineStyle, ...style }}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <>
                        <svg
                            className="animate-spin h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        <span>Loading...</span>
                    </>
                ) : (
                    <>
                        {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
                        {children}
                        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
                    </>
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
