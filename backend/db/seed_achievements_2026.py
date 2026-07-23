from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass
from pathlib import Path

from sqlalchemy import create_engine, text

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.config import settings


FREE_LISTENER_NAME = "Free listener"


@dataclass(frozen=True)
class AchievementTemplate:
    name: str
    description: str
    icon_image_key: str
    score: int = 3


ACHIEVEMENT_TEMPLATES: tuple[AchievementTemplate, ...] = (
    AchievementTemplate(
        name="Самый любопытный",
        description="Задавал больше всего вопросов",
        icon_image_key="media/achievements/1/самый-любопытный.png",
    ),
    AchievementTemplate(
        name="Самый необычный вопрос",
        description="Задал самый необычный вопрос на уроке",
        icon_image_key="media/achievements/1/самый-необычный-вопрос.png",
    ),
    AchievementTemplate(
        name="Помощник",
        description="Помог преподавателю открыть окно (или просто кому-то помог)",
        icon_image_key="media/achievements/1/помощник.png",
    ),
    AchievementTemplate(
        name="Душа компании",
        description="Без него сегодняшний урок было бы трудно провести",
        icon_image_key="media/achievements/1/душа-компании.png",
    ),
    AchievementTemplate(
        name="Интеллигент",
        description="Самая интересная мысль урока",
        icon_image_key="media/achievements/1/интеллигент.png",
    ),
    AchievementTemplate(
        name="Digital детокс",
        description="Вообще не сидел в телефоне",
        icon_image_key="media/achievements/1/digital-детокс.png",
    ),
    AchievementTemplate(
        name="Активист",
        description="Отвечал больше всех на вопросы",
        icon_image_key="media/achievements/1/активист.png",
    ),
    AchievementTemplate(
        name="Ждун",
        description="После урока оставался побеседовать с преподавателем",
        icon_image_key="media/achievements/1/ждун.png",
    ),
    AchievementTemplate(
        name="Дежа вю",
        description="Вспомнил что-то с прошлого занятия в нужный момент",
        icon_image_key="media/achievements/1/дежа-вю.png",
    ),
    AchievementTemplate(
        name="Полицейский",
        description="Помог поддержать тишину в классе",
        icon_image_key="media/achievements/1/полицейский.png",
    ),
    AchievementTemplate(
        name="Разрушитель стереотипов",
        description="Удивил преподавателя неожиданным взглядом на тему",
        icon_image_key="media/achievements/1/разрушитель-стереотипов.png",
    ),
    AchievementTemplate(
        name="Постоянный",
        description="Ни разу не опоздал за всё время",
        icon_image_key="media/achievements/1/полицейский.png",
    ),
    AchievementTemplate(
        name="Коллекционер",
        description="Собрал больше всех ачивок",
        icon_image_key="media/achievements/1/самый-любопытный.png",
    ),
    AchievementTemplate(
        name="Эволюция",
        description="Заметный прогресс от первого занятия к последнему (по мнению препода)",
        icon_image_key="media/achievements/1/разрушитель-стереотипов.png",
    ),
    AchievementTemplate(
        name="Самый любознательный",
        description="Больше всего задавал вопросов за курс",
        icon_image_key="media/achievements/1/самый-любопытный.png",
    ),
    AchievementTemplate(
        name="Летописец",
        description="Самый подробный конспект",
        icon_image_key="media/achievements/1/интеллигент.png",
    ),
)


CANONICAL_GROUPS_SQL = text(
    """
    SELECT
        season_id,
        title,
        course_type,
        course_duration,
        MIN(id) AS canonical_course_id
    FROM course
    WHERE course_status = 'Published'
    GROUP BY season_id, title, course_type, course_duration
    ORDER BY MIN(id) ASC
    """
)

GROUP_COURSE_IDS_SQL = text(
    """
    SELECT id
    FROM course
    WHERE season_id = :season_id
      AND title = :title
      AND course_type IS NOT DISTINCT FROM :course_type
      AND course_duration IS NOT DISTINCT FROM :course_duration
    ORDER BY id ASC
    """
)

MATCHING_ACHIEVEMENTS_SQL = text(
    """
    SELECT id, course_id, season_id, achievement_description, achievement_score, icon_image_key
    FROM achievement
    WHERE course_id = ANY(:course_ids)
      AND achievement_name = :achievement_name
    ORDER BY id ASC
    """
)

FREE_LISTENER_SQL = text(
    """
    SELECT id
    FROM achievement
    WHERE course_id = ANY(:course_ids)
      AND achievement_name = :achievement_name
    ORDER BY id ASC
    """
)

ASSIGNMENTS_BY_ACHIEVEMENT_SQL = text(
    """
    SELECT id, student_id
    FROM student_achievement
    WHERE achievement_id = :achievement_id
    ORDER BY id ASC
    """
)

ASSIGNMENT_CONFLICT_SQL = text(
    """
    SELECT id
    FROM student_achievement
    WHERE student_id = :student_id
      AND achievement_id = :achievement_id
    LIMIT 1
    """
)

DELETE_ASSIGNMENT_SQL = text("DELETE FROM student_achievement WHERE id = :id")
DELETE_ACHIEVEMENT_SQL = text("DELETE FROM achievement WHERE id = :id")

