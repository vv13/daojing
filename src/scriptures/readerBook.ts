import type { Chapter } from '../books/types';
import {
  DAODEJING_SLUG,
  GANYINGPIAN_SLUG,
  YINFUJING_SLUG,
  ZHUANGZI_SLUG,
  scripturePath,
} from './catalog';

export interface ReaderBookConfig {
  slug: string;
  chapters: Chapter[];
  readerPath: string;
  statsStorageKey: string;
  documentTitleShort: string;
  appTitle: string;
  subtitle: string;
  /** 为 false 时章节页不展示「解释」卡片（仅原文等）。默认 true。 */
  showExplanations?: boolean;
  fontPreviewLine: string;
}

type ReaderBookMeta = Omit<ReaderBookConfig, 'chapters'>;

const READER_BOOK_META: Record<string, ReaderBookMeta> = {
  [DAODEJING_SLUG]: {
    slug: DAODEJING_SLUG,
    readerPath: scripturePath(DAODEJING_SLUG),
    statsStorageKey: 'daodejing_stats',
    documentTitleShort: '道德经',
    appTitle: '《道德经》',
    subtitle: '老子',
    fontPreviewLine: '道可道，非常道',
  },
  [YINFUJING_SLUG]: {
    slug: YINFUJING_SLUG,
    readerPath: scripturePath(YINFUJING_SLUG),
    statsStorageKey: 'yinfujing_stats',
    documentTitleShort: '阴符经',
    appTitle: '《阴符经》',
    subtitle: '佚名（托名黄帝）',
    fontPreviewLine: '观天之道，执天之行',
  },
  [ZHUANGZI_SLUG]: {
    slug: ZHUANGZI_SLUG,
    readerPath: scripturePath(ZHUANGZI_SLUG),
    statsStorageKey: 'zhuangzi_stats',
    documentTitleShort: '庄子',
    appTitle: '《庄子》',
    subtitle: '南华经 · 庄周及其后学',
    fontPreviewLine: '北冥有鱼，其名为鲲',
  },
  [GANYINGPIAN_SLUG]: {
    slug: GANYINGPIAN_SLUG,
    readerPath: scripturePath(GANYINGPIAN_SLUG),
    statsStorageKey: 'ganyingpian_stats',
    documentTitleShort: '太上感应篇',
    appTitle: '《太上感应篇》',
    subtitle: '佚名（托名太上老君）',
    fontPreviewLine: '祸福无门，惟人自召',
  },
};

export async function loadReaderBookConfig(
  slug: string | undefined,
): Promise<ReaderBookConfig | null> {
  if (!slug) return null;
  const meta = READER_BOOK_META[slug];
  if (!meta) return null;

  if (slug === DAODEJING_SLUG) {
    const { daodejing } = await import('../books/daodejing');
    return { ...meta, chapters: daodejing };
  }
  if (slug === YINFUJING_SLUG) {
    const { yinfujing } = await import('../books/yinfujing');
    return { ...meta, chapters: yinfujing };
  }
  if (slug === ZHUANGZI_SLUG) {
    const { zhuangzi } = await import('../books/zhuangzi');
    return { ...meta, chapters: zhuangzi };
  }
  if (slug === GANYINGPIAN_SLUG) {
    const { ganyingpian } = await import('../books/ganyingpian');
    return { ...meta, chapters: ganyingpian };
  }
  return null;
}
