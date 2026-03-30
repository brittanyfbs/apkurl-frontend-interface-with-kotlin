/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Globe, 
  Smartphone, 
  History, 
  Settings as SettingsIcon, 
  Home as HomeIcon,
  ChevronLeft,
  Upload,
  Trash2,
  Info,
  AlertTriangle,
  CheckCircle2,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
type Screen = 'home' | 'url-scanner' | 'apk-scanner' | 'scanning' | 'history' | 'settings' | 'url-result' | 'apk-result' | 'privacy-policy';
type ScanType = 'url' | 'apk';

interface HistoryItem {
  id: number;
  type: ScanType;
  target: string;
  hash?: string;
  risk: 'high' | 'low';
  score: number;
  summary: string;
  reason: string;
  time: string;
}

// --- Components ---

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  message: string; 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl flex flex-col gap-6"
          >
            <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center text-red-500 mx-auto">
              <AlertTriangle size={32} />
            </div>
            <div className="text-center flex flex-col gap-2">
              <h3 className="text-xl font-black text-gray-900">{title}</h3>
              <p className="text-sm font-medium text-gray-500 leading-relaxed">
                {message}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={onConfirm}
                className="w-full py-4 bg-red-500 text-white font-bold rounded-2xl shadow-lg shadow-red-100 active:scale-[0.98] transition-all"
              >
                Yes, Delete
              </button>
              <button
                onClick={onClose}
                className="w-full py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl active:scale-[0.98] transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const BottomNavbar = ({ current, setScreen }: { current: Screen, setScreen: (s: Screen) => void }) => {
  const tabs = [
    { id: 'home', icon: HomeIcon, label: 'Home' },
    { id: 'history', icon: History, label: 'History' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white px-6 py-4 flex justify-between items-center z-50 border-t border-gray-100 shadow-[0_0_25px_rgba(47,107,255,0.2)]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setScreen(tab.id as Screen)}
          className={`flex flex-col items-center gap-1 transition-colors ${
            current === tab.id ? 'text-black' : 'text-black/50'
          }`}
        >
          <tab.icon size={24} strokeWidth={current === tab.id ? 2.5 : 2} />
          <span className="text-[10px] font-semibold uppercase tracking-wider">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

const LockShieldLogo = ({ size = 24, className = "text-black" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M7 10V7a5 5 0 0 1 10 0v3" />
    <path d="M12 22s7-4 7-10V6l-7-2-7 2v6c0 6 7 10 7 10z" />
  </svg>
);

const Header = ({ title, subtitle, onBack, rightAction, customLogo, showLogo = true }: { title: string, subtitle?: string, onBack?: () => void, rightAction?: React.ReactNode, customLogo?: string | null, showLogo?: boolean }) => (
  <div className="fixed top-0 left-0 right-0 bg-white px-6 py-4 z-[60] border-b border-gray-100 shadow-[0_0_25px_rgba(47,107,255,0.2)]">
    <div className="max-w-md mx-auto flex items-center gap-4">
      {onBack && (
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-black/10 transition-colors"
        >
          <ChevronLeft size={24} className="text-black" />
        </button>
      )}
      <div className="flex-1 min-w-0 flex items-center gap-3">
        {showLogo && (
          <div className="w-10 h-10 rounded-full bg-[#2F6BFF] flex items-center justify-center flex-shrink-0 shadow-sm">
            {customLogo ? (
              <img src={customLogo} alt="Logo" className="w-6 h-6 object-contain brightness-0" />
            ) : (
              <LockShieldLogo size={22} />
            )}
          </div>
        )}
        <div className="flex flex-col">
          <h1 className="text-2xl font-black text-black leading-tight tracking-[0.05em] uppercase truncate">{title}</h1>
          {subtitle && <p className="text-[10px] font-medium text-black/70">{subtitle}</p>}
        </div>
      </div>
      {rightAction && (
        <div className="flex-shrink-0">
          {rightAction}
        </div>
      )}
    </div>
  </div>
);

// --- Screens ---

const HomeScreen = ({ 
  setScreen, 
  setScanType, 
  historyItems,
  onViewReport,
  customLogo
}: { 
  setScreen: (s: Screen) => void, 
  setScanType: (t: ScanType) => void, 
  historyItems: HistoryItem[],
  onViewReport: (item: HistoryItem) => void,
  customLogo: string | null
}) => {
  const totalScans = historyItems.length;
  const highRisks = historyItems.filter(item => item.risk === 'high').length;
  const recentScans = historyItems.slice(0, 5);

  return (
    <div className="flex flex-col gap-6 pb-24">
      <Header title="APKURL" customLogo={customLogo} />
      
      <div className="flex flex-col mb-4">
        <h1 className="text-3xl font-black text-gray-900 leading-tight">Security Center</h1>
      </div>

      {/* Quick Scan Cards */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => { setScanType('url'); setScreen('url-scanner'); }}
          className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col items-center gap-3 active:scale-95 transition-transform"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#2F6BFF]">
            <Globe size={24} />
          </div>
          <span className="font-bold text-gray-800">Scan URL</span>
        </button>
        <button 
          onClick={() => { setScanType('apk'); setScreen('apk-scanner'); }}
          className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col items-center gap-3 active:scale-95 transition-transform"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#2F6BFF]">
            <Smartphone size={24} />
          </div>
          <span className="font-bold text-gray-800">Scan APK</span>
        </button>
      </div>

      {/* Dashboard Card */}
      <div className="bg-black p-6 rounded-[24px] text-white shadow-xl">
        <div className="grid grid-cols-2 gap-4 items-start mb-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Scans</span>
            <span className="text-3xl font-bold text-[#2F6BFF]">{totalScans}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">High Risks</span>
            <span className="text-3xl font-bold text-red-500">{highRisks}</span>
          </div>
        </div>
        <div className="pt-4 border-t border-gray-800">
          <p className="text-[11px] font-medium text-gray-400 text-left">
            Last Scan Activity: <span className="text-gray-300">{historyItems.length > 0 ? historyItems[0].time : 'No activity yet'}</span>
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
        {recentScans.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[24px] p-10 flex flex-col items-center justify-center gap-2 text-center">
            <Shield size={32} className="text-gray-300 mb-2" />
            <p className="text-sm font-bold text-gray-400">No recent scans</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recentScans.map(item => (
              <div 
                key={item.id} 
                onClick={() => onViewReport(item)}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    item.type === 'apk' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {item.type === 'apk' ? <Smartphone size={18} /> : <Globe size={18} />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800 truncate max-w-[140px]">{item.target}</span>
                    <span className="text-[10px] font-medium text-gray-400">{item.time}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                  item.risk === 'high' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                }`}>
                  {item.risk}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const URLScannerScreen = ({ onBack, onStart, customLogo }: { onBack: () => void, onStart: (target: string | File) => void, customLogo: string | null }) => {
  const [url, setUrl] = useState('');

  return (
    <div className="flex flex-col gap-6">
      <Header title="URL SCANNER" onBack={onBack} showLogo={false} />
      
      <p className="text-sm font-medium text-gray-500 leading-relaxed text-center">
        Enter a URL below and tap the button to start scanning.
      </p>

      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <Globe size={20} />
        </div>
        <input 
          type="text" 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 focus:border-[#2F6BFF] focus:outline-none transition-colors font-medium text-gray-800 shadow-sm"
        />
      </div>

      <button 
        disabled={!url}
        onClick={() => onStart(url)}
        className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-[0.98] ${
          url ? 'bg-[#2F6BFF] shadow-blue-200' : 'bg-gray-300 cursor-not-allowed shadow-none'
        }`}
      >
        Start Scanning
      </button>
    </div>
  );
};

const APKScannerScreen = ({ onBack, onStart, customLogo }: { onBack: () => void, onStart: (target: string | File) => void, customLogo: string | null }) => {
  const [fileSelected, setFileSelected] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileSelected(true);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Header title="APK SCANNER" onBack={onBack} showLogo={false} />
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".apk" 
        className="hidden" 
      />

      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`bg-white border-2 border-dashed rounded-[32px] p-12 flex flex-col items-center justify-center gap-4 text-center cursor-pointer transition-all group ${
          fileSelected ? 'border-[#2F6BFF] bg-blue-50/30' : 'border-gray-200 hover:border-[#2F6BFF] hover:bg-blue-50/30'
        }`}
      >
        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-colors shadow-sm ${
          fileSelected ? 'bg-white text-[#2F6BFF]' : 'bg-gray-50 text-gray-400 group-hover:bg-white group-hover:text-[#2F6BFF]'
        }`}>
          {fileSelected ? <CheckCircle2 size={32} /> : <Upload size={32} />}
        </div>
        <div className="w-full px-4">
          <p className="font-bold text-gray-800 text-lg truncate">
            {fileSelected ? selectedFile?.name : 'Choose APK File'}
          </p>
          <p className="text-sm font-medium text-gray-400">
            {fileSelected ? 'File ready for analysis' : 'or Drag & Drop'}
          </p>
        </div>
      </div>

      <button 
        disabled={!fileSelected}
        onClick={() => selectedFile && onStart(selectedFile)}
        className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-[0.98] ${
          fileSelected ? 'bg-[#2F6BFF] shadow-blue-200' : 'bg-gray-300 cursor-not-allowed shadow-none'
        }`}
      >
        Start Scanning
      </button>
    </div>
  );
};

const ScanningScreen = ({ type, customLogo }: { type: ScanType, customLogo: string | null }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => (prev < 100 ? prev + 1 : 100));
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-10 text-center">
      
      <div className="relative w-48 h-48">
        {/* Progress Ring */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            fill="none"
            stroke="#F3F4F6"
            strokeWidth="12"
          />
          <motion.circle
            cx="96"
            cy="96"
            r="88"
            fill="none"
            stroke="#2F6BFF"
            strokeWidth="12"
            strokeDasharray="553"
            initial={{ strokeDashoffset: 553 }}
            animate={{ strokeDashoffset: 553 - (553 * progress) / 100 }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span className="text-4xl font-black text-gray-900">{progress}%</span>
          <span className="text-[10px] font-black text-[#2F6BFF] uppercase tracking-[0.2em]">Analyzing</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
          {type === 'url' ? 'URL SCANNING...' : 'APK SCANNING...'}
        </h2>
        <p className="text-sm font-medium text-gray-500">
          Scanning in progress, thanks for waiting
        </p>
      </div>
    </div>
  );
};

const HistoryScreen = ({ 
  items, 
  onDeleteItems, 
  onDeleteAll,
  onViewReport,
  customLogo
}: { 
  items: HistoryItem[], 
  onDeleteItems: (ids: number[]) => void,
  onDeleteAll: () => void,
  onViewReport: (item: HistoryItem) => void,
  customLogo: string | null
}) => {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'selected' | 'all'>('selected');

  const toggleSelection = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDeleteClick = (type: 'selected' | 'all') => {
    if (type === 'selected' && selectedIds.length === 0) return;
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (modalType === 'all') {
      onDeleteAll();
    } else {
      onDeleteItems(selectedIds);
    }
    setIsModalOpen(false);
    setIsSelectionMode(false);
    setSelectedIds([]);
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
      <Header 
        title="HISTORY" 
        showLogo={false}
        rightAction={
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                setSelectedIds([]);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isSelectionMode ? 'bg-blue-500 text-white' : 'bg-gray-100 text-black'
              }`}
            >
              {isSelectionMode ? 'Cancel' : 'Select'}
            </button>
            <button 
              onClick={() => handleDeleteClick(isSelectionMode ? 'selected' : 'all')}
              className={`p-2 rounded-xl shadow-sm transition-colors ${
                (isSelectionMode && selectedIds.length > 0) || (!isSelectionMode && items.length > 0)
                  ? 'bg-red-50 text-red-400 hover:bg-red-100' 
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Trash2 size={20} />
            </button>
          </div>
        }
      />

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
          <History size={48} className="mb-4" />
          <p className="font-bold">No scan history found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div 
              key={item.id} 
              onClick={() => isSelectionMode ? toggleSelection(item.id) : onViewReport(item)}
              className={`bg-white p-5 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border transition-all flex flex-col gap-3 cursor-pointer ${
                selectedIds.includes(item.id) ? 'border-blue-500 bg-blue-50/20' : 'border-gray-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  {isSelectionMode && (
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedIds.includes(item.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-200'
                    }`}>
                      {selectedIds.includes(item.id) && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                  )}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    item.type === 'apk' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {item.type === 'apk' ? <Smartphone size={20} /> : <Globe size={20} />}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-sm truncate max-w-[150px]">{item.target}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {item.type === 'apk' ? `Hash: ${item.hash}` : 'URL Scan'}
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  item.risk === 'high' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                }`}>
                  {item.risk} Risk
                </span>
              </div>
              <div className="pt-3 border-t border-gray-50 flex items-center gap-1.5 text-gray-400">
                <History size={12} />
                <span className="text-[11px] font-medium">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={modalType === 'all' ? "Delete All History?" : "Delete Selected?"}
        message="This action cannot be undone. All selected scan results will be permanently removed from your device."
      />
    </div>
  );
};

const URLResultScreen = ({ item, onBack, onClose, customLogo }: { item: HistoryItem, onBack: () => void, onClose: () => void, customLogo: string | null }) => {
  const isHighRisk = item.risk === 'high';
  const riskColor = isHighRisk ? 'bg-red-500' : 'bg-[#3D8C40]';
  const darkRiskColor = isHighRisk ? 'bg-red-600' : 'bg-[#317033]';
  
  // Dynamic values with fallbacks
  const riskScore = (item.score ?? 50) + '%';
  const summary = item.summary || "No summary available";
  const reason = item.reason || "Unknown";

  return (
    <div className="flex flex-col gap-6 pb-12 min-h-screen bg-[#F8F9FD]">
      {/* Top Bar */}
      <Header 
        title="REPORT" 
        showLogo={false}
        rightAction={<button onClick={onClose} className="text-blue-400 font-bold text-sm">Done</button>} 
      />

      {/* Main Risk Card */}
      <div className={`${riskColor} rounded-[24px] p-8 flex flex-col items-center gap-8 shadow-lg shadow-green-100/50`}>
        <h2 className="text-3xl font-bold text-white uppercase tracking-tight">
          {item.risk.toUpperCase()} RISK
        </h2>
        
        {/* Stat Box */}
        <div className="flex justify-center w-full">
          <div className={`${darkRiskColor} w-32 rounded-[16px] p-4 flex flex-col items-center gap-1`}>
            <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Risk Score</span>
            <span className="text-2xl font-bold text-white">{riskScore}</span>
          </div>
        </div>
      </div>

      {/* Analysis Summary Section */}
      <div className="flex flex-col gap-4">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Analysis Summary</span>
        <div className="bg-gray-100 rounded-[20px] p-6 shadow-sm border border-gray-200/50">
          <p className="text-sm leading-relaxed text-gray-600 font-medium">
            {summary}
          </p>
        </div>
      </div>

      {/* Analysis Details */}
      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Target URL</span>
          <span className="text-xs font-bold text-gray-900 truncate max-w-[180px]">{item.target}</span>
        </div>
        <div className="h-[1px] bg-gray-50"></div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Reason</span>
          <span className="text-xs font-bold text-gray-900">{reason}</span>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="mt-auto pt-4">
        <button 
          onClick={onClose}
          className="w-full py-5 bg-black text-white font-bold rounded-[24px] shadow-xl active:scale-[0.98] transition-all"
        >
          Close Report
        </button>
      </div>
    </div>
  );
};

const APKResultScreen = ({ item, onBack, onClose, customLogo }: { item: HistoryItem, onBack: () => void, onClose: () => void, customLogo: string | null }) => {
  const isHighRisk = item.risk === 'high';
  const riskColor = isHighRisk ? 'bg-red-500' : 'bg-[#3D8C40]';
  const darkRiskColor = isHighRisk ? 'bg-red-600' : 'bg-[#317033]';
  
  // Dynamic values with fallbacks
  const riskScore = (item.score ?? 50) + '%';
  const summary = item.summary || "No summary available";
  const reason = item.reason || "Unknown";

  return (
    <div className="flex flex-col gap-6 pb-12 min-h-screen bg-[#F8F9FD]">
      {/* Top Bar */}
      <Header 
        title="REPORT" 
        showLogo={false}
        rightAction={<button onClick={onClose} className="text-blue-400 font-bold text-sm">Done</button>} 
      />

      {/* Main Risk Card */}
      <div className={`${riskColor} rounded-[24px] p-8 flex flex-col items-center gap-8 shadow-lg shadow-green-100/50`}>
        <h2 className="text-3xl font-bold text-white uppercase tracking-tight">
          {item.risk.toUpperCase()} RISK
        </h2>
        
        {/* Stat Box */}
        <div className="flex justify-center w-full">
          <div className={`${darkRiskColor} w-32 rounded-[16px] p-4 flex flex-col items-center gap-1`}>
            <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Risk Score</span>
            <span className="text-2xl font-bold text-white">{riskScore}</span>
          </div>
        </div>
      </div>

      {/* Analysis Summary Section */}
      <div className="flex flex-col gap-4">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Analysis Summary</span>
        <div className="bg-gray-100 rounded-[20px] p-6 shadow-sm border border-gray-200/50">
          <p className="text-sm leading-relaxed text-gray-600 font-medium">
            {summary}
          </p>
        </div>
      </div>

      {/* Package Info */}
      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Package Name</span>
          <span className="text-xs font-bold text-gray-900 truncate max-w-[180px]">{item.target}</span>
        </div>
        <div className="h-[1px] bg-gray-50"></div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Reason</span>
          <span className="text-xs font-bold text-gray-900">{reason}</span>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="mt-auto pt-4">
        <button 
          onClick={onClose}
          className="w-full py-5 bg-black text-white font-bold rounded-[24px] shadow-xl active:scale-[0.98] transition-all"
        >
          Close Report
        </button>
      </div>
    </div>
  );
};

const PrivacyPolicyScreen = ({ onBack }: { onBack: () => void }) => {
  const policies = [
    "APKURL does not collect, store, or share any personal user data.",
    "The app only processes URLs and APK files provided manually by the user.",
    "All analysis is performed locally on the device. No data is sent to external servers.",
    "The app does not access contacts, messages, location, or other personal information.",
    "Scan results are stored locally for history and can be deleted by the user at any time.",
    "Deleted data cannot be recovered.",
    "APKURL does not use third-party services that collect user data.",
    "Users should remain cautious, as no security system is 100% accurate."
  ];

  return (
    <div className="flex flex-col gap-8 pb-24">
      <Header title="PRIVACY POLICY" onBack={onBack} showLogo={false} />
      
      <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-50">
        <div className="flex flex-col gap-6">
          {policies.map((policy, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-black text-[#2F6BFF]">{index + 1}</span>
              </div>
              <p className="text-sm font-medium text-gray-600 leading-relaxed">
                {policy}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-[24px] border border-gray-100">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
          Last Updated: March 28, 2026
        </p>
      </div>
    </div>
  );
};

const SettingsScreen = ({ customLogo, onNavigate }: { customLogo: string | null, onNavigate: (s: Screen) => void }) => {
  return (
    <div className="flex flex-col gap-8 pb-24">
      <Header title="SETTINGS" showLogo={false} />

      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] px-1">Support & Info</h3>
        <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden border border-gray-50">
          <button 
            onClick={() => onNavigate('privacy-policy')}
            className="w-full px-6 py-5 flex justify-between items-center hover:bg-gray-50 transition-colors"
          >
            <span className="font-bold text-gray-800">Privacy Policy</span>
            <ChevronLeft size={20} className="rotate-180 text-gray-300" />
          </button>
        </div>
      </div>

      <div className="bg-[#2F6BFF]/5 p-6 rounded-[24px] border border-[#2F6BFF]/10 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-[#2F6BFF]">
          <Shield size={20} />
          <span className="font-black text-sm uppercase tracking-wider">Disclaimer</span>
        </div>
        <p className="text-xs font-medium text-blue-800/70 leading-relaxed">
          APKURL provides risk analysis for URLs and APK files, but results are not 100% accurate. Users should always remain cautious. The app is not responsible for any damage or loss.
        </p>
      </div>

      <div className="flex flex-col items-center gap-1 opacity-30 mt-4">
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">APKURL v1.0.4</span>
        <span className="text-[10px] font-medium">Build 2026.03.26</span>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [scanType, setScanType] = useState<ScanType>('url');
  const [customLogo, setCustomLogo] = useState<string | null>(() => {
    return localStorage.getItem('apkurl_custom_logo');
  });
  const [currentResult, setCurrentResult] = useState<HistoryItem | null>(null);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  const handleStartScan = async (target: string | File) => {
    setScreen('scanning');
    
    if (target instanceof File) {
      try {
        const formData = new FormData();
        formData.append("file", target);

        const response = await fetch('http://127.0.0.1:5000/scan', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        const newItem: HistoryItem = {
          id: Date.now(),
          type: scanType,
          target: target.name,
          hash: scanType === 'apk' ? 'a1b2...c3d4' : undefined,
          risk: data.risk || 'low',
          score: data.score ?? 50,
          summary: data.summary || 'No summary available',
          reason: data.reason || 'Unknown',
          time: 'Just now'
        };
        
        setHistoryItems(prev => [newItem, ...prev]);
        setCurrentResult(newItem);
        setScreen(scanType === 'url' ? 'url-result' : 'apk-result');
      } catch (error) {
        console.error('Scan failed:', error);
        // Fallback result if API fails
        const fallbackItem: HistoryItem = {
          id: Date.now(),
          type: scanType,
          target: target.name,
          hash: scanType === 'apk' ? 'a1b2...c3d4' : undefined,
          risk: 'low',
          score: 0,
          summary: 'The scan could not be completed due to a connection error. Please try again later.',
          reason: 'Connection Error',
          time: 'Just now'
        };
        setHistoryItems(prev => [fallbackItem, ...prev]);
        setCurrentResult(fallbackItem);
        setScreen(scanType === 'url' ? 'url-result' : 'apk-result');
      }
    } else {
      // If input is NOT a File (URL):
      // Do NOT call backend
      // Return a fallback result (temporary)
      const fallbackItem: HistoryItem = {
        id: Date.now(),
        type: scanType,
        target: target,
        hash: undefined,
        risk: 'low',
        score: 0,
        summary: 'URL scanning is temporarily unavailable. This is a fallback result.',
        reason: 'Temporary Fallback',
        time: 'Just now'
      };
      setHistoryItems(prev => [fallbackItem, ...prev]);
      setCurrentResult(fallbackItem);
      setScreen('url-result');
    }
  };

  const deleteItems = (ids: number[]) => {
    setHistoryItems(prev => prev.filter(item => !ids.includes(item.id)));
  };

  const deleteAll = () => {
    setHistoryItems([]);
  };

  const handleViewReport = (item: HistoryItem) => {
    setCurrentResult(item);
    setScreen(item.type === 'url' ? 'url-result' : 'apk-result');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] font-sans text-gray-900 selection:bg-blue-100">
      <div className="max-w-md mx-auto px-6 pt-24 pb-32 min-h-screen relative overflow-hidden">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {screen === 'home' && (
              <HomeScreen 
                setScreen={setScreen} 
                setScanType={setScanType} 
                historyItems={historyItems} 
                onViewReport={handleViewReport}
                customLogo={customLogo}
              />
            )}
            {screen === 'url-scanner' && (
              <URLScannerScreen onBack={() => setScreen('home')} onStart={handleStartScan} customLogo={customLogo} />
            )}
            {screen === 'apk-scanner' && (
              <APKScannerScreen onBack={() => setScreen('home')} onStart={handleStartScan} customLogo={customLogo} />
            )}
            {screen === 'scanning' && (
              <ScanningScreen type={scanType} customLogo={customLogo} />
            )}
            {screen === 'history' && (
              <HistoryScreen 
                items={historyItems} 
                onDeleteItems={deleteItems}
                onDeleteAll={deleteAll}
                onViewReport={handleViewReport}
                customLogo={customLogo}
              />
            )}
            {screen === 'settings' && (
              <SettingsScreen customLogo={customLogo} onNavigate={setScreen} />
            )}
            {screen === 'privacy-policy' && (
              <PrivacyPolicyScreen onBack={() => setScreen('settings')} />
            )}
            {screen === 'url-result' && currentResult && (
              <URLResultScreen 
                item={currentResult} 
                onBack={() => setScreen('home')} 
                onClose={() => setScreen('home')} 
                customLogo={customLogo}
              />
            )}
            {screen === 'apk-result' && currentResult && (
              <APKResultScreen 
                item={currentResult} 
                onBack={() => setScreen('home')} 
                onClose={() => setScreen('home')} 
                customLogo={customLogo}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Nav only on main tabs */}
        {['home', 'history', 'settings'].includes(screen) && (
          <BottomNavbar current={screen} setScreen={setScreen} />
        )}
      </div>
    </div>
  );
}
