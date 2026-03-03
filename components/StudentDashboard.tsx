
import React, { useState } from 'react';
import { GradedWork, UserRole, Test, Question, QuestionType } from '../types';
import { getAITutoringFeedback, analyzeImageContent, generateTestFromWork } from '../services/geminiService';
import { PASSING_PERCENTAGE } from '../constants';
import { marked } from 'marked';
import { 
  Upload, BookOpen, BrainCircuit, Calendar, CheckCircle2, 
  AlertCircle, Loader2, ScanSearch, Sparkles, X, 
  Dices, Play, Trophy, ChevronRight, FileText, ArrowLeft,
  LayoutGrid, ListChecks, Check, Maximize2
} from 'lucide-react';

interface Props {
  studentName: string;
  studentId: string;
  works: GradedWork[];
  tests: Test[];
  subjects: string[];
  onUpload: (work: Omit<GradedWork, 'id' | 'isPassing' | 'studentName'>) => void;
  onSaveTest: (test: Test) => void;
}

export const StudentDashboard: React.FC<Props> = ({ studentName, studentId, works, tests, subjects, onUpload, onSaveTest }) => {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'tests'>('portfolio');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedWork, setSelectedWork] = useState<GradedWork | null>(null);
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  const [testProgress, setTestProgress] = useState<{ index: number, score: number, answers: string[], showFeedback: boolean }>({ index: 0, score: 0, answers: [], showFeedback: false });
  const [testResult, setTestResult] = useState<{ score: number, total: number } | null>(null);
  
  const [formData, setFormData] = useState({
    subject: subjects[0] || 'Mathematics',
    quarter: 1,
    workName: '',
    date: new Date().toISOString().split('T')[0],
    score: 0,
    totalScore: 100,
    fileUrl: ''
  });
  
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState<string | null>(null);
  const [testGenLoading, setTestGenLoading] = useState<string | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);

  const myWorks = works.filter(w => w.studentId === studentId);
  const myTests = tests.filter(t => t.studentId === studentId);

  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const subjectsInWorks = [...new Set(myWorks.map(w => w.subject))].sort();
  const filteredWorks = subjectFilter ? myWorks.filter(w => w.subject === subjectFilter) : myWorks;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, fileUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleGenTest = async (work: GradedWork) => {
    setTestGenLoading(work.id);
    const questions = await generateTestFromWork(work.fileUrl, work.subject, work.workName);
    if (questions) {
      const newTest: Test = {
        id: `test-${Date.now()}`,
        workId: work.id,
        studentId,
        subject: work.subject,
        name: `Retake: ${work.workName}`,
        questions,
        createdAt: new Date().toISOString()
      };
      onSaveTest(newTest);
      setActiveTab('tests');
      setSelectedWork(null);
    }
    setTestGenLoading(null);
  };

  const startTest = (test: Test) => {
    setActiveTest(test);
    setTestProgress({ index: 0, score: 0, answers: [], showFeedback: false });
    setTestResult(null);
  };

  const handleAnswer = (ans: string) => {
    if (!activeTest) return;
    const currentQ = activeTest.questions[testProgress.index];
    const isCorrect = ans.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();
    
    setTestProgress(prev => ({
      ...prev,
      answers: [...prev.answers, ans],
      score: isCorrect ? prev.score + 1 : prev.score,
      showFeedback: true
    }));
  };

  const nextQuestion = () => {
    if (!activeTest) return;
    if (testProgress.index + 1 < activeTest.questions.length) {
      setTestProgress(prev => ({ ...prev, index: prev.index + 1, showFeedback: false }));
    } else {
      setTestResult({ score: testProgress.score, total: activeTest.questions.length });
    }
  };

  const handleDeepAnalysis = async (work: GradedWork) => {
    setAnalysisLoading(work.id);
    const analysis = await analyzeImageContent(work.fileUrl, work.subject);
    setSelectedAnalysis(analysis);
    setAnalysisLoading(null);
    setSelectedFeedback(null);
  };

  const fetchAIHelp = async (work: GradedWork) => {
    setAiLoading(work.id);
    const feedback = await getAITutoringFeedback(work.subject, work.workName, work.score || 0, work.totalScore);
    setSelectedFeedback(feedback || '');
    setAiLoading(null);
    setSelectedAnalysis(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fileUrl) {
      alert("Please upload an image of your work.");
      return;
    }
    onUpload({
      studentId: studentId,
      subject: formData.subject,
      quarter: formData.quarter,
      workName: formData.workName,
      date: formData.date,
      score: formData.score,
      totalScore: formData.totalScore,
      fileUrl: formData.fileUrl
    });
    
    setIsUploading(false);
    setFormData({
      subject: subjects[0] || 'Mathematics',
      quarter: 1,
      workName: '',
      date: new Date().toISOString().split('T')[0],
      score: 0,
      totalScore: 100,
      fileUrl: ''
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 pb-20">
      {/* Work Detail Modal */}
      {selectedWork && (
        <div className="fixed inset-0 z-[80] bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-0 md:p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-7xl h-full md:h-[90vh] md:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in slide-in-from-bottom-8 duration-500">
            {/* Left side: Lightbox Preview */}
            <div className="w-full md:w-3/5 bg-slate-100 relative group overflow-hidden">
               <div className="absolute top-6 left-6 z-10">
                 <button 
                  onClick={() => { setSelectedWork(null); setSelectedAnalysis(null); setSelectedFeedback(null); }}
                  className="bg-white/90 backdrop-blur p-4 rounded-2xl text-slate-800 shadow-xl hover:bg-white transition-all flex items-center gap-2 font-black"
                 >
                   <ArrowLeft size={20} /> Back to Portfolio
                 </button>
               </div>
               <img 
                src={selectedWork.fileUrl} 
                alt={selectedWork.workName} 
                className="w-full h-full object-contain p-4 md:p-12 select-none"
               />
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur px-6 py-2 rounded-full text-white text-xs font-bold pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                 Original Scanned Paper Preview
               </div>
            </div>

            {/* Right side: Info & AI results */}
            <div className="w-full md:w-2/5 flex flex-col h-full bg-white border-l border-slate-100">
              <div className="p-8 space-y-8 flex-1 overflow-y-auto scrollbar-hide">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedWork.subject}</span>
                    <span className="bg-slate-50 text-slate-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Quarter {selectedWork.quarter}</span>
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none">{selectedWork.workName}</h2>
                  <p className="text-slate-400 font-bold flex items-center gap-2 text-sm"><Calendar size={16} /> Uploaded on {selectedWork.date}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Score</span>
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-black text-slate-800">{selectedWork.score}</span>
                      <span className="text-slate-400 font-bold mb-1">/ {selectedWork.totalScore}</span>
                    </div>
                  </div>
                  <div className={`p-6 rounded-[2rem] border flex flex-col justify-center ${selectedWork.isPassing ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                    <span className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${selectedWork.isPassing ? 'text-emerald-500' : 'text-rose-500'}`}>Status</span>
                    <div className={`flex items-center gap-2 font-black ${selectedWork.isPassing ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {selectedWork.isPassing ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                      {selectedWork.isPassing ? 'PASSED' : 'RETAKE SUGGESTED'}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Learning Tools</h3>
                   <div className="grid grid-cols-1 gap-3">
                      <button 
                        onClick={() => handleDeepAnalysis(selectedWork)}
                        disabled={!!analysisLoading}
                        className="flex items-center gap-4 p-5 rounded-2xl bg-white border-2 border-slate-50 hover:border-violet-500 hover:bg-violet-50 transition-all group"
                      >
                        <div className="p-3 bg-violet-100 text-violet-600 rounded-xl group-hover:bg-violet-600 group-hover:text-white transition-colors">
                          {analysisLoading ? <Loader2 className="animate-spin" /> : <ScanSearch />}
                        </div>
                        <div className="text-left">
                          <div className="font-black text-slate-800 text-sm">Deep Vision Analysis</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Spot errors & find solutions</div>
                        </div>
                      </button>

                      <button 
                        onClick={() => handleGenTest(selectedWork)}
                        disabled={!!testGenLoading}
                        className="flex items-center gap-4 p-5 rounded-2xl bg-white border-2 border-slate-50 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                      >
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          {testGenLoading ? <Loader2 className="animate-spin" /> : <Dices />}
                        </div>
                        <div className="text-left">
                          <div className="font-black text-slate-800 text-sm">Interactive Retake</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Convert this paper to a test</div>
                        </div>
                      </button>

                      <button 
                        onClick={() => fetchAIHelp(selectedWork)}
                        disabled={!!aiLoading}
                        className="flex items-center gap-4 p-5 rounded-2xl bg-white border-2 border-slate-50 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                      >
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          {aiLoading ? <Loader2 className="animate-spin" /> : <BrainCircuit />}
                        </div>
                        <div className="text-left">
                          <div className="font-black text-slate-800 text-sm">AI Tutoring Lesson</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Step-by-step concept help</div>
                        </div>
                      </button>
                   </div>
                </div>

                {/* Result Block */}
                {(selectedAnalysis || selectedFeedback) && (
                  <div className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        {selectedAnalysis ? <Sparkles size={14} className="text-violet-500" /> : <BookOpen size={14} className="text-indigo-500" />}
                        {selectedAnalysis ? 'Vision Intelligence Report' : 'AI Learning Session'}
                      </h3>
                      <button onClick={() => { setSelectedAnalysis(null); setSelectedFeedback(null); }} className="text-slate-300 hover:text-slate-600">
                        <X size={16} />
                      </button>
                    </div>
                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 markdown-container text-slate-700 font-medium">
                       <div dangerouslySetInnerHTML={{ __html: marked.parse(selectedAnalysis || selectedFeedback || '') }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Runner Modal */}
      {activeTest && !testResult && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto animate-in slide-in-from-bottom duration-500">
          <div className="max-w-3xl mx-auto w-full px-6 py-12 flex flex-col min-h-screen">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-10 shrink-0">
              <button onClick={() => setActiveTest(null)} className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors">
                <ArrowLeft size={20} /> Exit Test
              </button>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{activeTest.subject}</span>
                <span className="font-black text-slate-800">{activeTest.name}</span>
              </div>
            </div>

            {/* Progress Bar Section */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-12 shrink-0">
              <div 
                className="h-full bg-indigo-600 transition-all duration-500 shadow-[0_0_12px_rgba(79,70,229,0.3)]" 
                style={{ width: `${((testProgress.index + (testProgress.showFeedback ? 1 : 0)) / activeTest.questions.length) * 100}%` }} 
              />
            </div>

            {/* Question Content Section */}
            <div className="flex-grow flex flex-col space-y-12">
              <div className="text-center space-y-4">
                <span className="inline-block bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter">
                  Question {testProgress.index + 1} of {activeTest.questions.length}
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-slate-800 leading-tight tracking-tight px-4">
                  {activeTest.questions[testProgress.index].prompt}
                </h2>
              </div>

              <div className="w-full max-w-2xl mx-auto grid grid-cols-1 gap-4">
                {activeTest.questions[testProgress.index].type === QuestionType.MULTIPLE_CHOICE ? (
                  activeTest.questions[testProgress.index].options?.map(opt => (
                    <button 
                      key={opt}
                      disabled={testProgress.showFeedback}
                      onClick={() => handleAnswer(opt)}
                      className={`p-6 rounded-[1.5rem] border-2 text-left font-bold transition-all transform duration-200 ${
                        testProgress.showFeedback 
                          ? opt === activeTest.questions[testProgress.index].correctAnswer 
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-lg scale-[1.02]' 
                            : testProgress.answers[testProgress.index] === opt ? 'bg-rose-50 border-rose-500 text-rose-700 opacity-50' : 'opacity-20 grayscale border-slate-100'
                          : 'bg-white border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 active:scale-95 shadow-sm hover:shadow-md'
                      }`}
                    >
                      {opt}
                    </button>
                  ))
                ) : (
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Type your answer here..."
                      disabled={testProgress.showFeedback}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAnswer((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                      className="w-full p-8 text-2xl font-black bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] text-center focus:border-indigo-600 focus:bg-white outline-none transition-all placeholder:text-slate-200 shadow-inner"
                    />
                    {!testProgress.showFeedback && <p className="text-center text-slate-400 font-bold text-sm animate-pulse">Press Enter to submit</p>}
                  </div>
                )}
              </div>

              {testProgress.showFeedback && (
                <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-top-4 duration-300 pb-12">
                  <div className={`p-8 rounded-[2.5rem] border-2 flex flex-col md:flex-row gap-6 ${testProgress.answers[testProgress.index].toLowerCase() === activeTest.questions[testProgress.index].correctAnswer.toLowerCase() ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                    <div className="p-4 rounded-2xl bg-white self-start shadow-sm">
                      {testProgress.answers[testProgress.index].toLowerCase() === activeTest.questions[testProgress.index].correctAnswer.toLowerCase() ? <Trophy className="text-emerald-500" size={32} /> : <AlertCircle className="text-rose-500" size={32} />}
                    </div>
                    <div className="space-y-4 flex-grow">
                       <div>
                         <p className={`font-black uppercase tracking-widest text-xs mb-1 ${testProgress.answers[testProgress.index].toLowerCase() === activeTest.questions[testProgress.index].correctAnswer.toLowerCase() ? 'text-emerald-600' : 'text-rose-600'}`}>
                           {testProgress.answers[testProgress.index].toLowerCase() === activeTest.questions[testProgress.index].correctAnswer.toLowerCase() ? 'Spot on!' : 'Not quite right'}
                         </p>
                         <p className="text-slate-700 leading-relaxed font-semibold text-lg">{activeTest.questions[testProgress.index].explanation}</p>
                       </div>
                       <button onClick={nextQuestion} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                         {testProgress.index + 1 === activeTest.questions.length ? 'See Final Results' : 'Next Question'} <ChevronRight size={20} />
                       </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Result Screen */}
      {testResult && (
        <div className="fixed inset-0 z-[110] bg-indigo-600 flex items-center justify-center p-6 text-white text-center animate-in zoom-in duration-500">
           <div className="max-w-md w-full space-y-12">
              <div className="relative inline-block">
                <div className="w-48 h-48 rounded-full border-8 border-indigo-400 flex items-center justify-center">
                  <div className="text-6xl font-black">{(testResult.score / testResult.total * 100).toFixed(0)}%</div>
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-indigo-900 px-6 py-2 rounded-2xl font-black shadow-xl">
                  {testResult.score}/{testResult.total} Correct
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-black">Well Done, {studentName}!</h1>
                <p className="text-indigo-200 font-bold">You've successfully completed the practice retake.</p>
              </div>
              <button onClick={() => { setActiveTest(null); setTestResult(null); }} className="w-full bg-white text-indigo-600 py-5 rounded-[2rem] font-black text-xl hover:bg-indigo-50 shadow-2xl transition-all active:scale-95">Back to Dashboard</button>
           </div>
        </div>
      )}

      {/* Main Dashboard Content */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter mb-2">Hello, {studentName}! 👋</h1>
          <p className="text-slate-500 font-bold text-lg">Build your academic legacy, one work at a time.</p>
        </div>
        
        <div className="bg-white p-1.5 rounded-[1.5rem] shadow-xl border border-slate-100 flex gap-1">
          <button 
            onClick={() => setActiveTab('portfolio')}
            className={`flex items-center gap-2 px-6 py-3 rounded-[1.25rem] font-black text-sm transition-all ${activeTab === 'portfolio' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <LayoutGrid size={18} /> Portfolio
          </button>
          <button 
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-2 px-6 py-3 rounded-[1.25rem] font-black text-sm transition-all ${activeTab === 'tests' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <ListChecks size={18} /> Retake Center
          </button>
        </div>
      </div>

      {activeTab === 'portfolio' ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
           <div className="flex justify-between items-center">
             <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
               <FileText className="text-indigo-600" /> Recent Works
             </h2>
             <button onClick={() => setIsUploading(true)} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-indigo-100 flex items-center gap-2 hover:bg-indigo-700 transition-all active:scale-95">
               <Upload size={20} /> Upload Paper
             </button>
           </div>

           {myWorks.length > 0 && (
             <div className="flex flex-wrap gap-2">
               <button
                 onClick={() => setSubjectFilter(null)}
                 className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                   subjectFilter === null
                     ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                     : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                 }`}
               >
                 All
               </button>
               {subjectsInWorks.map((subject) => (
                 <button
                   key={subject}
                   onClick={() => setSubjectFilter(subject)}
                   className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                     subjectFilter === subject
                       ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                       : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                   }`}
                 >
                   {subject}
                 </button>
               ))}
             </div>
           )}

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {filteredWorks.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                   <Upload className="mx-auto text-slate-300 mb-4" size={64} />
                   <p className="text-slate-500 font-black text-xl uppercase tracking-widest">
                     {myWorks.length === 0 ? 'No Works Yet' : `No works in ${subjectFilter}`}
                   </p>
                </div>
             ) : (
               filteredWorks.map(work => (
                 <div 
                   key={work.id} 
                   onClick={() => setSelectedWork(work)}
                   className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500 group cursor-pointer border-t-4 border-t-transparent hover:border-t-indigo-600"
                 >
                    <div className="h-56 relative overflow-hidden bg-slate-100">
                      <img src={work.fileUrl} alt={work.workName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/95 backdrop-blur px-4 py-2 rounded-2xl text-[10px] font-black uppercase text-indigo-600 shadow-xl tracking-widest">{work.subject}</span>
                      </div>
                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center">
                         <div className="bg-white/90 backdrop-blur px-6 py-2 rounded-full font-black text-indigo-600 shadow-xl translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2">
                           <Maximize2 size={16} /> View Details
                         </div>
                      </div>
                    </div>
                    
                    <div className="p-7 space-y-4">
                      <div>
                        <h3 className="font-black text-slate-800 text-xl tracking-tight leading-none mb-1 line-clamp-1">{work.workName}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={12} className="text-indigo-400" /> {work.date}</p>
                      </div>

                      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-3xl">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</span>
                          <span className="text-xl font-black text-slate-800">{work.score}/{work.totalScore}</span>
                        </div>
                        <div className={`p-2 rounded-2xl shadow-sm ${work.isPassing ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {work.isPassing ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                        </div>
                      </div>
                    </div>
                 </div>
               ))
             )}
           </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
           <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
             <Trophy className="text-emerald-600" /> Practice & Retake Tests
           </h2>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {myTests.length === 0 ? (
               <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-400">
                  <Dices className="mx-auto mb-4 opacity-20" size={64} />
                  <p className="font-bold text-lg">No interactive tests generated yet.</p>
                  <p className="text-sm">Go to your Portfolio and click "Convert to Interactive Retake" on any work.</p>
               </div>
             ) : (
               myTests.map(test => (
                 <div key={test.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 space-y-6 hover:shadow-xl transition-all group hover:-translate-y-1">
                   <div className="flex justify-between items-start">
                     <div className="p-4 bg-emerald-50 text-emerald-600 rounded-[1.5rem] shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                        <Dices size={28} />
                     </div>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{test.subject}</span>
                   </div>

                   <div>
                     <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-2">{test.name}</h3>
                     <p className="text-xs font-bold text-slate-400">{test.questions.length} Questions • Created {new Date(test.createdAt).toLocaleDateString()}</p>
                   </div>

                   <button 
                     onClick={() => startTest(test)}
                     className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-emerald-600 text-white font-black text-sm uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all active:scale-95"
                   >
                     <Play size={18} /> Start Practice
                   </button>
                 </div>
               ))
             )}
           </div>
        </div>
      )}

      {/* Upload Modal UI logic */}
      {isUploading && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[90] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in duration-200">
             <div className="flex justify-between items-center mb-8">
               <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Add New Paper</h2>
               <button onClick={() => setIsUploading(false)} className="bg-slate-50 p-2 rounded-full text-slate-400 hover:text-slate-600"><X /></button>
             </div>
             <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <select 
                    value={formData.subject} 
                    onChange={(e) => setFormData(p => ({...p, subject: e.target.value}))} 
                    className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none appearance-none bg-slate-50"
                  >
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={formData.quarter} onChange={(e) => setFormData(p => ({...p, quarter: Number(e.target.value)}))} className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none appearance-none bg-slate-50">{[1,2,3,4].map(q => <option key={q} value={q}>Q{q}</option>)}</select>
                </div>
                <input type="text" placeholder="Title of Work" required value={formData.workName} onChange={(e) => setFormData(p => ({...p, workName: e.target.value}))} className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none bg-slate-50 focus:border-indigo-500 transition-all" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Score</label>
                    <input type="number" value={formData.score} onChange={(e) => setFormData(p => ({...p, score: Number(e.target.value)}))} className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Total</label>
                    <input type="number" value={formData.totalScore} onChange={(e) => setFormData(p => ({...p, totalScore: Number(e.target.value)}))} className="w-full border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none bg-slate-50" />
                  </div>
                </div>
                
                <div className="relative">
                  <input 
                    type="file" 
                    id="file-upload"
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden"
                  />
                  <label 
                    htmlFor="file-upload"
                    className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all ${formData.fileUrl ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-indigo-500 hover:bg-slate-50'}`}
                  >
                    {formData.fileUrl ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-emerald-500 text-white rounded-full">
                          <Check size={24} />
                        </div>
                        <span className="font-bold text-emerald-700 text-sm">Image Selected Successfully</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="text-slate-400" />
                        <span className="font-bold text-slate-500 text-sm">Click to upload scanned paper</span>
                      </div>
                    )}
                  </label>
                </div>

                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all mt-4 active:scale-95">Save to Portfolio</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};
