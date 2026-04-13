import { useCallback, useEffect, useState } from 'react';

/** Chromium 等提供的「添加到主屏幕 / 安装」事件（非标准，类型库可能未收录） */
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
}

/**
 * PWA 安装：在支持的浏览器中拦截 `beforeinstallprompt` 并主动触发 `prompt()`；
 * iOS Safari 无该事件，需引导用户通过「分享 → 添加到主屏幕」。
 */
export function usePwaInstall() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [standalone, setStandalone] = useState(() => isStandaloneDisplay());

  useEffect(() => {
    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setDeferred(null);
      setStandalone(true);
    };

    window.addEventListener('beforeinstallprompt', onBip);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBip);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }, [deferred]);

  const canPromptInstall = Boolean(deferred) && !standalone;
  const showIosInstallHint = isIosDevice() && !standalone && !canPromptInstall;

  return {
    canPromptInstall,
    install,
    isStandalone: standalone,
    showIosInstallHint,
  };
}
