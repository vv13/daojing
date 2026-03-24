import { useState } from 'react';
import { pinyin } from 'pinyin-pro';
import { daodejing, type Chapter, type ExplanationType } from '../daodejing';
import TopBar from '../components/TopBar';
import { Card } from '../components/Card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { formatTime, insightStates, ui, type InsightStateKey } from '../constants';

export interface DetailPageProps {
  chapter: Chapter;
  currentReadingTime: number;
  insightChapterStates: Record<number, InsightStateKey>;
  onBack: () => void;
  onInsightStateChange: (state: InsightStateKey) => void;
  onGoToChapter: (chapter: Chapter) => void;
}

export default function DetailPage({
  chapter,
  currentReadingTime,
  insightChapterStates,
  onBack,
  onInsightStateChange,
  onGoToChapter,
}: DetailPageProps) {
  const [showPinyin, setShowPinyin] = useState(false);
  const [activeExplanation, setActiveExplanation] = useState<ExplanationType>('literal');

  const getInsightState = (id: number) => insightChapterStates[id];

  const currentInsightKey = getInsightState(chapter.id);
  const currentInsightState =
    insightStates.find((s) => s.key === currentInsightKey) ?? insightStates.find((s) => s.key === 'init');
  const insightDescription = currentInsightState?.hint ?? '';
  const insightActiveClassMap: Record<InsightStateKey, string> = {
    init: 'bg-(--insight-init-bg) text-(--insight-init-fg)',
    seeking: 'bg-(--insight-seeking-bg) text-(--insight-seeking-fg)',
    observing: 'bg-(--insight-observing-bg) text-(--insight-observing-fg)',
    heard: 'bg-(--insight-heard-bg) text-(--insight-heard-fg)',
    reflecting: 'bg-(--insight-reflecting-bg) text-(--insight-reflecting-fg)',
    subtle: 'bg-(--insight-subtle-bg) text-(--insight-subtle-fg)',
    awakened: 'bg-(--insight-awakened-bg) text-(--insight-awakened-fg)',
  };

  return (
    <div className="chapter-detail animate-[fadeIn_0.3s_ease]">
      <TopBar
        leftContent={
          <button className="inline-flex items-center gap-1 bg-(--card-bg) border border-(--border) px-2.5 py-0 rounded-lg cursor-pointer text-[0.85rem] text-(--text-secondary) h-[2.2rem] transition-[background,color,transform] duration-200 ease-in-out relative z-3 pointer-events-auto touch-manipulation active:scale-[0.98] active:bg-(--accent-light) active:text-(--primary)" onClick={onBack}>
            <svg
              className="w-[0.8rem] h-[0.8rem] shrink-0 transition-transform duration-200 ease-in-out"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 11.5L12 4l9 7.5" />
              <path d="M5.5 10.5V20h13V10.5" />
              <path d="M10 20v-5h4v5" />
            </svg>
            <span>{ui.back}</span>
          </button>
        }
      />

      <div className="text-center mb-[30px] py-[30px] px-5 bg-(--card-bg) rounded-2xl shadow-[0_2px_12px_var(--shadow)]">
        <div className="text-[0.9rem] text-(--text-light) mb-2.5">
          {ui.chapterPrefix} {chapter.id} {ui.chapterUnit}
        </div>
        <h2 className="text-[1.8rem] text-(--primary) font-['Kaiti','STKaiti',serif] tracking-[0.2em]">{chapter.title}</h2>
      </div>

      <Card>
        <div className="flex justify-between items-center gap-2.5 mb-4 pb-2.5 border-b border-(--border)">
          <h3 className="text-[1.1rem] text-(--primary) m-0 font-semibold">{ui.original}</h3>
          <button
            className={`w-[1.9em] h-[1.9em] rounded-full border-[1.5px] border-(--border) bg-(--card-bg) text-(--text-light) text-[0.8rem] cursor-pointer transition-[border-color,color,transform,background] duration-200 ease-in-out flex items-center justify-center shrink-0 touch-manipulation ${showPinyin ? 'active bg-(--primary) border-(--primary) text-white' : 'active:scale-[0.92] active:border-(--primary) active:text-(--primary)'}`}
            onClick={() => setShowPinyin((prev) => !prev)}
          >
            {ui.pinyin}
          </button>
        </div>
        <div
          className={`original-text font-['Kaiti','STKaiti','SimSun',serif] leading-[2] text-(--text-primary) ${showPinyin ? 'with-pinyin leading-[2.35]' : ''}`}
          style={{ fontSize: 'var(--user-font-size)' }}
        >
          {chapter.original.split('\n').map((line, i) => (
            <p key={i}>
              {showPinyin
                ? [...line].map((char, j) => {
                    if (/[\u4e00-\u9fff]/.test(char)) {
                      return (
                        <ruby key={j}>
                          {char}
                          <rp>(</rp>
                          <rt>{pinyin(char, { toneType: 'symbol' })}</rt>
                          <rp>)</rp>
                        </ruby>
                      );
                    }
                    return (
                      <span key={j} className="punctuation">
                        {char}
                      </span>
                    );
                  })
                : line}
            </p>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex justify-between items-center gap-2.5 mb-3.5 pb-2.5 border-b border-(--border)">
          <h3 className="text-[1.1rem] text-(--primary) m-0 font-semibold">{ui.explanation}</h3>
          <div className="m-0 min-w-[140px] max-w-[52%]" aria-label={ui.explanationTabs}>
            <Select value={activeExplanation} onValueChange={(v) => setActiveExplanation(v as ExplanationType)}>
              <SelectTrigger aria-label={ui.explanationTabs}>
                <SelectValue placeholder="选择释义风格" />
              </SelectTrigger>
              <SelectContent>
                {chapter.explanations.map((item) => (
                  <SelectItem key={item.type} value={item.type}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div
          className="leading-[1.8] text-justify font-['Kaiti','STKaiti','SimSun',serif] text-(--text-primary)"
          style={{ fontSize: 'var(--user-font-size)' }}
        >
          {chapter.explanations.find((item) => item.type === activeExplanation)?.content ?? ''}
        </div>
      </Card>

      <Card>
        <div className="flex justify-between items-center gap-2.5 mb-4 pb-2.5 border-b border-(--border) max-[600px]:flex-col max-[600px]:items-start max-[600px]:gap-1">
          <h3 className="text-[1.1rem] text-(--primary) m-0 font-semibold">{ui.insightTitle}</h3>
          <span
            className="font-medium whitespace-nowrap shrink-0 font-['Kaiti','STKaiti','SimSun',serif] text-(--text-primary)"
            style={{ fontSize: 'var(--user-font-size)' }}
          >
            {ui.chapterReading}：{formatTime(currentReadingTime)}
          </span>
        </div>
        <p
          className="m-0 mb-3.5 leading-[1.45] font-['Kaiti','STKaiti','SimSun',serif] text-(--text-primary)"
          style={{ fontSize: 'var(--user-font-size)' }}
        >
          {insightDescription}
        </p>
        <div className="flex flex-wrap gap-2">
          {insightStates.map((state) => {
            const isActive = getInsightState(chapter.id) === state.key;
            return (
              <button
                key={state.key}
                className={`border rounded-full px-3 py-[7px] cursor-pointer transition-[border-color,background-color,color,transform] duration-200 ease-in-out inline-flex items-center gap-1.5 touch-manipulation font-['Kaiti','STKaiti','SimSun',serif] ${isActive ? `border-transparent ${insightActiveClassMap[state.key]}` : 'border-(--border) bg-[#faf8f4] hover:border-(--accent) hover:bg-[#f7f3ec] active:scale-[0.97] active:border-(--accent) active:bg-[#f7f3ec]'}`}
                style={{ fontSize: 'var(--user-font-size)' }}
                onClick={() => onInsightStateChange(state.key)}
                type="button"
              >
                <span
                  className={`font-semibold leading-none font-['Kaiti','STKaiti','SimSun',serif] ${isActive ? 'text-inherit' : 'text-(--text-primary)'}`}
                  style={{ fontSize: 'var(--user-font-size)' }}
                >
                  {state.label}
                </span>
                <span className="hidden">{state.hint}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="flex justify-between gap-4 mt-[30px] max-[600px]:gap-2.5">
        {chapter.id > 1 ? (
          <button
            className="flex items-center gap-3 max-w-[48%] px-5 py-3.5 border border-(--border) rounded-xl text-base cursor-pointer transition-[border-color,background,box-shadow,transform] duration-200 ease-in-out bg-(--card-bg) text-(--primary) shadow-[0_2px_8px_var(--shadow)] touch-manipulation active:scale-[0.97]"
            onClick={() => {
              const prev = daodejing.find((c) => c.id === chapter.id - 1);
              if (prev) {
                onGoToChapter(prev);
                window.scrollTo(0, 0);
              }
            }}
          >
            <svg
              className="w-[1.35em] h-[1.35em] shrink-0 transition-transform duration-300 ease-in-out"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="flex flex-col gap-0.5 overflow-hidden">
              <span className="text-[0.8rem] text-(--text-light) leading-[1.2] text-left">{ui.prev}</span>
              <span className="text-[0.95rem] font-['Kaiti','STKaiti',serif] text-(--primary) leading-[1.3] whitespace-nowrap overflow-hidden text-ellipsis">
                {(daodejing.find((c) => c.id === chapter.id - 1) ?? chapter).title}
              </span>
            </span>
          </button>
        ) : (
          <span />
        )}
        {chapter.id < daodejing.length ? (
          <button
            className="flex items-center gap-3 max-w-[48%] ml-auto px-5 py-3.5 border border-(--border) rounded-xl text-base cursor-pointer transition-[border-color,background,box-shadow,transform] duration-200 ease-in-out bg-(--card-bg) text-(--primary) shadow-[0_2px_8px_var(--shadow)] touch-manipulation active:scale-[0.97]"
            onClick={() => {
              const next = daodejing.find((c) => c.id === chapter.id + 1);
              if (next) {
                onGoToChapter(next);
                window.scrollTo(0, 0);
              }
            }}
          >
            <span className="flex flex-col gap-0.5 overflow-hidden">
              <span className="text-[0.8rem] text-(--text-light) leading-[1.2] text-right">{ui.next}</span>
              <span className="text-[0.95rem] font-['Kaiti','STKaiti',serif] text-(--primary) leading-[1.3] whitespace-nowrap overflow-hidden text-ellipsis">
                {(daodejing.find((c) => c.id === chapter.id + 1) ?? chapter).title}
              </span>
            </span>
            <svg
              className="w-[1.35em] h-[1.35em] shrink-0 transition-transform duration-300 ease-in-out"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
