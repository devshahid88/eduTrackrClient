import { Assignment, Submission, AssignmentStatus, SubmissionStatus } from '../types/features/assignment-management';
// Calculate time remaining for assignment
export const calculateTimeRemaining = (dueDate: string) => {
  const due = new Date(dueDate);
  const now = new Date();
  const timeRemaining = due.getTime() - now.getTime();
  
  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  
  return {
    totalMs: timeRemaining,
    days,
    hours,
    minutes,
    isOverdue: timeRemaining < 0,
    isDueSoon: timeRemaining > 0 && timeRemaining <= 3 * 24 * 60 * 60 * 1000, // 3 days
    isDueToday: days === 0 && timeRemaining > 0
  };
};

// Get assignment status based on due date and submissions
export const getAssignmentStatus = (assignment: Assignment): {
  status: 'submitted' | 'overdue' | 'due-soon' | 'pending';
  variant: 'success' | 'danger' | 'warning' | 'info';
  text: string;
} => {
  const hasSubmissions = assignment.submissions && assignment.submissions.length > 0;
  const timeInfo = calculateTimeRemaining(assignment.dueDate);
  
  if (hasSubmissions) {
    return {
      status: 'submitted',
      variant: 'success',
      text: 'Submitted'
    };
  }
  
  if (timeInfo.isOverdue) {
    return {
      status: 'overdue',
      variant: 'danger',
      text: 'Overdue'
    };
  }
  
  if (timeInfo.isDueSoon) {
    return {
      status: 'due-soon',
      variant: 'warning',
      text: 'Due Soon'
    };
  }
  
  return {
    status: 'pending',
    variant: 'info',
    text: 'Pending'
  };
};

// Format time remaining text
export const formatTimeRemaining = (assignment: Assignment): string => {
  const hasSubmissions = assignment.submissions && assignment.submissions.length > 0;
  
  if (hasSubmissions && assignment.submissions![0]) {
    const submittedDate = new Date(assignment.submissions?.[0]?.submittedAt ?? '');
    return `Submitted on ${submittedDate.toLocaleDateString()}`;
  }
  
  const timeInfo = calculateTimeRemaining(assignment.dueDate);
  
  if (timeInfo.isOverdue) {
    const overdueDays = Math.abs(timeInfo.days);
    return `Overdue by ${overdueDays} day${overdueDays !== 1 ? 's' : ''}`;
  }
  
  if (timeInfo.days > 0) {
    return `${timeInfo.days} day${timeInfo.days !== 1 ? 's' : ''} left`;
  }
  
  if (timeInfo.hours > 0) {
    return `${timeInfo.hours} hour${timeInfo.hours !== 1 ? 's' : ''} left`;
  }
  
  return 'Due today';
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get teacher display name
export const getTeacherDisplayName = (teacher?: string | { name?: string; username?: string; firstname?: string; lastname?: string }): string => {
  if (!teacher) return 'Unknown Teacher';
  
  if (typeof teacher === 'string') return teacher;
  
  if (teacher.firstname && teacher.lastname) {
    return `${teacher.firstname} ${teacher.lastname}`;
  }
  
  return teacher.name || teacher.username || 'Unknown Teacher';
};

// Check if assignment allows submission
export const canSubmitAssignment = (assignment: Assignment): boolean => {
  const hasSubmissions = assignment.submissions && assignment.submissions.length > 0;
  if (hasSubmissions) return false;

  const timeInfo = calculateTimeRemaining(assignment.dueDate);

  // Can submit if not overdue, or if overdue but late submission is allowed
  return !timeInfo.isOverdue || !!assignment.allowLateSubmission;
};


// Get submission button text and variant
export const getSubmissionButtonConfig = (assignment: Assignment): {
  text: string;
  variant: 'primary' | 'danger' | 'success';
  disabled: boolean;
} => {
  const hasSubmissions = assignment.submissions && assignment.submissions.length > 0;
  const timeInfo = calculateTimeRemaining(assignment.dueDate);
  
  if (hasSubmissions) {
    return {
      text: 'View Submission',
      variant: 'success',
      disabled: false
    };
  }
  
  if (timeInfo.isOverdue) {
    if (assignment.allowLateSubmission) {
      return {
        text: 'Submit Late',
        variant: 'danger',
        disabled: false
      };
    } else {
      return {
        text: 'Submission Closed',
        variant: 'danger',
        disabled: true
      };
    }
  }
  
  return {
    text: 'Submit Assignment',
    variant: 'primary',
    disabled: false
  };
};
