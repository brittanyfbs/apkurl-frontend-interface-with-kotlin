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
type Screen = 'home' | 'url-scanner' | 'apk-scanner' | 'scanning' | 'history' | 'settings' | 'url-result' | 'apk-result';
type ScanType = 'url' | 'apk';

interface HistoryItem {
  id: number;
  type: ScanType;
  target: string;
  hash?: string;
  risk: 'high' | 'low';
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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setScreen(tab.id as Screen)}
          className={`flex flex-col items-center gap-1 transition-colors ${
            current === tab.id ? 'text-[#2F6BFF]' : 'text-gray-400'
          }`}
        >
          <tab.icon size={24} strokeWidth={current === tab.id ? 2.5 : 2} />
          <span className="text-[10px] font-semibold uppercase tracking-wider">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

const Header = ({ title, subtitle, onBack }: { title: string, subtitle?: string, onBack?: () => void }) => (
  <div className="flex items-center gap-4 mb-8">
    {onBack && (
      <button 
        onClick={onBack}
        className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <ChevronLeft size={24} className="text-gray-800" />
      </button>
    )}
    <div>
      <h1 className="text-2xl font-bold text-gray-900 leading-tight">{title}</h1>
      {subtitle && <p className="text-sm font-medium text-gray-500">{subtitle}</p>}
    </div>
  </div>
);

// --- Screens ---

