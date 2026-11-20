/**
 * Date With Me AI Assistant — chat API
 *
 * Vercel serverless function. It receives chat messages from the Blogger
 * widget, calls the configured AI provider, and returns the reply.
 *
 * The API key lives ONLY in a Vercel environment variable. It is never sent
 * to the browser and never appears in frontend code.
 *
 * Supported providers (set CHAT_PROVIDER):
 *   gemini — Google Gemini API via Google AI Studio (default)
 *   groq   — Groq API, OpenAI compatible (fallback)
 *
 * The system prompt below is the embedded copy of
 * knowledge/system-prompt.md. That file is the source of truth. If you edit
 * it, update the SYSTEM_PROMPT constant here too.
 *
 * Environment variables (see .env.example):
 *   GEMINI_API_KEY, GEMINI_MODEL (default gemini-2.5-flash)
 *   GROQ_API_KEY, GROQ_MODEL (default llama-3.3-70b-versatile)
 *   CHAT_PROVIDER (gemini or groq, default gemini)
 *   CHAT_ALLOWED_ORIGIN (default https://comedatewithmeguys.blogspot.com)
 *   CHAT_RATE_LIMIT_PER_10_MIN (default 30)
 */

const SYSTEM_PROMPT = `You are the Date With Me AI Assistant, a friendly AI dating and relationship adviser on the Date With Me blog. You help adults with dating, attraction, communication, romance, relationships and emotional connection. You are knowledgeable, respectful, understanding and practical. You sound like a helpful relationship adviser, not like a salesperson and not like a robot.

How to answer:
- Answer the visitor's actual question first, before anything else.
- Give practical, balanced advice in plain natural English. Short paragraphs, two to four at most. Specific steps beat vague encouragement.
- Ask one gentle follow up question when extra context would improve your answer. Do not interrogate the visitor.
- Do not give the same generic answer to every visitor. Tailor your reply to what they actually said.
- If you do not know something, say so plainly instead of guessing.
- Never ask the visitor for passwords, payment details, addresses, phone numbers or other personal information.

Writing style:
- Use commas and full stops. Do not use dashes of any kind, and do not use AI symbols or decorative characters.
- Do not use emojis.
- Keep replies concise enough to read on a phone.

Safety rules (mandatory):
- Never encourage manipulation, stalking, coercion, jealousy games, harassment or emotional abuse. If a visitor describes doing any of these, explain plainly that it is not acceptable and suggest a respectful approach instead.
- Never claim to diagnose mental health conditions and never provide therapy. You may suggest that speaking with a qualified counsellor or therapist can help.
- If a visitor mentions abuse, threats, self harm or immediate danger, take it seriously. Encourage them to seek appropriate professional or emergency support right away, and give the relevant helpline for their country where you know it: United States 988 Suicide and Crisis Lifeline, Canada 988, United Kingdom Samaritans 116 123, Australia Lifeline 13 11 14. Do not try to counsel them through a crisis yourself.
- Do not repeat or endorse hateful, harassing or sexually explicit content. If a request is inappropriate or unsafe, decline briefly and offer a helpful alternative topic.

The Date With Me eBook. Verified facts only. Do not invent chapters, bonuses, features, testimonials, reviews, promises or results.
- Title: Date With Me. Price: $9.99. Format: one PDF file, 42 pages, about 6,740 words, instant download after purchase. Digital only, nothing is posted.
- It has 13 chapters, each with a "Try This Today" action. Chapters run from "Know Yourself Before You Date Anyone" through "Building a Love That Lasts", plus an opening "Before We Begin" and a closing "Letter to You".
- Tagline: "Love Better. Understand Deeper. Heal Stronger."
- It offers honest guidance for modern dating, meaningful relationships, heartbreak and emotional growth. No tricks, and no rules that promise to make someone fall for you.
- Purchase link: https://letsgrowtogethor.gumroad.com/l/date-with-me
- Disclaimer: it offers general guidance on everyday relationship situations. It is not a substitute for professional counselling, medical or legal advice.

Recommendation rules:
- Recommend the eBook only when its verified content genuinely matches the visitor's question, for example dating confidence, communication, attraction, first dates, emotional connection or healing after a breakup.
- If the visitor asks an unrelated question, answer normally and do not mention the book.
- If the visitor asks about the book directly, describe it using the verified facts above and offer the purchase link.
- Never force a recommendation into every conversation. Never interrupt useful advice with an advertisement. Never say buying is necessary to get help. Never promise that buying will find them love or a partner. Never use fake scarcity, countdowns or invented testimonials.
- At most one recommendation per conversation unless the visitor asks about the book again.
- When you decide a recommendation fits, end your reply with the marker [EBOOK] on its own line. The website will turn that marker into a purchase card. Do not include the purchase link in your reply text, and do not write the marker anywhere else.

Related reading on the blog. You may suggest one of these published Date With Me articles when it genuinely fits the visitor's question. Use the exact title and URL.
- "The Fine Art of the First Impression" — https://comedatewithmeguys.blogspot.com/2026/06/the-fine-art-of-first-impression.html
- "The No Contact Rule After a Breakup: How It Works and When to Use It" — https://comedatewithmeguys.blogspot.com/2026/11/no-contact-rule-after-breakup.html
- "How to Keep Romance Alive in a Long-Term Relationship" — https://comedatewithmeguys.blogspot.com/2026/11/how-to-keep-romance-alive-long-term-relationship.html
- "Signs You Are Ready for Marriage (And Signs You Are Not Yet)" — https://comedatewithmeguys.blogspot.com/2026/11/signs-you-are-ready-for-marriage.html
- "How to Tell If a Guy Likes You: 12 Signs That Actually Mean Something" — https://comedatewithmeguys.blogspot.com/2026/11/how-to-tell-if-a-guy-likes-you.html
- "How to Write a Dating Profile That Gets Matches" — https://comedatewithmeguys.blogspot.com/2026/11/how-to-write-a-dating-profile-that-gets-matches.html
- "How to Have Difficult Conversations in a Relationship" — https://comedatewithmeguys.blogspot.com/2026/11/how-to-have-difficult-conversations-in-a-relationship.html
- "How to Move On After a Breakup When You Still Love Them" — https://comedatewithmeguys.blogspot.com/2026/11/how-to-move-on-after-a-breakup-when-you-still-love-them.html
- "The Complete First-Date Playbook: From First Message to Follow-Up Text" — https://comedatewithmeguys.blogspot.com/2026/11/complete-first-date-playbook.html
- "How Often Should You Text When Dating?" — https://comedatewithmeguys.blogspot.com/2026/11/how-often-should-you-text-when-dating.html
- "How to Move On After a Breakup: A Complete Healing Guide" — https://comedatewithmeguys.blogspot.com/2026/11/how-to-move-on-after-a-breakup-complete-healing-guide.html
- "Signs You Are Over Your Ex" — https://comedatewithmeguys.blogspot.com/2026/11/signs-you-are-over-your-ex.html
- "The Complete Guide to Healthy Communication in a Relationship" — https://comedatewithmeguys.blogspot.com/2026/11/complete-guide-to-healthy-communication-in-a-relationship.html
Do not invent article titles or URLs. If no article fits, do not suggest one.`;

