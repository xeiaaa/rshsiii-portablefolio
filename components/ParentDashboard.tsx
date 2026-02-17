
import React from 'react';
import { GradedWork, Student } from '../types';
import { Bell, Heart, TrendingUp, TrendingDown, BookOpen, AlertTriangle } from 'lucide-react';

interface Props {
  parentName: string;
  student: Student;
  works: GradedWork[];
}

export const ParentDashboard: React.FC<Props> = ({ parentName, student, works }) => {
  const failingWorks = works.filter(w => !w.isPassing && w.score !== null);
  const average = works.length > 0 ? (works.reduce((acc, w) => acc + (w.score || 0), 0) / works.length) : 0;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-widest mb-2">
            <Heart size={16} fill="currentColor" />
            Family Portal
          </div>
          <h1 className="text-3xl font-black text-slate-800">Hello, {parentName}</h1>
          <p className="text-slate-500">Monitoring <span className="text-indigo-600 font-bold">{student.name}'s</span> academic journey.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 p-4 rounded-2xl text-center min-w-[120px]">
            <p className="text-xs font-bold text-indigo-400 uppercase">Avg. Grade</p>
            <p className="text-2xl font-black text-indigo-700">{average.toFixed(1)}%</p>
          </div>
        </div>
      </header>

      {failingWorks.length > 0 && (
        <section className="bg-rose-50 border border-rose-100 p-6 rounded-3xl animate-pulse">
          <div className="flex items-center gap-3 mb-4 text-rose-700">
            <Bell size={24} />
            <h2 className="text-xl font-bold">Academic Alerts ({failingWorks.length})</h2>
          </div>
          <p className="text-rose-600 mb-6 font-medium">Your child got a score below passing in the following subjects. They might need extra help or study time.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {failingWorks.map(work => (
              <div key={work.id} className="bg-white p-4 rounded-2xl shadow-sm border border-rose-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">{work.subject}</h4>
                  <p className="text-sm text-slate-500">{work.workName}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-rose-600">{work.score}/{work.totalScore}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{work.date}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="text-indigo-600" />
            Recent Portfolio Uploads
          </h2>
          <div className="space-y-4">
            {works.length === 0 ? (
              <p className="text-slate-400 italic">No uploads recorded yet.</p>
            ) : (
              works.map(work => (
                <div key={work.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                  <div className="w-full md:w-40 h-32 rounded-2xl overflow-hidden bg-slate-100">
                    <img src={work.fileUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between">
                        <span className="text-xs font-bold text-indigo-500 uppercase">{work.subject}</span>
                        <span className="text-xs font-medium text-slate-400">{work.date}</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-1">{work.workName}</h3>
                      <p className="text-sm text-slate-500">Quarter {work.quarter}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${work.isPassing ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        <span className="text-sm font-bold text-slate-700">{work.isPassing ? 'Satisfactory' : 'Needs Improvement'}</span>
                      </div>
                      <span className="text-2xl font-black text-slate-800">{work.score}/{work.totalScore}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp className="text-emerald-500" />
              Progress Summary
            </h3>
            <div className="space-y-4">
               {/* Simplified Breakdown */}
               {['Mathematics', 'Science', 'English'].map(sub => {
                 const subWorks = works.filter(w => w.subject === sub);
                 const subAvg = subWorks.length > 0 ? subWorks.reduce((acc, w) => acc + (w.score || 0), 0) / subWorks.length : 0;
                 return (
                   <div key={sub} className="space-y-2">
                     <div className="flex justify-between text-sm font-bold">
                       <span className="text-slate-600">{sub}</span>
                       <span className="text-slate-800">{subAvg.toFixed(0)}%</span>
                     </div>
                     <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                       <div 
                        className={`h-full rounded-full transition-all duration-1000 ${subAvg >= 75 ? 'bg-indigo-500' : 'bg-rose-500'}`}
                        style={{ width: `${subAvg}%` }}
                       />
                     </div>
                   </div>
                 );
               })}
            </div>
          </div>

          <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-100">
            <div className="flex items-center gap-2 font-bold mb-4">
               <AlertTriangle size={20} />
               Parent Support
            </div>
            <p className="text-indigo-100 text-sm leading-relaxed mb-6">
              AI-generated tutoring tips are available on {student.name}'s account for any work with low scores.
            </p>
            <button className="w-full bg-white text-indigo-600 font-bold py-3 rounded-2xl hover:bg-indigo-50 transition-colors">
              Request Teacher Chat
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
