import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../auth/jwt';
import { upload, validateFile, getFileUrl } from '../middleware/upload';
import { storage } from '../unified-storage';

const router = Router();

// Schema for task creation
const createTaskSchema = z.object({
  sectionId: z.number(),
  subjectId: z.number().optional(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  type: z.enum(['Assignment', 'Quiz', 'Test']),
  timerMinutes: z.number().optional(),
  dueAt: z.string().datetime().optional(),
  questions: z.array(z.object({
    question: z.string(),
    choices: z.array(z.string()).optional(),
    answer: z.string()
  })).optional()
});

// Create task with questions (Teacher)
router.post('/', 
  requireAuth, 
  requireRole(['Teacher']), 
  async (req, res) => {
    try {
      const taskData = createTaskSchema.parse(req.body);
      const teacherId = (req as any).user.id;

      // Verify teacher has access to section
      const hasAccess = await storage.verifyTeacherSectionAccess(teacherId, taskData.sectionId);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied to this section' });
      }

      // Create task
      const task = await storage.createTask({
        teacherId,
        sectionId: taskData.sectionId,
        subjectId: taskData.subjectId,
        title: taskData.title,
        description: taskData.description || '',
        type: taskData.type,
        timerMinutes: taskData.timerMinutes,
        dueAt: taskData.dueAt ? new Date(taskData.dueAt) : null,
        createdAt: new Date()
      });

      // Add questions if provided
      if (taskData.questions && taskData.questions.length > 0) {
        for (const question of taskData.questions) {
          await storage.createTaskQuestion({
            taskId: task.id,
            question: question.question,
            choices: question.choices || null,
            answer: question.answer
          });
        }
      }

      // Notify students in section
      const students = await storage.getStudentsBySection(taskData.sectionId);
      for (const student of students) {
        await storage.createNotification({
          userId: student.id,
          title: `New ${taskData.type}: ${taskData.title}`,
          body: `A new ${taskData.type.toLowerCase()} has been assigned to your section`,
          type: 'task_assigned',
          relatedId: task.id
        });
      }

      res.status(201).json({
        id: task.id,
        message: 'Task created successfully',
        questionsCount: taskData.questions?.length || 0
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Invalid input', 
          details: error.errors 
        });
      }
      console.error('Create task error:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  }
);

// Get tasks for section (Students/Teachers)
router.get('/section/:sectionId', requireAuth, async (req, res) => {
  try {
    const sectionId = parseInt(req.params.sectionId);
    const user = (req as any).user;

    // Verify access to section
    const hasAccess = await storage.verifyUserSectionAccess(user.id, sectionId, user.role);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to this section' });
    }

    const tasks = await storage.getTasksBySection(sectionId);
    
    // If student, include submission status
    if (user.role === 'Student') {
      for (const task of tasks) {
        task.submission = await storage.getTaskSubmission(task.id, user.id);
      }
    }

    res.json(tasks);

  } catch (error) {
    console.error('Get section tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get task with questions (for taking quiz/test)
router.get('/:id/questions', 
  requireAuth, 
  requireRole(['Student']), 
  async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const studentId = (req as any).user.id;

      // Get task
      const task = await storage.getTaskById(taskId);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Verify student has access to this task's section
      const hasAccess = await storage.verifyUserSectionAccess(studentId, task.sectionId, 'Student');
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied to this task' });
      }

      // Check if already submitted
      const existingSubmission = await storage.getTaskSubmission(taskId, studentId);
      if (existingSubmission) {
        return res.status(400).json({ error: 'Task already submitted' });
      }

      // Get questions (hide answers from students)
      const questions = await storage.getTaskQuestions(taskId);
      const studentQuestions = questions.map(q => ({
        id: q.id,
        question: q.question,
        choices: q.choices
        // Answer is hidden from students
      }));

      res.json({
        task: {
          id: task.id,
          title: task.title,
          description: task.description,
          type: task.type,
          timerMinutes: task.timerMinutes,
          dueAt: task.dueAt
        },
        questions: studentQuestions
      });

    } catch (error) {
      console.error('Get task questions error:', error);
      res.status(500).json({ error: 'Failed to fetch task questions' });
    }
  }
);

// Submit task (Student)
router.post('/:id/submissions', 
  requireAuth, 
  requireRole(['Student']), 
  upload.single('file'),
  async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const studentId = (req as any).user.id;
      const { submissionText, answers } = req.body;

      // Get task
      const task = await storage.getTaskById(taskId);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Check if already submitted
      const existingSubmission = await storage.getTaskSubmission(taskId, studentId);
      if (existingSubmission) {
        return res.status(400).json({ error: 'Task already submitted' });
      }

      // Check due date
      if (task.dueAt && new Date() > new Date(task.dueAt)) {
        return res.status(400).json({ error: 'Task submission deadline has passed' });
      }

      let fileUrl = null;
      if (req.file) {
        const fileError = validateFile(req.file, {
          allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
          maxSize: 25 * 1024 * 1024 // 25MB
        });

        if (fileError) {
          return res.status(400).json({ error: fileError });
        }

        fileUrl = getFileUrl(req.file.path);
      }

      // Auto-grade if it's a quiz/test with questions
      let score = null;
      if ((task.type === 'Quiz' || task.type === 'Test') && answers) {
        const questions = await storage.getTaskQuestions(taskId);
        const studentAnswers = JSON.parse(answers);
        let correctCount = 0;

        for (const question of questions) {
          const studentAnswer = studentAnswers[question.id];
          if (studentAnswer === question.answer) {
            correctCount++;
          }
        }

        score = (correctCount / questions.length) * 100;
      }

      // Create submission
      const submission = await storage.createTaskSubmission({
        taskId,
        studentId,
        submissionText: submissionText || '',
        fileUrl,
        submittedAt: new Date(),
        score,
        gradedAt: score !== null ? new Date() : null,
        gradedBy: score !== null ? null : null // Auto-graded
      });

      // Notify teacher
      await storage.createNotification({
        userId: task.teacherId,
        title: 'New Task Submission',
        body: `A student has submitted ${task.title}`,
        type: 'task_submitted',
        relatedId: taskId
      });

      res.status(201).json({
        id: submission.id,
        message: 'Task submitted successfully',
        score: score !== null ? Math.round(score) : null,
        autoGraded: score !== null
      });

    } catch (error) {
      console.error('Submit task error:', error);
      res.status(500).json({ error: 'Failed to submit task' });
    }
  }
);