const FALLBACK_REPLY =
  "I am not able to answer that one safely. I can help with dating, attraction, communication, relationships and emotional connection instead. What would you like help with?";

const BUSY_REPLY =
  "I am getting a lot of questions right now. Please try again in a moment.";

/* Basic per IP rate limiting. In memory only, so it resets when the
   function cold starts. It stops casual abuse, it is not a full firewall. */
const rateLimits = new Map();

function isRateLimited(ip, limit, windowMs) {
  const now = Date.now();
  const entry = rateLimits.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count += 1;
  if (entry.count > limit) return true;
  return false;
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return (req.socket && req.socket.remoteAddress) || "unknown";
}

function validMessages(body) {
  if (!body || !Array.isArray(body.messages)) return null;
  if (body.messages.length < 1 || body.messages.length > 20) return null;
  const cleaned = [];
  for (const m of body.messages) {
    if (!m || typeof m.content !== "string") return null;
    if (m.role !== "user" && m.role !== "assistant") return null;
    const content = m.content.trim().slice(0, 1000);
    if (!content) return null;
    cleaned.push({ role: m.role, content });
  }
  return cleaned;
}

/* Gemini needs strictly alternating user and model turns, so merge any
   consecutive messages from the same side into one. */
function mergeTurns(messages) {
  const merged = [];
  for (const m of messages) {
    const last = merged[merged.length - 1];
    if (last && last.role === m.role) {
      last.content += "\n" + m.content;
    } else {
      merged.push({ role: m.role, content: m.content });
    }
  }
  return merged;
}

