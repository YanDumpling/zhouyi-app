import { useEffect, useState } from 'react';

interface CoinAnimationProps {
  onComplete: () => void;
}

interface CoinState {
  result: 'heads' | 'tails';
  flipping: boolean;
}

const COIN_SYMBOLS = {
  heads: '⚊', // 阳面
  tails: '⚋', // 阴面
};

export default function CoinAnimation({ onComplete }: CoinAnimationProps) {
  const [phase, setPhase] = useState<'ready' | 'flipping' | 'done'>('ready');
  const [round, setRound] = useState(0); // 当前第几爻 (0-5)
  const [coins, setCoins] = useState<CoinState[]>([
    { result: 'heads', flipping: false },
    { result: 'tails', flipping: false },
    { result: 'heads', flipping: false },
  ]);
  const [lines, setLines] = useState<string[]>([]); // 已生成的各爻符号

  useEffect(() => {
    if (phase === 'ready') {
      const t1 = setTimeout(() => setPhase('flipping'), 300);
      return () => clearTimeout(t1);
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== 'flipping') return;

    // 开始翻转3枚铜钱
    setCoins(prev => prev.map(c => ({ ...c, flipping: true })));

    // 每枚铜钱依次停止翻转
    const timers: ReturnType<typeof setTimeout>[] = [];

    const results: ('heads' | 'tails')[] = [];
    for (let i = 0; i < 3; i++) {
      timers.push(
        setTimeout(() => {
          const res = Math.random() < 0.5 ? 'heads' : 'tails';
          results.push(res);
          setCoins(prev =>
            prev.map((c, idx) =>
              idx === i ? { result: res as 'heads' | 'tails', flipping: false } : c
            )
          );
        }, 400 + i * 350)
      );
    }

    // 全部翻转完成后，记录这一爻的结果
    timers.push(
      setTimeout(() => {
        const heads = results.filter(r => r === 'heads').length;
        let symbol: string;
        if (heads === 3) symbol = '○'; // 老阳
        else if (heads === 0) symbol = '×'; // 老阴
        else if (heads === 2) symbol = '∣'; // 少阳
        else symbol = '¦'; // 少阴

        setLines(prev => [...prev, symbol]);

        if (round >= 5) {
          // 6爻全部完成
          setPhase('done');
          setTimeout(onComplete, 800);
        } else {
          // 准备下一爻
          setRound(prev => prev + 1);
          setPhase('ready');
        }
      }, 1600)
    );

    return () => timers.forEach(clearTimeout);
  }, [phase, round, onComplete]);

  return (
    <div className="coin-animation">
      <div className="coin-stage">
        {/* 3枚铜钱 */}
        <div className="coin-row">
          {coins.map((coin, i) => (
            <div
              key={`${round}-${i}`}
              className={`coin ${coin.flipping ? 'flipping' : ''} ${!coin.flipping && phase === 'flipping' ? 'dropped' : ''}`}
            >
              <div className="coin-inner">
                <div className="coin-front">
                  <span>{COIN_SYMBOLS.heads}</span>
                </div>
                <div className="coin-back">
                  <span>{COIN_SYMBOLS.tails}</span>
                </div>
              </div>
              {!coin.flipping && phase === 'flipping' && (
                <div className="coin-result">
                  <span>{COIN_SYMBOLS[coin.result]}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 当前爻信息 */}
        <div className="round-info">
          <p className="round-label">第 {round + 1} 爻</p>
          {lines.length > 0 && (
            <p className="lines-display">{lines.join(' ')}</p>
          )}
        </div>

        {phase === 'done' && (
          <div className="divination-done">
            <p>卦成</p>
          </div>
        )}
      </div>
    </div>
  );
}
