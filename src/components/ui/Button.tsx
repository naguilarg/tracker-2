import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'primary', size = 'md', ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';

        const variants = {
            primary: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
            secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
            outline: 'border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground',
            ghost: 'hover:bg-accent hover:text-accent-foreground',
            destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        };

        const sizes = {
            sm: 'h-8 px-3 text-xs',
            md: 'h-9 px-4 py-2 text-sm',
            lg: 'h-10 px-8 text-base',
            icon: 'h-9 w-9',
        };

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                {...props}
            />
        );
    }
);
