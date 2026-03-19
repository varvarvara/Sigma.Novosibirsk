CREATE TYPE student_statuses AS ENUM ('Registered', 'Enrolled', 'Blocked');

CREATE TABLE students (
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	first_name VARCHAR(50) NOT NULL,  
	last_name VARCHAR(50) NOT NULL,
	partonymic VARCHAR(50),
	email VARCHAR(254) UNIQUE NOT NULL, 
	phone VARCHAR(20) NOT NULL,                               
	tg_nickname VARCHAR(50),
	year_of_study INT CHECK (year_of_study BETWEEN 8 AND 11), 
	city VARCHAR(30),
	school VARCHAR(100),
	parent_name VARCHAR(150) NOT NULL,
	parent_phone VARCHAR(20) NOT NULL,  
	student_status student_statuses
);

CREATE TYPE staff_roles AS ENUM ('Teacher','Admin');

CREATE TABLE staff (
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	first_name VARCHAR(50) NOT NULL,  
	last_name VARCHAR(50) NOT NULL,
	partonymic VARCHAR(50),
	email VARCHAR(254) UNIQUE NOT NULL, 
	staff_role staff_roles
);

CREATE TYPE pre_registration_statuses AS ENUM ('PendingApproval', 'Approved');

CREATE TABLE pre_registration (
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	first_name VARCHAR(50) NOT NULL,  
	last_name VARCHAR(50) NOT NULL,
	partonymic VARCHAR(50),
	pre_registration_status pre_registration_statuses
);
-- нормер те
CREATE TABLE slots (
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	staff_id BIGINT,
	FOREIGN KEY (staff_id) REFERENCES staff(id)
	ON DELETE CASCADE,
	slot_date DATE,
	slot_time TIME
);

CREATE TYPE course_statuses AS ENUM ('Draft', 'Archived', 'Published');

CREATE TABLE course (
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	title VARCHAR (100),
	descriptions VARCHAR(200),
	staff_id BIGINT,
	FOREIGN KEY (staff_id) REFERENCES staff(id)
	ON DELETE CASCADE,
	course_status course_statuses,
	syllabus_url text,
	created_at timestamptz DEFAULT now(),
	updated_at timestamptz DEFAULT now()
);

CREATE TABLE course_class (
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	course_id BIGINT,
	FOREIGN KEY (course_id) REFERENCES course(id)
	ON DELETE CASCADE,
	class_number INT NOT NULL,
	class_description VARCHAR(200) NOT NULL,
	CONSTRAINT cn_course_class UNIQUE (course_id,class_number)
);

CREATE TABLE extracurricular_activity (
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	ex_course_name VARCHAR(100) NOT NULL,
	staff_id BIGINT,
	FOREIGN KEY (staff_id) REFERENCES staff(id)
	ON DELETE CASCADE,
	ex_course_score INT NOT NULL
);

CREATE TABLE extracurricular_team (
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	ex_team_number INT UNIQUE, -- как мне автоматически делить на команды или это мануально сделается? а может ведь
	student_id BIGINT
);


CREATE TABLE extracurricular_team_members(
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	team_id BIGINT,
	FOREIGN KEY (team_id) REFERENCES extracurricular_team(id)
	ON DELETE CASCADE,
	student_id BIGINT,
	FOREIGN KEY (student_id) REFERENCES students(id)
	ON DELETE CASCADE
);

CREATE TABLE extracurricular_score (
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	team_id BIGINT,
	FOREIGN KEY (team_id) REFERENCES extracurricular_team(id),
	ex_course_id BIGINT,
	FOREIGN KEY (ex_course_id) REFERENCES extracurricular_activity(id)
	ON DELETE CASCADE,
	ex_team_score INT DEFAULT 0, -- для этого триггер нужен, как считать
	CONSTRAINT cn_extracurricular_score UNIQUE(team_id, ex_course_id)
);

CREATE TABLE schedule (
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	staff_id BIGINT,
	FOREIGN KEY (staff_id) REFERENCES staff(id)
	ON DELETE CASCADE,
	course_class_id BIGINT,
	FOREIGN KEY (course_class_id) REFERENCES course_class(id)
	ON DELETE CASCADE,
	slot_id BIGINT, -- а надо ли?
	FOREIGN KEY (slot_id) REFERENCES slots(id),
	lesson_date DATE NOT NULL DEFAULT CURRENT_DATE,
	lesson_time TIME NOT NULL DEFAULT CURRENT_TIME
);

