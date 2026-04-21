import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';
import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'disabled'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
}

export function Button({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false,
  disabled = false,
  ...props 
}: ButtonProps) {
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-[0_0_15px_rgba(0,255,102,0.3)] hover:shadow-[0_0_25px_rgba(0,255,102,0.5)]',
    secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/5',
    glass: 'bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10',
    ghost: 'bg-transparent text-gray-300 hover:text-white hover:bg-white/5'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-5 py-2.5 rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl font-semibold'
  };

  return (
    <motion.button
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden transition-colors',
        'disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none',
        variants[variant],
        sizes[size],
        className
      )}
      whileHover={disabled || isLoading ? {} : { scale: 1.02 }}
      whileTap={disabled || isLoading ? {} : { scale: 0.98 }}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />
      )}
      <span className={cn('relative z-10 flex items-center', isLoading && 'opacity-80')}>
        {children}
      </span>
    </motion.button>
  );
}
