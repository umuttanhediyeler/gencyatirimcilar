import React, { useState, useEffect, useCallback } from 'react';
import { GameState } from './types';

const STOCK_SYMBOLS = ['AAPL', 'TSLA', 'GOOGL', 'AMZN', 'MSFT', 'NVDA', 'JPM', 'V', 'JNJ'];
const COUNTDOWN_SECONDS = 10;
const INITIAL_PRICE_BASE = 175;
const PRICE_FLUCTUATION = 50;
const TRADE_FLUCTUATION = 15;

// Helper to get a random stock symbol
const getRandomStock = () => STOCK_SYMBOLS[Math.floor(Math.random() * STOCK_SYMBOLS.length)];

// A helper function to generate a random initial price
const generateInitialPrice = () => {
  return parseFloat((INITIAL_PRICE_BASE + (Math.random() - 0.5) * PRICE_FLUCTUATION).toFixed(2));
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [currentPrice, setCurrentPrice] = useState<number>(generateInitialPrice);
  const [stockSymbol, setStockSymbol] = useState<string>(getRandomStock);
  const [purchasePrice, setPurchasePrice] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number>(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (gameState !== GameState.TRADING) {
      return;
    }

    if (countdown === 0) {
      setCurrentPrice(prevPrice => {
        const isWin = Math.random() < 0.3; // 30% win ratio, 70% loss ratio
        const changeAmount = (Math.random() * 0.5 + 0.5) * TRADE_FLUCTUATION; // Fluctuate between 50% and 100%
        const priceChange = isWin ? changeAmount : -changeAmount;
        const newPrice = prevPrice + priceChange;
        return parseFloat(Math.max(newPrice, 0.01).toFixed(2)); // Ensure price doesn't go below 0.01
      });
      setGameState(GameState.RESULT);
      setCountdown(COUNTDOWN_SECONDS); // Reset for the next round
      return;
    }

    const timerId = setInterval(() => {
      setCountdown(c => c - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [gameState, countdown]);

  const handleBuy = useCallback(() => {
    if (currentPrice > 0) {
        setPurchasePrice(currentPrice);
        setGameState(GameState.TRADING);
    }
  }, [currentPrice]);

  const handleReset = useCallback(() => {
    setGameState(GameState.IDLE);
    setPurchasePrice(null);
    setCurrentPrice(generateInitialPrice());
    setStockSymbol(getRandomStock());
    setCountdown(COUNTDOWN_SECONDS);
  }, []);

  const renderContent = () => {
    switch (gameState) {
      case GameState.TRADING:
        return (
          <button
            disabled
            className="w-48 h-48 rounded-full bg-gray-600 text-white text-6xl font-bold flex items-center justify-center cursor-not-allowed shadow-lg transition-transform duration-300"
          >
            {countdown}
          </button>
        );
      case GameState.RESULT: {
        if (purchasePrice === null) return null; // Should not happen
        const isProfit = currentPrice > purchasePrice;
        const difference = Math.abs(currentPrice - purchasePrice).toFixed(2);

        return (
          <div className="text-center animate-fade-in">
            <p className={`text-5xl font-bold ${isProfit ? 'text-green-400' : 'text-red-500'}`}>
              {isProfit ? 'Tebrikler, kazandınız!' : 'Maalesef, kaybettiniz!'}
            </p>
            <p className="text-2xl text-gray-300 mt-2">
              {isProfit ? 'Kazanç' : 'Kayıp'}: {isProfit ? '+' : '-'}${difference}
            </p>
            <button
              onClick={handleReset}
              className="mt-8 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              {isProfit ? 'Yeniden Oynayın' : 'Tekrar Deneyin!'}
            </button>
          </div>
        );
      }
      case GameState.IDLE:
      default:
        return (
          <button
            onClick={handleBuy}
            className="w-48 h-48 rounded-full bg-green-500 text-white text-5xl font-bold flex items-center justify-center transform hover:scale-110 focus:scale-110 active:scale-100 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50 transition-transform duration-300 shadow-xl hover:shadow-2xl"
          >
            SATIN AL
          </button>
        );
    }
  };

  return (
    <main className="bg-slate-900 text-white min-h-screen flex flex-col items-center justify-center p-6 relative selection:bg-green-500/30">
        <img
            src="https://static.wixstatic.com/media/c45cf1_6a8af70feea84d92ac34423e5bbc7985~mv2.png/v1/fill/w_662,h_662,al_c,q_90,enc_avif,quality_auto/c45cf1_6a8af70feea84d92ac34423e5bbc7985~mv2.png"
            alt="Site Logo"
            className="absolute top-6 left-6 w-[250px] h-[250px]"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_800px_at_50%_200px,#1e3a8a33,transparent)]"></div>
        <div className="relative z-10 text-center w-full max-w-2xl flex flex-col items-center justify-center" style={{minHeight: '450px'}}>
            <div className="mb-16 text-center">
                {gameState === GameState.TRADING && (
                    <p className="text-3xl font-semibold text-blue-400 mb-4 animate-pulse">Yatırım yapılıyor...</p>
                )}
                <h1 className="text-6xl font-black text-gray-200 tracking-wider">{stockSymbol}</h1>
                <p className="text-8xl font-mono font-bold text-gray-50 tracking-tight mt-2 transition-colors duration-500">
                    ${currentPrice > 0 ? currentPrice.toFixed(2) : '---.--'}
                </p>
            </div>
            <div className="h-48 flex items-center justify-center">
                {renderContent()}
            </div>
        </div>
        <footer className="absolute bottom-4 text-gray-500 text-sm">
            Bu bir simülasyondur. Yatırım tavsiyesi değildir.
        </footer>
    </main>
  );
};

export default App;
