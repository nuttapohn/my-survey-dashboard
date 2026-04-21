import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, CheckCircle2, ClipboardList, Users, 
  RefreshCw, Trophy, ExternalLink
} from 'lucide-react';

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbx8SnLRbUGcXCjCAZFPz5O1881SRO-7wE1jH2REisjzPoZKB7Ojpg4dwBTc4QYSLkO2Aw/exec"; 

const App = () => {
  const [data, setData] = useState({ surveys: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const fetchSheetData = async (forceSync = false) => {
    if (forceSync) setSyncing(true);
    else setLoading(true);
    try {
      if (WEB_APP_URL && WEB_APP_URL.includes("macros/s/")) {
        const url = forceSync ? `${WEB_APP_URL}?action=sync` : WEB_APP_URL;
        const response = await fetch(url);
        const result = await response.json();
        setData(result);
      } else {
        generateMockData();
      }
    } catch (err) {
      generateMockData();
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  const generateMockData = () => {
    const mockSurveys = Array.from({ length: 70 }, (_, i) => ({ name: `ชุดที่ ${i + 1}`, url: "#" }));
    const mockUsers = Array.from({ length: 44 }, (_, i) => {
      const status = Array.from({ length: 70 }, () => Math.random() > 0.5);
      return {
        id: (i + 1).toString().padStart(2, '0'),
        idCard: `16${(i + 1).toString().padStart(2, '0')}`,
        name: i === 0 ? 'พ.ต.ณัฐกฤต เชิดชู' : i === 1 ? 'ร.อ.หญิง นุชนารถ ปั้นคุ้ม' : `นทน. รายที่ ${i + 1}`,
        status,
        completedCount: status.filter(s => s).length
      };
    });
    setData({ surveys: mockSurveys, users: mockUsers });
  };

  useEffect(() => { fetchSheetData(); }, []);

  const filteredUsers = useMemo(() => {
    return data.users.filter(user => 
      user.name.includes(searchTerm) || user.idCard.includes(searchTerm)
    ).filter(user => {
      if (filterType === 'completed') return user.completedCount === data.surveys.length;
      if (filterType === 'pending') return user.completedCount < data.surveys.length;
      return true;
    });
  }, [data.users, searchTerm, filterType, data.surveys.length]);

  const stats = useMemo(() => {
    const total = data.users.length;
    const current = data.surveys.length || 70;
    const completed = data.users.filter(u => u.completedCount === current).length;
    return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0, current };
  }, [data.users, data.surveys.length]);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50 font-bold text-indigo-600 animate-pulse">
      กำลังเตรียมข้อมูลระบบ...
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-slate-900 font-sans overflow-x-hidden">
      
      {/* --- Grid Layout Main Wrapper --- */}
      <div className="grid grid-cols-1 w-full overflow-x-hidden">
        
        {/* Header: Flex for alignment */}
        <header className="bg-[#5D5FEF] text-white p-6 shadow-lg">
          <div className="w-full flex flex-col lg:grid lg:grid-cols-2 items-center gap-6">
            <div className="flex items-center gap-4 w-full">
              <ClipboardList size={32} className="shrink-0" />
              <div className="overflow-hidden">
                <h3 className="font-black text-xl md:text-2xl truncate">นายทหารการเงินชั้นนายร้อย รุ่นที่ 16 ของ สป.</h3>
                <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Master Survey Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full lg:justify-end">
              <div className="relative flex-1 lg:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" placeholder="ค้นหา..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl text-sm text-slate-800 border-none"
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button onClick={() => fetchSheetData(true)} className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-black transition-all">
                <RefreshCw className={syncing ? 'animate-spin' : ''} size={22} />
              </button>
            </div>
          </div>
        </header>

        {/* Stats Section: CSS Grid (3 Columns) */}
        <section className="p-4 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50 border-b">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div className="grid">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Overall Progress</span>
              <h2 className="text-4xl font-black text-slate-800">{stats.percent}%</h2>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Trophy size={32} /></div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div className="grid">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Completed Users</span>
              <h2 className="text-4xl font-black text-emerald-600">{stats.completed} <span className="text-xl text-slate-300">/ {stats.total}</span></h2>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Users size={32} /></div>
          </div>

          <div className="bg-[#2D2E5F] p-6 rounded-3xl shadow-lg text-white grid content-center">
            <p className="text-[10px] font-bold text-indigo-300 uppercase mb-3 tracking-[0.2em] text-center">Filter Status</p>
            <div className="grid grid-cols-3 gap-2">
              {['all', 'completed', 'pending'].map(t => (
                <button 
                  key={t} onClick={() => setFilterType(t)} 
                  className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${filterType === t ? 'bg-[#5D5FEF] text-white' : 'bg-[#3A3B7A] text-indigo-200'}`}
                >
                  {t === 'all' ? 'All' : t === 'completed' ? 'Done' : 'Wait'}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <main className="p-4 md:p-8 flex flex-col gap-8">
          
          {/* Quick Links Horizontal Grid */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase mb-4 px-2">Links: {stats.current} Surveys</h3>
            <div className="flex overflow-x-auto pb-2 gap-3 no-scrollbar scroll-smooth">
              {data.surveys.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noreferrer" className="shrink-0 bg-slate-50 px-4 py-2 rounded-xl text-[10px] font-bold border hover:border-indigo-400 hover:bg-indigo-50 transition-all">
                  <span className="text-indigo-600 mr-1">{i+1}.</span> {s.name}
                </a>
              ))}
            </div>
          </div>

          {/* Data Table: Locked scroll inside grid item */}
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {/* Sticky Column 1: Order */}
                    <th className="p-5 w-16 text-center sticky left-0 bg-[#F8FAFC] border-r z-30">No</th>
                    {/* Sticky Column 2: Name */}
                    <th className="p-5 min-w-[240px]  left-16 bg-[#F8FAFC] border-r z-30 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)] text-left">นทน. รายที่</th>
                    <th className="p-5 text-center w-24 border-r">Progress</th>
                    {data.surveys.map((_, i) => (
                      <th key={i} className="p-5 text-center min-w-[120px] border-l whitespace-nowrap">Survey {i+1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-indigo-50/20 transition-all group">
                      <td className="p-5 text-center font-mono text-slate-300 sticky left-0 bg-white group-hover:bg-[#F8FAFC] border-r z-10">{user.id}</td>
                      <td className="p-5  left-16 bg-white group-hover:bg-[#F8FAFC] border-r z-10 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)]">
                        <div className="font-bold text-slate-800 text-sm whitespace-nowrap">{user.name}</div>
                        <div className="text-[10px] font-medium text-slate-400">ID: {user.idCard}</div>
                      </td>
                      <td className="p-5 text-center border-r font-black text-indigo-600">
                        {user.completedCount}/{data.surveys.length}
                      </td>
                      {user.status.map((isDone, idx) => (
                        <td key={idx} className="p-5 text-center border-l min-w-[120px]">
                          {isDone ? (
                            <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                              <CheckCircle2 size={16} strokeWidth={3} />
                            </div>
                          ) : (
                            <a 
                              href={data.surveys[idx]?.url} target="_blank" rel="noreferrer"
                              className="w-8 h-8 bg-slate-50 text-slate-200 border rounded-full flex items-center justify-center mx-auto hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        <footer className="w-full py-12 text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.5em]">
          Master Dashboard | Grid-Powered Responsive UI
        </footer>
      </div>
    </div>
  );
};

export default App;