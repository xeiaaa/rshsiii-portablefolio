
import React, { useState } from 'react';
import { Section, UserAccount, GradedWork, UserRole } from '../types';
import { Users, GraduationCap, ChevronRight, FileText, BarChart3, Search, LayoutGrid } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  teacherName: string;
  teacherId: string;
  works: GradedWork[];
  sections: Section[];
  accounts: UserAccount[];
}

export const TeacherDashboard: React.FC<Props> = ({ teacherName, teacherId, works, sections, accounts }) => {
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<UserAccount | null>(null);

  // Filter sections assigned to this teacher
  const mySections = sections.filter(s => s.teacherId === teacherId);
  
  // Get students for the selected section
  const sectionStudents = selectedSection 
    ? accounts.filter(a => a.role === UserRole.STUDENT && (a as any).sectionId === selectedSection.id)
    : [];

  const studentWorks = selectedStudent ? works.filter(w => w.studentId === selectedStudent.id) : [];
  
  const chartData = studentWorks.map(w => ({
    name: w.workName.substring(0, 10) + '...',
    score: w.score,
    passing: 75
  })).reverse();

  return (
    <div className="max-w-7xl mx-auto p-4 flex flex-col md:flex-row gap-6 min-h-[calc(100vh-100px)]">
      {/* Sidebar: Sections & Students */}
      <aside className="w-full md:w-80 space-y-4">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Users className="text-indigo-600" />
            My Sections
          </h2>
          <div className="space-y-2">
            {mySections.length === 0 ? (
              <p className="text-xs text-slate-400 font-bold px-4 py-8 text-center bg-slate-50 rounded-2xl">No sections assigned yet.</p>
            ) : (
              mySections.map(section => (
                <button
                  key={section.id}
                  onClick={() => { setSelectedSection(section); setSelectedStudent(null); }}
                  className={`w-full text-left px-4 py-3 rounded-2xl flex items-center justify-between transition-all ${
                    selectedSection?.id === section.id ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="font-semibold">{section.name}</span>
                  <ChevronRight size={18} opacity={selectedSection?.id === section.id ? 1 : 0.3} />
                </button>
              ))
            )}
          </div>
        </div>

        {selectedSection && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 animate-in slide-in-from-left-2 duration-300">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Students</h3>
            <div className="space-y-1">
              {sectionStudents.length === 0 ? (
                <p className="text-xs text-slate-400 italic px-4 py-4">No students in this section.</p>
              ) : (
                sectionStudents.map(student => (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
                      selectedStudent?.id === student.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                      selectedStudent?.id === student.id ? 'bg-indigo-600 text-white' : 'bg-slate-100'
                    }`}>
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span>{student.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Main View */}
      <main className="flex-1 space-y-6">
        {!selectedStudent ? (
          <div className="h-full bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-12 text-center">
            <GraduationCap size={64} className="mb-4 opacity-20" />
            <h2 className="text-2xl font-bold mb-2">Academic Grading Console</h2>
            <p>Select a section and student from the left sidebar to view their portfolio and performance metrics.</p>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-inner">
                  {selectedStudent.name[0]}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">{selectedStudent.name}</h1>
                  <p className="text-slate-500">{selectedSection?.name} • Student Profile</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-slate-50 p-3 rounded-2xl text-center min-w-[100px]">
                  <p className="text-xs font-bold text-slate-400 uppercase">Avg Score</p>
                  <p className="text-xl font-bold text-slate-800">
                    {studentWorks.length > 0 ? (studentWorks.reduce((acc, w) => acc + (w.score || 0), 0) / studentWorks.length).toFixed(1) : '0'}%
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl text-center min-w-[100px]">
                  <p className="text-xs font-bold text-slate-400 uppercase">Works</p>
                  <p className="text-xl font-bold text-slate-800">{studentWorks.length}</p>
                </div>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <BarChart3 size={20} className="text-indigo-500" />
                Learning Progress
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} dot={{ r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="passing" stroke="#f43f5e" strokeDasharray="5 5" strokeWidth={1} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Submissions List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studentWorks.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-400 font-bold">No submissions found for this student.</div>
              ) : (
                studentWorks.map(work => (
                  <div key={work.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex gap-4 group hover:border-indigo-200 transition-colors shadow-sm hover:shadow-md">
                    <div className="w-24 h-24 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden relative">
                      <img src={work.fileUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">{work.subject}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${work.isPassing ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {work.isPassing ? 'PASS' : 'FAIL'}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{work.workName}</h4>
                        <p className="text-xs text-slate-400">Quarter {work.quarter} • {work.date}</p>
                      </div>
                      <div className="flex justify-between items-end">
                         <span className="text-lg font-black text-slate-700">{work.score}/{work.totalScore}</span>
                         <button className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">View Details</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