CREATE TABLE attendance (
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	student_id BIGINT NOT NULL,
	FOREIGN KEY (student_id) REFERENCES students(id)
	ON DELETE CASCADE,
	schedule_id BIGINT NOT NULL,
	FOREIGN KEY (schedule_id) REFERENCES schedule(id)
	ON DELETE CASCADE,
	attendance_status BOOLEAN NOT NULL,
	CONSTRAINT cn_attendance UNIQUE (student_id, schedule_id)
);

CREATE TYPE enrollment_statuses AS ENUM ('Active','Dropped', 'Completed'); -- уточнить, что за последний статус

CREATE TABLE enrollment (
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	student_id BIGINT,
	FOREIGN KEY (student_id) REFERENCES students(id)
	ON DELETE CASCADE,
	course_id BIGINT,
	FOREIGN KEY (course_id) REFERENCES course(id)
	ON DELETE CASCADE,
	enrolled_at timestamptz DEFAULT now(),
	enrollment_status enrollment_statuses,
	CONSTRAINT cn_enrollment UNIQUE (student_id,course_id)
);

-- CREATE TABLE gamification (
-- 	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
-- 	student_id BIGINT,
-- 	FOREIGN KEY (student_id) REFERENCES students(id)
-- 	ON DELETE CASCADE,
-- 	attendance_id BIGINT NOT NULL, -- тут подумать, а то ли я беру вообще, для учета баллов
-- 	FOREIGN KEY (attendance_id) REFERENCES attendance(id)
-- 	ON DELETE CASCADE,
-- 	student_level INT, --прописать, как он из таблички с уровнями будет браться
-- 	student_score INT -- прописать триггер для подсчёта баллов по посещаемости
-- );

CREATE TABLE gamification (
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	student_id BIGINT UNIQUE,
	FOREIGN KEY (student_id) REFERENCES students(id)
	ON DELETE CASCADE,
	attendance_score INT DEFAULT 0,
	achievement_score INT DEFAULT 0,
	extracurricular_score INT DEFAULT 0,
	total_score INT GENERATED ALWAYS AS
	(attendance_score + achievement_score + extracurricular_score) STORED,
	level INT DEFAULT 0
	
);

CREATE TABLE gamification_level(
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	gamification_level INT NOT NULL,
	gamification_level_score INT NOT NULL -- это таблица связи очков и уровней
);


CREATE TABLE achievement (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    achievement_description VARCHAR(100) NOT NULL,
    achievement_score INT NOT NULL
);

CREATE TABLE student_achievement (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id)
    ON DELETE CASCADE,
    achievement_id BIGINT NOT NULL,
    FOREIGN KEY (achievement_id) REFERENCES achievement(id)
    ON DELETE CASCADE,
    course_id BIGINT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES course(id)
    ON DELETE CASCADE,
    awarded_at timestamptz DEFAULT now(),
    CONSTRAINT cn_student_achievement UNIQUE (student_id, achievement_id, course_id)
);

CREATE TYPE certificate_statuses AS ENUM ('In progress', 'Issued'); 

CREATE TABLE student_certificate (
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	student_id BIGINT NOT NULL,
	FOREIGN KEY (student_id) REFERENCES students(id)
	ON DELETE CASCADE,
	course_id BIGINT NOT NULL,
	FOREIGN KEY (course_id) REFERENCES course(id)
	ON DELETE SET NULL,
	issued_by BIGINT,
	FOREIGN KEY (issued_by) REFERENCES staff(id)
	ON DELETE CASCADE,
	issued_at timestamptz DEFAULT now(),
	certificate_url VARCHAR(200) NOT NULL,
	certificate_status certificate_statuses,
	CONSTRAINT cn_student_certificate_unique UNIQUE (student_id, course_id)
);

CREATE TABLE teacher_certificate (
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	user_id BIGINT NOT NULL,
	FOREIGN KEY (user_id) REFERENCES staff(id)-- задать триггер на проверку роли пользователя
	ON DELETE CASCADE,
	course_id BIGINT,
	FOREIGN KEY (course_id) REFERENCES course(id)
	ON DELETE CASCADE,
	issued_by BIGINT,
	FOREIGN KEY (issued_by) REFERENCES staff(id)
	ON DELETE CASCADE,
	issued_at timestamptz DEFAULT now(),
	certificate_url VARCHAR(200) NOT NULL,
	certificate_status certificate_statuses 
);


