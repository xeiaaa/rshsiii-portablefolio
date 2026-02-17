
import React, { useState, useEffect } from 'react';
import { UserRole, GradedWork, AppState, Test, UserAccount, Section } from './types';
import { INITIAL_WORKS, PASSING_PERCENTAGE, INITIAL_ACCOUNTS, INITIAL_SECTIONS, INITIAL_SUBJECTS } from './constants';
import { StudentDashboard } from './components/StudentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { ParentDashboard } from './components/ParentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { GraduationCap, LogOut, Layout, ClipboardList, ShieldCheck, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('portablefolio_state');
    return saved ? JSON.parse(saved) : {
      currentUser: null,
      works: INITIAL_WORKS,
      tests: [],
      sections: INITIAL_SECTIONS,
      accounts: INITIAL_ACCOUNTS,
      subjects: INITIAL_SUBJECTS
    };
  });

  useEffect(() => {
    localStorage.setItem('portablefolio_state', JSON.stringify(state));
  }, [state]);

  const login = (role: UserRole) => {
    const account = state.accounts.find(a => a.role === role);
    if (account) {
      setState(prev => ({ ...prev, currentUser: account }));
    } else {
      // Fallback for new installs if initial accounts are missing
      const fallbackAccount = INITIAL_ACCOUNTS.find(a => a.role === role);
      if (fallbackAccount) setState(prev => ({ ...prev, currentUser: fallbackAccount }));
    }
  };

  const logout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
  };

  const handleUploadWork = (newWork: Omit<GradedWork, 'id' | 'isPassing' | 'studentName'>) => {
    const work: GradedWork = {
      ...newWork,
      id: `work-${Date.now()}`,
      studentName: state.currentUser?.name || 'Unknown Student',
      isPassing: (newWork.score || 0) >= (newWork.totalScore * (PASSING_PERCENTAGE / 100))
    };
    setState(prev => ({
      ...prev,
      works: [work, ...prev.works]
    }));
  };

  const handleSaveTest = (test: Test) => {
    setState(prev => ({
      ...prev,
      tests: [test, ...prev.tests.filter(t => t.workId !== test.workId)]
    }));
  };

  const handleUpdateSections = (sections: Section[]) => {
    setState(prev => ({ ...prev, sections }));
  };

  const handleUpdateAccounts = (accounts: UserAccount[]) => {
    setState(prev => ({ ...prev, accounts }));
  };

  const handleUpdateSubjects = (subjects: string[]) => {
    setState(prev => ({ ...prev, subjects }));
  };

  if (!state.currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-indigo-600">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg">
                <Layout size={32} />
              </div>
              <span className="text-3xl font-black tracking-tight">Portablefolio</span>
            </div>
            <h1 className="text-5xl font-black text-slate-800 leading-tight">Your Digital <span className="text-indigo-600">Academic</span> Legacy.</h1>
            <p className="text-xl text-slate-500 leading-relaxed">
              The all-in-one portfolio to safeguard your works, track progress, and improve learning with AI insights.
            </p>
          </div>

          <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Sign In</h2>
            <div className="grid grid-cols-1 gap-4">
              <button onClick={() => login(UserRole.STUDENT)} className="flex items-center gap-4 p-4 border rounded-2xl hover:bg-indigo-50 transition-all text-left group">
                <div className="p-3 bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white rounded-xl transition-colors"><GraduationCap /></div>
                <div><div className="font-bold text-slate-800">Student</div><div className="text-xs text-slate-400">Manage my works</div></div>
              </button>
              <button onClick={() => login(UserRole.PARENT)} className="flex items-center gap-4 p-4 border rounded-2xl hover:bg-emerald-50 transition-all text-left group">
                <div className="p-3 bg-slate-50 group-hover:bg-emerald-600 group-hover:text-white rounded-xl transition-colors"><ShieldCheck /></div>
                <div><div className="font-bold text-slate-800">Parent</div><div className="text-xs text-slate-400">Monitor child</div></div>
              </button>
              <button onClick={() => login(UserRole.TEACHER)} className="flex items-center gap-4 p-4 border rounded-2xl hover:bg-amber-50 transition-all text-left group">
                <div className="p-3 bg-slate-50 group-hover:bg-amber-600 group-hover:text-white rounded-xl transition-colors"><ClipboardList /></div>
                <div><div className="font-bold text-slate-800">Teacher</div><div className="text-xs text-slate-400">Grade & Review</div></div>
              </button>
              <button onClick={() => login(UserRole.ADMIN)} className="flex items-center gap-4 p-4 border rounded-2xl hover:bg-slate-100 transition-all text-left group">
                <div className="p-3 bg-slate-50 group-hover:bg-slate-800 group-hover:text-white rounded-xl transition-colors"><Settings /></div>
                <div><div className="font-bold text-slate-800">Admin</div><div className="text-xs text-slate-400">System Management</div></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layout className="text-indigo-600" />
            <span className="font-black text-xl tracking-tighter text-slate-800">Portablefolio</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
               <div className="text-sm font-bold text-slate-800">{state.currentUser.name}</div>
               <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{state.currentUser.role}</div>
             </div>
             <button onClick={logout} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><LogOut size={20} /></button>
          </div>
        </div>
      </nav>

      <div className="py-8">
        {state.currentUser.role === UserRole.STUDENT && (
          <StudentDashboard 
            studentName={state.currentUser.name} 
            studentId={state.currentUser.id}
            works={state.works}
            tests={state.tests}
            subjects={state.subjects}
            onUpload={handleUploadWork}
            onSaveTest={handleSaveTest}
          />
        )}
        {state.currentUser.role === UserRole.TEACHER && (
          <TeacherDashboard 
            teacherName={state.currentUser.name} 
            teacherId={state.currentUser.id}
            works={state.works} 
            sections={state.sections}
            accounts={state.accounts}
          />
        )}
        {state.currentUser.role === UserRole.PARENT && (
          <ParentDashboard 
            parentName={state.currentUser.name}
            student={state.accounts.find(a => a.id === state.currentUser?.linkedStudentId) as any} 
            works={state.works.filter(w => w.studentId === state.currentUser?.linkedStudentId)}
          />
        )}
        {state.currentUser.role === UserRole.ADMIN && (
          <AdminDashboard 
            adminName={state.currentUser.name}
            sections={state.sections}
            accounts={state.accounts}
            subjects={state.subjects}
            onUpdateSections={handleUpdateSections}
            onUpdateAccounts={handleUpdateAccounts}
            onUpdateSubjects={handleUpdateSubjects}
          />
        )}
      </div>
    </div>
  );
};

export default App;
