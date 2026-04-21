import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';
import { ReactNode } from 'react';

interface CardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  className?: string;
  glass?: boolean;
  hover?: boolean;
}

export function Card({ children, className, glass = true, hover = false, ...props }: CardProps) {
  return (
    <motion.div
      className={cn(
        'rounded-2xl p-6 relative overflow-hidden',
        glass ? 'bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]' : 'bg-[#1a1a1a] border border-white/5',
        hover && 'hover:border-neon-green/30 transition-colors duration-300',
        className
      )}
      whileHover={hover ? { y: -5 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      {...props}
    >
      <div className="relative z-10">{children}</div>
      {/* Subtle top-light effect for glassmorphism */}
      {glass && (
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
      )}
    </motion.div>
  );
}
