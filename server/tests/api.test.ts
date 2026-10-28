import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Mentor-Mentee System API Tests', () => {
  let studentToken = '';
  let mentorToken = '';
  let hodToken = '';
  let studentUserId = '';
  let studentProfileId = '';
  let mentorProfileId = '';

  beforeAll(async () => {
    // 1. Authenticate as Student
    const studentRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'rahul.kumar@student.edu', password: 'Password@123' });

    expect(studentRes.status).toBe(200);
    expect(studentRes.body.token).toBeDefined();
    studentToken = studentRes.body.token;
    studentUserId = studentRes.body.user.id;
    studentProfileId = studentRes.body.user.studentProfile.id;

    // 2. Authenticate as Mentor
    const mentorRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'sneha.sharma@college.edu', password: 'Password@123' });

    expect(mentorRes.status).toBe(200);
    mentorToken = mentorRes.body.token;
    mentorProfileId = mentorRes.body.user.facultyProfile.id;

    // 3. Authenticate as HOD
    const hodRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'hod.cse@college.edu', password: 'Password@123' });

    expect(hodRes.status).toBe(200);
    hodToken = hodRes.body.token;
  });

  describe('Authentication & Authorization', () => {
    it('rejects invalid password credentials with 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'rahul.kumar@student.edu', password: 'WrongPassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('denies access to protected routes without a token', async () => {
      const res = await request(app).get('/api/profiles/student/me');
      expect(res.status).toBe(401);
    });

    it('enforces role boundaries: student cannot access HOD department overview', async () => {
      const res = await request(app)
        .get('/api/hod/overview')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });

    it('allows HOD to access department overview with live query metrics', async () => {
      const res = await request(app)
        .get('/api/hod/overview')
        .set('Authorization', `Bearer ${hodToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats.totalStudents).toBeGreaterThan(0);
      expect(res.body.stats.totalFaculty).toBeGreaterThan(0);
    });
  });

  describe('Student Profile & Privacy Boundaries', () => {
    it('allows student to fetch their own profile with dynamic completion percentage', async () => {
      const res = await request(app)
        .get('/api/profiles/student/me')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.profile.usn).toBe('1MS22CS101');
      expect(res.body.profile.completionPercentage).toBeGreaterThanOrEqual(40);
    });

    it('updates student profile draft and recalculates completion', async () => {
      const res = await request(app)
        .put('/api/profiles/student/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          hobbies: ['Competitive Programming', 'Speedcubing', 'Badminton', 'Robotics'],
          skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'Go', 'Kubernetes'],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.profile.skills).toContain('Kubernetes');
    });

    it('never exposes private faculty notes to student in session queries', async () => {
      const res = await request(app)
        .get('/api/sessions')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.sessions)).toBe(true);
      // Ensure privateFacultyNotes is NOT exposed to student
      for (const s of res.body.sessions) {
        expect(s.privateFacultyNotes).toBeUndefined();
      }
    });

    it('allows mentor to view private faculty notes for assigned sessions', async () => {
      const res = await request(app)
        .get('/api/sessions')
        .set('Authorization', `Bearer ${mentorToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.sessions)).toBe(true);
      const hasPrivateNote = res.body.sessions.some((s: any) => s.privateFacultyNotes !== undefined);
      expect(hasPrivateNote).toBe(true);
    });
  });

  describe('Recommendation & Endorsement Workflow', () => {
    let createdRecId = '';

    it('allows mentor to create a recommendation with full metadata', async () => {
      const res = await request(app)
        .post('/api/recommendations')
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({
          studentProfileId,
          title: 'Docker & Kubernetes Microservices Lab',
          category: 'TECHNICAL_SKILLS',
          explanation: 'Hands-on container orchestration project to solidify distributed systems acumen.',
          priority: 'HIGH',
          resources: 'KodeKloud CKA Labs, Kubernetes documentation',
          successCriteria: 'Deploy multi-pod stateful set with ingress controller',
          submitForEndorsement: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.recommendation.title).toBe('Docker & Kubernetes Microservices Lab');
      createdRecId = res.body.recommendation.id;
    });

    it('allows HOD to review pending endorsements and approve with decision notes', async () => {
      // Fetch pending endorsements
      const listRes = await request(app)
        .get('/api/endorsements?status=PENDING')
        .set('Authorization', `Bearer ${hodToken}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.endorsements.length).toBeGreaterThan(0);

      const targetEndorsement = listRes.body.endorsements[0];

      // HOD makes decision
      const decisionRes = await request(app)
        .post(`/api/endorsements/${targetEndorsement.id}/decision`)
        .set('Authorization', `Bearer ${hodToken}`)
        .send({
          status: 'APPROVED',
          decisionNotes: 'Approved by CSE Department Head. Computing lab resources allocated.',
        });

      expect(decisionRes.status).toBe(200);
      expect(decisionRes.body.success).toBe(true);
      expect(decisionRes.body.endorsement.status).toBe('APPROVED');
      // Verifies original snapshot remains intact
      expect(decisionRes.body.endorsement.originalContentSnapshot).toBeDefined();
    });
  });
});
