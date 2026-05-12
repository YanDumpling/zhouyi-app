import { useState, useEffect } from 'react';
import hexagrams from '../data/hexagrams.json';
import type { HexagramData } from '../data/types';

const hexagramList = hexagrams as HexagramData[];

interface HomePageProps {
  onStart: () => void;
  onHistory: () => void;
}

export default function HomePage({ onStart, onHistory }: HomePageProps) {
  const [previewId, setPreviewId] = useState(() =>
    Math.floor(Math.random() * 64)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setPreviewId(Math.floor(Math.random() * 64));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const hexagram = hexagramList[previewId];

  return (
    <div className="home-page">
      <header className="home-header">
        <h1 className="app-title">周易v2</h1>
      </header>

      <div className="home-hero">
        <div className="hexagram-preview">
          <span className="preview-symbol">{hexagram.symbol}</span>
          <span className="preview-name">{hexagram.name}</span>
        </div>

        <div className="slogan">
          <p>一卦知吉凶</p>
          <p>万象皆可解</p>
        </div>
      </div>

      <div className="home-actions">
        <button className="btn-primary" onClick={onStart}>
          开始抽签
        </button>
      </div>

      <footer className="home-footer">
        <button className="btn-link" onClick={onHistory}>
          历史记录
        </button>
      </footer>
    </div>
  );
}
