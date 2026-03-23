import type { ReactNode } from 'react';

interface TopBarProps {
  leftContent?: ReactNode;
  rightContent?: ReactNode;
}

function TopBar({ leftContent, rightContent }: TopBarProps) {
  if (!leftContent && !rightContent) return null;
  return (
    <div className="page-topbar page-topbar-inline">
      {leftContent ? <div className="topbar-left">{leftContent}</div> : null}
      {rightContent ?? null}
    </div>
  );
}

export default TopBar;
