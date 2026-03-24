import type { ReactNode } from 'react';

interface TopBarProps {
  leftContent?: ReactNode;
  rightContent?: ReactNode;
}

function TopBar({ leftContent, rightContent }: TopBarProps) {
  if (!leftContent && !rightContent) return null;
  return (
    <div className="flex items-center justify-between min-h-[2.2rem] mb-4 gap-3 flex-nowrap relative">
      {leftContent ? <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 flex-1 min-w-0 overflow-hidden">{leftContent}</div> : null}
      {rightContent ?? null}
    </div>
  );
}

export default TopBar;
