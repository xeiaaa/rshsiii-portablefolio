
export enum UserRole {
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN'
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  IDENTIFICATION = 'IDENTIFICATION',
  FILL_BLANK = 'FILL_BLANK'
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: string[]; // For Multiple Choice
  correctAnswer: string;
  explanation: string;
}

export interface Test {
  id: string;
  workId: string; // Reference to the original work
  studentId: string;
  subject: string;
  name: string;
  questions: Question[];
  createdAt: string;
  lastScore?: number;
}

export interface GradedWork {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  quarter: number;
  workName: string;
  date: string;
  score: number | null;
  totalScore: number;
  fileUrl: string;
  isPassing: boolean;
  aiFeedback?: string;
}

export interface UserAccount {
  id: string;
  role: UserRole;
  name: string;
  linkedStudentId?: string; // For parents
  assignedTeacherId?: string; // For sections if needed
}

export interface Student {
  id: string;
  name: string;
  sectionId: string;
  parentId: string;
}

export interface Section {
  id: string;
  name: string;
  teacherId?: string; // Main teacher for the section
}

export interface AppState {
  currentUser: UserAccount | null;
  works: GradedWork[];
  tests: Test[];
  sections: Section[];
  accounts: UserAccount[];
  subjects: string[];
}
