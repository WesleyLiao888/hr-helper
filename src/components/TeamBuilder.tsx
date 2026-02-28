import { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Grid, RefreshCw, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface TeamBuilderProps {
  names: string[];
}

type GroupingMode = 'by-size' | 'by-count';

export function TeamBuilder({ names }: TeamBuilderProps) {
  const [mode, setMode] = useState<GroupingMode>('by-size');
  const [inputValue, setInputValue] = useState(4); // Default group size or count
  const [groups, setGroups] = useState<string[][]>([]);

  const generateGroups = () => {
    if (names.length === 0) return;

    // Shuffle names
    const shuffled = [...names].sort(() => Math.random() - 0.5);
    const result: string[][] = [];

    if (mode === 'by-size') {
      const size = Math.max(1, inputValue);
      for (let i = 0; i < shuffled.length; i += size) {
        result.push(shuffled.slice(i, i + size));
      }
    } else {
      const count = Math.max(1, inputValue);
      // Initialize empty groups
      for (let i = 0; i < count; i++) result.push([]);
      
      // Distribute
      shuffled.forEach((name, index) => {
        result[index % count].push(name);
      });
      
      // Remove empty groups if any (though logic above shouldn't leave empty unless count > names)
      // Actually if count > names, some will be empty. Let's keep them or filter? 
      // Usually better to filter empty.
    }

    setGroups(result.filter(g => g.length > 0));
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#06b6d4', '#8b5cf6']
    });
  };

  const handleDownload = () => {
    if (groups.length === 0) return;
    
    // Add BOM for Excel to recognize UTF-8
    let csvContent = "\uFEFFGroup,Name\n";
    groups.forEach((group, index) => {
      group.forEach(member => {
        csvContent += `Group ${index + 1},${member}\n`;
      });
    });

    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "groups.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Controls */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="grid md:grid-cols-3 gap-6 items-end">
          
          {/* Mode Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Grouping Method</label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setMode('by-size')}
                className={cn(
                  "flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all",
                  mode === 'by-size' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                People per Group
              </button>
              <button
                onClick={() => setMode('by-count')}
                className={cn(
                  "flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all",
                  mode === 'by-count' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Number of Groups
              </button>
            </div>
          </div>

          {/* Value Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              {mode === 'by-size' ? 'Group Size' : 'Total Groups'}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max={names.length}
                value={inputValue}
                onChange={(e) => setInputValue(parseInt(e.target.value) || 1)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-center font-bold text-lg"
              />
            </div>
          </div>

          {/* Action */}
          <div className="flex gap-2">
            <button
              onClick={generateGroups}
              disabled={names.length === 0}
              className="flex-1 h-[46px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" />
              Generate
            </button>
            {groups.length > 0 && (
              <button
                onClick={handleDownload}
                className="h-[46px] w-[46px] bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl flex items-center justify-center transition-colors"
                title="Download CSV"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {groups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {groups.map((group, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col"
            >
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-700">第 {idx + 1} 組</h3>
                <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                  {group.length} 人
                </span>
              </div>
              <div className="p-4 flex-1">
                <ul className="space-y-2">
                  {group.map((member, mIdx) => (
                    <li key={mIdx} className="flex items-center gap-2 text-slate-600 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      {member}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <Grid className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-500">尚未產生分組</h3>
          <p className="text-slate-400">調整設定並點擊開始分組以查看結果</p>
        </div>
      )}
    </div>
  );
}
