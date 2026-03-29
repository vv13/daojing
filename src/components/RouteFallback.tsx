/** 路由或懒加载组件挂起时的占位，保持首屏轻量。 */
export default function RouteFallback() {
  return (
    <div
      className="min-h-[50vh] flex flex-col items-center justify-center gap-2 text-(--text-secondary)"
      role="status"
      aria-live="polite"
    >
      <span className="text-[0.9rem] font-['Kaiti','STKaiti',serif]">加载中…</span>
    </div>
  );
}
