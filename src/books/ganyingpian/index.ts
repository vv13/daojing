import type { Chapter } from '../types';
import chaptersData from './chapters.json';

/** 《太上感应篇》按总论、善行、恶行、结论分章。正文见 chapters.json。 */
export const ganyingpian: Chapter[] = chaptersData as Chapter[];
