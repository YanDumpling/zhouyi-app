/**
 * 铜钱法起卦引擎
 *
 * 算法流程:
 * 1. 模拟摇6次铜钱，每次3枚，随机正反面
 * 2. 根据正反面数量判定每爻: 老阳(9)/老阴(6)/少阳(7)/少阴(8)
 * 3. 从下往上排列6爻，计算上下卦索引，查表得本卦
 * 4. 动爻(9或6)阴阳互变，查表得变卦
 */

// ---- 类型 ----

export interface DivinationResult {
  /** 6爻值数组，从下往上 (index 0=初爻, 5=上爻)，值为 6/7/8/9 */
  lines: number[];
  /** 本卦序号 0-63 */
  mainHexagramId: number;
  /** 动爻位置 (0-based, 从下往上) */
  changingLinePositions: number[];
  /** 变卦序号，无动爻时为 null */
  transformedHexagramId: number | null;
  /** 本卦的阴阳爻数组 (阳=true, 阴=false)，用于展示 */
  mainYinYang: boolean[];
  /** 变卦的阴阳爻数组，无动爻时与 mainYinYang 相同 */
  transformedYinYang: boolean[] | null;
}

// ---- 常量 ----

/**
 * 八卦: 每卦由3爻组成，阳爻=1，阴爻=0，从下往上读
 * 索引 = 二进制值 (下爻为低位)
 *
 *   索引: 0=坤☷ 1=震☳ 2=坎☵ 3=兑☱
 *         4=艮☶ 5=离☲ 6=巽☴ 7=乾☰
 */
const TRIGRAM_NAMES = ['坤', '震', '坎', '兑', '艮', '离', '巽', '乾'];

/** 6爻值 → 阴阳: 9(老阳)→阳, 7(少阳)→阳, 6(老阴)→阴, 8(少阴)→阴 */
function isYang(value: number): boolean {
  return value === 9 || value === 7;
}

// ---- 摇卦 ----

/** 随机抛一枚铜钱: true=正面(阳), false=反面(阴) */
function tossCoin(): boolean {
  return Math.random() < 0.5;
}

/**
 * 摇一次铜钱 (3枚)，返回该爻的值
 * 3正(老阳9) / 3反(老阴6) / 2正1反(少阳7) / 2反1正(少阴8)
 */
function castLine(): number {
  let heads = 0;
  for (let i = 0; i < 3; i++) {
    if (tossCoin()) heads++;
  }

  switch (heads) {
    case 3: return 9; // 老阳 (动爻)
    case 0: return 6; // 老阴 (动爻)
    case 2: return 7; // 少阳 (静爻)
    case 1: return 8; // 少阴 (静爻)
    default: return 7; // never reached
  }
}

// ---- 卦象计算 ----

/**
 * 根据3爻 (阳=true, 阴=false) 计算八卦索引 (0-7)
 * 从下往上读，下爻为低位
 */
function calcTrigramIndex(lines: boolean[]): number {
  return (lines[0] ? 1 : 0) | (lines[1] ? 2 : 0) | (lines[2] ? 4 : 0);
}

/**
 * 根据上下卦索引查本卦序号 (0-63)
 * 使用伏羲先天六十四卦序: 上卦索引×8 + 下卦索引
 */
function getHexagramId(upperTrigram: number, lowerTrigram: number): number {
  return upperTrigram * 8 + lowerTrigram;
}

// ---- 主入口 ----

export function castDivination(): DivinationResult {
  // 1. 摇6爻，从下往上
  const lines: number[] = [];
  for (let i = 0; i < 6; i++) {
    lines.push(castLine());
  }

  // 2. 阴阳爻数组
  const mainYinYang = lines.map(isYang);

  // 3. 计算本卦
  const lowerTrigram = calcTrigramIndex(mainYinYang.slice(0, 3));
  const upperTrigram = calcTrigramIndex(mainYinYang.slice(3, 6));
  const mainHexagramId = getHexagramId(upperTrigram, lowerTrigram);

  // 4. 找出动爻 (值为 6 或 9)
  const changingLinePositions: number[] = [];
  for (let i = 0; i < 6; i++) {
    if (lines[i] === 6 || lines[i] === 9) {
      changingLinePositions.push(i);
    }
  }

  // 5. 计算变卦 (动爻阴阳互变)
  let transformedHexagramId: number | null = null;
  let transformedYinYang: boolean[] | null = null;

  if (changingLinePositions.length > 0) {
    const transformed = [...mainYinYang];
    for (const pos of changingLinePositions) {
      transformed[pos] = !transformed[pos];
    }
    transformedYinYang = transformed;

    const tLower = calcTrigramIndex(transformed.slice(0, 3));
    const tUpper = calcTrigramIndex(transformed.slice(3, 6));
    transformedHexagramId = getHexagramId(tUpper, tLower);
  }

  return {
    lines,
    mainHexagramId,
    changingLinePositions,
    transformedHexagramId,
    mainYinYang,
    transformedYinYang,
  };
}

// ---- 辅助函数 ----

/** 爻值 → 中文标记: 老阳○ 老阴× 少阳| 少阴¦ */
export function lineToSymbol(value: number): string {
  switch (value) {
    case 9: return '老阳 ○';
    case 6: return '老阴 ×';
    case 7: return '少阳 丨';
    case 8: return '少阴 ¦';
    default: return '';
  }
}

/** 获取八卦名称 */
export function getTrigramName(index: number): string {
  return TRIGRAM_NAMES[index] || '?';
}
