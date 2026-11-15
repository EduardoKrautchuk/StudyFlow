export type ActivityType = 'exam' | 'assignment' | 'task';

export type ActivityPriority = 'low' | 'medium' | 'high';

export type ActivityStatus = 'pending' | 'completed';

export type Subject = {
  id: string;
  name: string;
  color: string;
  createdAt: Date | null;
};

export type StudyActivity = {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  type: ActivityType;
  priority: ActivityPriority;
  status: ActivityStatus;
  dueDate: string;
  dueTime: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};
