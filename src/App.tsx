import { useState, useCallback } from 'react';
import { castDivination } from './engine/divination';
import type { DivinationResult } from './engine/divination';
import { saveHistory } from './utils/storage';
import type { HistoryEntry } from './utils/storage';
import HomePage from './pages/HomePage';
import ResultPage from './pages/ResultPage';
import HistoryPage from './pages/HistoryPage';
import CoinAnimation from './components/CoinAnimation';

type Page = 'home' | 'loading' | 'result' | 'history';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [result, setResult] = useState<DivinationResult | null>(null);

  const handleStart = useCallback(() => {
    setPage('loading');
  }, []);

  const handleAnimationComplete = useCallback(() => {
    const newResult = castDivination();
    setResult(newResult);
    saveHistory(newResult);
    setPage('result');
  }, []);

  const handleBack = useCallback(() => {
    setPage('home');
    setResult(null);
  }, []);

  const handleHistory = useCallback(() => {
    setPage('history');
  }, []);

  const handleViewResult = useCallback((entry: HistoryEntry) => {
    setResult(entry.result);
    setPage('result');
  }, []);

  if (page === 'loading') {
    return <CoinAnimation onComplete={handleAnimationComplete} />;
  }

  if (page === 'result' && result) {
    return <ResultPage result={result} onBack={handleBack} />;
  }

  if (page === 'history') {
    return <HistoryPage onBack={handleBack} onViewResult={handleViewResult} />;
  }

  return <HomePage onStart={handleStart} onHistory={handleHistory} />;
}
