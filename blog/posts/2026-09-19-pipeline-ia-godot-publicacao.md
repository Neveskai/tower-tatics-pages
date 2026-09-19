---
title: "Como uso IA para automatizar a publicação e o marketing do Tower Tactics 3D"
date: 2026-09-19
summary: "Por dentro do pipeline que transforma um post em Markdown neste blog em legendas prontas pra LinkedIn, X, Instagram e Facebook — sem framework, sem auto-publish, e com humano no loop."
tags: [ia, ci-cd, github-actions, automacao, godot]
draft: false
---
Esse é o primeiro post desse blog, e ele é sobre o próprio blog — parece meio recursivo, mas faz sentido: o objetivo aqui é documentar como estou construindo o Tower Tactics 3D usando IA em cada parte do processo, e a própria pipeline de marketing é um pedaço disso.

## O problema

Eu sou engenheiro de software, não sou "cara de redes sociais". A parte de engenharia do jogo — Godot, arquitetura, pipeline de assets, publicação — eu domino bem. Mas construir audiência, postar com constância em quatro redes diferentes, adaptar tom por plataforma... isso não é o meu forte, e não é onde eu quero gastar energia manualmente todo dia.

Então a pergunta virou: como eu automatizo o máximo possível disso, sem perder qualidade e sem abrir mão de revisar o que vai pro ar?

## A decisão: sem framework, sem auto-publish

Duas decisões guiaram o design:

1. **Nada de static site generator.** O site já era HTML puro, sem build, sem dependência nenhuma. Trocar isso por um Jekyll ou 11ty resolveria problemas que eu não tenho. Então o blog é Markdown com frontmatter, convertido por um script Node pequeno (sem framework de template, só substituição de `{{VAR}}`) que reaproveita o mesmo CSS do site principal.

2. **Sem publicação automática nas redes.** O pipeline gera o conteúdo pronto — legenda por rede + imagem de card — mas quem aperta o botão de publicar sou eu. Um post errado no ar é muito mais caro de corrigir do que os 30 segundos que leva pra eu revisar antes de postar.

## Como funciona, ponta a ponta

Quando eu escrevo um post novo em `blog/posts/*.md` e dou push:

- Um workflow builda o Markdown em HTML estático e publica no GitHub Pages via GitHub Actions.
- Um segundo workflow detecta que aquele post mudou (comparando o hash do conteúdo, não o git diff — assim funciona igual localmente e no CI), manda o texto pra API da Claude pedindo legendas adaptadas pra LinkedIn, X, Instagram e Facebook, e gera uma imagem de compartilhamento (card 1200x630) com Playwright, tirando um screenshot de um template HTML com a mesma identidade visual do site.
- O resultado — os quatro textos e a imagem — fica commitado direto no repositório, em `blog/social/<slug>/`, pronto pra eu abrir no celular e copiar/colar.

Uma chamada de API só, cobrindo as quatro plataformas de uma vez, pedindo uma saída estruturada — assim o tom fica consistente entre elas e eu não preciso parsear texto livre.

## O que vem depois

Esse pipeline cobre a minha marca pessoal de engenharia. A conta institucional do jogo (mais focada em vídeo, anúncio de lançamento, novidades) é uma etapa separada — ainda não conectada a essa automação, mas o design já deixa a porta aberta pra isso: a lógica de geração de legenda não tem nada de "voz pessoal" hardcoded, é tudo parâmetro.

Auto-publicar via API de cada rede também é um passo natural depois que eu validar que o conteúdo gerado tem a qualidade que eu quero — mas por enquanto, revisão manual é intencional, não uma limitação temporária que eu quero remover o quanto antes.
