-- Sigma DB schema (aligned with current backend models/repositories)

-- Re-runnable cleanup
DROP TABLE IF EXISTS teacher_certificate CASCADE;
DROP TABLE IF EXISTS student_certificate CASCADE;
DROP TABLE IF EXISTS student_achievement CASCADE;
DROP TABLE IF EXISTS achievement CASCADE;
DROP TABLE IF EXISTS gamification CASCADE;
DROP TABLE IF EXISTS gamification_level CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS schedule CASCADE;
DROP TABLE IF EXISTS extracurricular_score CASCADE;
DROP TABLE IF EXISTS extracurricular_team_members CASCADE;
DROP TABLE IF EXISTS extracurricular_team CASCADE;
DROP TABLE IF EXISTS extracurricular_activity CASCADE;
DROP TABLE IF EXISTS enrollment CASCADE;
DROP TABLE IF EXISTS course_class CASCADE;
DROP TABLE IF EXISTS course CASCADE;
DROP TABLE IF EXISTS slots CASCADE;
DROP TABLE IF EXISTS pre_registration CASCADE;
DROP TABLE IF EXISTS intake_control CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS staff CASCADE;

DROP TYPE IF EXISTS certificate_statuses CASCADE;
DROP TYPE IF EXISTS course_statuses CASCADE;
DROP TYPE IF EXISTS course_types CASCADE;
DROP TYPE IF EXISTS enrollment_statuses CASCADE;
DROP TYPE IF EXISTS pre_registration_statuses CASCADE;
DROP TYPE IF EXISTS staff_roles CASCADE;
DROP TYPE IF EXISTS student_statuses CASCADE;

-- Enums
CREATE TYPE student_statuses AS ENUM ('Registered', 'Enrolled', 'Blocked');
CREATE TYPE staff_roles AS ENUM ('Teacher', 'Admin');
CREATE TYPE pre_registration_statuses AS ENUM ('PendingApproval', 'Approved');
CREATE TYPE course_statuses AS ENUM ('Draft', 'Archived', 'Published');
CREATE TYPE course_types AS ENUM ('ThreeDays', 'SixDays');
CREATE TYPE enrollment_statuses AS ENUM ('Active', 'Dropped', 'Completed');
CREATE TYPE certificate_statuses AS ENUM ('In progress', 'Issued');

-- Core users
CREATE TABLE staff (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    partonymic VARCHAR(50),
    email VARCHAR(254) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    staff_role staff_roles NOT NULL
);

CREATE TABLE intake_control (
    id INT PRIMARY KEY DEFAULT 1,
    intake_closed BOOLEAN NOT NULL DEFAULT FALSE,
    closed_at TIMESTAMPTZ NULL,
    closed_by BIGINT NULL REFERENCES staff(id) ON DELETE SET NULL
);

INSERT INTO intake_control (id, intake_closed) VALUES (1, FALSE)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE students (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    partonymic VARCHAR(50),
    email VARCHAR(254) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    tg_nickname VARCHAR(50),
    year_of_study INT CHECK (year_of_study BETWEEN 8 AND 11),
    city VARCHAR(30),
    school VARCHAR(100),
    parent_name VARCHAR(150) NOT NULL,
    parent_phone VARCHAR(20) NOT NULL,
    student_status student_statuses NOT NULL DEFAULT 'Registered'
);

CREATE TABLE pre_registration (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    partonymic VARCHAR(50),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    tg_nickname VARCHAR(50),
    pre_registration_status pre_registration_statuses NOT NULL DEFAULT 'PendingApproval'
);

-- Scheduling/courses
CREATE TABLE slots (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    staff_id BIGINT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    slot_time TIME NOT NULL,
    CONSTRAINT uq_slots_staff_datetime UNIQUE (staff_id, slot_date, slot_time)
);

