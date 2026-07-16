-- Демо-данные для страницы «Внеучебная активность».
-- Рейтинг команд и начисления появятся у всех студентов;
-- карточка «Моя команда» — только если студент есть в extracurricular_team_members.
--
-- Запуск (подставьте свои host/db/user):
--   psql "$DATABASE_URL" -f backend/db/seed_extracurricular_demo.sql
--
-- Демо-аккаунт varvara.demo@gmail.com по умолчанию НЕ в команде (только рейтинг).
-- Чтобы увидеть карточку команды, раскомментируйте блок в конце файла.

BEGIN;

DELETE FROM extracurricular_score
WHERE team_id IN (
    SELECT id FROM extracurricular_team
    WHERE ex_team_number IN (901, 902, 903)
);

DELETE FROM extracurricular_team_members
WHERE team_id IN (
    SELECT id FROM extracurricular_team
    WHERE ex_team_number IN (901, 902, 903)
);

DELETE FROM extracurricular_team
WHERE ex_team_number IN (901, 902, 903);

DELETE FROM extracurricular_activity
WHERE ex_course_name IN (
    'Демо: Квиз по истории',
    'Демо: Командный квест',
    'Демо: Дебаты'
);

DO $$
DECLARE
    v_season_id INT := 1;
    v_staff_id INT;
    v_team1_id INT;
    v_team2_id INT;
    v_team3_id INT;
    v_act1_id INT;
    v_act2_id INT;
    v_act3_id INT;
    v_students INT[];
    v_demo_id INT;
BEGIN
    SELECT id INTO v_staff_id FROM staff ORDER BY id LIMIT 1;
    IF v_staff_id IS NULL THEN
        RAISE EXCEPTION 'Нет staff — сначала создайте преподавателя';
    END IF;

    SELECT ARRAY_AGG(id ORDER BY id)
    INTO v_students
    FROM (
        SELECT id FROM students ORDER BY id LIMIT 6
    ) s;

    IF v_students IS NULL OR array_length(v_students, 1) < 4 THEN
        RAISE EXCEPTION 'Нужно минимум 4 студента в таблице students';
    END IF;

    SELECT id INTO v_demo_id FROM students WHERE email = 'varvara.demo@gmail.com';

    INSERT INTO extracurricular_activity (ex_course_name, staff_id, ex_course_score, season_id)
    VALUES
        ('Демо: Квиз по истории', v_staff_id, 120, v_season_id),
        ('Демо: Командный квест', v_staff_id, 80, v_season_id),
        ('Демо: Дебаты', v_staff_id, 50, v_season_id);

    SELECT id INTO v_act1_id FROM extracurricular_activity WHERE ex_course_name = 'Демо: Квиз по истории';
    SELECT id INTO v_act2_id FROM extracurricular_activity WHERE ex_course_name = 'Демо: Командный квест';
    SELECT id INTO v_act3_id FROM extracurricular_activity WHERE ex_course_name = 'Демо: Дебаты';

    INSERT INTO extracurricular_team (ex_team_number, ex_team_name, season_id)
    VALUES
        (901, 'Сигма-альфа', v_season_id),
        (902, 'Новосибирские лисы', v_season_id),
        (903, 'Квантовый отряд', v_season_id);

    SELECT id INTO v_team1_id FROM extracurricular_team WHERE ex_team_number = 901;
    SELECT id INTO v_team2_id FROM extracurricular_team WHERE ex_team_number = 902;
    SELECT id INTO v_team3_id FROM extracurricular_team WHERE ex_team_number = 903;

    -- Команда 1: студенты 1–2 (без демо-аккаунта)
    INSERT INTO extracurricular_team_members (team_id, student_id, season_id)
    VALUES
        (v_team1_id, v_students[1], v_season_id),
        (v_team1_id, v_students[2], v_season_id);

    -- Команда 2: студенты 3–4
    INSERT INTO extracurricular_team_members (team_id, student_id, season_id)
    VALUES
        (v_team2_id, v_students[3], v_season_id),
        (v_team2_id, v_students[4], v_season_id);

    -- Команда 3: студенты 5–6 (если есть)
    IF array_length(v_students, 1) >= 5 THEN
        INSERT INTO extracurricular_team_members (team_id, student_id, season_id)
        VALUES (v_team3_id, v_students[5], v_season_id);
    END IF;
    IF array_length(v_students, 1) >= 6 THEN
        INSERT INTO extracurricular_team_members (team_id, student_id, season_id)
        VALUES (v_team3_id, v_students[6], v_season_id);
    END IF;

    -- Баллы команд (триггер пересчитает gamification.extracurricular_score)
    INSERT INTO extracurricular_score (team_id, ex_course_id, ex_team_score, season_id)
    VALUES
        (v_team1_id, v_act1_id, 120, v_season_id),
        (v_team1_id, v_act2_id, 80, v_season_id),
        (v_team2_id, v_act1_id, 90, v_season_id),
        (v_team2_id, v_act3_id, 50, v_season_id),
        (v_team3_id, v_act2_id, 70, v_season_id),
        (v_team3_id, v_act3_id, 50, v_season_id);

    RAISE NOTICE 'Демо внеучебки загружена. Команды: 901/902/903. Демо-id: %', v_demo_id;
END $$;

-- Раскомментируйте, чтобы varvara.demo@gmail.com попала в команду и увидела карточку:
-- INSERT INTO extracurricular_team_members (team_id, student_id, season_id)
-- SELECT t.id, s.id, 1
-- FROM extracurricular_team t, students s
-- WHERE t.ex_team_number = 901 AND s.email = 'varvara.demo@gmail.com'
-- ON CONFLICT DO NOTHING;

COMMIT;
