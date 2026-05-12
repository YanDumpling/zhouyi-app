/** 单爻数据 */
export interface LineData {
  /** 爻位 1-6 (从下往上) */
  position: number;
  /** 爻类型 */
  type: 'yang' | 'yin';
  /** 爻辞原文 */
  original: string;
  /** 爻辞白话 */
  vernacular: string;
}

/** 场景化解读 */
export interface Interpretations {
  /** 感情运势 */
  love: string;
  /** 工作/事业 */
  work: string;
}

/** 完整卦象数据 */
export interface HexagramData {
  /** 伏羲先天序 id (0-63)，对应引擎查表结果 */
  id: number;
  /** 卦名 */
  name: string;
  /** Unicode 卦象符号 */
  symbol: string;
  /** 上卦名 */
  upperTrigram: string;
  /** 下卦名 */
  lowerTrigram: string;
  /** 卦辞原文 */
  description: string;
  /** 白话注释 */
  vernacular: string;
  /** 384爻辞 (6条/卦) */
  lines: LineData[];
  /** 场景化解读 */
  interpretations: Interpretations;
}
