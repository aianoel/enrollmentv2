CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin','teacher','student','parent','guidance','registrar','accounting')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    grade_level INT NOT NULL,
    adviser_id INT,
    FOREIGN KEY (adviser_id) REFERENCES users(id)
);

CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    section_id INT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
    documents TEXT,
    payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','paid')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (section_id) REFERENCES sections(id)
);

CREATE TABLE grades (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    quarter INT NOT NULL,
    grade DECIMAL(5,2),
    teacher_id INT,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (teacher_id) REFERENCES users(id)
);

CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    section_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('test','assignment')),
    due_date DATE,
    file_url VARCHAR(255),
    created_by INT NOT NULL,
    FOREIGN KEY (section_id) REFERENCES sections(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
);

CREATE TABLE meetings (
    id SERIAL PRIMARY KEY,
    section_id INT NOT NULL,
    title VARCHAR(255),
    meeting_link VARCHAR(255),
    date TIMESTAMP,
    created_by INT NOT NULL,
    FOREIGN KEY (section_id) REFERENCES sections(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE hero_images (
    id SERIAL PRIMARY KEY,
    image_url VARCHAR(255) NOT NULL,
    uploaded_by INT,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    date_posted DATE DEFAULT CURRENT_DATE,
    posted_by INT,
    FOREIGN KEY (posted_by) REFERENCES users(id)
);

CREATE TABLE news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    image_url VARCHAR(255),
    date_posted DATE DEFAULT CURRENT_DATE,
    posted_by INT,
    FOREIGN KEY (posted_by) REFERENCES users(id)
);

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE,
    location VARCHAR(255),
    posted_by INT,
    FOREIGN KEY (posted_by) REFERENCES users(id)
);