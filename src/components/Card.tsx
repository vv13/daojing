import type { HTMLAttributes } from 'react';
import './Card.css';

export type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = '', children, ...rest }: CardProps) {
  return (
    <div className={`card ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
