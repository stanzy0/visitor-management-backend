const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(process.env.DB_PATH || path.join(__dirname, '../sis.db'));

// Initialize database tables
db.serialize(() => {
  // Roles table
  db.run(`CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  )`);
  
  db.run(`INSERT OR IGNORE INTO roles (id, name) VALUES 
    (1, 'ADMIN'), (2, 'TEACHER'), (3, 'STUDENT'), (4, 'PARENT')`);

  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_id INTEGER NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
  )`);

  // Academic Years
  db.run(`CREATE TABLE IF NOT EXISTS academic_years (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT 0
  )`);

  // Classes
  db.run(`CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    academic_year_id INTEGER NOT NULL,
    grade_level TEXT NOT NULL,
    section TEXT NOT NULL,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
  )`);

  // Students
  db.run(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    enrollment_no TEXT UNIQUE NOT NULL,
    dob DATE NOT NULL,
    gender TEXT,
    current_class_id INTEGER,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'ENROLLED',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (current_class_id) REFERENCES classes(id)
  )`);

  // Staff
  db.run(`CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    employee_id TEXT UNIQUE NOT NULL,
    designation TEXT,
    department TEXT,
    joining_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // Subjects
  db.run(`CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    department TEXT,
    credits INTEGER DEFAULT 1
  )`);

  // Teacher-Subject mapping
  db.run(`CREATE TABLE IF NOT EXISTS teacher_subjects (
    teacher_id INTEGER,
    subject_id INTEGER,
    PRIMARY KEY (teacher_id, subject_id),
    FOREIGN KEY (teacher_id) REFERENCES staff(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
  )`);

  // Timetable
  db.run(`CREATE TABLE IF NOT EXISTS timetable (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER NOT NULL,
    teacher_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (teacher_id) REFERENCES staff(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
  )`);

  // Attendance
  db.run(`CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED')),
    marked_by INTEGER,
    marked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (marked_by) REFERENCES users(id)
  )`);

  // Inquiries
  db.run(`CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    grade_applying TEXT,
    source TEXT,
    status TEXT DEFAULT 'NEW',
    next_followup DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Applications
  db.run(`CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inquiry_id INTEGER,
    student_id INTEGER,
    application_date DATE NOT NULL,
    status TEXT DEFAULT 'SUBMITTED',
    entrance_score REAL,
    reviewer_id INTEGER,
    review_notes TEXT,
    FOREIGN KEY (inquiry_id) REFERENCES inquiries(id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (reviewer_id) REFERENCES staff(id)
  )`);

  // Fee Structures
  db.run(`CREATE TABLE IF NOT EXISTS fee_structures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    academic_year_id INTEGER NOT NULL,
    grade_level TEXT,
    fee_type TEXT NOT NULL,
    amount REAL NOT NULL,
    due_day INTEGER DEFAULT 5,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
  )`);

  // Fee Invoices
  db.run(`CREATE TABLE IF NOT EXISTS fee_invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    academic_year_id INTEGER NOT NULL,
    due_date DATE NOT NULL,
    total_amount REAL NOT NULL,
    paid_amount REAL DEFAULT 0,
    status TEXT DEFAULT 'PENDING',
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
  )`);

  // Payments
  db.run(`CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    payment_method TEXT,
    transaction_id TEXT,
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    received_by INTEGER,
    status TEXT DEFAULT 'SUCCESS',
    FOREIGN KEY (invoice_id) REFERENCES fee_invoices(id),
    FOREIGN KEY (received_by) REFERENCES users(id)
  )`);

  // Visitors
  db.run(`CREATE TABLE IF NOT EXISTS visitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    id_type TEXT,
    id_number TEXT,
    phone TEXT,
    email TEXT
  )`);

  // Visits
  db.run(`CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_id INTEGER NOT NULL,
    host_id INTEGER NOT NULL,
    purpose TEXT,
    check_in DATETIME DEFAULT CURRENT_TIMESTAMP,
    check_out DATETIME,
    status TEXT DEFAULT 'IN_PROGRESS',
    FOREIGN KEY (visitor_id) REFERENCES visitors(id),
    FOREIGN KEY (host_id) REFERENCES staff(id)
  )`);

  // Announcements
  db.run(`CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority TEXT DEFAULT 'NORMAL',
    target_audience TEXT,
    expires_at DATETIME,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
  )`);
});

module.exports = db;