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

  return (
    <div className="chapter-detail">
      <TopBar
        leftContent={
          <button className="back-button" onClick={onBack}>
            <svg
              className="back-icon"
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

      <div className="chapter-header">
        <div className="chapter-id">
          {ui.chapterPrefix} {chapter.id} {ui.chapterUnit}
        </div>
        <h2 className="chapter-title-detail">{chapter.title}</h2>
      </div>

      <Card>
        <div className="section-header">
          <h3>{ui.original}</h3>
          <button
            className={`pinyin-toggle ${showPinyin ? 'active' : ''}`}
            onClick={() => setShowPinyin((prev) => !prev)}
          >
            {ui.pinyin}
          </button>
        </div>
        <div className={`original-text ${showPinyin ? 'with-pinyin' : ''}`}>
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
        <div className="section-header section-header--compact">
          <h3>{ui.explanation}</h3>
          <div className="explanation-select-wrap" aria-label={ui.explanationTabs}>
            <Select value={activeExplanation} onValueChange={(v) => setActiveExplanation(v as ExplanationType)}>
              <SelectTrigger className="explanation-select-trigger" aria-label={ui.explanationTabs}>
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
        <div className="explanation-text">
          {chapter.explanations.find((item) => item.type === activeExplanation)?.content ?? ''}
        </div>
      </Card>

      <Card>
        <div className="section-header section-header--insight">
          <h3>{ui.insightTitle}</h3>
          <span className="insight-chapter-time">
            {ui.chapterReading}：{formatTime(currentReadingTime)}
          </span>
        </div>
        <p className="insight-hint">{insightDescription}</p>
        <div className="insight-options">
          {insightStates.map((state) => {
            const isActive = getInsightState(chapter.id) === state.key;
            return (
              <button
                key={state.key}
                className={`insight-option insight-option--${state.key} ${isActive ? 'active' : ''}`}
                onClick={() => onInsightStateChange(state.key)}
                type="button"
              >
                <span className="insight-label">{state.label}</span>
                <span className="insight-desc">{state.hint}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="chapter-nav">
        {chapter.id > 1 ? (
          <button
            className="nav-button prev"
            onClick={() => {
              const prev = daodejing.find((c) => c.id === chapter.id - 1);
              if (prev) {
                onGoToChapter(prev);
                window.scrollTo(0, 0);
              }
            }}
          >
            <svg
              className="nav-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="nav-text">
              <span className="nav-label">{ui.prev}</span>
              <span className="nav-title">
                {(daodejing.find((c) => c.id === chapter.id - 1) ?? chapter).title}
              </span>
            </span>
          </button>
        ) : (
          <span />
        )}
        {chapter.id < daodejing.length ? (
          <button
            className="nav-button next"
            onClick={() => {
              const next = daodejing.find((c) => c.id === chapter.id + 1);
              if (next) {
                onGoToChapter(next);
                window.scrollTo(0, 0);
              }
            }}
          >
            <span className="nav-text">
              <span className="nav-label">{ui.next}</span>
              <span className="nav-title">
                {(daodejing.find((c) => c.id === chapter.id + 1) ?? chapter).title}
              </span>
            </span>
            <svg
              className="nav-icon"
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
