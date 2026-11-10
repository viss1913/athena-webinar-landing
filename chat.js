(() => {
  "use strict";

  const root = document.querySelector("[data-ai-chat]");
  if (!root) return;

  const openBtn = root.querySelector("[data-ai-open]");
  const closeBtn = root.querySelector("[data-ai-close]");
  const panel = root.querySelector("[data-ai-panel]");
  const thread = root.querySelector("[data-ai-thread]");
  const form = root.querySelector("[data-ai-form]");
  const input = root.querySelector("[data-ai-input]");
  const sendBtn = root.querySelector("[data-ai-send]");
  const chips = root.querySelector("[data-ai-chips]");

  const GREETING =
    "Привет! Я Athena — помогу разобраться с мини-курсом по вайбкодингу: программа, инструменты, с чего начать и как записаться. Что хотите узнать?";

  /** @type {{ role: 'user' | 'assistant'; content: string }[]} */
  let messages = [{ role: "assistant", content: GREETING }];
  let busy = false;

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function inline(s) {
    let t = esc(s);
    t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
    t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    t = t.replace(
      /(^|[\s(])(https?:\/\/[^\s<]+)/g,
      (_, lead, url) => {
        const clean = url.replace(/[),.;]+$/, "");
        const tail = url.slice(clean.length);
        return `${lead}<a href="${clean}" target="_blank" rel="noopener noreferrer">${clean}</a>${tail}`;
      },
    );
    return t;
  }

  function renderMarkdown(src) {
    const lines = String(src || "").replace(/\r\n/g, "\n").split("\n");
    const out = [];
    const para = [];
    let i = 0;
    const flush = () => {
      if (!para.length) return;
      out.push(`<p>${inline(para.join(" "))}</p>`);
      para.length = 0;
    };
    while (i < lines.length) {
      const trim = lines[i].trim();
      if (!trim) {
        flush();
        i += 1;
        continue;
      }
      if (/^[-*]\s+/.test(trim)) {
        flush();
        const items = [];
        while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
          items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
          i += 1;
        }
        out.push(
          `<ul>${items.map((t) => `<li>${inline(t)}</li>`).join("")}</ul>`,
        );
        continue;
      }
      para.push(trim);
      i += 1;
    }
    flush();
    return out.join("");
  }

  function render() {
    thread.replaceChildren();
    messages.forEach((msg) => {
      const art = document.createElement("article");
      art.className = `ai-msg ${msg.role}`;
      const bubble = document.createElement("div");
      bubble.className = "ai-bubble";
      if (msg.role === "user") bubble.textContent = msg.content;
      else bubble.innerHTML = renderMarkdown(msg.content);
      art.appendChild(bubble);
      thread.appendChild(art);
    });
    thread.scrollTop = thread.scrollHeight;
  }

  function setOpen(open) {
    if (!panel || !openBtn) return;
    if (open) panel.removeAttribute("hidden");
    else panel.setAttribute("hidden", "");
    openBtn.setAttribute("aria-expanded", open ? "true" : "false");
    openBtn.classList.toggle("is-hidden", open);
    root.classList.toggle("is-open", open);
    if (open) {
      render();
      input.focus({ preventScroll: true });
    } else {
      openBtn.focus({ preventScroll: true });
    }
  }

  function setBusy(state) {
    busy = state;
    sendBtn.disabled = state;
    input.disabled = state;
    chips?.querySelectorAll("button").forEach((b) => {
      b.disabled = state;
    });
  }

  async function ask(text) {
    const content = String(text || "").trim();
    if (!content || busy) return;

    messages.push({ role: "user", content });
    if (chips) chips.hidden = true;
    render();
    setBusy(true);

    const pending = document.createElement("article");
    pending.className = "ai-msg assistant";
    pending.innerHTML = '<div class="ai-bubble ai-pending">Печатаю…</div>';
    thread.appendChild(pending);
    thread.scrollTop = thread.scrollHeight;

    try {
      const history = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-16);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json().catch(() => ({}));
      pending.remove();
      if (!res.ok || !data.reply) {
        throw new Error(data.detail || data.error || "request_failed");
      }
      messages.push({ role: "assistant", content: String(data.reply) });
      render();
    } catch (err) {
      pending.remove();
      const detail = err instanceof Error ? err.message : String(err);
      messages.push({
        role: "assistant",
        content:
          "Сейчас не удалось получить ответ. Проверьте, что сайт открыт через локальный сервер (`node server.mjs`), и попробуйте ещё раз.\n\n`" +
          detail.slice(0, 120) +
          "`",
      });
      render();
    } finally {
      setBusy(false);
      input.focus();
    }
  }

  openBtn?.addEventListener("click", () => setOpen(true));
  closeBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && root.classList.contains("is-open")) {
      setOpen(false);
    }
  });

  chips?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-chip]");
    if (!btn) return;
    ask(btn.textContent || "");
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value;
    input.value = "";
    input.style.height = "";
    ask(text);
  });

  input?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form?.requestSubmit();
    }
  });

  input?.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
  });

  render();
})();