CREATE TABLE course (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    descriptions VARCHAR(200),
    staff_id BIGINT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    course_status course_statuses NOT NULL DEFAULT 'Draft',
    course_type course_types NOT NULL DEFAULT 'ThreeDays',
    syllabus_url TEXT,
    capacity INT NULL CHECK (capacity >= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE course_class (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES course(id) ON DELETE CASCADE,
    class_number INT NOT NULL,
    class_description VARCHAR(200) NOT NULL,
    CONSTRAINT cn_course_class UNIQUE (course_id, class_number)
);

CREATE TABLE schedule (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    staff_id BIGINT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    course_class_id BIGINT NOT NULL REFERENCES course_class(id) ON DELETE CASCADE,
    slot_id BIGINT REFERENCES slots(id) ON DELETE SET NULL,
    lesson_date DATE NOT NULL DEFAULT CURRENT_DATE,
    lesson_time TIME NOT NULL DEFAULT CURRENT_TIME,
    CONSTRAINT uq_schedule_staff_datetime UNIQUE (staff_id, lesson_date, lesson_time)
);

CREATE TABLE attendance (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    schedule_id BIGINT NOT NULL REFERENCES schedule(id) ON DELETE CASCADE,
    attendance_status BOOLEAN NOT NULL,
    CONSTRAINT cn_attendance UNIQUE (student_id, schedule_id)
);

CREATE TABLE enrollment (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES course(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    enrollment_status enrollment_statuses NOT NULL DEFAULT 'Active',
    CONSTRAINT cn_enrollment UNIQUE (student_id, course_id)
);

-- Gamification
CREATE TABLE gamification (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT UNIQUE NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    attendance_score INT NOT NULL DEFAULT 0,
    achievement_score INT NOT NULL DEFAULT 0,
    extracurricular_score INT NOT NULL DEFAULT 0,
    total_score INT NOT NULL DEFAULT 0,
    level INT NOT NULL DEFAULT 0
);

CREATE TABLE gamification_level (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    gamification_level INT NOT NULL,
    gamification_level_score INT NOT NULL
);

-- Extracurricular
CREATE TABLE extracurricular_activity (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ex_course_name VARCHAR(100) NOT NULL,
    staff_id BIGINT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    ex_course_score INT NOT NULL
);

CREATE TABLE extracurricular_team (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ex_team_number INT UNIQUE NOT NULL,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE extracurricular_team_members (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES extracurricular_team(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT cn_extracurricular_team_members UNIQUE (team_id, student_id)
);

CREATE TABLE extracurricular_score (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES extracurricular_team(id) ON DELETE CASCADE,
    ex_course_id BIGINT NOT NULL REFERENCES extracurricular_activity(id) ON DELETE CASCADE,
    ex_team_score INT NOT NULL DEFAULT 0,
    CONSTRAINT cn_extracurricular_score UNIQUE (team_id, ex_course_id)
);

-- Achievements/certificates
CREATE TABLE achievement (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    achievement_description VARCHAR(100) NOT NULL,
    course_id BIGINT NOT NULL REFERENCES course(id) ON DELETE CASCADE,
    achievement_score INT NOT NULL,
    CONSTRAINT cn_achievement_unique UNIQUE (course_id, achievement_description)
);

CREATE TABLE student_achievement (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    achievement_id BIGINT NOT NULL REFERENCES achievement(id) ON DELETE CASCADE,
    awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT cn_student_achievement UNIQUE (student_id, achievement_id)
);
CREATE TABLE student_certificate (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES course(id) ON DELETE CASCADE,
    issued_by BIGINT REFERENCES staff(id) ON DELETE SET NULL,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    certificate_url VARCHAR(200),
    certificate_status certificate_statuses NOT NULL DEFAULT 'In progress',
    CONSTRAINT cn_student_certificate_unique UNIQUE (student_id, course_id)
);

CREATE TABLE teacher_certificate (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES course(id) ON DELETE CASCADE,
    issued_by BIGINT REFERENCES staff(id) ON DELETE SET NULL,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    certificate_url VARCHAR(200) NOT NULL,
    certificate_status certificate_statuses NOT NULL DEFAULT 'In progress'
);

-- Trigger: auto-update updated_at on course
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_course_updated_at ON course;
CREATE TRIGGER trg_course_updated_at
BEFORE UPDATE ON course
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
