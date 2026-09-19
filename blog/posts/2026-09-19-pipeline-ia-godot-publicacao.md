---
title: "Como construí o blog de engenharia do Tower Tactics 3D"
date: 2026-09-19
summary: "Por dentro do pipeline que transforma um post em Markdown neste blog em HTML estático, sem framework, publicado via GitHub Actions."
tags: [ia, ci-cd, github-actions, godot]
draft: false
---
Esse é o primeiro post desse blog, e ele é sobre o próprio blog — parece meio recursivo, mas faz sentido: o objetivo aqui é documentar como estou construindo o Tower Tactics 3D, e a infraestrutura desse blog é um pedaço disso.

## O problema

Eu sou engenheiro de software, e o site do jogo (esse mesmo em que você está lendo isso) sempre foi HTML puro, sem build, sem dependência nenhuma. Quando decidi começar a escrever sobre o processo de desenvolvimento — arquitetura em Godot, pipeline de assets, automação — eu queria um blog que não jogasse fora essa simplicidade.

## A decisão: sem framework

Trocar o site por um Jekyll ou 11ty resolveria problemas que eu não tenho. Então o blog é Markdown com frontmatter, convertido por um script Node pequeno (sem framework de template, só substituição de `{{VAR}}`) que reaproveita o mesmo CSS do site principal — mesma paleta, mesma nav, mesmo footer.

## Como funciona, ponta a ponta

Quando eu escrevo um post novo em `blog/posts/*.md` e dou push:

- Um script (`scripts/build-blog.mjs`) lê o Markdown, valida o frontmatter obrigatório (título, data, resumo), converte o corpo pra HTML e gera tanto a página do post quanto o índice do blog, com URLs limpas (`/blog/<slug>/`).
- Um workflow do GitHub Actions builda isso e publica direto no GitHub Pages — sem HTML gerado ficando comitado no repositório, é tudo reconstruído do zero a cada deploy.

## O que vem depois

O próximo passo natural é pensar em como levar esses posts pras redes sociais — hoje isso ainda é manual, e é algo que pretendo resolver mais pra frente, depois de ter mais conteúdo publicado aqui.
