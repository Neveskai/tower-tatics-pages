import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const REPO_ROOT = path.resolve(import.meta.dirname, "..", "..");
export const POSTS_DIR = path.join(REPO_ROOT, "blog", "posts");
export const BLOG_OUT_DIR = path.join(REPO_ROOT, "blog");

// Filenames look like YYYY-MM-DD-some-slug.md. The date prefix keeps
// directory listings/git log in chronological order; the actual slug
// (and therefore output URL) defaults to whatever follows it, but can be
// overridden by an explicit `slug` in frontmatter.
const FILENAME_RE = /^(\d{4}-\d{2}-\d{2})-(.+)\.md$/;

function slugFromFilename(filename) {
  const match = FILENAME_RE.exec(filename);
  if (!match) {
    throw new Error(
      `Post filename "${filename}" must match YYYY-MM-DD-slug.md`,
    );
  }
  return match[2];
}

function validateFrontmatter(data, filename) {
  const required = ["title", "date", "summary"];
  const missing = required.filter((key) => !data[key]);
  if (missing.length > 0) {
    throw new Error(
      `Post "${filename}" is missing required frontmatter field(s): ${missing.join(", ")}`,
    );
  }
}

// Reads and parses every *.md file in blog/posts/.
export function loadPosts({ includeDrafts = false } = {}) {
  const filenames = readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));

  const posts = filenames.map((filename) => {
    const filePath = path.join(POSTS_DIR, filename);
    const raw = readFileSync(filePath, "utf8");
    const { data, content } = matter(raw);
    validateFrontmatter(data, filename);

    const slug = data.slug ?? slugFromFilename(filename);

    return {
      filename,
      filePath,
      slug,
      title: data.title,
      date: new Date(data.date),
      dateRaw: data.date,
      summary: data.summary,
      tags: data.tags ?? [],
      cover: data.cover ?? null,
      draft: Boolean(data.draft),
      body: content,
    };
  });

  const filtered = includeDrafts ? posts : posts.filter((p) => !p.draft);
  return filtered.sort((a, b) => b.date - a.date);
}
