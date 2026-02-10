import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Circle, 
  ClipboardList, 
  Users, 
  Loader2, 
  RefreshCw, 
  ExternalLink,
  AlertCircle,
  Trophy,
  Filter,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

/**
 * ==============================================================================
 * Responsive Survey Tracking Dashboard (Mobile & Tablet Optimized)
 * พัฒนาด้วย React + Tailwind CSS
 * แก้ไข: เพิ่มลิงก์ไปยังแบบฟอร์มในไอคอนสถานะที่ยังไม่ดำเนินการ
 * ==============================================================================
 */

// --- ⚠️ ส่วนที่ต้องแก้ไข: ใส่ URL ของ Web App ที่ได้จาก Google Apps Script ⚠️ ---
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbx8SnLRbUGcXCjCAZFPz5O1881SRO-7wE1jH2REisjzPoZKB7Ojpg4dwBTc4QYSLkO2Aw/exec"; 

const App = () => {
  const [data, setData] = useState({ surveys: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // ฟังก์ชันดึงข้อมูล
  const fetchSheetData = async (forceSync = false) => {
    if (forceSync) setSyncing(true);
    else setLoading(true);

    try {
      if (!WEB_APP_URL) {
        generateMockData();
        return;
      }
      const url = forceSync ? `${WEB_APP_URL}?action=sync` : WEB_APP_URL;
      const response = await fetch(url);
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      setData(result);
    } catch (err) {
      console.error("Fetch error:", err);
      generateMockData();
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  // ข้อมูลจำลองสำหรับทดสอบ UI
  const generateMockData = () => {
    const mockSurveys = [
      { name: "ด้านการฝึกอบรม", url: "https://google.com" },
      { name: "ด้านวิทยากร", url: "https://google.com" },
      { name: "ด้านสถานที่", url: "https://google.com" },
      { name: "ความรู้ก่อน-หลัง", url: "https://google.com" }
    ];
    const mockUsers = Array.from({ length: 44 }, (_, i) => {
      const status = mockSurveys.map(() => Math.random() > 0.4);
      return {
        id: (i + 1).toString().padStart(2, '0'),
        idCard: (i + 1).toString().padStart(2, '0'),
        name: `นทน. ทดสอบ รายที่ ${i + 1}`,
        status: status,
        completedCount: status.filter(s => s).length
      };
    });
    setData({ surveys: mockSurveys, users: mockUsers });
  };

  useEffect(() => {
    fetchSheetData();
  }, []);

  // กรองข้อมูลตามการค้นหาและตัวกรอง
  const filteredUsers = useMemo(() => {
    return data.users.filter(user => {
      const matchesSearch = user.name.includes(searchTerm) || user.idCard.includes(searchTerm);
      const isDone = user.completedCount === data.surveys.length;
      if (filterType === 'completed') return matchesSearch && isDone;
      if (filterType === 'pending') return matchesSearch && !isDone;
      return matchesSearch;
    });
  }, [data.users, searchTerm, filterType, data.surveys.length]);

  // สถิติ
  const stats = useMemo(() => {
    const total = data.users.length;
    const completed = data.users.filter(u => u.completedCount === data.surveys.length).length;
    return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [data.users, data.surveys.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <ClipboardList className="absolute text-blue-600" size={32} />
        </div>
        <p className="mt-6 text-slate-500 font-bold animate-pulse">กำลังเตรียมข้อมูล Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      
      {/* --- Sticky Header --- */}
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:items-center md:justify-between">
            {/* Logo & Title */}
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200 text-white">
                <ClipboardList size={24} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-800 leading-tight">นายทหารการเงินชั้นนายร้อย รุ่นที่ 16 ของ สป.</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Survey Tracking</p>
              </div>
            </div>

            {/* Actions: Search & Sync */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  className="w-full md:w-64 pl-9 pr-4 py-2.5 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm transition-all"
                  placeholder="ค้นหาชื่อ/รหัส..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                onClick={() => fetchSheetData(true)}
                disabled={syncing}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white p-2.5 rounded-xl transition-all shadow-md active:scale-95"
                title="รีเฟรชข้อมูล"
              >
                <RefreshCw className={syncing ? 'animate-spin' : ''} size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        
        {/* --- Stats Section --- */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ภาพรวม</p>
                <h3 className="text-2xl font-black text-slate-800">{stats.percent}%</h3>
              </div>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Trophy size={20} /></div>
            </div>
            <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${stats.percent}%` }}></div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ทำครบแล้ว</p>
                <h3 className="text-2xl font-black text-emerald-600">{stats.completed} <span className="text-sm font-normal text-slate-300">/ {stats.total}</span></h3>
              </div>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Users size={20} /></div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-indigo-900 p-5 rounded-3xl shadow-lg shadow-indigo-100 text-white flex flex-col justify-center">
            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-3">ตัวกรองรายการ</p>
            <div className="flex space-x-2">
              {['all', 'completed', 'pending'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all ${
                    filterType === type ? 'bg-white text-indigo-900 shadow-md' : 'bg-indigo-800 text-indigo-200'
                  }`}
                >
                  {type === 'all' ? 'ทั้งหมด' : type === 'completed' ? 'ทำครบ' : 'ยังไม่ครบ'}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* --- Quick Links (Horizontal Scroll on Mobile) --- */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <ExternalLink size={14} /> ลิงก์แบบสอบถาม ({data.surveys.length} ชุด)
            </h2>
          </div>
          <div className="flex overflow-x-auto pb-4 space-x-3 no-scrollbar scroll-smooth">
            {data.surveys.map((s, i) => (
              <a 
                key={i} href={s.url} target="_blank" rel="noreferrer"
                className="flex-shrink-0 bg-white border border-slate-100 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-sm hover:border-indigo-500 transition-all active:scale-95"
              >
                <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-xs">{i+1}</div>
                <span className="text-xs font-bold text-slate-700 whitespace-nowrap">{s.name}</span>
              </a>
            ))}
          </div>
        </section>

        {/* --- Main Content Area (Table vs Cards) --- */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          
          {/* Mobile View: Card List (แสดงเมื่อขนาดจอ < md) */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div key={user.id} className="p-5 flex flex-col space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-mono text-xs font-bold">{user.id}</div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm leading-none mb-1">{user.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400">ID: {user.idCard}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black ${user.completedCount === data.surveys.length ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                      {user.completedCount}/{data.surveys.length}
                    </div>
                  </div>
                  
                  {/* Status Grid in Card */}
                  <div className="grid grid-cols-4 gap-2">
                    {user.status.map((isDone, idx) => (
                      isDone ? (
                        <div key={idx} className="p-2 rounded-xl flex flex-col items-center justify-center border bg-emerald-50 border-emerald-100 text-emerald-600">
                          <CheckCircle2 size={16} />
                          <span className="text-[8px] mt-1 font-bold truncate w-full text-center opacity-70">{data.surveys[idx]?.name}</span>
                        </div>
                      ) : (
                        <a 
                          key={idx} 
                          href={data.surveys[idx]?.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 rounded-xl flex flex-col items-center justify-center border bg-slate-50 border-slate-100 text-slate-400 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all active:scale-90"
                          title={`คลิกเพื่อทำ: ${data.surveys[idx]?.name}`}
                        >
                          <ArrowRight size={16} className="animate-pulse" />
                          <span className="text-[8px] mt-1 font-bold truncate w-full text-center opacity-70">{data.surveys[idx]?.name}</span>
                        </a>
                      )
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-20 text-center text-slate-400 italic text-sm">ไม่พบข้อมูล...</div>
            )}
          </div>

          {/* Tablet & Desktop View: Pro Table (แสดงเมื่อขนาดจอ >= md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <th className="p-6 text-center w-20">ลำดับ</th>
                  <th className="p-6 min-w-[250px]">ข้อมูล นทน.</th>
                  <th className="p-6 text-center">ความคืบหน้า</th>
                  {data.surveys.map((s, i) => (
                    <th key={i} className="p-6 text-center border-l border-slate-50 font-bold whitespace-nowrap">{s.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-indigo-50/30 transition-all group">
                    <td className="p-6 text-center text-slate-300 font-mono text-sm">{user.id}</td>
                    <td className="p-6">
                      <div className="font-extrabold text-slate-700 group-hover:text-indigo-700 transition-colors">{user.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-tighter">รหัสประจำตัว: {user.idCard}</div>
                    </td>
                    <td className="p-6 text-center">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black ${user.completedCount === data.surveys.length ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                        {user.completedCount}/{data.surveys.length}
                      </div>
                    </td>
                    {user.status.map((isDone, idx) => (
                      <td key={idx} className="p-6 text-center border-l border-slate-50/50">
                        {isDone ? (
                          <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-sm shadow-emerald-200"><CheckCircle2 size={18} strokeWidth={3} /></div>
                        ) : (
                          <a 
                            href={data.surveys[idx]?.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="w-8 h-8 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto border border-slate-100 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:shadow-lg transition-all group/icon"
                            title={`คลิกเพื่อทำ: ${data.surveys[idx]?.name}`}
                          >
                            <ExternalLink size={14} className="group-hover/icon:scale-110" />
                          </a>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="bg-slate-50/50 p-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-100">
            <span>แสดงรายการทั้งหมด {filteredUsers.length} ท่าน</span>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-sm shadow-emerald-200"></span> <span>ดำเนินการแล้ว</span></div>
              <div className="flex items-center space-x-2"><span className="w-2.5 h-2.5 bg-slate-200 rounded-full border border-slate-300"></span> <span>ยังไม่ดำเนินการ (คลิกเพื่อทำ)</span></div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-12 text-center">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">© 2026 Survey Tracking System | Optimized for iPad & Mobile</p>
      </footer>

      {/* Syncing Overlay for Mobile */}
      {syncing && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-[2px] z-[100] flex items-center justify-center">
          <div className="bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center">
            <RefreshCw className="animate-spin text-indigo-600 mb-3" size={32} />
            <p className="text-sm font-black text-slate-600 uppercase tracking-widest">กำลังซิงค์ข้อมูล...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;