-- ===============================
-- Master PostgreSQL Schema – School Management System
-- ===============================

-- ===============================
-- 1. Users & Roles
-- ===============================
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL -- Admin, Principal, Academic Coordinator, Registrar, Accounting, Guidance, Teacher, Student, Parent
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role_id INT REFERENCES roles(id) ON DELETE RESTRICT,
    section_id INT REFERENCES sections(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- 2. Sections & Subjects
-- ===============================
CREATE TABLE sections (
    id SERIAL PRIMARY KEY,
    section_name VARCHAR(100) NOT NULL,
    grade_level VARCHAR(50) NOT NULL,
    adviser_id INT REFERENCES users(id) -- Teacher assigned
);

CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    subject_name VARCHAR(100) NOT NULL,
    grade_level VARCHAR(50) NOT NULL
);

-- ===============================
-- 3. Academic Coordinator & Teacher Functions
-- ===============================
CREATE TABLE teacher_assignments (
    id SERIAL PRIMARY KEY,
    teacher_id INT REFERENCES users(id) ON DELETE CASCADE,
    subject_id INT REFERENCES subjects(id),
    section_id INT REFERENCES sections(id),
    school_year VARCHAR(9) NOT NULL
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    teacher_id INT REFERENCES users(id) ON DELETE CASCADE,
    section_id INT REFERENCES sections(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(50), -- Assignment, Quiz, Test
    timer_minutes INT, -- For timed quizzes/tests
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE task_submissions (
    id SERIAL PRIMARY KEY,
    task_id INT REFERENCES tasks(id) ON DELETE CASCADE,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    submission_text TEXT,
    file_url TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    grade NUMERIC(5,2)
);

-- ===============================
-- 4. Meetings (Principal, Coordinator, Teacher, Students)
-- ===============================
CREATE TABLE meetings (
    id SERIAL PRIMARY KEY,
    organizer_id INT REFERENCES users(id) ON DELETE CASCADE,
    section_id INT REFERENCES sections(id),
    title VARCHAR(255) NOT NULL,
    meeting_url TEXT NOT NULL,
    scheduled_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- 5. Accounting Functions
-- ===============================
CREATE TABLE fee_structures (
    id SERIAL PRIMARY KEY,
    grade_level VARCHAR(50) NOT NULL,
    tuition_fee NUMERIC(12,2) NOT NULL,
    misc_fee NUMERIC(12,2) DEFAULT 0,
    other_fee NUMERIC(12,2) DEFAULT 0,
    effective_school_year VARCHAR(9) NOT NULL
);

CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    school_year VARCHAR(9) NOT NULL,
    due_date DATE NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'Unpaid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INT REFERENCES invoices(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(12,2) NOT NULL
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    invoice_id INT REFERENCES invoices(id) ON DELETE CASCADE,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount_paid NUMERIC(12,2) NOT NULL,
    payment_method VARCHAR(50),
    receipt_number VARCHAR(100)
);

CREATE TABLE scholarships (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    scholarship_name VARCHAR(255) NOT NULL,
    discount_percentage NUMERIC(5,2) NOT NULL,
    effective_school_year VARCHAR(9) NOT NULL
);

CREATE TABLE school_expenses (
    id SERIAL PRIMARY KEY,
    expense_date DATE NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    amount NUMERIC(12,2) NOT NULL,
    recorded_by INT REFERENCES users(id)
);

-- ===============================
-- 6. Guidance Functions
-- ===============================
CREATE TABLE guidance_reports (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    counselor_id INT REFERENCES users(id) ON DELETE CASCADE,
    report_type VARCHAR(100),
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- 7. Chat System
-- ===============================
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    conversation_type VARCHAR(20) DEFAULT 'private', -- private, group
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversation_members (
    id SERIAL PRIMARY KEY,
    conversation_id INT REFERENCES conversations(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INT REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INT REFERENCES users(id) ON DELETE CASCADE,
    message_text TEXT,
    attachment_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE
);

CREATE TABLE user_status (
    user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    is_online BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- 8. Announcements & Events (Admin, Principal)
-- ===============================
CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    description TEXT,
    event_date TIMESTAMP NOT NULL,
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- Sample Data Insert
-- ===============================

-- Insert roles
INSERT INTO roles (role_name) VALUES 
('Admin'), ('Principal'), ('Academic Coordinator'), ('Registrar'), 
('Accounting'), ('Guidance'), ('Teacher'), ('Student'), ('Parent');

-- Insert sections first (needed for users)
INSERT INTO sections (section_name, grade_level) VALUES 
('Section A', 'Grade 10'),
('Section B', 'Grade 10'),
('Section A', 'Grade 11');

-- Insert subjects
INSERT INTO subjects (subject_name, grade_level) VALUES 
('Mathematics', 'Grade 10'),
('English', 'Grade 10'),
('Science', 'Grade 10'),
('History', 'Grade 11');