const HomeScreen = ({ 
  setScreen, 
  setScanType, 
  historyItems,
  onViewReport
}: { 
  setScreen: (s: Screen) => void, 
  setScanType: (t: ScanType) => void, 
  historyItems: HistoryItem[],
  onViewReport: (item: HistoryItem) => void
}) => {
  const totalScans = historyItems.length;
  const highRisks = historyItems.filter(item => item.risk === 'high').length;
  const recentScans = historyItems.slice(0, 5);

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div className="flex flex-col mb-8 -mt-6">
        <span className="text-sm font-black text-gray-900 uppercase tracking-[0.4em] mb-4">APKURL</span>
        <h1 className="text-4xl font-black text-gray-900 leading-tight">Security Center</h1>
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
          <p className="text-[11px] font-medium text-gray-400 text-center">
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

const URLScannerScreen = ({ onBack, onStart }: { onBack: () => void, onStart: (target: string) => void }) => {
  const [url, setUrl] = useState('');

  return (
    <div className="flex flex-col gap-6">
      <Header title="URL Scanner" onBack={onBack} />
      
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

const APKScannerScreen = ({ onBack, onStart }: { onBack: () => void, onStart: (target: string) => void }) => {
  const [fileSelected, setFileSelected] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileSelected(true);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Header title="APK Scanner" onBack={onBack} />
      
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
            {fileSelected ? fileName : 'Choose APK File'}
          </p>
          <p className="text-sm font-medium text-gray-400">
            {fileSelected ? 'File ready for analysis' : 'or Drag & Drop'}
          </p>
        </div>
      </div>

      <button 
        disabled={!fileSelected}
        onClick={() => onStart(fileName)}
        className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-[0.98] ${
          fileSelected ? 'bg-[#2F6BFF] shadow-blue-200' : 'bg-gray-300 cursor-not-allowed shadow-none'
        }`}
      >
        Start Scanning
      </button>
    </div>
  );
};

const ScanningScreen = ({ type }: { type: ScanType }) => {
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
  onViewReport
}: { 
  items: HistoryItem[], 
  onDeleteItems: (ids: number[]) => void,
  onDeleteAll: () => void,
  onViewReport: (item: HistoryItem) => void
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
      <div className="flex justify-between items-start">
        <Header title="Scan History" />
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setIsSelectionMode(!isSelectionMode);
              setSelectedIds([]);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              isSelectionMode ? 'bg-blue-500 text-white' : 'bg-white text-gray-500 shadow-sm'
            }`}
          >
            {isSelectionMode ? 'Cancel' : 'Select'}
          </button>
          <button 
            onClick={() => handleDeleteClick(isSelectionMode ? 'selected' : 'all')}
            className={`p-2 rounded-xl shadow-sm transition-colors ${
              (isSelectionMode && selectedIds.length > 0) || (!isSelectionMode && items.length > 0)
                ? 'bg-white text-red-500 hover:bg-red-50' 
                : 'bg-gray-50 text-gray-300 cursor-not-allowed'
            }`}
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

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

const URLResultScreen = ({ item, onBack, onClose }: { item: HistoryItem, onBack: () => void, onClose: () => void }) => {
  const isHighRisk = item.risk === 'high';
  const riskColor = isHighRisk ? 'bg-red-500' : 'bg-[#3D8C40]';
  const darkRiskColor = isHighRisk ? 'bg-red-600' : 'bg-[#317033]';
  const riskScore = isHighRisk ? '85%' : '15%';

  return (
    <div className="flex flex-col gap-6 pb-12 min-h-screen bg-[#F8F9FD]">
      {/* Top Bar */}
      <div className="flex justify-between items-center py-4 px-2">
        <h1 className="text-xl font-bold text-gray-900">Security Report</h1>
        <button onClick={onClose} className="text-blue-600 font-bold text-sm">Done</button>
      </div>

      {/* Main Risk Card */}
      <div className={`${riskColor} rounded-[24px] p-8 flex flex-col items-center gap-8 shadow-lg shadow-green-100/50`}>
        <h2 className="text-3xl font-bold text-white">
          {isHighRisk ? 'High Risk' : 'Low Risk'}
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
            {isHighRisk 
              ? "Warning: This URL has been flagged as potentially dangerous. Our heuristic analysis detected patterns associated with phishing or malware distribution."
              : "Analysis complete. This URL appears to be safe based on our current security database and heuristic checks."}
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
          <span className="text-xs font-bold text-gray-900">{isHighRisk ? 'Suspicious Patterns' : 'Verified Safe'}</span>
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

const APKResultScreen = ({ item, onBack, onClose }: { item: HistoryItem, onBack: () => void, onClose: () => void }) => {
  const isHighRisk = item.risk === 'high';
  const riskColor = isHighRisk ? 'bg-red-500' : 'bg-[#3D8C40]';
  const darkRiskColor = isHighRisk ? 'bg-red-600' : 'bg-[#317033]';
  const riskScore = isHighRisk ? '91%' : '08%';

  return (
    <div className="flex flex-col gap-6 pb-12 min-h-screen bg-[#F8F9FD]">
      {/* Top Bar */}
      <div className="flex justify-between items-center py-4 px-2">
        <h1 className="text-xl font-bold text-gray-900">Security Report</h1>
        <button onClick={onClose} className="text-blue-600 font-bold text-sm">Done</button>
      </div>

      {/* Main Risk Card */}
      <div className={`${riskColor} rounded-[24px] p-8 flex flex-col items-center gap-8 shadow-lg shadow-green-100/50`}>
        <h2 className="text-3xl font-bold text-white">
          {isHighRisk ? 'High Risk' : 'Low Risk'}
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
            {isHighRisk 
              ? "Critical: This APK file contains suspicious code patterns and requested excessive permissions that could compromise your device security."
              : "Analysis complete. This APK file appears to be safe based on our current security database and heuristic checks."}
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
          <span className="text-xs font-bold text-gray-900">{isHighRisk ? 'Suspicious Permissions' : 'Verified Safe'}</span>
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

const SettingsScreen = () => {
  return (
    <div className="flex flex-col gap-8 pb-24">
      <Header title="Settings" />

      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] px-1">Support & Info</h3>
        <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden border border-gray-50">
          <button className="w-full px-6 py-5 flex justify-between items-center hover:bg-gray-50 transition-colors">
            <span className="font-bold text-gray-800">Privacy Policy</span>
            <ChevronLeft size={20} className="rotate-180 text-gray-300" />
          </button>
          <div className="h-[1px] bg-gray-50 mx-6"></div>
          <button className="w-full px-6 py-5 flex justify-between items-center hover:bg-gray-50 transition-colors">
            <span className="font-bold text-gray-800">Terms of Service</span>
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
          APKURL uses advanced heuristic analysis and global threat databases to identify potential risks. However, no security scan is 100% definitive. Always exercise caution when installing unknown files.
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
  const [currentResult, setCurrentResult] = useState<HistoryItem | null>(null);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([
    { id: 1, type: 'apk', target: 'com.example.app_v2.apk', hash: '8f2a...b3c1', risk: 'high', time: '2 mins ago' },
    { id: 2, type: 'url', target: 'https://secure-login.net', risk: 'low', time: '1 hour ago' },
    { id: 3, type: 'url', target: 'https://google.com', risk: 'low', time: 'Yesterday' },
  ]);

  const handleStartScan = (target: string) => {
    setScreen('scanning');
    setTimeout(() => {
      const newItem: HistoryItem = {
        id: Date.now(),
        type: scanType,
        target: target,
        hash: scanType === 'apk' ? 'a1b2...c3d4' : undefined,
        risk: Math.random() > 0.7 ? 'high' : 'low',
        time: 'Just now'
      };
      setHistoryItems(prev => [newItem, ...prev]);
      setCurrentResult(newItem);
      setScreen(scanType === 'url' ? 'url-result' : 'apk-result');
    }, 5000);
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
      <div className="max-w-md mx-auto px-6 pt-12 min-h-screen relative overflow-hidden">
        
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
              />
            )}
            {screen === 'url-scanner' && (
              <URLScannerScreen onBack={() => setScreen('home')} onStart={handleStartScan} />
            )}
            {screen === 'apk-scanner' && (
              <APKScannerScreen onBack={() => setScreen('home')} onStart={handleStartScan} />
            )}
            {screen === 'scanning' && (
              <ScanningScreen type={scanType} />
            )}
            {screen === 'history' && (
              <HistoryScreen 
                items={historyItems} 
                onDeleteItems={deleteItems}
                onDeleteAll={deleteAll}
                onViewReport={handleViewReport}
              />
            )}
            {screen === 'settings' && (
              <SettingsScreen />
            )}
            {screen === 'url-result' && currentResult && (
              <URLResultScreen 
                item={currentResult} 
                onBack={() => setScreen('home')} 
                onClose={() => setScreen('home')} 
              />
            )}
            {screen === 'apk-result' && currentResult && (
              <APKResultScreen 
                item={currentResult} 
                onBack={() => setScreen('home')} 
                onClose={() => setScreen('home')} 
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
