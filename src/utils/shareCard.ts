import type { DivinationResult } from '../engine/divination';
import type { HexagramData } from '../data/types';
import hexagrams from '../data/hexagrams.json';

const hexagramList = hexagrams as HexagramData[];

export function generateShareCard(result: DivinationResult): Promise<string> {
  return new Promise((resolve) => {
    const width = 800;
    const main = hexagramList[result.mainHexagramId];
    const transformed = result.transformedHexagramId !== null
      ? hexagramList[result.transformedHexagramId]
      : null;
    const changingLines = result.changingLinePositions
      .map(i => main.lines[i])
      .filter(l => l?.vernacular);

    // 动态计算高度
    let height = 800; // 基础高度
    height += wrapText(getCtx(), main.vernacular, width - 160).length * 38;
    if (changingLines.length > 0) height += 100 + changingLines.length * 40;
    if (transformed) height += 120 + wrapText(getCtx(), transformed.vernacular || '', width - 160).length * 38;
    height += 200; // 感情解读
    height += 200; // 工作解读
    height += 80;  // footer
    height = Math.max(height, 1100);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // 背景
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, '#E8F1FB');
    bg.addColorStop(0.4, '#F5F7FA');
    bg.addColorStop(1, '#FFFFFF');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // 装饰边框
    ctx.strokeStyle = '#4A90D9';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(24, 24, width - 48, height - 48);
    ctx.setLineDash([]);
    ctx.strokeStyle = '#4A90D920';
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // 卦象符号
    ctx.font = '96px "PingFang SC", "Heiti SC", sans-serif';
    ctx.fillStyle = '#1A1A2E';
    ctx.textAlign = 'center';
    ctx.fillText(main.symbol, width / 2, 200);

    // 卦名
    ctx.font = 'bold 42px "PingFang SC", "Heiti SC", sans-serif';
    ctx.fillStyle = '#2C5F9E';
    ctx.fillText(main.name, width / 2, 280);

    // 分隔线
    ctx.strokeStyle = '#4A90D9';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(width / 2 - 120, 310);
    ctx.lineTo(width / 2 + 120, 310);
    ctx.stroke();

    // 卦辞
    ctx.font = '22px "PingFang SC", "Heiti SC", sans-serif';
    ctx.fillStyle = '#6B7280';
    ctx.fillText(main.description, width / 2, 360);

    // 白话
    ctx.font = '26px "PingFang SC", "Heiti SC", sans-serif';
    ctx.fillStyle = '#1A1A2E';
    let y = 420;
    for (const line of wrapText(ctx, main.vernacular, width - 160)) {
      ctx.fillText(line, width / 2, y);
      y += 38;
    }

    // 动爻 + 变卦
    if (result.changingLinePositions.length > 0) {
      y += 24;
      ctx.font = 'bold 22px "PingFang SC", "Heiti SC", sans-serif';
      ctx.fillStyle = '#E8A87C';
      ctx.textAlign = 'center';
      ctx.fillText('动爻', width / 2, y);
      y += 32;

      ctx.font = '20px "PingFang SC", "Heiti SC", sans-serif';
      ctx.fillStyle = '#1A1A2E';
      ctx.textAlign = 'left';
      for (const line of changingLines) {
        const text = `第${line.position}爻：${line.vernacular}`;
        for (const l of wrapText(ctx, text, width - 160)) {
          ctx.fillText(l, 80, y);
          y += 30;
        }
        y += 6;
      }

      if (transformed) {
        y += 16;
        ctx.font = 'bold 22px "PingFang SC", "Heiti SC", sans-serif';
        ctx.fillStyle = '#4A90D9';
        ctx.textAlign = 'center';
        ctx.fillText(`变卦：${transformed.symbol} ${transformed.name}`, width / 2, y);
        y += 36;
        if (transformed.vernacular) {
          ctx.font = '20px "PingFang SC", "Heiti SC", sans-serif';
          ctx.fillStyle = '#3B5998';
          ctx.textAlign = 'left';
          for (const line of wrapText(ctx, transformed.vernacular, width - 160)) {
            ctx.fillText(line, 80, y);
            y += 30;
          }
        }
      }
    }

    y += 28;

    // 感情解读
    y = drawSection(ctx, '感情运势', main.interpretations.love, y, width, '#E8A87C');
    y += 20;
    y = drawSection(ctx, '工作事业', main.interpretations.work, y, width, '#4A90D9');

    // 底部
    ctx.font = '18px "PingFang SC", "Heiti SC", sans-serif';
    ctx.fillStyle = '#9CA3AF';
    ctx.textAlign = 'center';
    ctx.fillText('— 周易v2 · 一卦知吉凶 —', width / 2, height - 40);

    resolve(canvas.toDataURL('image/png'));
  });
}

function getCtx(): CanvasRenderingContext2D {
  const c = document.createElement('canvas');
  c.width = 800;
  c.height = 100;
  const ctx = c.getContext('2d')!;
  ctx.font = '26px "PingFang SC", "Heiti SC", sans-serif';
  return ctx;
}

function drawSection(
  ctx: CanvasRenderingContext2D,
  label: string,
  text: string,
  startY: number,
  width: number,
  color: string,
): number {
  const x = 80;
  let y = startY;
  ctx.font = 'bold 24px "PingFang SC", "Heiti SC", sans-serif';
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.fillText(label, x, y);
  y += 36;
  ctx.font = '22px "PingFang SC", "Heiti SC", sans-serif';
  ctx.fillStyle = '#1A1A2E';
  for (const line of wrapText(ctx, text, width - 160)) {
    ctx.fillText(line, x, y);
    y += 34;
  }
  return y;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const lines: string[] = [];
  let current = '';
  for (const char of text) {
    const test = current + char;
    if (ctx.measureText(test).width > maxWidth && current.length > 0) {
      lines.push(current);
      current = char;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}
