-- =====================
-- UNIFIED POSTGRESQL SCHEMA - SCHOOL MANAGEMENT SYSTEM
-- =====================

-- =====================
-- USERS & ROLES
-- =====================
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL -- Admin, Principal, Academic Coordinator, Teacher, Student, Guidance, Registrar, Accounting
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    role_id INT REFERENCES roles(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    profile_image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- =====================
-- SECTIONS & SUBJECTS
-- =====================
CREATE TABLE sections (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    grade_level TEXT NOT NULL
);

CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    section_id INT REFERENCES sections(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT
);

-- =====================
-- ENROLLMENT PROGRESS (STUDENT)
-- =====================
CREATE TABLE enrollment_progress (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    current_status TEXT NOT NULL, -- Pending, Verified, Payment Complete, Enrolled
    remarks TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================
-- TEACHER MODULE UPLOADS
-- =====================
CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    teacher_id INT REFERENCES users(id) ON DELETE CASCADE,
    section_id INT REFERENCES sections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================
-- TASKS (Assignment, Quiz, Test)
-- =====================
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    teacher_id INT REFERENCES users(id) ON DELETE CASCADE,
    section_id INT REFERENCES sections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    task_type TEXT NOT NULL, -- Assignment, Quiz, Test
    timer_minutes INT,
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================
-- MEETINGS (Google Meet Style)
-- =====================
CREATE TABLE meetings (
    id SERIAL PRIMARY KEY,
    host_id INT REFERENCES users(id) ON DELETE CASCADE,
    section_id INT REFERENCES sections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    meeting_link TEXT NOT NULL,
    scheduled_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================
-- CHAT SYSTEM
-- =====================
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INT REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INT REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE
);

CREATE TABLE online_status (
    user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    is_online BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP
);

-- =====================
-- ANNOUNCEMENTS & EVENTS
-- =====================
CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    posted_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    created_by INT REFERENCES users(id) ON DELETE SET NULL
);

-- =====================
-- ACCOUNTING
-- =====================
CREATE TABLE fees (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    fee_type TEXT NOT NULL, -- Tuition, Miscellaneous, etc.
    amount NUMERIC(10,2) NOT NULL,
    due_date TIMESTAMP,
    status TEXT DEFAULT 'Unpaid'
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    fee_id INT REFERENCES fees(id) ON DELETE CASCADE,
    amount_paid NUMERIC(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method TEXT,
    recorded_by INT REFERENCES users(id) ON DELETE SET NULL
);

-- =====================
-- GUIDANCE
-- =====================
CREATE TABLE guidance_reports (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    counselor_id INT REFERENCES users(id) ON DELETE SET NULL,
    report TEXT NOT NULL,
    report_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================
-- GRADES
-- =====================
CREATE TABLE grades (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    subject_id INT REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id INT REFERENCES users(id) ON DELETE CASCADE,
    grade NUMERIC(5,2) NOT NULL,
    quarter INT NOT NULL,
    school_year TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================
-- NEWS (for landing page)
-- =====================
CREATE TABLE news (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    posted_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (name) VALUES 
('admin'), 
('principal'), 
('academic_coordinator'), 
('teacher'), 
('student'), 
('parent'), 
('guidance'), 
('registrar'), 
('accounting');