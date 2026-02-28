import { useState } from 'react';
import { InputSection } from './components/InputSection';
import { LuckyDraw } from './components/LuckyDraw';
import { TeamBuilder } from './components/TeamBuilder';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Users, List, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'input' | 'draw' | 'groups';

function App() {
  const [names, setNames] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('input');

  const handleDataLoaded = (newNames: string[]) => {
    setNames(prev => [...prev, ...newNames]);
  };

  const clearNames = () => {
    setNames([]);
  };

  const removeDuplicates = () => {
    setNames(prev => [...new Set(prev)]);
  };

  const tabs = [
    { id: 'input', label: '名單來源', icon: List },
    { id: 'draw', label: '幸運抽籤', icon: Gift },
    { id: 'groups', label: '分組工具', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">HR 小工具</h1>
          </div>
          
          <nav className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    isActive 
                      ? "bg-indigo-50 text-indigo-700" 
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'input' && (
              <InputSection 
                onDataLoaded={(newNames) => {
                  if (newNames.length === 0) {
                    clearNames();
                  } else {
                    handleDataLoaded(newNames);
                  }
                }}
                onRemoveDuplicates={removeDuplicates}
                existingNames={names} 
              />
            )}
            
            {activeTab === 'draw' && (
              names.length > 0 ? (
                <LuckyDraw names={names} />
              ) : (
                <EmptyState onNavigate={() => setActiveTab('input')} />
              )
            )}

            {activeTab === 'groups' && (
              names.length > 0 ? (
                <TeamBuilder names={names} />
              ) : (
                <EmptyState onNavigate={() => setActiveTab('input')} />
              )
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function EmptyState({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <List className="w-10 h-10 text-slate-400" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">目前沒有名單資料</h2>
      <p className="text-slate-500 mb-8 max-w-md mx-auto">
        您尚未加入任何名單。請前往「名單來源」分頁匯入資料。
      </p>
      <button
        onClick={onNavigate}
        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
      >
        新增名單
      </button>
    </div>
  );
}

export default App;
