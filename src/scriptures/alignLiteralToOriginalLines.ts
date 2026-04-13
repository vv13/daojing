/**
 * 将一条白话直译字符串拆成与原文行数相同的若干行，供逐行对照展示。
 * - 优先按句末标点切分；
 * - 段数过多则合并最短相邻段；
 * - 段数过少则优先按逗号拆分，仍不足时按长度均分补齐；
 * - 原文空行会保留为空翻译行（便于段落对齐）。
 */
const END_SENT = /(?<=[。！？])/gu;

function mergeShortestPair(parts: string[]): string[] {
  if (parts.length < 2) return parts;
  let bestI = 0;
  let bestLen = Infinity;
  for (let i = 0; i < parts.length - 1; i++) {
    const len = parts[i].length + parts[i + 1].length;
    if (len < bestLen) {
      bestLen = len;
      bestI = i;
    }
  }
  return [...parts.slice(0, bestI), parts[bestI] + parts[bestI + 1], ...parts.slice(bestI + 2)];
}

function splitAtBestComma(s: string): [string, string] | null {
  if (s.length < 4) return null;
  const mid = s.length / 2;
  const prefer = '，；、';
  let bestJ = -1;
  let bestDist = Infinity;
  for (let j = 0; j < s.length; j++) {
    if (prefer.includes(s[j])) {
      const d = Math.abs(j + 0.5 - mid);
      if (d < bestDist) {
        bestDist = d;
        bestJ = j;
      }
    }
  }
  if (bestJ < 0) return null;
  const a = s.slice(0, bestJ + 1).trim();
  const b = s.slice(bestJ + 1).trim();
  if (!a || !b) return null;
  return [a, b];
}

function expandToCount(parts: string[], n: number): string[] | null {
  let units = [...parts];
  while (units.length < n) {
    const idx = units.reduce((bi, u, i) => (u.length > units[bi].length ? i : bi), 0);
    const sp = splitAtBestComma(units[idx]);
    if (!sp) return null;
    units = [...units.slice(0, idx), sp[0], sp[1], ...units.slice(idx + 1)];
  }
  return units;
}

function splitByLength(text: string, n: number): string[] {
  if (n <= 1) return [text.trim()];
  const clean = text.trim();
  if (!clean) return Array.from({ length: n }, () => '');

  const chars = [...clean];
  const total = chars.length;
  const result: string[] = [];
  let start = 0;
  for (let i = 0; i < n; i++) {
    const end = Math.round(((i + 1) * total) / n);
    result.push(chars.slice(start, end).join('').trim());
    start = end;
  }
  return result;
}

function alignToCount(text: string, n: number): string[] | null {
  if (n <= 0) return null;
  const trimmed = text.trim();
  if (!trimmed) return Array.from({ length: n }, () => '');

  const explicit = trimmed.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  if (explicit.length === n) return explicit;

  let parts = trimmed.split(END_SENT).map((s) => s.trim()).filter((s) => s.length > 0);
  if (parts.length === 0) parts = [trimmed];

  while (parts.length > n) {
    parts = mergeShortestPair(parts);
  }

  if (parts.length < n) {
    const expanded = expandToCount(parts, n);
    if (expanded && expanded.length === n) {
      parts = expanded;
    } else {
      return splitByLength(trimmed, n);
    }
  }

  return parts.length === n ? parts : splitByLength(trimmed, n);
}

export function alignLiteralToOriginalLines(original: string[] | string, literalContent: string): string[] | null {
  const origLines = Array.isArray(original) ? original : original.split('\n');
  if (origLines.length <= 0) return null;

  const nonEmptyIndexes: number[] = [];
  for (let i = 0; i < origLines.length; i++) {
    if (origLines[i].trim() !== '') nonEmptyIndexes.push(i);
  }
  if (nonEmptyIndexes.length === 0) return null;

  const alignedNonEmpty = alignToCount(literalContent, nonEmptyIndexes.length);
  if (!alignedNonEmpty) return null;

  const result = Array.from({ length: origLines.length }, () => '');
  nonEmptyIndexes.forEach((lineIndex, i) => {
    result[lineIndex] = alignedNonEmpty[i] ?? '';
  });
  return result;
}
