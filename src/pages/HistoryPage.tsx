import { useState, useEffect } from 'react';
import { loadHistory, deleteHistory, clearHistory, type HistoryEntry } from '../utils/storage';
import hexagrams from '../data/hexagrams.json';
import type { HexagramData } from '../data/types';

const hexagramList = hexagrams as HexagramData[];

interface HistoryPageProps {
  onBack: () => void;
  onViewResult: (entry: HistoryEntry) => void;
}

export default function HistoryPage({ onBack, onViewResult }: HistoryPageProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setEntries(loadHistory());
  }, []);

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    deleteHistory(id);
    setEntries(prev => prev.filter(en => en.id !== id));
  }

  function handleClear() {
    clearHistory();
    setEntries([]);
  }

  function formatTime(ts: number): string {
    const d = new Date(ts);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  return (
    <div className="history-page">
      <header className="result-header">
        <button className="btn-back" onClick={onBack}>← 返回</button>
        <span className="header-title">历史记录</span>
        <span className="header-spacer" />
      </header>

      <div className="history-content">
        {entries.length === 0 ? (
          <div className="history-empty">
            <p className="empty-icon">☷</p>
            <p className="empty-text">暂无记录</p>
            <p className="empty-hint">开始抽签后，记录会出现在这里</p>
          </div>
        ) : (
          <>
            <div className="history-list">
              {entries.map(entry => {
                const hexagram = hexagramList[entry.result.mainHexagramId];
                const hasChange = entry.result.changingLinePositions.length > 0;

                return (
                  <div
                    key={entry.id}
                    className="history-item"
                    onClick={() => onViewResult(entry)}
                  >
                    <div className="history-item-left">
                      <span className="history-symbol">{hexagram.symbol}</span>
                      <div className="history-item-info">
                        <span className="history-name">{hexagram.name}</span>
                        <span className="history-time">{formatTime(entry.timestamp)}</span>
                      </div>
                    </div>
                    <div className="history-item-right">
                      {hasChange && <span className="history-badge">有变卦</span>}
                      <button
                        className="history-delete"
                        onClick={(e) => handleDelete(entry.id, e)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="history-actions">
              <button className="btn-clear" onClick={handleClear}>
                清空记录
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
