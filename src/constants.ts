export type InsightStateKey =
  | 'init'
  | 'seeking'
  | 'observing'
  | 'heard'
  | 'reflecting'
  | 'subtle'
  | 'awakened';

export const completedInsightStates: InsightStateKey[] = ['heard', 'reflecting', 'subtle', 'awakened'];
export const isCompletedInsightState = (state?: InsightStateKey) =>
  Boolean(state && completedInsightStates.includes(state));

export const insightStates = [
  { key: 'init' as const, label: '叩门', hint: '站在众妙之门外，准备叩响真理。', badge: '叩门' },
  { key: 'seeking' as const, label: '涉溪', hint: '刚刚踏入老子思想的溪流，感受清凉。', badge: '涉溪' },
  { key: 'observing' as const, label: '观象', hint: '「执大象，天下往」。正在观察道之气象。', badge: '观象' },
  { key: 'heard' as const, label: '闻道', hint: '听闻了这一章的真理，余音绕梁。', badge: '闻道' },
  { key: 'reflecting' as const, label: '存思', hint: '闭目静坐，将文字转化为内心的神采。', badge: '存思' },
  { key: 'subtle' as const, label: '入微', hint: '察觉到文字背后极其细微、不可言说的规律。', badge: '入微' },
  { key: 'awakened' as const, label: '悟道', hint: '此时已无所谓读与不读，与道合一。', badge: '悟道' },
];

export const ui = {
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
  fontSizeTitle: '正文设置',
} as const;

export const FONT_SIZE_MIN = 8;
export const FONT_SIZE_DEFAULT = 16;
export const FONT_SIZE_MAX = 24;

export const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}小时${m}分${s}秒`;
  if (m > 0) return `${m}分${s}秒`;
  return `${s}秒`;
};
