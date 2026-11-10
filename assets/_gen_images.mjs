/**
 * Regenerate landing visuals via OpenRouter ChatGPT Image 2
 * (same path as IDE: POST /images, model openai/gpt-image-2).
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
  console.error("No OPENROUTER_API_KEY");
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

const STYLE =
  "Apple marketing aesthetic, ultra clean, soft daylight, premium SaaS landing, crisp UI, high detail, no watermarks, no Cyrillic text artifacts, no blurry compression";

const jobs = [
  {
    file: "hero-glass-clean.png",
    aspect: "16:9",
    refs: [path.join(REFS, "1.jpg")],
    prompt: `${STYLE}. Hero background only: large liquid glass / crystal ribbon sculptures framing left and right edges of a light gray #F5F5F7 canvas, soft prismatic edge highlights, frosted transparency, empty center for typography, no text, no logos, no UI, photoreal 3D render matching Apple keynote glass.`,
  },
  {
    file: "card-sites.jpg",
    aspect: "4:3",
    refs: [path.join(REFS, "2.jpg")],
    prompt: `${STYLE}. Close-up of a floating Mac browser window mockup for a portfolio site myportfolio.ru: white UI, traffic lights, modern architecture house photo hero, headline area, black pill CTA. Soft shadow on light gray. No surrounding page chrome, just the polished product card visual.`,
  },
  {
    file: "card-chatbots.jpg",
    aspect: "4:3",
    refs: [path.join(REFS, "2.jpg")],
    prompt: `${STYLE}. Close-up messenger / AI chat UI mockup card: left icon sidebar, blue user bubble and white AI reply bubble with spark icon, clean white rounded window, soft shadow. Product screenshot look for a landing feature card.`,
  },
  {
    file: "card-smm.jpg",
    aspect: "4:3",
    refs: [path.join(REFS, "2.jpg")],
    prompt: `${STYLE}. Close-up content calendar dashboard mockup: header content plan, calendar grid with highlighted day, three social preview cards with Telegram YouTube Instagram style icons and green checkmarks. Soft white card, soft shadow.`,
  },
  {
    file: "card-backend.jpg",
    aspect: "4:3",
    refs: [path.join(REFS, "2.jpg")],
    prompt: `${STYLE}. Close-up dark admin database dashboard mockup: dark sidebar, table of users with green active status dots, tiny sparkline chart, modern developer console aesthetic, soft shadow.`,
  },
  {
    file: "tool-cursor.jpg",
    aspect: "4:3",
    refs: [path.join(REFS, "3.jpg")],
    prompt: `${STYLE}. High fidelity Cursor IDE window mockup: light theme, file tree, React TypeScript code, AI chat sidebar suggesting a counter, mini UI preview with +1 button. Soft drop shadow, slightly floating. Label-ready product screenshot.`,
  },
  {
    file: "tool-codex.jpg",
    aspect: "4:3",
    refs: [path.join(REFS, "3.jpg")],
    prompt: `${STYLE}. High fidelity OpenAI Codex / agent task UI mockup: checklist with completed steps and one in-progress spinner, green code diff snippet below. Clean light window, soft shadow.`,
  },
  {
    file: "tool-vscode.jpg",
    aspect: "4:3",
    refs: [path.join(REFS, "3.jpg")],
    prompt: `${STYLE}. High fidelity Visual Studio Code dark theme window: file tree, TypeScript code, bottom terminal showing Vite ready localhost. Soft shadow product screenshot.`,
  },
  {
    file: "shift-compare.jpg",
    aspect: "16:9",
    refs: [path.join(REFS, "4.jpg")],
    prompt: `${STYLE}. Wide composition: left light ChatGPT-style chat window (user asks to create a studio website), arrow in the middle, right dark IDE with file tree, React code, live website preview. Soft shadows, premium product marketing visual.`,
  },
  {
    file: "launch-flow.jpg",
    aspect: "16:9",
    refs: [path.join(REFS, "5.jpg")],
    prompt: `${STYLE}. Wide process illustration: sticky note idea on left, floating AI chat + database + cloud icons in middle, arrow to laptop and phone mockups showing a finished mountain landscape website with yellow Start button. Soft shadows, lots of white space, premium SaaS marketing.`,
  },
];

fs.mkdirSync(OUT, { recursive: true });

for (const job of jobs) {
  try {
    await generate(job);
  } catch (e) {
    console.error(`✗ ${job.file}: ${e.message}`);
  }
}

console.log("done");
