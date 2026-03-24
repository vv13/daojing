import { useState, useEffect, useRef, useCallback } from 'react';
import { daodejing, type Chapter } from './daodejing';
import { Slider } from './components/ui/slider';
import HomePage from './pages/HomePage';
import DetailPage from './pages/DetailPage';
import {
  type InsightStateKey,
  isCompletedInsightState,
  ui,
  FONT_SIZE_MIN,
  FONT_SIZE_DEFAULT,
  FONT_SIZE_MAX,
} from './constants';
import './App.css';

interface ReadingStats {
  readChapters: number[];
  readingChapters: number[];
  insightStates: Record<string, InsightStateKey>;
  chapterTimes: Record<string, number>;
}

const readChapterParam = (): number | null => {
  const raw = new URLSearchParams(window.location.search).get('chapter');
  if (raw == null || raw === '') return null;
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1 || id > daodejing.length) return null;
  return id;
};

const setChapterSearchParam = (chapterId: number | null, mode: 'push' | 'replace') => {
  const path = window.location.pathname || '/';
  const nextUrl = chapterId == null ? path : `${path}?chapter=${encodeURIComponent(String(chapterId))}`;
  const state = { ddj: chapterId != null ? 1 : 0 };
  if (mode === 'push') window.history.pushState(state, '', nextUrl);
  else window.history.replaceState(state, '', nextUrl);
};

const FONT_SIZE_TICKS = [8, 16, 24] as const;

