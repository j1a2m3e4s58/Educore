-- EduCore production relational schema target.
-- Use this when moving from data/educore-db.json to PostgreSQL/MySQL.

CREATE TABLE schools (
  id VARCHAR(120) PRIMARY KEY,
  code VARCHAR(80) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL
);

CREATE TABLE users (
  id VARCHAR(120) PRIMARY KEY,
  tenant_id VARCHAR(120) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(60) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Active',
  password_hash TEXT NOT NULL,
  linked_teacher_id VARCHAR(120) NULL,
  linked_student_id VARCHAR(120) NULL,
  linked_student_ids TEXT NULL,
  failed_login_count INTEGER NOT NULL DEFAULT 0,
  login_locked_until TIMESTAMP NULL,
  must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
  created_by VARCHAR(255) NULL,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  UNIQUE (tenant_id, email)
);

CREATE TABLE students (
  id VARCHAR(120) PRIMARY KEY,
  tenant_id VARCHAR(120) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  student_id VARCHAR(120) NOT NULL,
  class_id VARCHAR(120) NULL,
  parent_name VARCHAR(255) NULL,
  parent_email VARCHAR(255) NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (tenant_id, student_id)
);

CREATE TABLE teachers (
  id VARCHAR(120) PRIMARY KEY,
  tenant_id VARCHAR(120) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  staff_id VARCHAR(120) NOT NULL,
  email VARCHAR(255) NULL,
  assigned_classes TEXT NULL,
  subjects_taught TEXT NULL,
  timetable TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (tenant_id, staff_id)
);

CREATE TABLE fees (
  id VARCHAR(120) PRIMARY KEY,
  tenant_id VARCHAR(120) NOT NULL,
  student_id VARCHAR(120) NULL,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  academic_year VARCHAR(60) NULL,
  period VARCHAR(80) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE materials (
  id VARCHAR(120) PRIMARY KEY,
  tenant_id VARCHAR(120) NOT NULL,
  teacher_id VARCHAR(120) NULL,
  class_id VARCHAR(120) NULL,
  subject_id VARCHAR(120) NULL,
  title VARCHAR(255) NOT NULL,
  file_url TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assignments (
  id VARCHAR(120) PRIMARY KEY,
  tenant_id VARCHAR(120) NOT NULL,
  teacher_id VARCHAR(120) NULL,
  student_id VARCHAR(120) NULL,
  class_id VARCHAR(120) NULL,
  title VARCHAR(255) NOT NULL,
  due_date DATE NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audits (
  id VARCHAR(120) PRIMARY KEY,
  tenant_id VARCHAR(120) NOT NULL,
  actor_id VARCHAR(120) NULL,
  actor_email VARCHAR(255) NULL,
  action VARCHAR(255) NOT NULL,
  detail TEXT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'info',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE archives (
  id VARCHAR(120) PRIMARY KEY,
  tenant_id VARCHAR(120) NOT NULL,
  academic_year VARCHAR(80) NOT NULL,
  period VARCHAR(80) NOT NULL,
  snapshot TEXT NULL,
  created_by VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE password_resets (
  id VARCHAR(120) PRIMARY KEY,
  tenant_id VARCHAR(120) NOT NULL,
  user_id VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  code_hash TEXT NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Pending',
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
  id VARCHAR(120) PRIMARY KEY,
  token_hash TEXT NOT NULL,
  user_id VARCHAR(120) NOT NULL,
  tenant_id VARCHAR(120) NOT NULL,
  role VARCHAR(60) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE delivery_queue (
  id VARCHAR(120) PRIMARY KEY,
  tenant_id VARCHAR(120) NOT NULL,
  channel VARCHAR(40) NOT NULL,
  recipient VARCHAR(255) NULL,
  body TEXT NULL,
  provider VARCHAR(80) NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Queued',
  created_by VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
