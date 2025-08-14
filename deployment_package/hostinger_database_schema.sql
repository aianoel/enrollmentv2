-- ===============================
-- School Management System - Hostinger Production Database Schema
-- ===============================

-- Drop existing tables if they exist (be careful in production!)
-- DROP TABLE IF EXISTS task_submissions CASCADE;
-- DROP TABLE IF EXISTS teacher_tasks CASCADE;
-- DROP TABLE IF EXISTS teacher_meetings CASCADE;
-- DROP TABLE IF EXISTS grades CASCADE;
-- DROP TABLE IF EXISTS enrollments CASCADE;
-- DROP TABLE IF EXISTS sections CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TABLE IF EXISTS roles CASCADE;
-- DROP TABLE IF EXISTS subjects CASCADE;
-- DROP TABLE IF EXISTS announcements CASCADE;
-- DROP TABLE IF EXISTS org_chart CASCADE;
-- DROP TABLE IF EXISTS tuition_fees CASCADE;
-- DROP TABLE IF EXISTS school_settings CASCADE;
-- DROP TABLE IF EXISTS teacher_assignments CASCADE;
-- DROP TABLE IF EXISTS chat_conversations CASCADE;
-- DROP TABLE IF EXISTS chat_messages CASCADE;

-- ===============================
-- 1. Roles Table
-- ===============================
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

-- Insert default roles
INSERT INTO roles (role_name) VALUES 
('admin'),
('principal'),
('academic_coordinator'),
('registrar'),
('accounting'),
('guidance'),
('teacher'),
('student'),
('parent');

-- ===============================
-- 2. Users Table
-- ===============================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- 3. Sections Table
-- ===============================
CREATE TABLE sections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    grade_level INTEGER NOT NULL,
    adviser_id INTEGER
);

-- ===============================
-- 4. Subjects Table
-- ===============================
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    section_id INTEGER REFERENCES sections(id)
);

-- ===============================
-- 5. Enrollments Table
-- ===============================
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    section_id INTEGER,
    status VARCHAR(20) DEFAULT 'pending',
    documents TEXT,
    payment_status VARCHAR(20) DEFAULT 'unpaid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- 6. Grades Table
-- ===============================
CREATE TABLE grades (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    subject_id INTEGER REFERENCES subjects(id),
    quarter INTEGER NOT NULL,
    grade DECIMAL(5,2),
    teacher_id INTEGER
);

-- ===============================
-- 7. Teacher Tasks Table
-- ===============================
CREATE TABLE teacher_tasks (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER NOT NULL REFERENCES users(id),
    section_id INTEGER NOT NULL REFERENCES sections(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(50) NOT NULL,
    timer_minutes INTEGER,
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- 8. Task Submissions Table
-- ===============================
CREATE TABLE task_submissions (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES teacher_tasks(id),
    student_id INTEGER NOT NULL REFERENCES users(id),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_url TEXT,
    score DECIMAL(5,2),
    feedback TEXT
);

-- ===============================
-- 9. Teacher Meetings Table
-- ===============================
CREATE TABLE teacher_meetings (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER NOT NULL REFERENCES users(id),
    section_id INTEGER NOT NULL REFERENCES sections(id),
    title VARCHAR(255) NOT NULL,
    meeting_url TEXT NOT NULL,
    scheduled_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- 10. Teacher Assignments Table
-- ===============================
CREATE TABLE teacher_assignments (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES users(id),
    subject_id INTEGER REFERENCES subjects(id),
    section_id INTEGER REFERENCES sections(id),
    school_year VARCHAR(20) DEFAULT '2024-2025'
);

-- ===============================
-- 11. Announcements Table
-- ===============================
CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER REFERENCES users(id),
    target_audience VARCHAR(100) DEFAULT 'all',
    priority VARCHAR(20) DEFAULT 'normal',
    date_posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- ===============================
-- 12. Organization Chart Table
-- ===============================
CREATE TABLE org_chart (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    photo_url TEXT,
    reports_to INTEGER
);

-- ===============================
-- 13. School Settings Table
-- ===============================
CREATE TABLE school_settings (
    id SERIAL PRIMARY KEY,
    primary_color VARCHAR(7) DEFAULT '#3b82f6',
    school_name VARCHAR(255) DEFAULT 'School Management System',
    school_year VARCHAR(20) DEFAULT '2024-2025',
    start_date DATE,
    end_date DATE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- 14. Tuition Fees Table
-- ===============================
CREATE TABLE tuition_fees (
    id SERIAL PRIMARY KEY,
    grade_level INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE,
    school_year VARCHAR(20) DEFAULT '2024-2025',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- 15. Chat Conversations Table
-- ===============================
CREATE TABLE chat_conversations (
    id VARCHAR(255) PRIMARY KEY,
    conversation_type VARCHAR(50) NOT NULL,
    participants INTEGER[] NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- 16. Chat Messages Table
-- ===============================
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    conversation_id VARCHAR(255) REFERENCES chat_conversations(id),
    sender_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- Insert Sample Data
-- ===============================

-- Sample Admin User (You MUST change this password!)
INSERT INTO users (name, email, password_hash, role, role_id, is_active) VALUES 
('System Administrator', 'admin@yourschool.com', '$2a$10$YourHashedPasswordHere', 'admin', 1, true);

-- Sample School Settings
INSERT INTO school_settings (primary_color, school_name, school_year) VALUES 
('#3b82f6', 'Your School Name', '2024-2025');

-- Sample Organization Chart Entry
INSERT INTO org_chart (name, position, photo_url) VALUES 
('Principal Name', 'Principal', '');

-- Sample Sections
INSERT INTO sections (name, grade_level, adviser_id) VALUES 
('Grade 7-A', 7, NULL),
('Grade 8-A', 8, NULL),
('Grade 9-A', 9, NULL),
('Grade 10-A', 10, NULL);

-- Sample Subjects
INSERT INTO subjects (name, description, section_id) VALUES 
('Mathematics', 'Basic Mathematics', 1),
('English', 'English Language Arts', 1),
('Science', 'General Science', 1),
('Social Studies', 'History and Geography', 1);

-- Sample Tuition Fees
INSERT INTO tuition_fees (grade_level, amount, school_year) VALUES 
(7, 5000.00, '2024-2025'),
(8, 5500.00, '2024-2025'),
(9, 6000.00, '2024-2025'),
(10, 6500.00, '2024-2025');

-- ===============================
-- Create Indexes for Performance
-- ===============================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_grades_student_id ON grades(student_id);
CREATE INDEX idx_grades_subject_id ON grades(subject_id);
CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX idx_teacher_tasks_teacher_id ON teacher_tasks(teacher_id);
CREATE INDEX idx_task_submissions_task_id ON task_submissions(task_id);
CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);

-- ===============================
-- Set Permissions (Optional)
-- ===============================
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_db_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_db_user;

-- ===============================
-- IMPORTANT NOTES:
-- ===============================
-- 1. Change the admin password hash before running this script
-- 2. Update school name and other settings as needed
-- 3. Add your actual data after running this schema
-- 4. Make sure to backup your database regularly
-- 5. Test all functionality after deployment