CREATE OR REPLACE PROCEDURE approve_pre_registration(
    p_pre_registration_id BIGINT,
    p_email TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_first_name TEXT;
    v_last_name TEXT;
    v_partonymic TEXT;
BEGIN

    SELECT first_name, last_name, partonymic
    INTO v_first_name, v_last_name, v_partonymic
    FROM pre_registration
    WHERE id = p_pre_registration_id;

    INSERT INTO staff(
        first_name,
        last_name,
        partonymic,
        email,
        staff_role
    )
    VALUES (
        v_first_name,
        v_last_name,
        v_partonymic,
        p_email,
        'Teacher'::staff_roles
    );

    UPDATE pre_registration
    SET pre_registration_status = 'Approved'
    WHERE id = p_pre_registration_id;

END;
$$;


CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


CREATE TRIGGER trg_course_updated_at
BEFORE UPDATE ON course
FOR EACH ROW
EXECUTE FUNCTION set_updated_at(); 

CREATE OR REPLACE FUNCTION recalc_gamification(p_student_id BIGINT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_attendance_score INT;
    v_achievement_score INT;
    v_extracurricular_score INT;
    v_total_score INT;
    v_level INT;
BEGIN

-- attendance (например 3 балла за посещение)

SELECT COUNT(*) * 3
INTO v_attendance_score
FROM attendance
WHERE student_id = p_student_id
AND attendance_status = TRUE;

-- achievement

SELECT COALESCE(SUM(achievement_score),0)
INTO v_achievement_score
FROM achievement
WHERE student_id = p_student_id;

-- extracurricular

SELECT COALESCE(SUM(a.ex_course_score),0)
INTO v_extracurricular_score
FROM extracurricular_team_members m
JOIN extracurricular_score s
ON m.team_id = s.team_id
JOIN extracurricular_activity a
ON s.ex_course_id = a.id
WHERE m.student_id = p_student_id;

-- total

v_total_score :=
v_attendance_score +
v_achievement_score +
v_extracurricular_score;

-- level

SELECT gamification_level
INTO v_level
FROM gamification_level
WHERE gamification_level_score <= v_total_score
ORDER BY gamification_level_score DESC
LIMIT 1;

-- update gamification

UPDATE gamification
SET
attendance_score = v_attendance_score,
achievement_score = v_achievement_score,
extracurricular_score = v_extracurricular_score,
level = COALESCE(v_level,0)
WHERE student_id = p_student_id;
END;
$$;


CREATE OR REPLACE FUNCTION trg_attendance_gamification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
PERFORM recalc_gamification(NEW.student_id);
RETURN NEW;
END;
$$;

CREATE TRIGGER attendance_gamification_trigger
AFTER INSERT OR UPDATE
ON attendance
FOR EACH ROW
EXECUTE FUNCTION trg_attendance_gamification();

CREATE OR REPLACE FUNCTION trg_achievement_gamification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
PERFORM recalc_gamification(NEW.student_id);
RETURN NEW;
END;
$$;

CREATE TRIGGER achievement_gamification_trigger
AFTER INSERT OR UPDATE
ON achievement
FOR EACH ROW
EXECUTE FUNCTION trg_achievement_gamification();

CREATE OR REPLACE FUNCTION trg_extracurricular_gamification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_student_id BIGINT;
BEGIN
FOR v_student_id IN
SELECT student_id
FROM extracurricular_team_members
WHERE team_id = NEW.team_id
LOOP
    PERFORM recalc_gamification(v_student_id);
END LOOP;
RETURN NEW;
END;
$$;

CREATE TRIGGER extracurricular_gamification_trigger
AFTER INSERT OR UPDATE
ON extracurricular_score
FOR EACH ROW
EXECUTE FUNCTION trg_extracurricular_gamification();

CREATE OR REPLACE FUNCTION create_gamification_row()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
INSERT INTO gamification(student_id)
VALUES(NEW.id);
RETURN NEW;
END;
$$;

CREATE TRIGGER student_gamification_init
AFTER INSERT
ON students
FOR EACH ROW
EXECUTE FUNCTION create_gamification_row();


CREATE OR REPLACE FUNCTION check_full_attendance_for_certificate()
RETURNS TRIGGER AS $$
BEGIN

    IF NEW.certificate_status = 'issued' THEN

        IF EXISTS (
            SELECT 1
            FROM attendance a
            JOIN schedule s ON a.schedule_id = s.id
            JOIN course_class cc ON s.course_class_id = cc.id
            WHERE a.student_id = NEW.student_id
              AND cc.course_id = NEW.course_id
              AND a.attendance_status = FALSE
        ) THEN
            RAISE EXCEPTION 
            'Нельзя выдать сертификат: у студента есть пропуски на курсе';
        END IF;

    END IF;

    RETURN NEW;

END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_full_attendance_for_certificate
BEFORE INSERT OR UPDATE ON student_certificate
FOR EACH ROW
EXECUTE FUNCTION check_full_attendance_for_certificate();