function App() {
  const initialUrlChapterId = readChapterParam();
  const initialChapter =
    initialUrlChapterId != null ? daodejing.find((c) => c.id === initialUrlChapterId) ?? null : null;

  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(initialChapter);
  const [readChapters, setReadChapters] = useState<number[]>([]);
  const [readingChapters, setReadingChapters] = useState<number[]>([]);
  const [insightChapterStates, setInsightChapterStates] = useState<Record<number, InsightStateKey>>({});
  const [chapterTimes, setChapterTimes] = useState<Record<number, number>>({});
  const [currentReadingTime, setCurrentReadingTime] = useState(0);
  const [isDetailMode, setIsDetailMode] = useState(initialChapter != null);
  const [nightMode, setNightMode] = useState(() => {
    try {
      return localStorage.getItem('daodejing_night') === '1';
    } catch {
      return false;
    }
  });
  const [fontSize, setFontSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('daodejing_fontsize');
      if (saved) {
        const n = Number(saved);
        if (Number.isFinite(n)) return Math.max(FONT_SIZE_MIN, Math.min(FONT_SIZE_MAX, Math.round(n)));
      }
    } catch { /* ignore */ }
    return FONT_SIZE_DEFAULT;
  });
  const [showFontSizePopup, setShowFontSizePopup] = useState(false);

  const currentReadingTimeRef = useRef(0);
  const chapterTimesRef = useRef<Record<number, number>>({});
  const currentChapterIdRef = useRef<number | null>(initialChapter?.id ?? null);
  const timerRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const isRunningRef = useRef(false);

  const saveStats = useCallback((chapters: number[], reading: number[], insight: Record<number, InsightStateKey>, times: Record<number, number>) => {
    const insightRecord: Record<string, InsightStateKey> = {};
    for (const [key, value] of Object.entries(insight)) {
      insightRecord[String(key)] = value;
    }
    const stats: ReadingStats = {
      readChapters: chapters,
      readingChapters: reading,
      insightStates: insightRecord,
      chapterTimes: times,
    };
    localStorage.setItem('daodejing_stats', JSON.stringify(stats));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('night-mode', nightMode);
    try { localStorage.setItem('daodejing_night', nightMode ? '1' : '0'); } catch { /* ignore */ }
  }, [nightMode]);

  useEffect(() => {
    document.documentElement.style.setProperty('--user-font-size', `${fontSize}px`);
    try { localStorage.setItem('daodejing_fontsize', String(fontSize)); } catch { /* ignore */ }
  }, [fontSize]);

  useEffect(() => { currentReadingTimeRef.current = currentReadingTime; }, [currentReadingTime]);
  useEffect(() => { chapterTimesRef.current = chapterTimes; }, [chapterTimes]);

  useEffect(() => {
    let readIds: number[] = [];
    const saved = localStorage.getItem('daodejing_stats');
    if (saved) {
      const stats = JSON.parse(saved);
      const chapters: number[] = stats.readChapters || [];
      const reading: number[] = stats.readingChapters || [];
      const savedInsight: Record<number, InsightStateKey> = {};
      if (stats.insightStates) {
        for (const [key, value] of Object.entries(stats.insightStates as Record<string, InsightStateKey>)) {
          savedInsight[Number(key)] = value;
        }
      }
      const hasInsightRecord = Boolean(stats.insightStates);
      const completedByInsight = Object.entries(savedInsight)
        .filter(([, state]) => isCompletedInsightState(state))
        .map(([id]) => Number(id));
      readIds = hasInsightRecord ? completedByInsight : chapters;
      setReadChapters(readIds);
      setReadingChapters(reading.filter(id => !completedByInsight.includes(id)));
      setInsightChapterStates(savedInsight);

      if (stats.chapterTimes) {
        const times: Record<number, number> = {};
        for (const [key, value] of Object.entries(stats.chapterTimes)) {
          times[Number(key)] = value as number;
        }
        setChapterTimes(times);
        chapterTimesRef.current = times;
      } else if (typeof stats.readingTime === 'number' && stats.readingTime > 0 && chapters.length > 0) {
        const perChapter = Math.floor(stats.readingTime / chapters.length);
        const times: Record<number, number> = {};
        chapters.forEach(id => { times[id] = perChapter; });
        setChapterTimes(times);
        chapterTimesRef.current = times;
      }
    }

    const urlId = readChapterParam();
    if (urlId != null) {
      const ch = daodejing.find((c) => c.id === urlId);
      if (ch) {
        setReadingChapters((prev) => {
          if (readIds.includes(ch.id) || prev.includes(ch.id)) return prev;
          return [...prev, ch.id];
        });
        setInsightChapterStates((prev) => {
          if (prev[ch.id]) return prev;
          return { ...prev, [ch.id]: 'init' };
        });
        const acc = chapterTimesRef.current[ch.id] || 0;
        setCurrentReadingTime(acc);
        currentReadingTimeRef.current = acc;
      }
    }
  }, []);

  useEffect(() => {
    if (readChapters.length > 0 || readingChapters.length > 0 || Object.keys(insightChapterStates).length > 0 || Object.keys(chapterTimes).length > 0) {
      saveStats(readChapters, readingChapters, insightChapterStates, chapterTimes);
    }
  }, [chapterTimes, readChapters, readingChapters, insightChapterStates, saveStats]);

  const flushCurrentTime = useCallback(() => {
    const chapterId = currentChapterIdRef.current;
    if (chapterId == null) return;
    const time = Math.floor(currentReadingTimeRef.current);
    if (time <= 0) return;
    setChapterTimes(prev => {
      const updated = { ...prev, [chapterId]: time };
      chapterTimesRef.current = updated;
      return updated;
    });
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    lastTimeRef.current = performance.now();
    isRunningRef.current = true;
    timerRef.current = window.setInterval(() => {
      const now = performance.now();
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      setCurrentReadingTime(prev => {
        const newTime = prev + delta;
        currentReadingTimeRef.current = newTime;
        return newTime;
      });
    }, 100);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    isRunningRef.current = false;
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) { flushCurrentTime(); stopTimer(); }
      else if (isDetailMode) { startTimer(); }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isDetailMode, startTimer, stopTimer, flushCurrentTime]);

  useEffect(() => {
    if (isDetailMode) startTimer(); else stopTimer();
    return () => stopTimer();
  }, [isDetailMode, startTimer, stopTimer]);

  useEffect(() => {
    const interval = window.setInterval(() => { if (isRunningRef.current) flushCurrentTime(); }, 5000);
    return () => clearInterval(interval);
  }, [flushCurrentTime]);

  useEffect(() => {
    return () => {
      stopTimer();
      const chapterId = currentChapterIdRef.current;
      if (chapterId != null) {
        const times = { ...chapterTimesRef.current, [chapterId]: Math.floor(currentReadingTimeRef.current) };
        const saved = localStorage.getItem('daodejing_stats');
        const parsed = saved ? JSON.parse(saved) : {};
        const readChaps = parsed.readChapters || [];
        const readingChaps = parsed.readingChapters || [];
        const states = parsed.insightStates || {};
        localStorage.setItem('daodejing_stats', JSON.stringify({ readChapters: readChaps, readingChapters: readingChaps, insightStates: states, chapterTimes: times }));
      }
    };
  }, [stopTimer]);

  const goToChapter = useCallback(
    (chapter: Chapter, urlMode: 'push' | 'replace' | 'none') => {
      flushCurrentTime();
      stopTimer();
      setCurrentChapter(chapter);
      currentChapterIdRef.current = chapter.id;
      setIsDetailMode(true);
      const accumulated = chapterTimesRef.current[chapter.id] || 0;
      setCurrentReadingTime(accumulated);
      currentReadingTimeRef.current = accumulated;
      startTimer();
      setReadingChapters((prev) => {
        if (readChapters.includes(chapter.id) || prev.includes(chapter.id)) return prev;
        return [...prev, chapter.id];
      });
      setInsightChapterStates((prev) => {
        if (prev[chapter.id]) return prev;
        return { ...prev, [chapter.id]: 'init' };
      });
      if (urlMode !== 'none') setChapterSearchParam(chapter.id, urlMode);
    },
    [flushCurrentTime, stopTimer, startTimer, readChapters],
  );

  useEffect(() => {
    const onPopState = () => {
      const id = readChapterParam();
      if (id == null) {
        flushCurrentTime(); stopTimer();
        setIsDetailMode(false); setCurrentChapter(null); currentChapterIdRef.current = null;
        return;
      }
      const ch = daodejing.find((c) => c.id === id);
      if (ch) goToChapter(ch, 'none');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [flushCurrentTime, stopTimer, goToChapter]);

  const handleChapterClick = (chapter: Chapter) => goToChapter(chapter, 'push');

  const handleInsightStateChange = (state: InsightStateKey) => {
    const chapterId = currentChapter?.id;
    if (!chapterId) return;
    setInsightChapterStates(prev => ({ ...prev, [chapterId]: state }));
    setReadChapters(prev => {
      if (isCompletedInsightState(state)) return prev.includes(chapterId) ? prev : [...prev, chapterId];
      return prev.filter(id => id !== chapterId);
    });
    setReadingChapters(prev => prev.filter(id => id !== chapterId));
  };

  const handleBack = () => {
    flushCurrentTime(); stopTimer();
    setIsDetailMode(false); setCurrentChapter(null); currentChapterIdRef.current = null;
    setChapterSearchParam(null, 'replace');
  };

  const totalTime = Object.values(chapterTimes).reduce((a, b) => a + b, 0)
    + (currentChapterIdRef.current != null
      ? Math.max(0, currentReadingTime - (chapterTimes[currentChapterIdRef.current] || 0))
      : 0);

  return (
    <div className="min-h-screen max-w-[800px] mx-auto p-5 relative">
      <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
        <button
          type="button"
          className="w-[2.2rem] h-[2.2rem] flex items-center justify-center rounded-xl border border-(--border) bg-(--card-bg) text-[color:var(--text-secondary)] cursor-pointer shadow-[0_2px_8px_var(--shadow)] transition-[background,color,border-color,transform] duration-200 ease-in-out touch-manipulation active:scale-[0.96]"
          onClick={() => setShowFontSizePopup((v) => !v)}
          aria-label={ui.fontSizeTitle}
          title={ui.fontSizeTitle}
        >
          <svg className="w-[1.35em] h-[1.35em]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 7V4h16v3" />
            <path d="M9 20h6" />
            <path d="M12 4v16" />
          </svg>
        </button>
        <button
          type="button"
          className={`w-[2.2rem] h-[2.2rem] flex items-center justify-center rounded-xl border border-(--border) bg-(--card-bg) text-[color:var(--text-secondary)] cursor-pointer shadow-[0_2px_8px_var(--shadow)] transition-[background,color,border-color,transform] duration-200 ease-in-out touch-manipulation active:scale-[0.96] ${
            nightMode ? 'text-[color:var(--primary)] border-(--primary-light) bg-(--accent-light)' : ''
          }`}
          onClick={() => setNightMode((v) => !v)}
          aria-pressed={nightMode}
          aria-label={nightMode ? ui.nightModeDisable : ui.nightModeEnable}
          title={nightMode ? ui.nightModeDisable : ui.nightModeEnable}
        >
          {nightMode ? (
            <svg className="w-[1.35em] h-[1.35em]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          ) : (
            <svg className="w-[1.35em] h-[1.35em]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          )}
        </button>
      </div>

      {showFontSizePopup && (
        <>
          <div className="fixed inset-0 z-99 bg-black/25 animate-[fadeOverlay_0.15s_ease]" onClick={() => setShowFontSizePopup(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-100 bg-(--card-bg) rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.18)] w-[min(320px,85vw)] overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <span className="text-[0.95rem] font-semibold text-(--primary)">{ui.fontSizeTitle}</span>
              <svg className="w-4 h-4 text-(--text-light) cursor-pointer shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" onClick={() => setShowFontSizePopup(false)} aria-label="关闭" role="button">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </div>
            <div className="px-5 pb-5 flex flex-col gap-3.5">
              <div className="flex items-center justify-between gap-3">
                <div
                  className="font-['Kaiti','STKaiti','SimSun',serif] text-(--text-primary) leading-[1.8] transition-[font-size] duration-150 ease-in-out"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  道可道，非常道
                </div>
                <span className="text-[0.75rem] text-(--text-light) tabular-nums whitespace-nowrap shrink-0">{fontSize}px</span>
              </div>
              <Slider
                min={FONT_SIZE_MIN}
                max={FONT_SIZE_MAX}
                step={1}
                value={[fontSize]}
                onValueChange={([idx]) => {
                  const safeValue = Math.max(FONT_SIZE_MIN, Math.min(FONT_SIZE_MAX, Math.round(idx)));
                  setFontSize(safeValue);
                }}
                aria-label={ui.fontSizeTitle}
                ticks={FONT_SIZE_TICKS.map((value) => ({ value }))}
              />
            </div>
          </div>
        </>
      )}

      {isDetailMode && currentChapter ? (
        <DetailPage
          chapter={currentChapter}
          currentReadingTime={currentReadingTime}
          insightChapterStates={insightChapterStates}
          onBack={handleBack}
          onInsightStateChange={handleInsightStateChange}
          onGoToChapter={(ch) => goToChapter(ch, 'replace')}
        />
      ) : (
        <HomePage
          readChapters={readChapters}
          readingChapters={readingChapters}
          insightChapterStates={insightChapterStates}
          chapterTimes={chapterTimes}
          totalTime={totalTime}
          onChapterClick={handleChapterClick}
        />
      )}
    </div>
  );
}

export default App;