async function callGemini(messages) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    const error = new Error("GEMINI_API_KEY is not set");
    error.code = "missing_key";
    throw error;
  }
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/" +
    encodeURIComponent(model) +
    ":generateContent?key=" +
    encodeURIComponent(key);
  const contents = mergeTurns(messages).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: { temperature: 0.7, topP: 0.9, maxOutputTokens: 600 },
    }),
  });
  if (response.status === 429) {
    const error = new Error("Gemini rate limit reached");
    error.code = "rate_limited";
    throw error;
  }
  if (!response.ok) {
    const error = new Error("Gemini request failed with status " + response.status);
    error.code = "provider_error";
    throw error;
  }
  const data = await response.json();
  if (data.promptFeedback && data.promptFeedback.blockReason) {
    return { reply: FALLBACK_REPLY, blocked: true };
  }
  const parts = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts;
  const text = Array.isArray(parts)
    ? parts.map((p) => p.text || "").join("").trim()
    : "";
  if (!text) {
    const error = new Error("Gemini returned an empty reply");
    error.code = "provider_error";
    throw error;
  }
  return { reply: text, blocked: false };
}

async function callGroq(messages) {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    const error = new Error("GROQ_API_KEY is not set");
    error.code = "missing_key";
    throw error;
  }
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + key,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      temperature: 0.7,
      max_tokens: 600,
    }),
  });
  if (response.status === 429) {
    const error = new Error("Groq rate limit reached");
    error.code = "rate_limited";
    throw error;
  }
  if (!response.ok) {
    const error = new Error("Groq request failed with status " + response.status);
    error.code = "provider_error";
    throw error;
  }
  const data = await response.json();
  const text =
    data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
      ? data.choices[0].message.content.trim()
      : "";
  if (!text) {
    const error = new Error("Groq returned an empty reply");
    error.code = "provider_error";
    throw error;
  }
  return { reply: text, blocked: false };
}

function setCors(req, res) {
  const allowed = process.env.CHAT_ALLOWED_ORIGIN || "https://comedatewithmeguys.blogspot.com";
  const origin = req.headers.origin;
  if (origin === allowed) {
    res.setHeader("Access-Control-Allow-Origin", allowed);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  setCors(req, res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method === "GET") {
    res.status(200).json({ status: "ok", provider: process.env.CHAT_PROVIDER || "gemini" });
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const limit = parseInt(process.env.CHAT_RATE_LIMIT_PER_10_MIN || "30", 10);
  if (isRateLimited(getClientIp(req), limit, 10 * 60 * 1000)) {
    res.status(429).json({ error: "rate_limited", reply: BUSY_REPLY });
    return;
  }

  const messages = validMessages(req.body);
  if (!messages) {
    res.status(400).json({ error: "invalid_messages" });
    return;
  }

  try {
    const provider = process.env.CHAT_PROVIDER || "gemini";
    const result =
      provider === "groq" ? await callGroq(messages) : await callGemini(messages);

    let reply = result.reply;
    let recommendEbook = false;
    if (reply.includes("[EBOOK]")) {
      recommendEbook = true;
      reply = reply.replace(/\[EBOOK\]/g, "").replace(/\n{3,}/g, "\n\n").trim();
    }

    res.status(200).json({ reply, recommendEbook });
  } catch (error) {
    if (error.code === "rate_limited") {
      res.status(503).json({ error: "busy", reply: BUSY_REPLY });
      return;
    }
    if (error.code === "missing_key") {
      res.status(503).json({ error: "not_configured" });
      return;
    }
    res.status(503).json({ error: "unavailable" });
  }
}
