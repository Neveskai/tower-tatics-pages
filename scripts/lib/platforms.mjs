// Per-platform guidance for caption generation. Deliberately data, not logic:
// kept separate from generate-social.mjs so a future second content stream
// (e.g. the game's own institutional account) can reuse the generation core
// with a different voice/spec table instead of a rewrite.
export const PLATFORMS = {
  linkedin: {
    label: "LinkedIn",
    guidance:
      "Tom profissional de engenharia, em primeira pessoa. Pode ser mais longo " +
      "(alvo de ~1300-1900 caracteres), com quebras de linha para facilitar a " +
      "leitura. Termine com 3-5 hashtags técnicas relevantes.",
    maxChars: null,
  },
  twitter: {
    label: "X/Twitter",
    guidance:
      "Direto e forte, uma ideia só. Sem enrolação. No máximo 1-2 hashtags.",
    maxChars: 280,
  },
  instagram: {
    label: "Instagram",
    guidance:
      "Legenda mais casual mas ainda técnica, com uso moderado de emoji. " +
      "As hashtags vão separadas em `instagram_hashtags` (5 a 15 tags), não " +
      "dentro do texto da legenda.",
    maxChars: null,
  },
  facebook: {
    label: "Facebook",
    guidance:
      "Tom parecido com o LinkedIn mas mais casual, um pouco mais curto. " +
      "Nota: o Facebook não tem API pública para postar no perfil pessoal — " +
      "esta legenda é só para copiar/colar manualmente.",
    maxChars: null,
  },
};
