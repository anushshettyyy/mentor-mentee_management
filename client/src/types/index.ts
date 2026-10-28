export type Role = 'STUDENT' | 'MENTOR' | 'HOD' | 'ADMIN';

export type ProfileStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED_ENDORSED';

export type AssignmentStatus = 'ACTIVE' | 'INACTIVE' | 'REASSIGNED';

export type SessionType =
  | 'ONE_ON_ONE'
  | 'ACADEMIC_REVIEW'
  | 'CAREER_COUNSELING'
  | 'SUPPORT_WELLBEING'
  | 'CRISIS_FOLLOWUP'
  | 'CASUAL_CHECKIN';

export type SessionStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type RecommendationCategory =
  | 'ACADEMIC_IMPROVEMENT'
  | 'CAREER_GUIDANCE'
  | 'TECHNICAL_SKILLS'
  | 'COMMUNICATION'
  | 'SOFT_SKILLS'
  | 'WELLBEING_SUPPORT'
  | 'EXTRACURRICULAR_ACTIVITIES'
  | 'PROJECTS'
  | 'INTERNSHIPS'
  | 'CERTIFICATIONS'
  | 'PERSONAL_DEVELOPMENT';

export type RecommendationStatus =
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'SUBMITTED_FOR_ENDORSEMENT'
  | 'ENDORSED'
  | 'REJECTED'
  | 'COMPLETED';

export type ActionItemStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';

export type EndorsementStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';

export type EndorsementItemType = 'RECOMMENDATION' | 'PROFILE_APPROVAL' | 'MENTORING_PLAN';

export type LearningStyle = 'VISUAL' | 'AUDITORY' | 'KINESTHETIC' | 'READING_WRITING';

export interface User {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  department?: { id: string; name: string; code: string } | null;
  studentProfile?: StudentProfile | null;
  facultyProfile?: FacultyProfile | null;
}

export interface StudentProfile {
  id: string;
  userId: string;
  usn: string;
  course: string;
  department: string;
  departmentId?: string | null;
  semester: number;
  academicYear: string;
  dateOfBirth?: string | null;
  address?: string | null;
  phone?: string | null;
  profilePhoto?: string | null;
  hobbies: string[];
  interests: string[];
  skills: string[];
  strengths: string[];
  areasToImprove: string[];
  careerGoals?: string | null;
  shortTermGoals?: string | null;
  longTermGoals?: string | null;
  achievements?: any;
  certifications?: any;
  extracurricularActivities?: string | null;
  languages: string[];
  preferredLearningStyle: LearningStyle;
  academicInterests?: string | null;
  supportRequested?: string | null;
  completionPercentage: number;
  status: ProfileStatus;
  reviewNotes?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
  mentorAssignments?: MentorAssignment[];
  academicRecords?: AcademicRecord[];
}

export interface FacultyProfile {
  id: string;
  userId: string;
  employeeId: string;
  department: string;
  departmentId?: string | null;
  designation: string;
  qualifications: string;
  specialization?: string | null;
  cabinLocation?: string | null;
  officeHours?: string | null;
  maxMentees: number;
  user?: User;
}

export interface MentorAssignment {
  id: string;
  studentProfileId: string;
  facultyProfileId: string;
  status: AssignmentStatus;
  assignedAt: string;
  endedAt?: string | null;
  notes?: string | null;
  studentProfile?: StudentProfile;
  facultyProfile?: FacultyProfile;
}

export interface AcademicRecord {
  id: string;
  studentProfileId: string;
  semester: number;
  sgpa: number;
  cgpa: number;
  backlogsCount: number;
  subjects?: Array<{ code: string; name: string; grade: string; credits: number }>;
}

export interface MentoringSession {
  id: string;
  studentProfileId: string;
  facultyProfileId: string;
  mentorAssignmentId?: string | null;
  sessionDate: string;
  type: SessionType;
  discussionSummary: string;
  privateFacultyNotes?: string | null; // Stripped for students!
  agreedActionItemsSummary?: string | null;
  nextFollowUpDate?: string | null;
  status: SessionStatus;
  studentProfile?: StudentProfile;
  facultyProfile?: FacultyProfile;
  actionItems?: ActionItem[];
}

export interface Recommendation {
  id: string;
  studentProfileId: string;
  facultyProfileId: string;
  title: string;
  category: RecommendationCategory;
  explanation: string;
  priority: Priority;
  targetDate?: string | null;
  resources?: string | null;
  successCriteria?: string | null;
  status: RecommendationStatus;
  followUpNotes?: string | null;
  hodEndorsementRequested: boolean;
  createdAt: string;
  updatedAt: string;
  studentProfile?: StudentProfile;
  facultyProfile?: FacultyProfile;
  endorsements?: Endorsement[];
  actionItems?: ActionItem[];
}

export interface ActionItem {
  id: string;
  studentProfileId: string;
  facultyProfileId: string;
  sessionId?: string | null;
  recommendationId?: string | null;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority: Priority;
  status: ActionItemStatus;
  studentNotes?: string | null;
  mentorFeedback?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  recommendation?: { id: string; title: string; category: RecommendationCategory } | null;
}

export interface Endorsement {
  id: string;
  itemType: EndorsementItemType;
  itemId: string;
  recommendationId?: string | null;
  studentProfileId?: string | null;
  requestedByMentorId: string;
  reviewedByHodId?: string | null;
  status: EndorsementStatus;
  decisionNotes?: string | null;
  originalContentSnapshot: any;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  recommendation?: Recommendation | null;
  studentProfile?: StudentProfile | null;
  requestedByMentor?: FacultyProfile;
  reviewedByHod?: FacultyProfile | null;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ACTION_REQUIRED';
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId?: string | null;
  actorRole?: Role | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  changeSummary?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  actor?: { firstName: string; lastName: string; email: string; role: Role } | null;
}
