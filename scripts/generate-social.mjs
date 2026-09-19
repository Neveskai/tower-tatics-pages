#!/usr/bin/env node
// For each new/changed post in blog/posts/, generates ready-to-post captions
// for LinkedIn/X/Instagram/Facebook via the Claude API, plus a share card
// (delegated to generate-card.mjs). Writes everything into
// blog/social/<slug>/ and is skipped for posts whose source hasn't changed
// since the last run (tracked via a sha256 hash file).
//
// Usage: ANTHROPIC_API_KEY=... node scripts/generate-social.mjs [--force]
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import * as z from "zod/v4";
import { generateCard } from "./generate-card.mjs";
import { loadPosts, socialDirFor, sourceHash } from "./lib/posts.mjs";
import { PLATFORMS } from "./lib/platforms.mjs";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-5";
const force = process.argv.includes("--force");

const CaptionsSchema = z.object({
  linkedin: z.string().describe(PLATFORMS.linkedin.guidance),
  twitter: z.string().describe(PLATFORMS.twitter.guidance),
  instagram: z.string().describe(PLATFORMS.instagram.guidance),
  instagram_hashtags: z
    .array(z.string())
    .describe("5 a 15 hashtags para o Instagram, sem o caractere #"),
  facebook: z.string().describe(PLATFORMS.facebook.guidance),
});

function hashPath(slug) {
  return path.join(socialDirFor(slug), ".source-hash");
}

function needsRegeneration(post) {
  if (force) return true;
  const hf = hashPath(post.slug);
  if (!existsSync(hf)) return true;
  const previous = readFileSync(hf, "utf8").trim();
  return previous !== sourceHash(post);
}

function buildPrompt(post) {
  const platformSpecs = Object.entries(PLATFORMS)
    .map(([key, spec]) => `- ${spec.label} (${key}): ${spec.guidance}`)
    .join("\n");

  return `Você é o ghostwriter de redes sociais de um engenheiro de software solo que documenta, em português (pt-BR), como está construindo o jogo "Tower Tactics 3D" (tower defense 3D para Android, feito em Godot) usando workflows de desenvolvimento com IA.

Abaixo está um post do blog de engenharia dele. Transforme o conteúdo desse post em legendas prontas para postar em cada rede social, adaptando tom e formato:

${platformSpecs}

Todas as legendas devem:
- Ser escritas em português (pt-BR), na voz do próprio autor (primeira pessoa).
- Refletir fielmente o conteúdo técnico do post, sem inventar detalhes que não estão nele.
- Terminar (quando fizer sentido) convidando a pessoa a ler o post completo, sem incluir a URL (ela é adicionada depois).

---
Título: ${post.title}
Resumo: ${post.summary}
Tags: ${post.tags.join(", ")}

Corpo do post:
${post.body}
---`;
}

async function generateCaptions(client, post) {
  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 4096,
    messages: [{ role: "user", content: buildPrompt(post) }],
    output_config: {
      format: zodOutputFormat(CaptionsSchema),
    },
  });

  if (!response.parsed_output) {
    throw new Error(`Claude failed to return parseable captions for "${post.slug}"`);
  }

  const captions = response.parsed_output;
  if (captions.twitter.length > PLATFORMS.twitter.maxChars) {
    console.warn(
      `  warning: X/Twitter caption for "${post.slug}" is ${captions.twitter.length} chars, truncating to ${PLATFORMS.twitter.maxChars}`,
    );
    captions.twitter = captions.twitter.slice(0, PLATFORMS.twitter.maxChars - 1) + "…";
  }

  return captions;
}

function writeCaptionFiles(post, captions) {
  const outDir = socialDirFor(post.slug);
  mkdirSync(outDir, { recursive: true });

  writeFileSync(path.join(outDir, "captions.json"), JSON.stringify(captions, null, 2) + "\n");
  writeFileSync(path.join(outDir, "linkedin.txt"), captions.linkedin + "\n");
  writeFileSync(path.join(outDir, "twitter.txt"), captions.twitter + "\n");

  const igHashtags = captions.instagram_hashtags.map((t) => `#${t}`).join(" ");
  writeFileSync(
    path.join(outDir, "instagram.txt"),
    `${captions.instagram}\n\n${igHashtags}\n`,
  );

  writeFileSync(
    path.join(outDir, "facebook.txt"),
    `${captions.facebook}\n\n(Nota: sem API pública para postar em perfil pessoal do Facebook — copie e cole manualmente.)\n`,
  );
}

async function processPost(client, post) {
  console.log(`Processing "${post.slug}"...`);
  const captions = await generateCaptions(client, post);
  writeCaptionFiles(post, captions);
  await generateCard(post);
  writeFileSync(hashPath(post.slug), sourceHash(post));
  console.log(`  done: blog/social/${post.slug}/`);
}

async function main() {
  const posts = loadPosts({ includeDrafts: false });
  const pending = posts.filter(needsRegeneration);

  if (pending.length === 0) {
    console.log("No posts changed since last run. Nothing to do.");
    return;
  }

  console.log(`${pending.length} post(s) to (re)generate social content for.`);
  const client = new Anthropic();

  for (const post of pending) {
    await processPost(client, post);
  }

  console.log("Social content generation complete.");
}

try {
  await main();
} catch (err) {
  console.error("Social content generation failed:", err.message);
  process.exit(1);
}
