import type { Chapter } from '../types';
import chaptersData from './chapters.json';

/** 《黄帝阴符经》按传统三篇分章（演道、演法、演术）。正文见 chapters.json。 */
export const yinfujing: Chapter[] = chaptersData as Chapter[];