INSERT_ACHIEVEMENT_SQL = text(
    """
    INSERT INTO achievement (
        achievement_name,
        achievement_description,
        course_id,
        achievement_score,
        season_id,
        icon_image_key
    ) VALUES (
        :achievement_name,
        :achievement_description,
        :course_id,
        :achievement_score,
        :season_id,
        :icon_image_key
    )
    """
)

UPDATE_ACHIEVEMENT_SQL = text(
    """
    UPDATE achievement
    SET achievement_description = :achievement_description,
        course_id = :course_id,
        achievement_score = :achievement_score,
        season_id = :season_id,
        icon_image_key = :icon_image_key
    WHERE id = :id
    """
)

REASSIGN_ACHIEVEMENT_SQL = text(
    """
    UPDATE student_achievement
    SET achievement_id = :achievement_id
    WHERE id = :id
    """
)


def seed_achievements(*, apply_changes: bool) -> None:
    engine = create_engine(settings.database_url)
    created_count = 0
    updated_count = 0
    deleted_count = 0
    reassigned_count = 0

    with engine.connect() as conn:
        transaction = conn.begin()
        groups = conn.execute(CANONICAL_GROUPS_SQL).mappings().all()

        for group in groups:
            course_ids = [
                row.id
                for row in conn.execute(
                    GROUP_COURSE_IDS_SQL,
                    {
                        "season_id": group["season_id"],
                        "title": group["title"],
                        "course_type": group["course_type"],
                        "course_duration": group["course_duration"],
                    },
                )
            ]
            canonical_course_id = group["canonical_course_id"]

            free_listener_rows = conn.execute(
                FREE_LISTENER_SQL,
                {
                    "course_ids": course_ids,
                    "achievement_name": FREE_LISTENER_NAME,
                },
            ).mappings().all()
            for achievement in free_listener_rows:
                assignments = conn.execute(
                    ASSIGNMENTS_BY_ACHIEVEMENT_SQL,
                    {"achievement_id": achievement["id"]},
                ).mappings().all()
                reassigned_count += len(assignments)
                deleted_count += 1
                if not apply_changes:
                    continue
                for assignment in assignments:
                    conn.execute(DELETE_ASSIGNMENT_SQL, {"id": assignment["id"]})
                conn.execute(DELETE_ACHIEVEMENT_SQL, {"id": achievement["id"]})

            for template in ACHIEVEMENT_TEMPLATES:
                matching = conn.execute(
                    MATCHING_ACHIEVEMENTS_SQL,
                    {
                        "course_ids": course_ids,
                        "achievement_name": template.name,
                    },
                ).mappings().all()

                if not matching:
                    created_count += 1
                    if apply_changes:
                        conn.execute(
                            INSERT_ACHIEVEMENT_SQL,
                            {
                                "achievement_name": template.name,
                                "achievement_description": template.description,
                                "course_id": canonical_course_id,
                                "achievement_score": template.score,
                                "season_id": group["season_id"],
                                "icon_image_key": template.icon_image_key,
                            },
                        )
                    continue

                primary = matching[0]
                needs_update = any(
                    [
                        primary["achievement_description"] != template.description,
                        primary["course_id"] != canonical_course_id,
                        primary["achievement_score"] != template.score,
                        primary["season_id"] != group["season_id"],
                        primary["icon_image_key"] != template.icon_image_key,
                    ]
                )
                if needs_update:
                    updated_count += 1
                    if apply_changes:
                        conn.execute(
                            UPDATE_ACHIEVEMENT_SQL,
                            {
                                "id": primary["id"],
                                "achievement_description": template.description,
                                "course_id": canonical_course_id,
                                "achievement_score": template.score,
                                "season_id": group["season_id"],
                                "icon_image_key": template.icon_image_key,
                            },
                        )

                for duplicate in matching[1:]:
                    duplicate_assignments = conn.execute(
                        ASSIGNMENTS_BY_ACHIEVEMENT_SQL,
                        {"achievement_id": duplicate["id"]},
                    ).mappings().all()
                    for assignment in duplicate_assignments:
                        conflict = conn.execute(
                            ASSIGNMENT_CONFLICT_SQL,
                            {
                                "student_id": assignment["student_id"],
                                "achievement_id": primary["id"],
                            },
                        ).first()
                        reassigned_count += 1
                        if not apply_changes:
                            continue
                        if conflict is None:
                            conn.execute(
                                REASSIGN_ACHIEVEMENT_SQL,
                                {
                                    "id": assignment["id"],
                                    "achievement_id": primary["id"],
                                },
                            )
                        else:
                            conn.execute(DELETE_ASSIGNMENT_SQL, {"id": assignment["id"]})

                    deleted_count += 1
                    if apply_changes:
                        conn.execute(DELETE_ACHIEVEMENT_SQL, {"id": duplicate["id"]})

        if apply_changes:
            transaction.commit()
        else:
            transaction.rollback()

    print(
        {
            "mode": "apply" if apply_changes else "dry-run",
            "templates": len(ACHIEVEMENT_TEMPLATES),
            "created": created_count,
            "updated": updated_count,
            "deleted": deleted_count,
            "reassigned_assignments": reassigned_count,
        }
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Persist the changes instead of printing a dry run")
    args = parser.parse_args()
    seed_achievements(apply_changes=args.apply)
