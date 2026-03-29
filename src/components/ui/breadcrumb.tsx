import * as React from 'react';
import { Link, type LinkProps } from 'react-router-dom';

function cn(...parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join(' ');
}

function Breadcrumb({ className = '', ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav aria-label="breadcrumb" data-slot="breadcrumb" className={className.trim()} {...props} />
  );
}

function BreadcrumbList({ className = '', ...props }: React.ComponentProps<'ol'>) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        'm-0 list-none flex flex-wrap items-center gap-x-1 gap-y-1 break-words p-0 text-base leading-none text-(--text-secondary) sm:gap-x-1.5',
        className,
      )}
      {...props}
    />
  );
}

function BreadcrumbItem({ className = '', ...props }: React.ComponentProps<'li'>) {
  return (
    <li data-slot="breadcrumb-item" className={cn('inline-flex min-w-0 items-center', className)} {...props} />
  );
}

/** 与 shadcn 一致；显式去掉 `<a>` 默认下划线（含 visited）。 */
function BreadcrumbLink({ className = '', ...props }: LinkProps) {
  return (
    <Link
      data-slot="breadcrumb-link"
      className={cn(
        'inline-flex min-w-0 min-h-[2.75rem] max-w-full items-center rounded-md px-2 py-1 font-normal no-underline decoration-transparent',
        '-mx-1 touch-manipulation [-webkit-tap-highlight-color:transparent]',
        'text-(--text-secondary) visited:text-(--text-secondary) visited:no-underline',
        'transition-colors hover:bg-(--accent-light)/45 hover:text-(--primary) hover:no-underline active:bg-(--accent-light)/65',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)/35 focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-color)',
        className,
      )}
      {...props}
    />
  );
}

function BreadcrumbPage({ className = '', ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="breadcrumb-page"
      aria-current="page"
      className={cn(
        'inline-flex min-h-[2.75rem] min-w-0 max-w-full items-center px-2 py-1 font-medium leading-none text-(--text-primary)',
        className,
      )}
      {...props}
    />
  );
}

function BreadcrumbSeparator({ children, className = '', ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center self-center text-(--text-light)',
        '[&>svg]:block [&>svg]:size-4 [&>svg]:shrink-0',
        className,
      )}
      {...props}
    >
      {children ?? <ChevronRightIcon />}
    </li>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator };
