#!/usr/bin/env node
// Renders blog/templates/card.html.tmpl for a single post and screenshots it
// to a 1200x630 PNG share card via headless Chromium (Playwright).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { BLOG_OUT_DIR, socialDirFor } from "./lib/posts.mjs";
import { render } from "./lib/template.mjs";

const REPO_ROOT = path.resolve(import.meta.dirname, "..");
const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function iconDataUri() {
  const iconPath = path.join(REPO_ROOT, "app_icon_192.png");
  const base64 = readFileSync(iconPath).toString("base64");
  return `data:image/png;base64,${base64}`;
}

export async function generateCard(post) {
  const template = readFileSync(
    path.join(BLOG_OUT_DIR, "templates", "card.html.tmpl"),
    "utf8",
  );
  const html = render(template, {
    TITLE: escapeHtml(post.title),
    SUMMARY: escapeHtml(post.summary),
    ICON_DATA_URI: iconDataUri(),
  });

  const outDir = socialDirFor(post.slug);
  mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "card.png");

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: CARD_WIDTH, height: CARD_HEIGHT },
    });
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.screenshot({ path: outPath });
  } finally {
    await browser.close();
  }

  console.log(`  generated ${path.relative(REPO_ROOT, outPath)}`);
  return outPath;
}

// Allow running standalone: node scripts/generate-card.mjs <slug>
if (import.meta.url === `file://${process.argv[1]}`) {
  const { loadPosts } = await import("./lib/posts.mjs");
  const slug = process.argv[2];
  if (!slug) {
    console.error("Usage: node scripts/generate-card.mjs <slug>");
    process.exit(1);
  }
  const post = loadPosts({ includeDrafts: true }).find((p) => p.slug === slug);
  if (!post) {
    console.error(`No post found with slug "${slug}"`);
    process.exit(1);
  }
  await generateCard(post);
}
