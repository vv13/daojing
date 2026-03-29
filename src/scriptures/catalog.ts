/** URL segment under `/jing/:slug` for each scripture. */
export const DAODEJING_SLUG = 'daodejing' as const;
export const YINFUJING_SLUG = 'yinfujing' as const;
export const ZHUANGZI_SLUG = 'zhuangzi' as const;

export const JING_CATALOG_PATH = '/jing';

export const scripturePath = (slug: string) => `/jing/${slug}`;

export const daodejingReaderPath = scripturePath(DAODEJING_SLUG);
export const yinfujingReaderPath = scripturePath(YINFUJING_SLUG);
export const zhuangziReaderPath = scripturePath(ZHUANGZI_SLUG);

export interface ScriptureBookItem {
  slug: string;
  title: string;
  authorLine: string;
  tagline: string;
  /** When false, card is shown as 即将上架. */
  available: boolean;
}

export const SCRIPTURE_CATALOG: ScriptureBookItem[] = [
  {
    slug: DAODEJING_SLUG,
    title: '道德经',
    authorLine: '老子',
    tagline: '八十一章，论道与德、无为与自然。',
    available: true,
  },
  {
    slug: YINFUJING_SLUG,
    title: '阴符经',
    authorLine: '佚名（托名黄帝）',
    tagline: '三篇：演道、演法、演术；阐天道、人事与机变。',
    available: true,
  },
  {
    slug: ZHUANGZI_SLUG,
    title: '庄子',
    authorLine: '庄周（南华经）',
    tagline: '三十三篇：内篇七、外篇十五、杂篇十一；寓言与齐物、逍遥之旨。',
    available: true,
  },
];
