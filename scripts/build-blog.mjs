#!/usr/bin/env node
// Builds the static blog HTML from Markdown sources in blog/posts/.
// Usage: node scripts/build-blog.mjs [--drafts]
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { marked } from "marked";
import { BLOG_OUT_DIR, loadPosts } from "./lib/posts.mjs";
import { render } from "./lib/template.mjs";

const TEMPLATES_DIR = path.join(BLOG_OUT_DIR, "templates");
const includeDrafts = process.argv.includes("--drafts");

const DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function tagsHtml(tags) {
  return tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("\n    ");
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildPost(post, template) {
  const html = render(template, {
    TITLE: escapeHtml(post.title),
    SUMMARY: escapeHtml(post.summary),
    OG_IMAGE: post.cover ?? "",
    DATE_HUMAN: DATE_FORMATTER.format(post.date),
    TAGS_HTML: tagsHtml(post.tags),
    CONTENT: marked.parse(post.body),
    ROOT: "../../",
    BLOG_INDEX: "../index.html",
  });

  const outDir = path.join(BLOG_OUT_DIR, post.slug);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(path.join(outDir, "index.html"), html);
  console.log(`  built blog/${post.slug}/index.html`);
}

function postCardHtml(post) {
  return `<a class="post-card" href="${post.slug}/index.html">
    <div class="date">${DATE_FORMATTER.format(post.date)}</div>
    <h2>${escapeHtml(post.title)}</h2>
    <p>${escapeHtml(post.summary)}</p>
    <div class="tags">${tagsHtml(post.tags)}</div>
  </a>`;
}

function buildIndex(posts, template) {
  const postsHtml =
    posts.length > 0
      ? posts.map(postCardHtml).join("\n  ")
      : '<div class="empty">Nenhum post publicado ainda.</div>';

  const html = render(template, {
    POSTS_HTML: postsHtml,
    ROOT: "../",
  });

  writeFileSync(path.join(BLOG_OUT_DIR, "index.html"), html);
  console.log("  built blog/index.html");
}

function main() {
  const posts = loadPosts({ includeDrafts });
  console.log(`Found ${posts.length} post(s)${includeDrafts ? " (including drafts)" : ""}.`);

  const postTemplate = readFileSync(path.join(TEMPLATES_DIR, "post.html.tmpl"), "utf8");
  const indexTemplate = readFileSync(path.join(TEMPLATES_DIR, "index.html.tmpl"), "utf8");

  for (const post of posts) {
    buildPost(post, postTemplate);
  }
  buildIndex(posts, indexTemplate);

  console.log("Blog build complete.");
}

try {
  main();
} catch (err) {
  console.error("Blog build failed:", err.message);
  process.exit(1);
}
