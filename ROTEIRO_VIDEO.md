# Roteiro de Vídeo - Apresentação BancoCred

Este roteiro foi planejado para destacar as funcionalidades técnicas e a experiência do usuário do BancoCred.

---

## 🎬 Cena 1: Introdução e Login Seguro
**Tela:** Página de Login (`/login`)
**Ação:** Digitar email e senha.
**Narração Sugerida:**
> "Fala, pessoal! Hoje quero apresentar o **BancoCred**, uma aplicação bancária fullstack completa que desenvolvi."
> "Tudo começa aqui na segurança: o sistema utiliza autenticação via **JWT (JSON Web Tokens)** e todas as senhas são criptografadas no banco de dados usando **BCrypt**, garantindo a proteção total dos dados dos usuários."

---

## 🎬 Cena 2: Dashboard e Stack Tecnológica
**Tela:** Dashboard (após o login)
**Ação:** 
1. Ao entrar, o saldo estará oculto (`••••••`).
2. Passe o mouse devagar sobre os ícones da barra de tecnologias (React, TS, etc) para mostrar o efeito de zoom.
3. Aponte para o seu nome em roxo ("Desenvolvido por...").
**Narração Sugerida:**
> "Ao entrar na Dashboard, temos uma interface moderna e responsiva. Aqui em cima, destaque para a stack principal utilizada no projeto: **React, TypeScript, Tailwind CSS e Vite** no frontend, rodando sobre uma arquitetura robusta de **NestJS, PostgreSQL e Docker**."

---

## 🎬 Cena 3: Privacidade e UX (Saldo)
**Tela:** Card de "Saldo disponível"
**Ação:** Clique no ícone do "olho" 👁️ para revelar o saldo.
**Narração Sugerida:**
> "Pensando na experiência do usuário e privacidade, o saldo inicia oculto. Com um clique, temos acesso aos valores em tempo real."

---

## 🎬 Cena 4: Transferências em Tempo Real
**Tela:** Clique na aba "Transferir"
**Ação:** 
1. Digite um valor (ex: 100.00).
2. Digite o ID de uma conta destino.
3. Clique em "Confirmar Transferência".
**Narração Sugerida:**
> "O sistema permite transferências instantâneas entre contas. Toda a lógica de transação garante a atomicidade da operação no banco de dados PostgreSQL, assegurando que o dinheiro nunca se perca no caminho."

---

## 🎬 Cena 5: Investimentos (Integração com API Externa)
**Tela:** Clique na aba "Investir"
**Ação:** 
1. Mostre as opções de Dólar e Euro.
2. Simule uma compra de Dólar.
**Narração Sugerida:**
> "Aqui temos uma funcionalidade incrível de Câmbio. O sistema consome a **AwesomeAPI** em tempo real para buscar a cotação atualizada do Dólar e Euro, permitindo que o usuário compre moedas estrangeiras instantaneamente."

---

## 🎬 Cena 6: Extrato e Histórico
**Tela:** Clique na aba "Ver Extrato" ou role para "Últimas movimentações"
**Ação:** 
1. Aponte para a transação mais recente com a etiqueta "NOVO" pulsando.
2. Mostre a listagem ordenada por data.
**Narração Sugerida:**
> "No extrato, as transações são listadas em ordem cronológica. Implementei indicadores visuais para facilitar a leitura, como essa tag 'NOVO' para movimentações recentes e diferenciação de cores para entradas e saídas."

---

## 🎬 Cena 7: Conclusão
**Tela:** Volte para a visão geral ou mostre o código no VS Code rapidamente.
**Narração Sugerida:**
> "O BancoCred é um projeto que une performance, segurança e uma ótima experiência de usuário. O código está disponível no meu GitHub. Valeu!"
