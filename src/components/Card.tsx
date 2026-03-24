import type { HTMLAttributes } from 'react';

export type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = '', children, ...rest }: CardProps) {
  return (
    <div
      className={`rounded-2xl bg-(--card-bg) p-6 mb-5 shadow-[0_2px_12px_var(--shadow)] ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}
