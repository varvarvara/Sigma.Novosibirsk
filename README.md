# Sigma.Novosibirsk

Веб-платформа летней научно-образовательной школы «Сигма.Новосибирск»: курсы, расписание, посещаемость, баллы и геймификация.

**Стек:** React (Vite) + FastAPI + PostgreSQL (+ Redis, Celery).

## Быстрый локальный запуск

### Требования

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Node.js 20+

### 1. Инфраструктура и API

```bash
cd backend
cp .env.example .env   # при первом запуске
docker compose up -d --build
```

Проверка API:

```bash
curl http://localhost:8000/health
# {"status":"ok"}
```

Документация API: http://localhost:8000/docs

| Сервис    | Адрес              |
|-----------|--------------------|
| API       | http://localhost:8000 |
| PostgreSQL | `localhost:5433` (логин/пароль/БД: `sigma`) |
| Redis     | `localhost:6380`   |

Из корня репозитория то же самое:

```bash
./scripts/dev-up.sh
# или
docker compose up -d --build
```

### 2. Frontend (мобильный UI в браузере)

```bash
cd frontend
cp .env.example .env   # при первом запуске
npm install
npm install @pbe/react-yandex-maps --legacy-peer-deps # (Библиотека для работы Яндекс карт)
npm run dev
```

Приложение: **http://localhost:5173**

В `.env` frontend:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_DEFAULT_SEASON_ID=1
```

### 3. Вход для проверки

Если аккаунт уже создан:

- Email: `varvara.demo@gmail.com`
- Пароль: `SigmaDemo2026`
- Роль: **Студент**

Регистрация нового студента: экран «Зарегистрироваться» или `POST /users/students/signup`.

## Структура проекта

```
backend/     # FastAPI, SQLAlchemy, Alembic, Celery
frontend/    # React + Vite + TanStack Router
scripts/     # dev-up.sh
```

## Остановка

```bash
cd backend && docker compose down
```

## Роли

- **Студент** — профиль, курсы, расписание, баллы, внеучебка
- **Преподаватель** — API готово, UI частично
- **Организатор** — геймификация (API + часть UI)
