# Athena — лендинг мини-курса по вайбкодингу

Статический лендинг + локальный сервер с ИИ-чатом (Gemini 2.5 Flash через OpenRouter / Railway relay).

## Быстрый старт

```bash
# 1. Ключи (не коммитятся)
cp .env.example .env
# Впиши OPENROUTER_API_KEY=...  или OPENROUTER_RELAY_SECRET=...

# 2. Запуск
node server.mjs
```

Открой http://127.0.0.1:8765/

## Структура

| Файл | Назначение |
|------|------------|
| `index.html` | Разметка лендинга |
| `styles.css` | Стили (десктоп + адаптив) |
| `app.js` | Навигация, форма записи, анимации |
| `chat.js` | Виджет чата Athena |
| `server.mjs` | Статика + `POST /api/chat` |
| `assets/mockups/` | Картинки секций |
| `assets/refs/` | Исходные макеты дизайна |
| `assets/_gen_images.mjs` | Перегенерация картинок через gpt-image-2 |

## ИИ-чат

- Модель: `google/gemini-2.5-flash`
- Предпочтительно: Railway relay (`OPENROUTER_RELAY_SECRET` + `OPENROUTER_RELAY_BASE`)
- Fallback: прямой OpenRouter (`OPENROUTER_API_KEY`)
- Промпт системный — в `server.mjs`

## Что можно доделать

- Фото и био преподавателя (`#teacher`)
- Реальные отзывы
- Бэкенд формы записи / Telegram URL в `app.js` (`EXTERNAL_SIGNUP_URL`)
- Положить `OPENROUTER_RELAY_SECRET` в `.env` для relay как в IDE
