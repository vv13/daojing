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
  const insightBadgeClassMap: Record<InsightStateKey, string> = {
    init: 'text-[var(--insight-init-fg)] bg-[var(--insight-init-bg)] border-[var(--insight-init-border)]',
    seeking: 'text-[var(--insight-seeking-fg)] bg-[var(--insight-seeking-bg)] border-[var(--insight-seeking-border)]',
    observing: 'text-[var(--insight-observing-fg)] bg-[var(--insight-observing-bg)] border-[var(--insight-observing-border)]',
    heard: 'text-[var(--insight-heard-fg)] bg-[var(--insight-heard-bg)] border-[var(--insight-heard-border)]',
    reflecting: 'text-[var(--insight-reflecting-fg)] bg-[var(--insight-reflecting-bg)] border-[var(--insight-reflecting-border)]',
    subtle: 'text-[var(--insight-subtle-fg)] bg-[var(--insight-subtle-bg)] border-[var(--insight-subtle-border)]',
    awakened: 'text-[var(--insight-awakened-fg)] bg-[var(--insight-awakened-bg)] border-[var(--insight-awakened-border)]',
  };
  const getInsightBadgeClass = (id: number) => {
    const state = getInsightState(id) ?? 'observing';
    return insightBadgeClassMap[state];
  };

  return (
    <div>
      <header className="text-center pt-[calc(2.2rem+30px)] pb-[30px]">
        <h1 className="text-[2.1rem] text-[color:var(--primary)] font-bold tracking-[0.3em] mb-2">{ui.appTitle}</h1>
        <p className="text-[1.1rem] text-[color:var(--text-secondary)] font-['Kaiti','STKaiti',serif]">{ui.subtitle}</p>
      </header>

      <div className="bg-(--card-bg) rounded-xl p-5 mb-[30px] shadow-[0_2px_8px_var(--shadow)]">
        <div className="bg-transparent rounded-none p-0 mb-0 shadow-none">
          <div className="flex justify-between items-start gap-3 mb-3 text-[0.95rem] text-[color:var(--text-secondary)]">
            <span className="inline-flex items-baseline gap-[0.45em] min-w-0">
              <span>{ui.progress}</span>
              {totalTime > 0 ? (
                <span className="text-[0.74em] text-[color:var(--text-light)]">
                  {ui.totalDuration}：{formatTime(Math.floor(totalTime))}
                </span>
              ) : null}
            </span>
            <span className="text-right whitespace-normal break-words max-w-[46%] shrink">
              {readChapters.length} / {daodejing.length} {ui.chapterUnit} ({progress}%)
            </span>
          </div>
          <div className="h-2 bg-(--accent-light) rounded overflow-hidden">
            <div className="h-full bg-[linear-gradient(90deg,var(--primary),var(--accent))] rounded transition-[width] duration-300 ease-in-out" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4">
        {daodejing.map((chapter) => {
          const chapterTime = chapterTimes[chapter.id];
          return (
            <div
              key={chapter.id}
              className={`relative rounded-xl p-[20px_16px] cursor-pointer transition-[translate,box-shadow,border-color] duration-200 ease-in-out shadow-[0_2px_8px_var(--shadow)] border touch-manipulation active:scale-[0.98] hover:-translate-y-1 hover:shadow-[0_8px_20px_var(--shadow)] hover:border-(--accent) ${
                isChapterRead(chapter.id)
                  ? 'border-(--primary-light) bg-[linear-gradient(135deg,#faf8f5_0%,#f5efe6_100%)]'
                  : 'border-transparent bg-(--card-bg)'
              }`}
              onClick={() => onChapterClick(chapter)}
            >
              <div className="text-[0.85rem] text-[color:var(--text-light)] mb-2">{chapter.id}</div>
              <div className="text-[0.9rem] text-[color:var(--text-primary)] font-['Kaiti','STKaiti',serif] leading-[1.4]">{chapter.title}</div>
              {getInsightBadge(chapter.id) && (
                <div className={`absolute top-[0.6em] right-[0.6em] text-[0.7rem] px-[0.55em] py-[0.15em] rounded-[0.65em] font-medium border border-transparent ${getInsightBadgeClass(chapter.id)}`}>
                  {getInsightBadge(chapter.id)}
                </div>
              )}
              {!getInsightBadge(chapter.id) && isChapterReading(chapter.id) && (
                <div className="absolute top-[0.6em] right-[0.6em] text-[0.7rem] px-[0.55em] py-[0.15em] rounded-[0.65em] font-medium border border-transparent text-[var(--insight-observing-fg)] bg-[var(--insight-observing-bg)] border-[var(--insight-observing-border)]">{ui.reading}</div>
              )}
              {chapterTime > 0 && <div className="mt-2 text-[0.75rem] text-[color:var(--text-light)]">{formatTime(chapterTime)}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
