import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Trophy, RefreshCw, Settings2, UserCheck, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LuckyDrawProps {
  names: string[];
}

export function LuckyDraw({ names }: LuckyDrawProps) {
  const [winners, setWinners] = useState<string[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [currentDisplay, setCurrentDisplay] = useState('???');
  const [drawCount, setDrawCount] = useState(1);
  const [allowRepeats, setAllowRepeats] = useState(false);
  const [history, setHistory] = useState<{ round: number; winners: string[] }[]>([]);

  const availableNames = allowRepeats 
    ? names 
    : names.filter(n => !winners.includes(n));

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleDraw = () => {
    if (availableNames.length === 0) {
      alert("沒有更多名單可供抽籤！");
      return;
    }
    
    setIsRolling(true);
    const duration = 2000; // 2 seconds rolling
    const intervalTime = 50;
    const startTime = Date.now();

    intervalRef.current = setInterval(() => {
      const randomName = names[Math.floor(Math.random() * names.length)];
      setCurrentDisplay(randomName);

      if (Date.now() - startTime > duration) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        finalizeDraw();
      }
    }, intervalTime);
  };

  const finalizeDraw = () => {
    // Select winners
    const count = Math.min(drawCount, availableNames.length);
    const roundWinners: string[] = [];
    const tempAvailable = [...availableNames];

    for (let i = 0; i < count; i++) {
      if (tempAvailable.length === 0) break;
      const randomIndex = Math.floor(Math.random() * tempAvailable.length);
      const winner = tempAvailable[randomIndex];
      roundWinners.push(winner);
      tempAvailable.splice(randomIndex, 1); // Remove to prevent picking same person twice in one batch (unless allowRepeats logic is different, but usually batch is unique)
    }

    setWinners(prev => [...prev, ...roundWinners]);
    setHistory(prev => [{ round: prev.length + 1, winners: roundWinners }, ...prev]);
    setIsRolling(false);
    setCurrentDisplay(roundWinners.length === 1 ? roundWinners[0] : '🎉');

    // Confetti
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#8b5cf6', '#ec4899', '#10b981']
    });
  };

  const reset = () => {
    setWinners([]);
    setHistory([]);
    setCurrentDisplay('???');
  };

  const handleDownload = () => {
    if (history.length === 0) return;
    
    // Add BOM for Excel to recognize UTF-8
    let csvContent = "\uFEFFRound,Winner\n";
    history.forEach((record) => {
      record.winners.forEach(winner => {
        csvContent += `${record.round},${winner}\n`;
      });
    });

    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "winners.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Controls & Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold">
              <Settings2 className="w-5 h-5" />
              <h3>抽籤設定</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  每次抽出人數
                </label>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={drawCount} 
                    onChange={(e) => setDrawCount(parseInt(e.target.value))}
                    className="flex-1 accent-indigo-600"
                  />
                  <span className="w-8 text-center font-mono font-bold text-indigo-600">{drawCount}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-600">允許重複中獎</label>
                <button 
                  onClick={() => setAllowRepeats(!allowRepeats)}
                  className={cn(
                    "w-11 h-6 rounded-full transition-colors relative",
                    allowRepeats ? "bg-indigo-600" : "bg-slate-200"
                  )}
                >
                  <span className={cn(
                    "absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform",
                    allowRepeats ? "translate-x-5" : "translate-x-0"
                  )} />
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between text-sm text-slate-500 mb-2">
                  <span>總人數:</span>
                  <span className="font-mono">{names.length}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>可抽人數:</span>
                  <span className="font-mono font-bold text-emerald-600">{availableNames.length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={reset}
              className="py-2 px-4 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> 重置
            </button>
            <button
              onClick={handleDownload}
              disabled={history.length === 0}
              className="py-2 px-4 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> 匯出
            </button>
          </div>
        </div>

        {/* Center: Stage */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 rounded-3xl p-8 text-center min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden shadow-xl">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-slate-900 to-slate-900" />
            
            <div className="relative z-10">
              <motion.div
                key={currentDisplay}
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-8"
              >
                <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 tracking-tight">
                  {currentDisplay}
                </h2>
              </motion.div>

              <button
                onClick={handleDraw}
                disabled={isRolling || availableNames.length === 0}
                className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-indigo-600 font-lg rounded-full hover:bg-indigo-500 hover:scale-105 focus:outline-none ring-offset-2 focus:ring-2 ring-indigo-400 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-indigo-500/30"
              >
                {isRolling ? '抽籤中...' : '開始抽籤'}
                <Trophy className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>

          {/* Recent Winners */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              中獎紀錄
            </h3>
            <div className="space-y-3">
              <AnimatePresence>
                {history.map((record) => (
                  <motion.div
                    key={record.round}
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm overflow-hidden"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                        第 {record.round} 輪
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {record.winners.map((winner, idx) => (
                          <span key={idx} className="font-medium text-slate-800 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                            {winner}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {history.length === 0 && (
                <div className="text-center py-8 text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  尚未有中獎者，請開始抽籤！
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

