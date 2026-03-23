import { useState, useEffect, useRef, useCallback } from 'react';
import { pinyin } from 'pinyin-pro';
import { daodejing, type Chapter, type ExplanationType } from './daodejing';
import './App.css';


interface ReadingStats {
  readChapters: number[];
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

function App() {
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [readChapters, setReadChapters] = useState<number[]>([]);
  const [chapterTimes, setChapterTimes] = useState<Record<number, number>>({});
  const [currentReadingTime, setCurrentReadingTime] = useState(0);
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [showPinyin, setShowPinyin] = useState(false);
  const [activeExplanation, setActiveExplanation] = useState<ExplanationType>('literal');

  const currentReadingTimeRef = useRef(0);
  const chapterTimesRef = useRef<Record<number, number>>({});
  const currentChapterIdRef = useRef<number | null>(null);

  const timerRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const isRunningRef = useRef(false);

  const saveStats = useCallback((chapters: number[], times: Record<number, number>) => {
    const stats: ReadingStats = {
      readChapters: chapters,
      chapterTimes: times,
    };
    localStorage.setItem('daodejing_stats', JSON.stringify(stats));
  }, []);

  useEffect(() => {
    currentReadingTimeRef.current = currentReadingTime;
  }, [currentReadingTime]);

  useEffect(() => {
    chapterTimesRef.current = chapterTimes;
  }, [chapterTimes]);

  // 从 localStorage 读取阅读状态（兼容旧格式）
  useEffect(() => {
    const saved = localStorage.getItem('daodejing_stats');
    if (saved) {
      const stats = JSON.parse(saved);
      const chapters: number[] = stats.readChapters || [];
      setReadChapters(chapters);

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
  }, []);

  // chapterTimes 变化时保存到 localStorage
  useEffect(() => {
    if (readChapters.length > 0 || Object.keys(chapterTimes).length > 0) {
      saveStats(readChapters, chapterTimes);
    }
  }, [chapterTimes, readChapters, saveStats]);

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
        const readChaps = saved ? (JSON.parse(saved).readChapters || []) : [];
        localStorage.setItem('daodejing_stats', JSON.stringify({ readChapters: readChaps, chapterTimes: times }));
      }
    };
  }, [stopTimer]);

  const handleChapterClick = (chapter: Chapter) => {
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

    setReadChapters(prev => {
      const newChapters = [...new Set([...prev, chapter.id])];
      return newChapters;
    });
  };

  const handleBack = () => {
    flushCurrentTime();
    stopTimer();
    setIsDetailMode(false);
    setCurrentChapter(null);
    currentChapterIdRef.current = null;
  };

  const totalTime = Object.values(chapterTimes).reduce((a, b) => a + b, 0)
    + (currentChapterIdRef.current != null
      ? Math.max(0, currentReadingTime - (chapterTimes[currentChapterIdRef.current] || 0))
      : 0);

  const progress = Math.round((readChapters.length / daodejing.length) * 100);

  const isChapterRead = (id: number) => readChapters.includes(id);

  const renderChapterList = () => (
    <div className="chapter-list">
      <header className="header">
        <h1>《道德经》</h1>
        <p className="subtitle">老子</p>
      </header>

      <div className="stats-bar">
        <div className="progress-bar">
          <div className="progress-info">
            <span>
              阅读进度{totalTime > 0 ? `（累计时长：${formatTime(Math.floor(totalTime))}）` : ''}
            </span>
            <span>{readChapters.length} / {daodejing.length} 章 ({progress}%)</span>
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
              {isChapterRead(chapter.id) && <div className="read-badge">已读</div>}
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

    return (
      <div className="chapter-detail">
        <div className="detail-topbar">
          <button className="back-button" onClick={handleBack}>
            ← 返回目录
          </button>
          <span className="chapter-reading-time">本章悟道：{formatTime(currentReadingTime)}</span>
        </div>

        <div className="chapter-header">
          <div className="chapter-id">第 {currentChapter.id} 章</div>
          <h2 className="chapter-title-detail">{currentChapter.title}</h2>
        </div>

        <div className="content-section">
          <div className="section-header">
            <h3>原文</h3>
            <button
              className={`pinyin-toggle ${showPinyin ? 'active' : ''}`}
              onClick={() => setShowPinyin(prev => !prev)}
            >
              拼
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
          <h3>解释</h3>
          <div className="explanation-tabs" role="tablist" aria-label="释义风格">
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
            {currentChapter.explanations.find((item) => item.type === activeExplanation)?.content}
          </div>
        </div>

        <div className="chapter-nav">
          {currentChapter.id > 1 ? (
            <button
              className="nav-button prev"
              onClick={() => {
                const prev = daodejing.find(c => c.id === currentChapter.id - 1);
                if (prev) {
                  handleChapterClick(prev);
                  window.scrollTo(0, 0);
                }
              }}
            >
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span className="nav-text">
                <span className="nav-label">上一章</span>
                <span className="nav-title">{daodejing.find(c => c.id === currentChapter.id - 1)?.title}</span>
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
                  handleChapterClick(next);
                  window.scrollTo(0, 0);
                }
              }}
            >
              <span className="nav-text">
                <span className="nav-label">下一章</span>
                <span className="nav-title">{daodejing.find(c => c.id === currentChapter.id + 1)?.title}</span>
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
      {isDetailMode ? renderChapterDetail() : renderChapterList()}
    </div>
  );
}

export default App;