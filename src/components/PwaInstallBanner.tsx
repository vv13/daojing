import { ui } from '../constants';
import { usePwaInstall } from '../hooks/usePwaInstall';

export default function PwaInstallBanner() {
  const { canPromptInstall, install, isStandalone, showIosInstallHint } = usePwaInstall();

  if (isStandalone) return null;
  if (!canPromptInstall && !showIosInstallHint) return null;

  return (
    <div
      className="mb-6 rounded-xl border border-(--border) bg-(--accent-light) px-4 py-3.5 shadow-[0_2px_8px_var(--shadow)] flex flex-col gap-2.5 max-[480px]:text-[0.92rem]"
      role="region"
      aria-label={ui.pwaInstallRegion}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="m-0 font-semibold text-(--primary) text-[0.95rem]">{ui.pwaInstallTitle}</p>
          <p className="m-0 mt-1 text-[0.82rem] text-(--text-secondary) leading-relaxed">
            {canPromptInstall ? ui.pwaInstallHint : ui.pwaIosHint}
          </p>
        </div>
        {canPromptInstall ? (
          <button
            type="button"
            onClick={() => void install()}
            className="shrink-0 rounded-lg border border-(--primary) bg-(--primary) px-3.5 py-2 text-[0.88rem] font-medium text-white shadow-sm transition-[transform,opacity] duration-200 hover:opacity-95 active:scale-[0.98] touch-manipulation"
          >
            {ui.pwaInstallAction}
          </button>
        ) : null}
      </div>
    </div>
  );
}
