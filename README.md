# Sigma.Novosibirsk

Веб-платформа для летней научно-образовательной школы «Сигма.Новосибирск». Проект объединяет регистрацию участников, курсы, расписание, посещаемость, достижения, сертификаты и внеучебную геймификацию в одном интерфейсе для студентов, преподавателей и организаторов.

## Содержание

- [О проекте](#о-проекте)
- [Основные возможности](#основные-возможности)
- [Технологии](#технологии)
- [Структура проекта](#структура-проекта)
- [Локальный запуск](#локальный-запуск)
- [Продакшен-конфигурация](#продакшен-конфигурация)
- [Как пользоваться проектом](#как-пользоваться-проектом)
- [Тестирование](#тестирование)
- [Вклад в проект](#вклад-в-проект)
- [Лицензия](#лицензия)

## О проекте

Sigma.Novosibirsk решает организационные задачи сезонной школы:

- хранит данные об участниках, преподавателях и курсах;
- показывает актуальное расписание по слотам и сезонам;
- позволяет отмечать посещаемость и выдавать достижения;
- поддерживает работу с сертификатами и медиа через S3-совместимое хранилище;
- даёт организаторам инструменты для внеучебной активности, команд и баллов.

Проект разделён на два основных приложения:

- `frontend` — клиентское приложение на React/Vite;
- `backend` — API и бизнес-логика на FastAPI.

## Основные возможности

- Регистрация и авторизация пользователей.
- Кабинет студента с курсами, расписанием и баллами.
- Интерфейсы преподавателя для посещаемости и достижений.
- Организаторские экраны для сезонов, команд и внеучебной активности.
- OpenAPI-документация для API.
- Поддержка фоновых задач через Celery и Redis.

## Технологии

- Frontend: React, Vite, TanStack Router, TanStack Query, Axios
- Backend: FastAPI, SQLAlchemy, Alembic, Pydantic
- Data layer: PostgreSQL, Redis
- Background jobs: Celery
- Infrastructure: Docker Compose, Nginx
- Integrations: SMTP, S3-compatible storage

## Структура проекта

```text
.
├── backend/                  # FastAPI API, модели, миграции, тесты
│   ├── alembic/              # Alembic migrations
│   ├── app/                  # модули приложения
│   ├── db/                   # SQL и seed-скрипты
│   ├── tests/                # backend tests
│   └── docker-compose.yml    # локальная инфраструктура backend + db + redis
├── frontend/                 # React/Vite client
├── docker-compose.yml        # root wrapper для backend/docker-compose.yml
├── docker-compose.prod.yml   # production compose-конфигурация
├── .env.example              # root env для frontend/top-level tooling
└── .env.prod.example         # пример root env для production
```

## Локальный запуск

### Требования

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) или совместимый Docker runtime
- Node.js 20+
- npm

### 1. Запуск backend и инфраструктуры

Из корня репозитория:

```bash
docker compose up -d --build
```

Или напрямую из папки `backend`:

```bash
cd backend
cp .env.example .env
docker compose up -d --build
```

После запуска будут доступны:

| Сервис | Адрес |
|---|---|
| API | [http://localhost:8000](http://localhost:8000) |
| Swagger UI | [http://localhost:8000/docs](http://localhost:8000/docs) |
| PostgreSQL | `localhost:5433` |
| Redis | `localhost:6380` |
| Mailpit | [http://localhost:8025](http://localhost:8025) |

Проверка health endpoint:

```bash
curl http://localhost:8000/health
```

Ожидаемый ответ:

```json
{"status":"ok"}
```

### 2. Настройка frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend по умолчанию будет доступен на [http://localhost:5173](http://localhost:5173).

Минимально важные переменные в `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_URL=http://localhost:5173
VITE_DEFAULT_SEASON_ID=1
```

### 3. Полезные env-файлы

- `backend/.env.example` — локальная конфигурация backend
- `backend/.env.prod.example` — production-конфигурация backend
- `.env.example` — root-конфигурация для frontend/top-level tooling
- `.env.prod.example` — root-конфигурация production-сборки

### 4. Остановка локального окружения

```bash
docker compose down
```

## Продакшен-конфигурация

Для production в репозитории есть отдельный файл `docker-compose.prod.yml`.

Общий сценарий:

```bash
cp .env.prod.example .env
cp backend/.env.prod.example backend/.env.prod
docker compose -f docker-compose.prod.yml up -d --build
```

Перед запуском production обязательно проверьте:

- `VITE_API_BASE_URL`
- `FRONTEND_PORT`
- `BACKEND_PORT`
- `BACKEND_ENV_FILE`
- `DATABASE_URL`
- `JWT_SECRET`
- `CORS_ALLOW_ORIGINS`
- SMTP-настройки
- S3-настройки

## Как пользоваться проектом

### Для разработчиков

- Backend API: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`
- Frontend app: `http://localhost:5173`

### Для пользователей системы

В проекте есть роли:

- **Студент** — личный кабинет, расписание, курсы, баллы, внеучебка
- **Преподаватель** — посещаемость, достижения, работа со своими курсами
- **Организатор** — сезоны, активности, команды, рейтинг, администрирование

Если вам нужны тестовые учётные записи, создавайте их локально через интерфейс регистрации или через соответствующие API-эндпоинты. Тестовые пароли не стоит хранить в публичном README.

## Тестирование

В актуальной версии проекта есть backend-тесты на базовые правила безопасности и парольную политику.

Запуск:

```bash
cd backend
pytest -q
```

Если frontend собирается без ошибок, это тоже полезная проверка перед деплоем:

```bash
cd frontend
npm run build
```

## Вклад в проект

Если вы развиваете проект внутри команды:

1. Создайте отдельную ветку от актуальной `main`.
2. Вносите изменения небольшими и понятными коммитами.
3. Перед merge проверьте локальный запуск backend и frontend.
4. Для backend-изменений прогоните `pytest -q`.
5. Для frontend-изменений проверьте `npm run build`.

Если проект будет открыт для внешних contributions, сюда можно добавить отдельный `CONTRIBUTING.md`.

## Лицензия

Проект распространяется под лицензией MIT. Подробности смотрите в файле [LICENSE](LICENSE).