// Grade submission (Teacher)
router.patch('/submissions/:id/grade', 
  requireAuth, 
  requireRole(['Teacher']), 
  async (req, res) => {
    try {
      const submissionId = parseInt(req.params.id);
      const { score, feedback } = req.body;
      const teacherId = (req as any).user.id;

      // Validate score
      if (score < 0 || score > 100) {
        return res.status(400).json({ error: 'Score must be between 0 and 100' });
      }

      // Get submission and verify teacher access
      const submission = await storage.getTaskSubmissionById(submissionId);
      if (!submission) {
        return res.status(404).json({ error: 'Submission not found' });
      }

      const task = await storage.getTaskById(submission.taskId);
      if (task.teacherId !== teacherId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Update grade
      await storage.updateTaskSubmission(submissionId, {
        score,
        feedback,
        gradedAt: new Date(),
        gradedBy: teacherId
      });

      // Notify student
      await storage.createNotification({
        userId: submission.studentId,
        title: 'Task Graded',
        body: `Your submission for "${task.title}" has been graded: ${Math.round(score)}%`,
        type: 'task_graded',
        relatedId: submission.taskId
      });

      res.json({ message: 'Task graded successfully' });

    } catch (error) {
      console.error('Grade task error:', error);
      res.status(500).json({ error: 'Failed to grade task' });
    }
  }
);

export default router;