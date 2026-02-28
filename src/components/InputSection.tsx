import React, { useState, useRef, useMemo } from 'react';
import Papa from 'papaparse';
import { Upload, FileText, X, Users, Trash2, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface InputSectionProps {
  onDataLoaded: (names: string[]) => void;
  onRemoveDuplicates: () => void;
  existingNames: string[];
}

const MOCK_NAMES = [
  "陳小明", "林美華", "張志強", "李淑芬", "王大偉", 
  "黃雅婷", "吳建國", "劉秀英", "蔡宗翰", "楊惠君",
  "許家豪", "鄭婉婷", "謝俊宏", "郭怡君", "洪志明",
  "曾淑娟", "邱建宏", "廖美玲", "賴志偉", "周雅雯"
];

export function InputSection({ onDataLoaded, onRemoveDuplicates, existingNames }: InputSectionProps) {
  const [textInput, setTextInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate duplicates
  const duplicates = useMemo(() => {
    const counts: Record<string, number> = {};
    existingNames.forEach(name => {
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.keys(counts).filter(name => counts[name] > 1);
  }, [existingNames]);

  const hasDuplicates = duplicates.length > 0;

  const handleTextSubmit = () => {
    if (!textInput.trim()) return;
    const names = textInput
      .split(/[\n,]+/) // Split by newline or comma
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    if (names.length > 0) {
      onDataLoaded(names);
      setTextInput('');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    parseFile(file);
    // Reset input so same file can be selected again if needed
    event.target.value = '';
  };

  const parseFile = (file: File) => {
    Papa.parse(file, {
      complete: (results) => {
        const names: string[] = [];
        results.data.forEach((row: any) => {
          // Assume first column or look for specific headers if needed. 
          // For simplicity, take all non-empty values from the first column found.
          const values = Object.values(row).filter(v => typeof v === 'string' && v.trim().length > 0) as string[];
          names.push(...values);
        });
        if (names.length > 0) {
          onDataLoaded(names);
        }
      },
      header: false, // Assume simple list for now, or auto-detect
      skipEmptyLines: true,
    });
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      parseFile(file);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">匯入名單</h2>
        <p className="text-slate-500">上傳 CSV 檔案或直接貼上姓名以開始使用。</p>
        <button
          onClick={() => onDataLoaded(MOCK_NAMES)}
          className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors mt-2"
        >
          <Sparkles className="w-4 h-4" />
          載入範例名單
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* Left: Manual Input & File Upload */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[600px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <FileText className="w-5 h-5" />
              <span>貼上名單</span>
            </div>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              上傳 CSV / TXT
            </button>
            <input
              type="file"
              accept=".csv,.txt"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
          </div>
          
          <textarea
            className="flex-1 w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none text-sm font-mono"
            placeholder="王小明&#10;李小華&#10;張大千..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <button
            onClick={handleTextSubmit}
            disabled={!textInput.trim()}
            className="mt-4 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
          >
            加入名單
          </button>
        </div>

        {/* Right: Preview Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-500" />
              <span className="font-medium text-slate-700">目前名單 ({existingNames.length})</span>
            </div>
            
            <div className="flex items-center gap-2">
              {hasDuplicates && (
                <button 
                  onClick={onRemoveDuplicates}
                  className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1 px-2 py-1 rounded hover:bg-amber-50 transition-colors border border-amber-200 bg-amber-50"
                >
                  <AlertCircle className="w-3 h-3" /> 移除重複 ({duplicates.length})
                </button>
              )}
              {existingNames.length > 0 && (
                <button 
                  onClick={() => onDataLoaded([])} 
                  className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> 清空
                </button>
              )}
            </div>
          </div>
          
          <div className="p-4 overflow-y-auto flex-1 bg-slate-50/30">
            {existingNames.length > 0 ? (
              <div className="flex flex-wrap gap-2 content-start">
                {existingNames.map((name, i) => {
                  const isDup = duplicates.includes(name);
                  return (
                    <span 
                      key={i} 
                      className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-md text-sm border transition-colors",
                        isDup 
                          ? "bg-amber-100 text-amber-800 border-amber-200" 
                          : "bg-white text-slate-700 border-slate-200 shadow-sm"
                      )}
                      title={isDup ? "重複的姓名" : ""}
                    >
                      {name}
                    </span>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Users className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm">尚未加入任何名單</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

