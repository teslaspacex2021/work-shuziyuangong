const TOKENS_PER_YI = 100_000_000;

/** Tokens 绝对数量 → 亿（两位小数） */
export const formatTokensYiFromRaw = (raw: number) =>
  `${(raw / TOKENS_PER_YI).toFixed(2)}亿`;

/** 以百万(M)为单位的 Tokens → 亿 */
export const formatTokensYiFromM = (millions: number) =>
  `${(millions / 100).toFixed(2)}亿`;

/** 以万为单位的 Tokens → 亿 */
export const formatTokensYiFromWan = (wan: number) =>
  `${(wan / 10_000).toFixed(2)}亿`;

/** 趋势图 mock 口径（数值 ÷ 1,000,000 = 亿） */
export const formatTokensYiFromChart = (value: number) =>
  `${(value / 1_000_000).toFixed(2)}亿`;

/** 驾驶舱统计字符串（如 45.2M）→ 亿 */
export const formatTokensStat = (value: string | number) => {
  if (typeof value === 'number') return formatTokensYiFromM(value);
  if (value.endsWith('亿')) return value;
  if (value.endsWith('M')) return formatTokensYiFromM(parseFloat(value));
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? formatTokensYiFromM(parsed) : value;
};

/** 已是「亿」为单位的数值 → 展示字符串 */
export const formatTokensYiValue = (yi: number) => `${yi.toFixed(2)}亿`;

export const tokensToYi = (raw: number) => raw / TOKENS_PER_YI;
