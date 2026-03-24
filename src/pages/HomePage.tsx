import { daodejing, type Chapter } from '../daodejing';
import { formatTime, insightStates, ui, type InsightStateKey } from '../constants';

export interface HomePageProps {
  readChapters: number[];
  readingChapters: number[];
  insightChapterStates: Record<number, InsightStateKey>;
  chapterTimes: Record<number, number>;
  totalTime: number;
  onChapterClick: (chapter: Chapter) => void;
}

export default function HomePage({
  readChapters,
  readingChapters,
  insightChapterStates,
  chapterTimes,
  totalTime,
  onChapterClick,
}: HomePageProps) {
  const progress = Math.round((readChapters.length / daodejing.length) * 100);

  const isChapterRead = (id: number) => readChapters.includes(id);
  const isChapterReading = (id: number) => readingChapters.includes(id) && !isChapterRead(id);
  const getInsightState = (id: number) => insightChapterStates[id];
  const getInsightBadge = (id: number) => {
    const state = insightStates.find((item) => item.key === getInsightState(id));
    return state?.badge ?? null;
  };

  return (
    <div className="chapter-list">
      <header className="header">
        <h1>{ui.appTitle}</h1>
        <p className="subtitle">{ui.subtitle}</p>
      </header>

      <div className="stats-bar">
        <div className="progress-bar">
          <div className="progress-info">
            <span className="progress-main">
              <span>{ui.progress}</span>
              {totalTime > 0 ? (
                <span className="progress-duration">
                  {ui.totalDuration}：{formatTime(Math.floor(totalTime))}
                </span>
              ) : null}
            </span>
            <span className="progress-summary">
              {readChapters.length} / {daodejing.length} {ui.chapterUnit} ({progress}%)
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
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
              onClick={() => onChapterClick(chapter)}
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
              {chapterTime > 0 && <div className="chapter-time">{formatTime(chapterTime)}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
