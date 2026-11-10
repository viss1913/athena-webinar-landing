# Промпты для картинок лендинга Athena

Модель: **`openai/gpt-image-2`** через OpenRouter (`POST /images`, quality `high`).  
Референсы макетов: `assets/refs/1.jpg` … `5.jpg`.

**Важно:** весь видимый UI-текст на мокапах — **на русском**. Английский только в коде/именах файлов IDE, если это уместно.

## Запуск

```bash
cp .env.example .env
# OPENROUTER_API_KEY=sk-or-...

node assets/_gen_images.mjs
```

Опционально одна картинка:

```bash
node assets/_gen_images.mjs card-sites.png
```

---

## Общий стиль (добавляется ко всем промптам)

```
Apple marketing aesthetic, ultra clean soft daylight, premium SaaS landing page,
crisp high-detail UI mockups, soft shadows, light gray #F5F5F7 background,
no watermarks, no compression artifacts.
CRITICAL: all visible interface labels, headlines, buttons and chat messages
must be in correct natural Russian language (Cyrillic). No English UI copy
except code identifiers / file names inside an IDE when needed.
```

---

## 1. `hero-glass-clean.png` — фон hero

- Aspect: `16:9`
- Ref: `refs/1.jpg`
- Текст: **нет**

```
Hero background only: large liquid glass / crystal ribbon sculptures framing
left and right edges of a light gray #F5F5F7 canvas, soft prismatic edge
highlights, frosted transparency, empty center for typography.
No text, no logos, no UI. Photoreal 3D render matching Apple keynote glass.
```

---

## 2. `card-sites.png` — карточка «Сайты»

- Aspect: `4:3`
- Ref: `refs/2.jpg`

```
Close-up floating Mac browser window mockup of a Russian portfolio website.
URL bar: myportfolio.ru
Navigation in Russian: О нас · Проекты · Контакты
Big Russian headline: «Создавай больше»
Subline: «Идеи. Проекты. Возможности.»
Black pill CTA in Russian: «Узнать больше →»
Right side: modern architecture house photo.
Soft shadow on light gray. Product card crop only, no outer landing chrome.
```

---

## 3. `card-chatbots.png` — карточка «ИИ-чат-боты»

- Aspect: `4:3`
- Ref: `refs/2.jpg`

```
Close-up messenger / AI chat UI mockup for a landing feature card.
Left icon sidebar. Clean white rounded window with soft shadow.
User bubble (Russian): «Как сделать лендинг за вечер?»
AI reply bubble (Russian): «Отличный вопрос! Опишите, какой сайт вам нужен —
и я помогу его создать.»
Small spark/AI icon. No English chat text.
```

---

## 4. `card-smm.png` — карточка «SMM и продвижение»

- Aspect: `4:3`
- Ref: `refs/2.jpg`

```
Close-up content calendar dashboard mockup.
Header in Russian: «Контент-план · Июль 2026»
Calendar grid with one highlighted day.
Three post preview cards with Telegram / YouTube / Instagram style icons
and green checkmarks. Soft white card, soft shadow.
UI labels in Russian (Статус, Готово, Публикация).
```

---

## 5. `card-backend.png` — карточка «Backend и базы данных»

- Aspect: `4:3`
- Ref: `refs/2.jpg`

```
Close-up dark admin database dashboard mockup.
Title in Russian: «База данных»
Sidebar labels in Russian: Данные · Аналитика · Настройки · Логи
Table columns in Russian: ID · Имя · Статус
Rows with Russian names, green active status dots, tiny sparkline.
Modern developer console look, soft shadow.
```

---

## 6. `tool-cursor.png` — Cursor

- Aspect: `4:3`
- Ref: `refs/3.jpg`

```
High-fidelity Cursor IDE window mockup, light theme, soft drop shadow.
File tree with App.tsx. React/TypeScript code in editor is fine in English.
AI chat sidebar text in Russian:
User/AI: «Давай добавим красивый счётчик?»
AI reply: «Готово! Добавлен компонент с интерактивным счётчиком.»
Mini preview with number 0 and blue button «+1».
Floating product screenshot look.
```

---

## 7. `tool-codex.png` — Codex / агенты

- Aspect: `4:3`
- Ref: `refs/3.jpg`

```
High-fidelity OpenAI Codex / agent task UI mockup, light clean window.
Checklist in Russian:
✓ Добавить аналитику для пользовательских планов
✓ Анализирую кодовую базу
✓ Планирую изменения
● Вношу изменения…
○ Проверяю результаты
Below: small green code diff snippet (code may be English).
Soft shadow.
```

---

## 8. `tool-vscode.png` — VS Code

- Aspect: `4:3`
- Ref: `refs/3.jpg`

```
High-fidelity Visual Studio Code dark theme window.
File tree + TypeScript code (English identifiers OK).
Bottom terminal: «Vite ready in 300ms → localhost:5173»
Soft shadow product screenshot. Minimal English UI chrome only.
```

---

## 9. `shift-compare.png` — чат → IDE

- Aspect: `16:9`
- Ref: `refs/4.jpg`

```
Wide composition, premium marketing visual.
LEFT: light ChatGPT-style chat.
User (Russian): «Создай сайт для моей студии»
AI (Russian): «Конечно! Я создам современный сайт для вашей студии.»
CENTER: arrow →
RIGHT: dark IDE with file tree, React code, live preview.
Preview headline in Russian: «Твоя студия для больших идей»
Button in Russian: «Начать работу»
Soft shadows.
```

---

## 10. `launch-flow.png` — идея → запуск

- Aspect: `16:9`
- Ref: `refs/5.jpg`

```
Wide process illustration on white / light gray.
LEFT: sticky note with handwritten Russian «Моя идея»
MIDDLE: floating AI chat + database + cloud icons
ARROW →
RIGHT: laptop + phone mockups of finished mountain website.
Screen headline in Russian: «Создавай больше»
Subline: «Твой цифровой продукт сегодня»
Yellow CTA button: «Начать»
Soft shadows, lots of white space, premium SaaS marketing.
```

---

## Замечание по текущим ассетам

Сейчас в `assets/mockups/` часть картинок с английским UI — это баг первой генерации.  
Перегенерируй скриптом выше и замени файлы с теми же именами (пути в `index.html` уже на `.png`).
