const bcrypt = require('bcryptjs');
const db = require('./models/db');

async function seed() {
  console.log('Seeding database...');
  
  // Create users with hashed passwords
  const adminPass = await bcrypt.hash('admin123', 10);
  const teacherPass = await bcrypt.hash('teacher123', 10);
  const studentPass = await bcrypt.hash('student123', 10);
  const parentPass = await bcrypt.hash('parent123', 10);

  db.serialize(() => {
    // Insert users
    db.run(`INSERT OR IGNORE INTO users (role_id, email, password_hash, full_name) VALUES 
      (1, 'admin@nexusschool.edu', '${adminPass}', 'System Administrator')`);
    db.run(`INSERT OR IGNORE INTO users (role_id, email, password_hash, full_name) VALUES 
      (2, 'teacher@nexusschool.edu', '${teacherPass}', 'John Smith')`);
    db.run(`INSERT OR IGNORE INTO users (role_id, email, password_hash, full_name) VALUES 
      (3, 'student@nexusschool.edu', '${studentPass}', 'Alice Johnson')`);
    db.run(`INSERT OR IGNORE INTO users (role_id, email, password_hash, full_name) VALUES 
      (4, 'parent@nexusschool.edu', '${parentPass}', 'Robert Johnson')`);

    // Get user IDs
    db.get("SELECT id FROM users WHERE email = 'admin@nexusschool.edu'", (err, admin) => {
      db.get("SELECT id FROM users WHERE email = 'teacher@nexusschool.edu'", (err, teacher) => {
        db.get("SELECT id FROM users WHERE email = 'student@nexusschool.edu'", (err, studentUser) => {
          // Create academic year
          db.run(`INSERT OR IGNORE INTO academic_years (label, start_date, end_date, is_current) 
                  VALUES ('2024-2025', '2024-09-01', '2025-06-30', 1)`);
          
          // Create classes
          db.run(`INSERT OR IGNORE INTO classes (academic_year_id, grade_level, section) VALUES (1, 'Grade 10', 'A')`);
          db.run(`INSERT OR IGNORE INTO classes (academic_year_id, grade_level, section) VALUES (1, 'Grade 9', 'B')`);
          
          // Create student record
          db.get("SELECT id FROM classes WHERE grade_level = 'Grade 10' AND section = 'A'", (err, cls) => {
            db.run(`INSERT OR IGNORE INTO students (user_id, enrollment_no, dob, gender, current_class_id) 
                    VALUES (${studentUser.id}, 'STU2024001', '2008-05-15', 'FEMALE', ${cls.id})`);
          });
          
          // Create staff record
          db.get("SELECT id FROM users WHERE email = 'teacher@nexusschool.edu'", (err, t) => {
            db.run(`INSERT OR IGNORE INTO staff (user_id, employee_id, designation, department) 
                    VALUES (${t.id}, 'EMP001', 'Math Teacher', 'Mathematics')`);
          });
          
          // Create subjects
          db.run(`INSERT OR IGNORE INTO subjects (code, name, department) VALUES ('MATH101', 'Mathematics', 'Mathematics')`);
          db.run(`INSERT OR IGNORE INTO subjects (code, name, department) VALUES ('SCI101', 'Science', 'Science')`);
          db.run(`INSERT OR IGNORE INTO subjects (code, name, department) VALUES ('ENG101', 'English', 'Languages')`);
          
          // Create sample attendance
          db.get("SELECT id FROM students LIMIT 1", (err, student) => {
            if (student) {
              for (let i = 0; i < 10; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                db.run(`INSERT OR IGNORE INTO attendance (student_id, class_id, date, status) 
                        VALUES (${student.id}, 1, '${date.toISOString().split('T')[0]}', 'PRESENT')`);
              }
            }
          });
          
          console.log('Seed complete! Users:');
          console.log('  Admin: admin@nexusschool.edu / admin123');
          console.log('  Teacher: teacher@nexusschool.edu / teacher123');
          console.log('  Student: student@nexusschool.edu / student123');
          console.log('  Parent: parent@nexusschool.edu / parent123');
        });
      });
    });
  });
}

seed();

setTimeout(() => process.exit(0), 2000);