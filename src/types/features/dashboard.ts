export interface Attachment {
  name: string;
  url: string;
}

export interface Submission {
  _id: string;
  studentId?: string;
  submittedAt: string;
  isLate?: boolean;
  grade?: number;
  feedback?: string;
  attachments?: Attachment[];
}

export interface Teacher {
  _id: string;
  name?: string;
  username?: string;
}

export interface AssignmentItem {
  _id: string;
  title: string;
  description?: string;
  instructions?: string;
  dueDate: string;
  createdAt?: string;
  maxMarks: number;
  submissions: Submission[];
  courseName: string;
  departmentName: string;
  teacherId?: Teacher;
  submissionFormat?: string;
  attachments?: Attachment[];
  allowLateSubmission?: boolean;
  status: 'Pending' | 'Overdue' | 'Submitted';
  grade?: number;
}

export interface ScheduleItem {
  _id: string;
  course: string;
  courseCode?: string;
  startTime: string;
  endTime: string;
  location: string;
  instructor: string;
  credits?: number;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
}
