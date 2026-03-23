import { useState, useEffect, useRef, useCallback } from 'react';
import { pinyin } from 'pinyin-pro';
import { daodejing, type Chapter, type ExplanationType } from './daodejing';
import TopBar from './components/TopBar';
import './App.css';

interface ReadingStats {
  readChapters: number[];
  readingChapters: number[];
  insightStates: Record<string, InsightStateKey>;
  chapterTimes: Record<string, number>;
}

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}小时${m}分${s}秒`;
  if (m > 0) return `${m}分${s}秒`;
  return `${s}秒`;
};

type InsightStateKey =
  | 'init'
  | 'seeking'
  | 'observing'
  | 'heard'
  | 'reflecting'
  | 'subtle'
  | 'awakened';

const completedInsightStates: InsightStateKey[] = ['heard', 'reflecting', 'subtle', 'awakened'];
const isCompletedInsightState = (state?: InsightStateKey) => Boolean(state && completedInsightStates.includes(state));

const insightStates = [
  {
    key: 'init' as const,
    label: '叩门',
    hint: '站在众妙之门外，准备叩响真理。',
    badge: '叩门',
  },
  {
    key: 'seeking' as const,
    label: '涉溪',
    hint: '刚刚踏入老子思想的溪流，感受清凉。',
    badge: '涉溪',
  },
  {
    key: 'observing' as const,
    label: '观象',
    hint: '「执大象，天下往」。正在观察道之气象。',
    badge: '观象',
  },
  {
    key: 'heard' as const,
    label: '闻道',
    hint: '听闻了这一章的真理，余音绕梁。',
    badge: '闻道',
  },
  {
    key: 'reflecting' as const,
    label: '存思',
    hint: '闭目静坐，将文字转化为内心的神采。',
    badge: '存思',
  },
  {
    key: 'subtle' as const,
    label: '入微',
    hint: '察觉到文字背后极其细微、不可言说的规律。',
    badge: '入微',
  },
  {
    key: 'awakened' as const,
    label: '悟道',
    hint: '此时已无所谓读与不读，与道合一。',
    badge: '悟道',
  },
];

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

const ui = {
  appTitle: '《道德经》',
  subtitle: '老子',
  progress: '阅读进度',
  totalDuration: '累计时长',
  chapterUnit: '章',
  reading: '观象',
  insightTitle: '悟道状态',
  back: '返回目录',
  chapterReading: '本章悟道',
  chapterPrefix: '第',
  original: '原文',
  explanation: '解释',
  explanationTabs: '释义风格',
  pinyin: '拼',
  prev: '上一章',
  next: '下一章',
  nightModeEnable: '开启夜览',
  nightModeDisable: '关闭夜览',
} as const;

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
  const [showPinyin, setShowPinyin] = useState(false);
  const [nightMode, setNightMode] = useState(() => {
    try {
      return localStorage.getItem('daodejing_night') === '1';
    } catch {
      return false;
    }
  });
  const [activeExplanation, setActiveExplanation] = useState<ExplanationType>('literal');
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
    try {
      localStorage.setItem('daodejing_night', nightMode ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [nightMode]);

  useEffect(() => {
    currentReadingTimeRef.current = currentReadingTime;
  }, [currentReadingTime]);

  useEffect(() => {
    chapterTimesRef.current = chapterTimes;
  }, [chapterTimes]);

  // 从 localStorage 读取阅读状态（兼容旧格式），并与 URL ?chapter= 对齐阅读进度
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

  // chapterTimes 变化时保存到 localStorage
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
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
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
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    isRunningRef.current = false;
  }, []);

  // 页面可见性变化处理
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        flushCurrentTime();
        stopTimer();
      } else if (isDetailMode) {
        startTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isDetailMode, startTimer, stopTimer, flushCurrentTime]);

  // 进入阅读详情时开始计时，离开时停止
  useEffect(() => {
    if (isDetailMode) {
      startTimer();
    } else {
      stopTimer();
    }
    return () => stopTimer();
  }, [isDetailMode, startTimer, stopTimer]);

  // 定期将当前阅读时间写入 chapterTimes（每 5 秒）
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (isRunningRef.current) flushCurrentTime();
    }, 5000);
    return () => clearInterval(interval);
  }, [flushCurrentTime]);

  // 组件卸载时停止计时并保存
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
      setActiveExplanation('literal');
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
        flushCurrentTime();
        stopTimer();
        setIsDetailMode(false);
        setCurrentChapter(null);
        currentChapterIdRef.current = null;
        return;
      }
      const ch = daodejing.find((c) => c.id === id);
      if (ch) goToChapter(ch, 'none');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [flushCurrentTime, stopTimer, goToChapter]);

  const handleChapterClick = (chapter: Chapter) => {
    goToChapter(chapter, 'push');
  };

  const handleInsightStateChange = (state: InsightStateKey) => {
    const chapterId = currentChapter?.id;
    if (!chapterId) return;
    setInsightChapterStates(prev => ({ ...prev, [chapterId]: state }));
    setReadChapters(prev => {
      if (isCompletedInsightState(state)) {
        return prev.includes(chapterId) ? prev : [...prev, chapterId];
      }
      return prev.filter(id => id !== chapterId);
    });
    setReadingChapters(prev => prev.filter(id => id !== chapterId));
  };

  const handleBack = () => {
    flushCurrentTime();
    stopTimer();
    setIsDetailMode(false);
    setCurrentChapter(null);
    currentChapterIdRef.current = null;
    setChapterSearchParam(null, 'replace');
  };

  const totalTime = Object.values(chapterTimes).reduce((a, b) => a + b, 0)
    + (currentChapterIdRef.current != null
      ? Math.max(0, currentReadingTime - (chapterTimes[currentChapterIdRef.current] || 0))
      : 0);

  const progress = Math.round((readChapters.length / daodejing.length) * 100);

  const isChapterRead = (id: number) => readChapters.includes(id);
  const isChapterReading = (id: number) => readingChapters.includes(id) && !isChapterRead(id);
  const getInsightState = (id: number) => insightChapterStates[id];
  const getInsightBadge = (id: number) => {
    const state = insightStates.find(item => item.key === getInsightState(id));
    if (!state) return null;
    return state.badge;
  };

  const renderChapterList = () => (
    <div className="chapter-list">
      <header className="header">
        <h1>{ui.appTitle}</h1>
        <p className="subtitle">{ui.subtitle}</p>
      </header>

      <div className="stats-bar">
        <div className="progress-bar">
          <div className="progress-info">
            <span>
              {ui.progress}{totalTime > 0 ? `（${ui.totalDuration}：${formatTime(Math.floor(totalTime))}）` : ''}
            </span>
            <span>{readChapters.length} / {daodejing.length} {ui.chapterUnit} ({progress}%)</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      <div className="chapters">
        {daodejing.map((chapter) => {
          const chapterTime = chapterTimes[chapter.id];
          return (
            <div
              key={chapter.id}
              className={`chapter-card ${isChapterRead(chapter.id) ? 'read' : ''}`}
              onClick={() => handleChapterClick(chapter)}
            >
              <div className="chapter-number">{chapter.id}</div>
              <div className="chapter-title">{chapter.title}</div>
              {getInsightBadge(chapter.id) && (
                <div className={`read-badge insight-badge insight-badge--${getInsightState(chapter.id)}`}>
                  {getInsightBadge(chapter.id)}
                </div>
              )}
              {!getInsightBadge(chapter.id) && isChapterReading(chapter.id) && (
                <div className="reading-badge insight-badge insight-badge--observing">{ui.reading}</div>
              )}
              {chapterTime > 0 && (
                <div className="chapter-time">{formatTime(chapterTime)}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderChapterDetail = () => {
    if (!currentChapter) return null;

    const currentInsightKey = getInsightState(currentChapter.id);
    const currentInsightState = insightStates.find(s => s.key === currentInsightKey)
      ?? insightStates.find(s => s.key === 'init');
    const insightDescription = currentInsightState?.hint ?? '';

    return (
      <div className="chapter-detail">
        <TopBar
          leftContent={(
            <button className="back-button" onClick={handleBack}>
              <svg className="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              <span>{ui.back}</span>
            </button>
          )}
        />

        <div className="chapter-header">
          <div className="chapter-id">{ui.chapterPrefix} {currentChapter.id} {ui.chapterUnit}</div>
          <h2 className="chapter-title-detail">{currentChapter.title}</h2>
        </div>

        <div className="content-section">
          <div className="section-header">
            <h3>{ui.original}</h3>
            <button
              className={`pinyin-toggle ${showPinyin ? 'active' : ''}`}
              onClick={() => setShowPinyin(prev => !prev)}
            >
              {ui.pinyin}
            </button>
          </div>
          <div className={`original-text ${showPinyin ? 'with-pinyin' : ''}`}>
            {currentChapter.original.split('\n').map((line, i) => (
              <p key={i}>
                {showPinyin
                  ? [...line].map((char, j) => {
                      if (/[\u4e00-\u9fff]/.test(char)) {
                        return (
                          <ruby key={j}>
                            {char}
                            <rp>(</rp><rt>{pinyin(char, { toneType: 'symbol' })}</rt><rp>)</rp>
                          </ruby>
                        );
                      }
                      return <span key={j} className="punctuation">{char}</span>;
                    })
                  : line}
              </p>
            ))}
          </div>
        </div>

        <div className="content-section">
          <h3>{ui.explanation}</h3>
          <div className="explanation-tabs" role="tablist" aria-label={ui.explanationTabs}>
            {currentChapter.explanations.map((item) => (
              <button
                key={item.type}
                className={`explanation-tab ${activeExplanation === item.type ? 'active' : ''}`}
                onClick={() => setActiveExplanation(item.type)}
                role="tab"
                aria-selected={activeExplanation === item.type}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="explanation-text">
            {currentChapter.explanations.find((item) => item.type === activeExplanation)?.content ?? ''}
          </div>
        </div>

        <div className="insight-panel">
          <div className="insight-header">
            <h4>{ui.insightTitle}</h4>
            <span className="insight-chapter-time">{ui.chapterReading}：{formatTime(currentReadingTime)}</span>
          </div>
          <p className="insight-hint">{insightDescription}</p>
          <div className="insight-options">
            {insightStates.map((state) => {
              const isActive = getInsightState(currentChapter.id) === state.key;
              return (
                <button
                  key={state.key}
                  className={`insight-option insight-option--${state.key} ${isActive ? 'active' : ''}`}
                  onClick={() => handleInsightStateChange(state.key)}
                  type="button"
                >
                  <span className="insight-label">{state.label}</span>
                  <span className="insight-desc">{state.hint}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="chapter-nav">
          {currentChapter.id > 1 ? (
            <button
              className="nav-button prev"
              onClick={() => {
                const prev = daodejing.find(c => c.id === currentChapter.id - 1);
                if (prev) {
                  goToChapter(prev, 'replace');
                  window.scrollTo(0, 0);
                }
              }}
            >
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span className="nav-text">
                <span className="nav-label">{ui.prev}</span>
                <span className="nav-title">{(daodejing.find(c => c.id === currentChapter.id - 1) ?? currentChapter).title}</span>
              </span>
            </button>
          ) : (
            <span />
          )}
          {currentChapter.id < daodejing.length ? (
            <button
              className="nav-button next"
              onClick={() => {
                const next = daodejing.find(c => c.id === currentChapter.id + 1);
                if (next) {
                  goToChapter(next, 'replace');
                  window.scrollTo(0, 0);
                }
              }}
            >
              <span className="nav-text">
                <span className="nav-label">{ui.next}</span>
                <span className="nav-title">{(daodejing.find(c => c.id === currentChapter.id + 1) ?? currentChapter).title}</span>
              </span>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 6 15 12 9 18" />
              </svg>
            </button>
          ) : (
            <span />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <button
        type="button"
        className={`night-toggle ${nightMode ? 'night-toggle--on' : ''}`}
        onClick={() => setNightMode((v) => !v)}
        aria-pressed={nightMode}
        aria-label={nightMode ? ui.nightModeDisable : ui.nightModeEnable}
        title={nightMode ? ui.nightModeDisable : ui.nightModeEnable}
      >
        {nightMode ? (
          <svg className="night-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        ) : (
          <svg className="night-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        )}
      </button>
      {isDetailMode ? renderChapterDetail() : renderChapterList()}
    </div>
  );
}

export default App;