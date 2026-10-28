import { PrismaClient, Role, ProfileStatus, AssignmentStatus, SessionType, SessionStatus, Priority, RecommendationCategory, RecommendationStatus, ActionItemStatus, EndorsementStatus, EndorsementItemType, LearningStyle } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed...');

  // Clean existing records in referential order
  await prisma.notification.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.endorsement.deleteMany({});
  await prisma.actionItem.deleteMany({});
  await prisma.recommendation.deleteMany({});
  await prisma.mentoringSession.deleteMany({});
  await prisma.academicRecord.deleteMany({});
  await prisma.mentorAssignment.deleteMany({});
  await prisma.studentProfile.deleteMany({});
  await prisma.facultyProfile.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.department.deleteMany({});

  const defaultPasswordHash = await bcrypt.hash('Password@123', 10);

  // 1. Departments
  const deptCSE = await prisma.department.create({
    data: {
      name: 'Computer Science & Engineering',
      code: 'CSE',
    },
  });

  const deptISE = await prisma.department.create({
    data: {
      name: 'Information Science & Engineering',
      code: 'ISE',
    },
  });

  const deptECE = await prisma.department.create({
    data: {
      name: 'Electronics & Communication Engineering',
      code: 'ECE',
    },
  });

  console.log('✅ Departments created');

  // 2. Users & Profiles

  // Admin / HOD of CSE
  const hodUser = await prisma.user.create({
    data: {
      email: 'hod.cse@college.edu',
      passwordHash: defaultPasswordHash,
      role: Role.HOD,
      firstName: 'Dr. Ramesh',
      lastName: 'Rao',
      phone: '+91 98450 11223',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      departmentId: deptCSE.id,
    },
  });

  const hodFacultyProfile = await prisma.facultyProfile.create({
    data: {
      userId: hodUser.id,
      employeeId: 'FAC-CSE-001',
      department: 'Computer Science & Engineering',
      departmentId: deptCSE.id,
      designation: 'Professor & Head of Department',
      qualifications: 'Ph.D. (IIT Bombay), M.Tech',
      specialization: 'Distributed Systems & Cloud Computing',
      cabinLocation: 'CSE Block, Level 3, Room 301',
      officeHours: 'Mon-Fri 3:00 PM - 5:00 PM',
      maxMentees: 5,
    },
  });

  // System Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@college.edu',
      passwordHash: defaultPasswordHash,
      role: Role.ADMIN,
      firstName: 'Suresh',
      lastName: 'Patel',
      phone: '+91 98450 99887',
      departmentId: deptCSE.id,
    },
  });

  // Mentors / Faculty in CSE
  const mentor1User = await prisma.user.create({
    data: {
      email: 'sneha.sharma@college.edu',
      passwordHash: defaultPasswordHash,
      role: Role.MENTOR,
      firstName: 'Dr. Sneha',
      lastName: 'Sharma',
      phone: '+91 98860 33445',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      departmentId: deptCSE.id,
    },
  });

  const mentor1Profile = await prisma.facultyProfile.create({
    data: {
      userId: mentor1User.id,
      employeeId: 'FAC-CSE-014',
      department: 'Computer Science & Engineering',
      departmentId: deptCSE.id,
      designation: 'Associate Professor',
      qualifications: 'Ph.D., M.Tech (IISc Bangalore)',
      specialization: 'Artificial Intelligence & Machine Learning',
      cabinLocation: 'CSE Block, Level 2, Room 214',
      officeHours: 'Tue & Thu 2:00 PM - 4:00 PM',
      maxMentees: 20,
    },
  });

  const mentor2User = await prisma.user.create({
    data: {
      email: 'vikram.verma@college.edu',
      passwordHash: defaultPasswordHash,
      role: Role.MENTOR,
      firstName: 'Prof. Vikram',
      lastName: 'Verma',
      phone: '+91 97420 55667',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      departmentId: deptCSE.id,
    },
  });

  const mentor2Profile = await prisma.facultyProfile.create({
    data: {
      userId: mentor2User.id,
      employeeId: 'FAC-CSE-028',
      department: 'Computer Science & Engineering',
      departmentId: deptCSE.id,
      designation: 'Assistant Professor',
      qualifications: 'M.Tech, B.E.',
      specialization: 'Full Stack Engineering & Cyber Security',
      cabinLocation: 'CSE Block, Level 1, Room 108',
      officeHours: 'Wed & Fri 11:00 AM - 1:00 PM',
      maxMentees: 20,
    },
  });

  // Students in CSE
  // Student 1: Rahul Kumar (Senior, Active, 95% complete)
  const student1User = await prisma.user.create({
    data: {
      email: 'rahul.kumar@student.edu',
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      firstName: 'Rahul',
      lastName: 'Kumar',
      phone: '+91 91234 56789',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      departmentId: deptCSE.id,
    },
  });

  const student1Profile = await prisma.studentProfile.create({
    data: {
      userId: student1User.id,
      usn: '1MS22CS101',
      course: 'B.Tech Computer Science',
      department: 'Computer Science & Engineering',
      departmentId: deptCSE.id,
      semester: 6,
      academicYear: '2025-2026',
      dateOfBirth: new Date('2003-05-14'),
      address: '#42, 4th Cross, Indiranagar, Bengaluru, KA 560038',
      phone: '+91 91234 56789',
      profilePhoto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      hobbies: ['Competitive Programming', 'Speedcubing', 'Badminton'],
      interests: ['Cloud Architecture', 'Distributed Systems', 'Open Source'],
      skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'Go'],
      strengths: ['Analytical Thinking', 'System Design Basics', 'Quick Learner'],
      areasToImprove: ['Public Speaking', 'DSA Graph Algorithms', 'Time Management'],
      careerGoals: 'Lead Cloud Solutions Architect at a top-tier tech innovator within 5 years.',
      shortTermGoals: 'Secure a Summer 2026 SDE Internship and clear AWS Solutions Architect Associate.',
      longTermGoals: 'Found a developer tooling startup focusing on observability and cost efficiency.',
      achievements: [
        { title: '1st Place Smart India Hackathon Internal', year: '2024' },
        { title: 'Dean’s Honor List 4 Consecutive Semesters', year: '2023-2025' }
      ],
      certifications: [
        { title: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', year: '2024' },
        { title: 'Meta Front-End Developer Professional', issuer: 'Coursera', year: '2023' }
      ],
      extracurricularActivities: 'Core Member of College Coding Club (CodeX), Volunteered at TechKriti Annual Fest.',
      languages: ['English', 'Kannada', 'Hindi'],
      preferredLearningStyle: LearningStyle.KINESTHETIC,
      academicInterests: 'High Performance Computing, Microservices, Kubernetes orchestration',
      supportRequested: 'Guidance on top-tier product company interview patterns and mock interviews.',
      completionPercentage: 95,
      status: ProfileStatus.APPROVED_ENDORSED,
      reviewNotes: 'Exceptional profile with clear roadmap and strong academic rigor. Endorsed.',
      submittedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000),
      reviewedAt: new Date(Date.now() - 25 * 24 * 3600 * 1000),
    },
  });

  // Student 2: Ananya Sen (Under Review)
  const student2User = await prisma.user.create({
    data: {
      email: 'ananya.sen@student.edu',
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      firstName: 'Ananya',
      lastName: 'Sen',
      phone: '+91 92345 67890',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      departmentId: deptCSE.id,
    },
  });

  const student2Profile = await prisma.studentProfile.create({
    data: {
      userId: student2User.id,
      usn: '1MS22CS045',
      course: 'B.Tech Computer Science',
      department: 'Computer Science & Engineering',
      departmentId: deptCSE.id,
      semester: 6,
      academicYear: '2025-2026',
      dateOfBirth: new Date('2003-09-22'),
      address: '#18, Palm Meadows, Whitefield, Bengaluru',
      phone: '+91 92345 67890',
      profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      hobbies: ['Digital Art', 'Violin', 'Reading Sci-Fi'],
      interests: ['Natural Language Processing', 'Generative AI', 'Bioinformatics'],
      skills: ['Python', 'PyTorch', 'TensorFlow', 'FastAPI', 'Data Analytics'],
      strengths: ['Mathematical foundations', 'Research acumen', 'Curiosity'],
      areasToImprove: ['Backend deployment', 'Frontend interfaces', 'Networking fundamentals'],
      careerGoals: 'Machine Learning Research Engineer at an AI lab or PhD at an esteemed university.',
      shortTermGoals: 'Publish a workshop research paper on LLM fine-tuning efficiency.',
      longTermGoals: 'Spearhead AI for healthcare diagnostics research.',
      achievements: [
        { title: 'Best Undergraduate Research Poster Award', year: '2024' }
      ],
      certifications: [
        { title: 'Deep Learning Specialization', issuer: 'DeepLearning.AI', year: '2024' }
      ],
      extracurricularActivities: 'Student Member IEEE Computer Society, AI Reading Group Organizer.',
      languages: ['English', 'Bengali', 'Hindi'],
      preferredLearningStyle: LearningStyle.VISUAL,
      academicInterests: 'Transformer architectures, Multimodal models, Ethical AI',
      supportRequested: 'Connecting with faculty doing active NLP research for co-advising.',
      completionPercentage: 85,
      status: ProfileStatus.SUBMITTED,
      reviewNotes: null,
      submittedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
    },
  });

  // Student 3: Karthik Reddy (Draft stage)
  const student3User = await prisma.user.create({
    data: {
      email: 'karthik.reddy@student.edu',
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      firstName: 'Karthik',
      lastName: 'Reddy',
      phone: '+91 93456 78901',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      departmentId: deptCSE.id,
    },
  });

  const student3Profile = await prisma.studentProfile.create({
    data: {
      userId: student3User.id,
      usn: '1MS23CS078',
      course: 'B.Tech Computer Science',
      department: 'Computer Science & Engineering',
      departmentId: deptCSE.id,
      semester: 4,
      academicYear: '2025-2026',
      phone: '+91 93456 78901',
      hobbies: ['Cricket', 'Robotics'],
      interests: ['Embedded Systems', 'IoT', 'C++ Programming'],
      skills: ['C++', 'Python', 'Arduino'],
      strengths: ['Hardware-Software integration', 'Teamwork'],
      areasToImprove: ['Data Structures in C++', 'Object Oriented Design'],
      careerGoals: 'Firmware & Embedded Software Engineer at an EV or Robotics firm.',
      shortTermGoals: 'Build an autonomous obstacle-avoiding bot for inter-college competition.',
      longTermGoals: 'Lead embedded systems architecture in automotive electronics.',
      completionPercentage: 55,
      status: ProfileStatus.DRAFT,
      preferredLearningStyle: LearningStyle.AUDITORY,
      supportRequested: 'Need guidance to balance hardware project hours with academic coursework.',
    },
  });

  // Student 4: Pooja Hegde (Changes Requested)
  const student4User = await prisma.user.create({
    data: {
      email: 'pooja.hegde@student.edu',
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      firstName: 'Pooja',
      lastName: 'Hegde',
      phone: '+91 94567 89012',
      departmentId: deptCSE.id,
    },
  });

  const student4Profile = await prisma.studentProfile.create({
    data: {
      userId: student4User.id,
      usn: '1MS23CS112',
      course: 'B.Tech Computer Science',
      department: 'Computer Science & Engineering',
      departmentId: deptCSE.id,
      semester: 4,
      academicYear: '2025-2026',
      hobbies: ['Photography', 'Blogging'],
      interests: ['Cybersecurity', 'Network Forensics'],
      skills: ['Linux', 'Wireshark', 'Bash'],
      strengths: ['Security auditing curiosity', 'Persistence'],
      areasToImprove: ['Cryptography mathematical fundamentals', 'Python scripting'],
      careerGoals: 'Information Security Analyst at a Cyber Defense Operations Center.',
      shortTermGoals: 'Complete CompTIA Security+ prep and participate in university CTF.',
      completionPercentage: 70,
      status: ProfileStatus.CHANGES_REQUESTED,
      reviewNotes: 'Please expand your specific certifications target and detail your academic improvement plan for Semester 3 math course.',
      submittedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000),
      reviewedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
      preferredLearningStyle: LearningStyle.READING_WRITING,
    },
  });

  // Student 5: Deepa Bhat (Unassigned student for HOD assignment demonstration)
  const student5User = await prisma.user.create({
    data: {
      email: 'deepa.bhat@student.edu',
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      firstName: 'Deepa',
      lastName: 'Bhat',
      phone: '+91 95678 90123',
      departmentId: deptCSE.id,
    },
  });

  const student5Profile = await prisma.studentProfile.create({
    data: {
      userId: student5User.id,
      usn: '1MS24CS030',
      course: 'B.Tech Computer Science',
      department: 'Computer Science & Engineering',
      departmentId: deptCSE.id,
      semester: 2,
      academicYear: '2025-2026',
      hobbies: ['Debating', 'Chess'],
      interests: ['Web Technologies', 'UI/UX'],
      skills: ['HTML', 'CSS', 'JavaScript Basics'],
      strengths: ['Communication', 'Dedication'],
      areasToImprove: ['Data Structures & C programming'],
      completionPercentage: 40,
      status: ProfileStatus.DRAFT,
      preferredLearningStyle: LearningStyle.VISUAL,
    },
  });

  console.log('✅ Users and Profiles created');

  // 3. Mentor Assignments
  const assign1 = await prisma.mentorAssignment.create({
    data: {
      studentProfileId: student1Profile.id,
      facultyProfileId: mentor1Profile.id,
      departmentId: deptCSE.id,
      status: AssignmentStatus.ACTIVE,
      assignedById: hodUser.id,
      notes: 'Assigned based on interest in high-performance cloud and distributed systems.',
    },
  });

  const assign2 = await prisma.mentorAssignment.create({
    data: {
      studentProfileId: student2Profile.id,
      facultyProfileId: mentor1Profile.id,
      departmentId: deptCSE.id,
      status: AssignmentStatus.ACTIVE,
      assignedById: hodUser.id,
      notes: 'Strong alignment with Dr. Sneha’s AI/ML research expertise.',
    },
  });

  const assign3 = await prisma.mentorAssignment.create({
    data: {
      studentProfileId: student3Profile.id,
      facultyProfileId: mentor2Profile.id,
      departmentId: deptCSE.id,
      status: AssignmentStatus.ACTIVE,
      assignedById: hodUser.id,
      notes: 'Alignment with Prof. Vikram’s systems & hardware lab.',
    },
  });

  const assign4 = await prisma.mentorAssignment.create({
    data: {
      studentProfileId: student4Profile.id,
      facultyProfileId: mentor2Profile.id,
      departmentId: deptCSE.id,
      status: AssignmentStatus.ACTIVE,
      assignedById: hodUser.id,
      notes: 'Assigned for security track and system administration mentorship.',
    },
  });

  console.log('✅ Mentor Assignments created');

  // 4. Academic Records
  await prisma.academicRecord.createMany({
    data: [
      {
        studentProfileId: student1Profile.id,
        semester: 1,
        sgpa: 9.1,
        cgpa: 9.1,
        backlogsCount: 0,
        subjects: [
          { code: '22MAT11', name: 'Mathematics I', grade: 'S', credits: 4 },
          { code: '22PHY12', name: 'Physics for Engineers', grade: 'A', credits: 4 },
          { code: '22CSE13', name: 'Problem Solving in C', grade: 'S', credits: 3 },
        ],
      },
      {
        studentProfileId: student1Profile.id,
        semester: 2,
        sgpa: 9.3,
        cgpa: 9.2,
        backlogsCount: 0,
        subjects: [
          { code: '22MAT21', name: 'Mathematics II', grade: 'S', credits: 4 },
          { code: '22CHE22', name: 'Chemistry', grade: 'A', credits: 4 },
          { code: '22CSE23', name: 'Data Structures with C', grade: 'S', credits: 4 },
        ],
      },
      {
        studentProfileId: student1Profile.id,
        semester: 3,
        sgpa: 9.0,
        cgpa: 9.13,
        backlogsCount: 0,
        subjects: [
          { code: '22CSE31', name: 'Design & Analysis of Algorithms', grade: 'S', credits: 4 },
          { code: '22CSE32', name: 'Digital Logic & Computer Design', grade: 'A', credits: 3 },
          { code: '22CSE33', name: 'Discrete Mathematics', grade: 'A', credits: 3 },
        ],
      },
      {
        studentProfileId: student1Profile.id,
        semester: 4,
        sgpa: 9.4,
        cgpa: 9.2,
        backlogsCount: 0,
        subjects: [
          { code: '22CSE41', name: 'Operating Systems', grade: 'S', credits: 4 },
          { code: '22CSE42', name: 'Database Management Systems', grade: 'S', credits: 4 },
          { code: '22CSE43', name: 'Computer Networks', grade: 'A', credits: 4 },
        ],
      },
      {
        studentProfileId: student1Profile.id,
        semester: 5,
        sgpa: 9.5,
        cgpa: 9.26,
        backlogsCount: 0,
        subjects: [
          { code: '22CSE51', name: 'Cloud Computing & Virtualization', grade: 'S', credits: 4 },
          { code: '22CSE52', name: 'Software Engineering & Agile', grade: 'S', credits: 3 },
          { code: '22CSE53', name: 'Compiler Design', grade: 'A', credits: 4 },
        ],
      },
      {
        studentProfileId: student2Profile.id,
        semester: 4,
        sgpa: 8.9,
        cgpa: 8.85,
        backlogsCount: 0,
        subjects: [
          { code: '22CSE41', name: 'Operating Systems', grade: 'A', credits: 4 },
          { code: '22CSE42', name: 'Database Management Systems', grade: 'S', credits: 4 },
        ],
      },
      {
        studentProfileId: student2Profile.id,
        semester: 5,
        sgpa: 9.2,
        cgpa: 8.92,
        backlogsCount: 0,
        subjects: [
          { code: '22CSE51', name: 'Artificial Intelligence Foundations', grade: 'S', credits: 4 },
          { code: '22CSE52', name: 'Linear Algebra for Machine Learning', grade: 'S', credits: 4 },
        ],
      },
    ],
  });

  console.log('✅ Academic Records created');

  // 5. Mentoring Sessions
  const session1 = await prisma.mentoringSession.create({
    data: {
      studentProfileId: student1Profile.id,
      facultyProfileId: mentor1Profile.id,
      mentorAssignmentId: assign1.id,
      sessionDate: new Date(Date.now() - 14 * 24 * 3600 * 1000),
      type: SessionType.ACADEMIC_REVIEW,
      discussionSummary: 'Reviewed 5th semester SGPA (9.5) and discussed capstone project ideation. Rahul wants to build an automated microservices deployment testing pipeline.',
      privateFacultyNotes: 'Student shows exceptional technical maturity. Mentally focused, well-disciplined. Keep encouraging him to mentor junior students in CodeX club.',
      agreedActionItemsSummary: 'Prepare 2-page project proposal and select team members for Capstone.',
      nextFollowUpDate: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      status: SessionStatus.COMPLETED,
    },
  });

  const session2 = await prisma.mentoringSession.create({
    data: {
      studentProfileId: student1Profile.id,
      facultyProfileId: mentor1Profile.id,
      mentorAssignmentId: assign1.id,
      sessionDate: new Date(Date.now() - 40 * 24 * 3600 * 1000),
      type: SessionType.CAREER_COUNSELING,
      discussionSummary: 'Detailed roadmap for campus placements and off-campus internships. Discussed portfolio enhancements and LinkedIn presence.',
      privateFacultyNotes: 'Student occasionally feels imposter syndrome regarding LeetCode competitive speed. Reassured him on deep design strengths.',
      agreedActionItemsSummary: 'Complete 50 curated LeetCode Mediums on Graphs and DP by month end.',
      nextFollowUpDate: new Date(Date.now() - 14 * 24 * 3600 * 1000),
      status: SessionStatus.COMPLETED,
    },
  });

  const session3 = await prisma.mentoringSession.create({
    data: {
      studentProfileId: student2Profile.id,
      facultyProfileId: mentor1Profile.id,
      mentorAssignmentId: assign2.id,
      sessionDate: new Date(Date.now() - 7 * 24 * 3600 * 1000),
      type: SessionType.ACADEMIC_REVIEW,
      discussionSummary: 'Explored research venues for the LLM fine-tuning paper. Discussed ethics approval and dataset curation standards.',
      privateFacultyNotes: 'Ananya is enthusiastic about academic publishing. Needs slight guidance on managing conference deadlines alongside semester mid-terms.',
      agreedActionItemsSummary: 'Draft abstract and methodology section for peer review by next Monday.',
      nextFollowUpDate: new Date(Date.now() + 10 * 24 * 3600 * 1000),
      status: SessionStatus.COMPLETED,
    },
  });

  console.log('✅ Mentoring Sessions created');

  // 6. Recommendations
  const rec1 = await prisma.recommendation.create({
    data: {
      studentProfileId: student1Profile.id,
      facultyProfileId: mentor1Profile.id,
      title: 'AWS Certified Solutions Architect – Associate Certification',
      category: RecommendationCategory.CERTIFICATIONS,
      explanation: 'Will substantiate Rahul’s cloud architecture competencies with an industry-recognized credential prior to 7th semester placement drives.',
      priority: Priority.HIGH,
      targetDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      resources: 'AWS Skill Builder, Stephane Maarek Udemy Course, Tutorials Dojo Practice Exams',
      successCriteria: 'Scoring 820+ on official exam and deploying multi-region VPC terraform demo.',
      status: RecommendationStatus.ENDORSED,
      followUpNotes: 'Enrolled in course; completed Modules 1-6 with 90% score on internal quizzes.',
      hodEndorsementRequested: true,
    },
  });

  const rec2 = await prisma.recommendation.create({
    data: {
      studentProfileId: student1Profile.id,
      facultyProfileId: mentor1Profile.id,
      title: 'Technical Presentation & Public Speaking Practice',
      category: RecommendationCategory.COMMUNICATION,
      explanation: 'To complement Rahul’s strong coding capability with executive presentation presence in tech symposiums.',
      priority: Priority.MEDIUM,
      targetDate: new Date(Date.now() + 45 * 24 * 3600 * 1000),
      resources: 'Toastmasters College Chapter, TEDx Campus Talks Archive',
      successCriteria: 'Presenting a 20-minute tech talk on Kubernetes in the department open seminar.',
      status: RecommendationStatus.IN_PROGRESS,
      followUpNotes: 'Agreed to deliver first session at CodeX workshop next Friday.',
      hodEndorsementRequested: false,
    },
  });

  const rec3 = await prisma.recommendation.create({
    data: {
      studentProfileId: student2Profile.id,
      facultyProfileId: mentor1Profile.id,
      title: 'Undergraduate Research Mentorship & Travel Grant Submission',
      category: RecommendationCategory.PROJECTS,
      explanation: 'Support Ananya’s LLM dataset paper submission to IEEE International Conference on Cognitive Computing and request department travel grant endorsement.',
      priority: Priority.HIGH,
      targetDate: new Date(Date.now() + 20 * 24 * 3600 * 1000),
      resources: 'Overleaf template, Department Research Lab GPUs, IEEE Author Guidelines',
      successCriteria: 'Camera-ready paper draft with mentor co-authorship and formal HOD endorsement for conference funding.',
      status: RecommendationStatus.SUBMITTED_FOR_ENDORSEMENT,
      followUpNotes: 'Paper draft submitted to mentor on Feb 12; mentor reviewed and submitted for HOD approval.',
      hodEndorsementRequested: true,
    },
  });

  const rec4 = await prisma.recommendation.create({
    data: {
      studentProfileId: student4Profile.id,
      facultyProfileId: mentor2Profile.id,
      title: 'Remedial Problem Solving Sessions for Discrete Mathematics',
      category: RecommendationCategory.ACADEMIC_IMPROVEMENT,
      explanation: 'Strengthen proofs and graph theory foundations to boost CGPA in core CS prerequisites.',
      priority: Priority.URGENT,
      targetDate: new Date(Date.now() + 15 * 24 * 3600 * 1000),
      resources: 'Prof. Gilbert Strang Math lectures, NPTEL Discrete Mathematics course notes',
      successCriteria: 'Scoring 80%+ in internal assessment 2 and completing weekly problem sheets.',
      status: RecommendationStatus.IN_PROGRESS,
      followUpNotes: 'Attending Tuesday remedial tutorials with teaching assistants.',
      hodEndorsementRequested: false,
    },
  });

  console.log('✅ Recommendations created');

  // 7. Action Items
  await prisma.actionItem.createMany({
    data: [
      {
        studentProfileId: student1Profile.id,
        facultyProfileId: mentor1Profile.id,
        sessionId: session1.id,
        recommendationId: rec1.id,
        title: 'Complete AWS IAM & VPC Practice Labs',
        description: 'Implement a highly available VPC architecture with public/private subnets and NAT gateway.',
        dueDate: new Date(Date.now() + 5 * 24 * 3600 * 1000),
        priority: Priority.HIGH,
        status: ActionItemStatus.IN_PROGRESS,
        studentNotes: 'Configured VPC with CIDR block 10.0.0.0/16 and tested routing tables.',
        mentorFeedback: 'Good progress. Ensure security group inbound rules are strictly least-privilege.',
      },
      {
        studentProfileId: student1Profile.id,
        facultyProfileId: mentor1Profile.id,
        sessionId: session1.id,
        title: 'Finalize Capstone Team & Abstract',
        description: 'Submit 300-word synopsis of the microservices observability platform.',
        dueDate: new Date(Date.now() + 10 * 24 * 3600 * 1000),
        priority: Priority.MEDIUM,
        status: ActionItemStatus.PENDING,
      },
      {
        studentProfileId: student1Profile.id,
        facultyProfileId: mentor1Profile.id,
        sessionId: session2.id,
        title: 'Review System Design Primer (Caching & Message Queues)',
        description: 'Summarize Kafka vs RabbitMQ architectural trade-offs.',
        dueDate: new Date(Date.now() - 5 * 24 * 3600 * 1000),
        priority: Priority.MEDIUM,
        status: ActionItemStatus.COMPLETED,
        studentNotes: 'Shared Markdown summary document with Dr. Sneha.',
        mentorFeedback: 'Well structured comparison. Discussed real-time stream ingestion during meeting.',
        completedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000),
      },
      {
        studentProfileId: student2Profile.id,
        facultyProfileId: mentor1Profile.id,
        sessionId: session3.id,
        recommendationId: rec3.id,
        title: 'Complete Benchmark Inference Latency Tests',
        description: 'Benchmark LoRA vs QLoRA 4-bit quantizations on GPU cluster.',
        dueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000),
        priority: Priority.HIGH,
        status: ActionItemStatus.IN_PROGRESS,
      },
      {
        studentProfileId: student4Profile.id,
        facultyProfileId: mentor2Profile.id,
        recommendationId: rec4.id,
        title: 'Submit Discrete Mathematics Problem Set 3',
        description: 'Induction proofs and recurrence relations questions.',
        dueDate: new Date(Date.now() + 2 * 24 * 3600 * 1000),
        priority: Priority.URGENT,
        status: ActionItemStatus.PENDING,
      },
    ],
  });

  console.log('✅ Action Items created');

  // 8. Endorsements (Preserving version snapshot)
  // Endorsement 1: Endorsed by HOD for Rahul's AWS Certification sponsorship
  await prisma.endorsement.create({
    data: {
      itemType: EndorsementItemType.RECOMMENDATION,
      itemId: rec1.id,
      recommendationId: rec1.id,
      studentProfileId: student1Profile.id,
      requestedByMentorId: mentor1Profile.id,
      reviewedByHodId: hodFacultyProfile.id,
      status: EndorsementStatus.APPROVED,
      decisionNotes: 'Approved with 50% department certification fee reimbursement on successful credential completion.',
      originalContentSnapshot: {
        title: rec1.title,
        category: rec1.category,
        priority: rec1.priority,
        explanation: rec1.explanation,
        successCriteria: rec1.successCriteria,
        requestedAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
      },
      reviewedAt: new Date(Date.now() - 18 * 24 * 3600 * 1000),
    },
  });

  // Endorsement 2: Pending HOD review for Ananya's research recommendation
  await prisma.endorsement.create({
    data: {
      itemType: EndorsementItemType.RECOMMENDATION,
      itemId: rec3.id,
      recommendationId: rec3.id,
      studentProfileId: student2Profile.id,
      requestedByMentorId: mentor1Profile.id,
      status: EndorsementStatus.PENDING,
      originalContentSnapshot: {
        title: rec3.title,
        category: rec3.category,
        priority: rec3.priority,
        explanation: rec3.explanation,
        successCriteria: rec3.successCriteria,
        requestedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      },
    },
  });

  // Endorsement 3: Student 1 Profile Endorsement Record
  await prisma.endorsement.create({
    data: {
      itemType: EndorsementItemType.PROFILE_APPROVAL,
      itemId: student1Profile.id,
      studentProfileId: student1Profile.id,
      requestedByMentorId: mentor1Profile.id,
      reviewedByHodId: hodFacultyProfile.id,
      status: EndorsementStatus.APPROVED,
      decisionNotes: 'Comprehensive profile approved and verified. Student recognized for academic excellence.',
      originalContentSnapshot: {
        usn: student1Profile.usn,
        course: student1Profile.course,
        semester: student1Profile.semester,
        completionPercentage: 95,
        careerGoals: student1Profile.careerGoals,
      },
      reviewedAt: new Date(Date.now() - 25 * 24 * 3600 * 1000),
    },
  });

  console.log('✅ Endorsements created');

  // 9. Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: student1User.id,
        title: 'Recommendation Endorsed',
        message: 'Your recommendation "AWS Certified Solutions Architect" has been endorsed by HOD Dr. Ramesh Rao.',
        type: 'SUCCESS',
        link: '/mentee/recommendations',
        isRead: false,
      },
      {
        userId: student1User.id,
        title: 'Upcoming Mentoring Follow-up',
        message: 'Next mentoring session check-in scheduled for next week with Dr. Sneha Sharma.',
        type: 'INFO',
        link: '/mentee/sessions',
        isRead: true,
      },
      {
        userId: mentor1User.id,
        title: 'New Profile Submitted',
        message: 'Ananya Sen (1MS22CS045) has submitted her profile for mentor review.',
        type: 'ACTION_REQUIRED',
        link: '/mentor/mentees',
        isRead: false,
      },
      {
        userId: hodUser.id,
        title: 'Pending Endorsement Request',
        message: 'Dr. Sneha Sharma submitted a recommendation for Ananya Sen requiring HOD endorsement.',
        type: 'ACTION_REQUIRED',
        link: '/hod/approvals',
        isRead: false,
      },
      {
        userId: student4User.id,
        title: 'Profile Changes Requested',
        message: 'Prof. Vikram Verma requested changes to your profile submission.',
        type: 'WARNING',
        link: '/mentee/profile',
        isRead: false,
      },
    ],
  });

  // 10. Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        actorId: hodUser.id,
        actorRole: Role.HOD,
        action: 'ENDORSEMENT_DECISION',
        entityType: 'Endorsement',
        entityId: rec1.id,
        changeSummary: 'Approved recommendation for AWS certification with 50% funding.',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      {
        actorId: mentor1User.id,
        actorRole: Role.MENTOR,
        action: 'RECOMMENDATION_CREATE',
        entityType: 'Recommendation',
        entityId: rec3.id,
        changeSummary: 'Created research recommendation and submitted for HOD endorsement.',
        ipAddress: '192.168.1.104',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      {
        actorId: student1User.id,
        actorRole: Role.STUDENT,
        action: 'PROFILE_SUBMIT',
        entityType: 'StudentProfile',
        entityId: student1Profile.id,
        changeSummary: 'Submitted comprehensive student profile for mentor verification.',
        ipAddress: '192.168.1.145',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      {
        actorId: hodUser.id,
        actorRole: Role.HOD,
        action: 'MENTOR_ASSIGN',
        entityType: 'MentorAssignment',
        entityId: assign1.id,
        changeSummary: 'Assigned Rahul Kumar (1MS22CS101) to Dr. Sneha Sharma.',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    ],
  });

  console.log('✅ Audit logs and notifications created');
  console.log('🎉 Seed complete! Demo credentials:');
  console.log('   - HOD / Dept Admin:  hod.cse@college.edu        / Password@123');
  console.log('   - Mentor / Faculty:  sneha.sharma@college.edu    / Password@123');
  console.log('   - Mentee / Student:  rahul.kumar@student.edu     / Password@123');
  console.log('   - Mentee (Pending):  ananya.sen@student.edu      / Password@123');
}

main()
  .catch((e) => {
    console.error('❌ Error in seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
