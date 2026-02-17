
import React, { useState } from 'react';
import { UserRole, UserAccount, Section } from '../types';
import { 
  Users, UserPlus, GraduationCap, ClipboardList, 
  Settings, Trash2, Edit3, Plus, Search, 
  LayoutGrid, ArrowRight, ShieldCheck, X, Check, BookOpen
} from 'lucide-react';

interface Props {
  adminName: string;
  sections: Section[];
  accounts: UserAccount[];
  subjects: string[];
  onUpdateSections: (sections: Section[]) => void;
  onUpdateAccounts: (accounts: UserAccount[]) => void;
  onUpdateSubjects: (subjects: string[]) => void;
}

export const AdminDashboard: React.FC<Props> = ({ 
  adminName, 
  sections, 
  accounts, 
  subjects,
  onUpdateSections, 
  onUpdateAccounts,
  onUpdateSubjects
}) => {
  const [activeTab, setActiveTab] = useState<'sections' | 'teachers' | 'students' | 'subjects'>('sections');
  const [editingItem, setEditingItem] = useState<{ type: string; data: any; index?: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const teachers = accounts.filter(a => a.role === UserRole.TEACHER);
  const students = accounts.filter(a => a.role === UserRole.STUDENT);

  const handleDeleteSection = (id: string) => {
    if (confirm("Are you sure you want to delete this section? Students in this section will need to be reassigned.")) {
      onUpdateSections(sections.filter(s => s.id !== id));
    }
  };

  const handleDeleteAccount = (id: string) => {
    if (confirm("Delete this user account? All associated data will be lost.")) {
      onUpdateAccounts(accounts.filter(a => a.id !== id));
    }
  };

  const handleDeleteSubject = (index: number) => {
    if (confirm("Delete this subject? It will no longer be available for selection in new works.")) {
      onUpdateSubjects(subjects.filter((_, i) => i !== index));
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (editingItem.type === 'section') {
      const isNew = !sections.find(s => s.id === editingItem.data.id);
      if (isNew) {
        onUpdateSections([...sections, editingItem.data]);
      } else {
        onUpdateSections(sections.map(s => s.id === editingItem.data.id ? editingItem.data : s));
      }
    } else if (editingItem.type === 'subject') {
      if (editingItem.index !== undefined) {
        onUpdateSubjects(subjects.map((s, i) => i === editingItem.index ? editingItem.data : s));
      } else {
        onUpdateSubjects([...subjects, editingItem.data]);
      }
    } else {
      const isNew = !accounts.find(a => a.id === editingItem.data.id);
      if (isNew) {
        onUpdateAccounts([...accounts, editingItem.data]);
      } else {
        onUpdateAccounts(accounts.map(a => a.id === editingItem.data.id ? editingItem.data : a));
      }
    }
    setEditingItem(null);
  };

  const filteredData = () => {
    const q = searchQuery.toLowerCase();
    if (activeTab === 'sections') return sections.filter(s => s.name.toLowerCase().includes(q));
    if (activeTab === 'teachers') return teachers.filter(t => t.name.toLowerCase().includes(q));
    if (activeTab === 'subjects') return subjects.map((s, i) => ({ name: s, index: i })).filter(s => s.name.toLowerCase().includes(q));
    return students.filter(s => s.name.toLowerCase().includes(q));
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter mb-2">Admin Console 🛠️</h1>
          <p className="text-slate-500 font-bold text-lg">Managing the heart of Portablefolio.</p>
        </div>
        
        <div className="bg-white p-1.5 rounded-[1.5rem] shadow-xl border border-slate-100 flex flex-wrap gap-1">
          {[
            { id: 'sections', label: 'Sections', icon: LayoutGrid },
            { id: 'teachers', label: 'Teachers', icon: ClipboardList },
            { id: 'students', label: 'Students', icon: GraduationCap },
            { id: 'subjects', label: 'Subjects', icon: BookOpen }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-[1.25rem] font-black text-sm transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder={`Search ${activeTab}...`} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-700 shadow-sm focus:border-indigo-500 outline-none transition-all"
          />
        </div>
        
        <button 
          onClick={() => {
            if (activeTab === 'sections') setEditingItem({ type: 'section', data: { id: `sec-${Date.now()}`, name: '' } });
            if (activeTab === 'teachers') setEditingItem({ type: 'teacher', data: { id: `tea-${Date.now()}`, name: '', role: UserRole.TEACHER } });
            if (activeTab === 'students') setEditingItem({ type: 'student', data: { id: `stu-${Date.now()}`, name: '', role: UserRole.STUDENT } });
            if (activeTab === 'subjects') setEditingItem({ type: 'subject', data: '' });
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus size={20} /> Add New {activeTab.slice(0, -1)}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData().map((item: any) => (
          <div key={item.id || item.index} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${
                activeTab === 'sections' ? 'bg-indigo-50 text-indigo-600' : 
                activeTab === 'teachers' ? 'bg-amber-50 text-amber-600' : 
                activeTab === 'subjects' ? 'bg-rose-50 text-rose-600' :
                'bg-emerald-50 text-emerald-600'
              }`}>
                {activeTab === 'sections' ? <LayoutGrid size={24} /> : 
                 activeTab === 'teachers' ? <ClipboardList size={24} /> : 
                 activeTab === 'subjects' ? <BookOpen size={24} /> :
                 <GraduationCap size={24} />}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => {
                    if (activeTab === 'subjects') {
                      setEditingItem({ type: 'subject', data: item.name, index: item.index });
                    } else {
                      setEditingItem({ type: activeTab.slice(0, -1), data: item });
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                >
                  <Edit3 size={18} />
                </button>
                <button 
                  onClick={() => {
                    if (activeTab === 'sections') handleDeleteSection(item.id);
                    else if (activeTab === 'subjects') handleDeleteSubject(item.index);
                    else handleDeleteAccount(item.id);
                  }}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">{activeTab === 'subjects' ? item.name : item.name}</h3>
                {activeTab !== 'subjects' && <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.id}</p>}
              </div>

              {activeTab === 'sections' && (
                <div className="pt-4 border-t border-slate-50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Assigned Teacher</span>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-black">
                      {teachers.find(t => t.id === item.teacherId)?.name[0] || '?'}
                    </div>
                    <span className="text-sm font-bold text-slate-700">
                      {teachers.find(t => t.id === item.teacherId)?.name || 'Unassigned'}
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'students' && (
                <div className="pt-4 border-t border-slate-50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Section</span>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                      <LayoutGrid size={14} />
                    </div>
                    <span className="text-sm font-bold text-slate-700">
                      {sections.find(s => s.id === item.sectionId)?.name || 'Needs Assignment'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter capitalize">
                {editingItem.type} Details
              </h2>
              <button onClick={() => setEditingItem(null)} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  {editingItem.type === 'subject' ? 'Subject Name' : 'Name'}
                </label>
                <input 
                  type="text" 
                  required
                  autoFocus
                  value={editingItem.type === 'subject' ? editingItem.data : editingItem.data.name}
                  onChange={(e) => {
                    if (editingItem.type === 'subject') {
                      setEditingItem({ ...editingItem, data: e.target.value });
                    } else {
                      setEditingItem({...editingItem, data: {...editingItem.data, name: e.target.value}});
                    }
                  }}
                  className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-800 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              {editingItem.type === 'section' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Teacher</label>
                  <select 
                    value={editingItem.data.teacherId || ''}
                    onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, teacherId: e.target.value}})}
                    className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-800 focus:border-indigo-500 outline-none appearance-none bg-slate-50"
                  >
                    <option value="">Choose Teacher...</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              )}

              {editingItem.type === 'student' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Section</label>
                  <select 
                    value={editingItem.data.sectionId || ''}
                    onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, sectionId: e.target.value}})}
                    className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-800 focus:border-indigo-500 outline-none appearance-none bg-slate-50"
                  >
                    <option value="">Choose Section...</option>
                    {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}

              <button 
                type="submit" 
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Check size={20} /> Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
