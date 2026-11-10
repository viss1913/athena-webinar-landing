/**
 * Regenerate landing visuals via OpenRouter ChatGPT Image 2
 * (same path as IDE: POST /images, model openai/gpt-image-2).
 *
 * Usage:
 *   node assets/_gen_images.mjs
 *   node assets/_gen_images.mjs card-sites.png
 *
 * Prompts (human-readable): assets/IMAGE_PROMPTS.md
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(__dirname, "mockups");
const REFS = path.join(__dirname, "refs");

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const raw of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    )
      v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnv(path.join(ROOT, ".env"));
loadEnv(
  path.join(ROOT, "..", "IDE", "apps", "api", ".env.production.immers"),
);

const API_KEY = (
  process.env.OPENROUTER_API_KEY ||
  process.env.LLM_API_KEY ||
  ""
).trim();
const BASE = (
  process.env.LLM_BASE_URL ||
  "https://openrouter.ai/api/v1"
).replace(/\/$/, "");
const MODEL = process.env.OPENROUTER_IMAGE_MODEL || "openai/gpt-image-2";

if (!API_KEY) {
  console.error("No OPENROUTER_API_KEY in .env");
  process.exit(1);
}

function toDataUrl(filePath) {
  const buf = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mime =
    ext === ".png"
      ? "image/png"
      : ext === ".webp"
        ? "image/webp"
        : "image/jpeg";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

async function generate({
  file,
  prompt,
  aspect = "16:9",
  quality = "high",
  refs = [],
}) {
  const input_references = refs
    .filter((p) => fs.existsSync(p))
    .slice(0, 4)
    .map((p) => ({
      type: "image_url",
      image_url: { url: toDataUrl(p) },
    }));

  const bodies = [
    {
      model: MODEL,
      prompt,
      aspect_ratio: aspect,
      quality,
      n: 1,
      ...(input_references.length ? { input_references } : {}),
    },
    {
      model: MODEL,
      prompt,
      aspect_ratio: aspect,
      n: 1,
      ...(input_references.length ? { input_references } : {}),
    },
  ];

  let lastErr;
  for (const body of bodies) {
    try {
      console.log(`→ ${file} (${aspect}, refs=${input_references.length})`);
      const res = await fetch(`${BASE}/images`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:8765",
          "X-Title": "Athena Webinar Image Gen",
        },
        body: JSON.stringify(body),
      });
      const raw = await res.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(`bad_json_${res.status}: ${raw.slice(0, 200)}`);
      }
      if (!res.ok) {
        throw new Error(
          `http_${res.status}: ${JSON.stringify(data).slice(0, 300)}`,
        );
      }
      const row = (data.data || [])[0];
      let buf;
      if (row?.b64_json) {
        buf = Buffer.from(row.b64_json, "base64");
      } else if (row?.url) {
        const img = await fetch(row.url);
        buf = Buffer.from(await img.arrayBuffer());
      } else {
        throw new Error("no_image_in_response");
      }
      const dest = path.join(OUT, file);
      fs.writeFileSync(dest, buf);
      console.log(`✓ ${file} (${buf.length} bytes)`);
      return dest;
    } catch (e) {
      lastErr = e;
      console.warn(`retry/fail ${file}: ${e.message?.slice(0, 220)}`);
    }
  }
  throw lastErr || new Error("generate_failed");
}

const STYLE = [
  "Apple marketing aesthetic, ultra clean soft daylight, premium SaaS landing page,",
  "crisp high-detail UI mockups, soft shadows, light gray #F5F5F7 background,",
  "no watermarks, no compression artifacts.",
  "CRITICAL: all visible interface labels, headlines, buttons and chat messages",
  "must be in correct natural Russian language (Cyrillic). No English UI copy",
  "except code identifiers / file names inside an IDE when needed.",
].join(" ");

const jobs = [
  {
    file: "hero-glass-clean.png",
    aspect: "16:9",
    refs: [path.join(REFS, "1.jpg")],
    prompt: `${STYLE} Hero background only: large liquid glass / crystal ribbon sculptures framing left and right edges of a light gray #F5F5F7 canvas, soft prismatic edge highlights, frosted transparency, empty center for typography. No text, no logos, no UI. Photoreal 3D render matching Apple keynote glass.`,
  },
  {
    file: "card-sites.png",
    aspect: "4:3",
    refs: [path.join(REFS, "2.jpg")],
    prompt: `${STYLE} Close-up floating Mac browser window mockup of a Russian portfolio website. URL bar: myportfolio.ru. Navigation in Russian: О нас · Проекты · Контакты. Big Russian headline: «Создавай больше». Subline: «Идеи. Проекты. Возможности.» Black pill CTA in Russian: «Узнать больше →». Right side: modern architecture house photo. Soft shadow on light gray. Product card crop only.`,
  },
  {
    file: "card-chatbots.png",
    aspect: "4:3",
    refs: [path.join(REFS, "2.jpg")],
    prompt: `${STYLE} Close-up messenger / AI chat UI mockup for a landing feature card. Left icon sidebar. Clean white rounded window with soft shadow. User bubble (Russian): «Как сделать лендинг за вечер?» AI reply bubble (Russian): «Отличный вопрос! Опишите, какой сайт вам нужен — и я помогу его создать.» Small spark/AI icon. No English chat text.`,
  },
  {
    file: "card-smm.png",
    aspect: "4:3",
    refs: [path.join(REFS, "2.jpg")],
    prompt: `${STYLE} Close-up content calendar dashboard mockup. Header in Russian: «Контент-план · Июль 2026». Calendar grid with one highlighted day. Three post preview cards with Telegram / YouTube / Instagram style icons and green checkmarks. Soft white card, soft shadow. UI labels in Russian (Статус, Готово, Публикация).`,
  },
  {
    file: "card-backend.png",
    aspect: "4:3",
    refs: [path.join(REFS, "2.jpg")],
    prompt: `${STYLE} Close-up dark admin database dashboard mockup. Title in Russian: «База данных». Sidebar labels in Russian: Данные · Аналитика · Настройки · Логи. Table columns in Russian: ID · Имя · Статус. Rows with Russian names, green active status dots, tiny sparkline. Modern developer console look, soft shadow.`,
  },
  {
    file: "tool-cursor.png",
    aspect: "4:3",
    refs: [path.join(REFS, "3.jpg")],
    prompt: `${STYLE} High-fidelity Cursor IDE window mockup, light theme, soft drop shadow. File tree with App.tsx. React/TypeScript code in editor may be English. AI chat sidebar text in Russian: «Давай добавим красивый счётчик?» and reply «Готово! Добавлен компонент с интерактивным счётчиком.» Mini preview with 0 and blue button «+1».`,
  },
  {
    file: "tool-codex.png",
    aspect: "4:3",
    refs: [path.join(REFS, "3.jpg")],
    prompt: `${STYLE} High-fidelity OpenAI Codex / agent task UI mockup, light clean window. Checklist in Russian: ✓ Добавить аналитику для пользовательских планов; ✓ Анализирую кодовую базу; ✓ Планирую изменения; ● Вношу изменения…; ○ Проверяю результаты. Below: small green code diff (code may be English). Soft shadow.`,
  },
  {
    file: "tool-vscode.png",
    aspect: "4:3",
    refs: [path.join(REFS, "3.jpg")],
    prompt: `${STYLE} High-fidelity Visual Studio Code dark theme window. File tree + TypeScript code (English identifiers OK). Bottom terminal: «Vite ready in 300ms → localhost:5173». Soft shadow product screenshot.`,
  },
  {
    file: "shift-compare.png",
    aspect: "16:9",
    refs: [path.join(REFS, "4.jpg")],
    prompt: `${STYLE} Wide composition, premium marketing visual. LEFT: light ChatGPT-style chat. User (Russian): «Создай сайт для моей студии». AI (Russian): «Конечно! Я создам современный сайт для вашей студии.» CENTER arrow → RIGHT: dark IDE with file tree, React code, live preview. Preview headline in Russian: «Твоя студия для больших идей». Button: «Начать работу». Soft shadows.`,
  },
  {
    file: "launch-flow.png",
    aspect: "16:9",
    refs: [path.join(REFS, "5.jpg")],
    prompt: `${STYLE} Wide process illustration on white / light gray. LEFT: sticky note with handwritten Russian «Моя идея». MIDDLE: floating AI chat + database + cloud icons. ARROW → RIGHT: laptop + phone mockups of finished mountain website. Screen headline in Russian: «Создавай больше». Subline: «Твой цифровой продукт сегодня». Yellow CTA: «Начать». Soft shadows, lots of white space.`,
  },
];

const only = process.argv[2]?.trim();
const queue = only
  ? jobs.filter((j) => j.file === only || j.file.replace(/\.[^.]+$/, "") === only)
  : jobs;

if (!queue.length) {
  console.error(`Unknown image "${only}". See assets/IMAGE_PROMPTS.md`);
  process.exit(1);
}

fs.mkdirSync(OUT, { recursive: true });

for (const job of queue) {
  try {
    await generate(job);
  } catch (e) {
    console.error(`✗ ${job.file}: ${e.message}`);
  }
}

console.log("done");
