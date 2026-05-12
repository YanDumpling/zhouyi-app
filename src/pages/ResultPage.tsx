import { useCallback } from 'react';
import type { DivinationResult } from '../engine/divination';
import type { HexagramData } from '../data/types';
import hexagrams from '../data/hexagrams.json';
import { lineToSymbol } from '../engine/divination';
import { generateShareCard } from '../utils/shareCard';

const hexagramList = hexagrams as HexagramData[];

interface ResultPageProps {
  result: DivinationResult;
  onBack: () => void;
}

export default function ResultPage({ result, onBack }: ResultPageProps) {
  const mainHexagram = hexagramList[result.mainHexagramId];
  const transformedHexagram = result.transformedHexagramId !== null
    ? hexagramList[result.transformedHexagramId]
    : null;
  const changingLines = result.changingLinePositions.map(i => mainHexagram.lines[i]);

  const handleShare = useCallback(async () => {
    const dataUrl = await generateShareCard(result);
    const link = document.createElement('a');
    link.download = `周易v2-${mainHexagram.name}.png`;
    link.href = dataUrl;
    link.click();
  }, [result, mainHexagram.name]);

  return (
    <div className="result-page">
      <header className="result-header">
        <button className="btn-back" onClick={onBack}>← 返回</button>
        <span className="header-title">周易v2</span>
        <span className="header-spacer" />
      </header>

      <div className="result-content">
        {/* 本卦 */}
        <section className="hexagram-section">
          <h2 className="section-label">本卦</h2>
          <div className="hexagram-card">
            <span className="hexagram-symbol">{mainHexagram.symbol}</span>
            <h3 className="hexagram-name">{mainHexagram.name}</h3>
            <p className="hexagram-desc">{mainHexagram.description}</p>
            <p className="hexagram-vernacular">{mainHexagram.vernacular}</p>

            {/* 6爻展示 */}
            <div className="yao-lines">
              {result.lines.map((value, i) => {
                const isChanging = result.changingLinePositions.includes(i);
                const lineData = mainHexagram.lines[i];
                return (
                  <div
                    key={i}
                    className={`yao-line ${isChanging ? 'changing' : ''}`}
                  >
                    <div className="yao-header">
                      <span className="yao-pos">第{i + 1}爻</span>
                      <span className="yao-type">{lineToSymbol(value)}</span>
                      <span className="yao-bar">
                        {value === 7 || value === 9 ? '━━━' : '━ ━'}
                      </span>
                    </div>
                    {lineData?.original && (
                      <div className="yao-text">
                        <p className="yao-original">{lineData.original}</p>
                        {lineData.vernacular && (
                          <p className="yao-vernacular">{lineData.vernacular}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 动爻 + 变卦 */}
        {result.changingLinePositions.length > 0 && (
          <>
            <section className="changing-section">
              <h2 className="section-label">动爻</h2>
              <p className="changing-info">
                第 {result.changingLinePositions.map(i => i + 1).join('、')} 爻动
              </p>
            </section>

            {changingLines.map((line, idx) => {
              if (!line?.original) return null;
              return (
                <div key={idx} className="changing-detail-card">
                  <div className="changing-detail-header">
                    <span className="changing-badge">
                      第{result.changingLinePositions[idx] + 1}爻
                    </span>
                  </div>
                  <p className="changing-line-text">{line.original}</p>
                  <p className="changing-line-ver">{line.vernacular}</p>
                </div>
              );
            })}

            {transformedHexagram && (
              <section className="hexagram-section">
                <h2 className="section-label">变卦</h2>
                <div className="hexagram-card transformed">
                  <span className="hexagram-symbol">{transformedHexagram.symbol}</span>
                  <h3 className="hexagram-name">{transformedHexagram.name}</h3>
                  <p className="hexagram-desc">{transformedHexagram.description}</p>
                </div>
              </section>
            )}
          </>
        )}

        {/* 场景解读：本卦 + 动爻结合 */}
        {mainHexagram.interpretations.love && (
          <section className="interpretations-section">
            <h2 className="section-label">场景解读</h2>

            {/* 感情 */}
            <div className="interpretation-card">
              <h4>感情运势</h4>
              <p className="interp-main">{mainHexagram.interpretations.love}</p>

              {changingLines.length > 0 && (
                <div className="interp-changing">
                  <p className="interp-changing-label">动爻指引：</p>
                  {changingLines.map((line, idx) => {
                    if (!line?.vernacular) return null;
                    return (
                      <p key={idx} className="interp-line-hint">
                        · 第{result.changingLinePositions[idx] + 1}爻动 — {line.vernacular}
                      </p>
                    );
                  })}
                </div>
              )}

              {transformedHexagram?.interpretations.love && (
                <div className="interp-transformed">
                  <p className="interp-transformed-label">
                    变卦「{transformedHexagram.name}」指引：
                  </p>
                  <p>{transformedHexagram.interpretations.love}</p>
                </div>
              )}
            </div>

            {/* 工作 */}
            <div className="interpretation-card">
              <h4>工作事业</h4>
              <p className="interp-main">{mainHexagram.interpretations.work}</p>

              {changingLines.length > 0 && (
                <div className="interp-changing">
                  <p className="interp-changing-label">动爻指引：</p>
                  {changingLines.map((line, idx) => {
                    if (!line?.vernacular) return null;
                    return (
                      <p key={idx} className="interp-line-hint">
                        · 第{result.changingLinePositions[idx] + 1}爻动 — {line.vernacular}
                      </p>
                    );
                  })}
                </div>
              )}

              {transformedHexagram?.interpretations.work && (
                <div className="interp-transformed">
                  <p className="interp-transformed-label">
                    变卦「{transformedHexagram.name}」指引：
                  </p>
                  <p>{transformedHexagram.interpretations.work}</p>
                </div>
              )}
            </div>
          </section>
        )}

        <div className="share-section">
          <button className="btn-share" onClick={handleShare}>
            保存卦象卡片
          </button>
        </div>
      </div>
    </div>
  );
}
