
import { UserRole, UserAccount, Section, GradedWork } from './types';

export const PASSING_PERCENTAGE = 75;

export const INITIAL_ACCOUNTS: UserAccount[] = [
  { id: 'admin-1', role: UserRole.ADMIN, name: 'Main Administrator' },
  { id: 'tea-1', role: UserRole.TEACHER, name: 'Prof. Anderson' },
  { id: 'stu-1', role: UserRole.STUDENT, name: 'Francesca Fontillas' },
  { id: 'stu-2', role: UserRole.STUDENT, name: 'Jane Smith' },
  { id: 'par-1', role: UserRole.PARENT, name: 'Mr. Fontillas', linkedStudentId: 'stu-1' },
];

export const INITIAL_SECTIONS: Section[] = [
  { id: 'sec-1', name: 'Grade 10 - Newton', teacherId: 'tea-1' },
  { id: 'sec-2', name: 'Grade 10 - Einstein', teacherId: 'tea-1' },
];

export const INITIAL_SUBJECTS: string[] = [
  'Mathematics',
  'Science',
  'English',
  'History',
  'Filipino',
  'Physical Education'
];

export const INITIAL_WORKS: GradedWork[] = [];
