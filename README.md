# 🏦 BancoCred - Digital Banking Core

![Status](https://img.shields.io/badge/Status-Production-green)
![React](https://img.shields.io/badge/Frontend-React-blue?logo=react)
![NestJS](https://img.shields.io/badge/Backend-NestJS-red?logo=nestjs)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql)
![Docker](https://img.shields.io/badge/DevOps-Docker-2496ED?logo=docker)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript)

> **🚀 LIVE DEMO:** [bancocred.edmilsonrodrigues.com.br](http://bancocred.edmilsonrodrigues.com.br)

O **BancoCred** é uma aplicação Full Stack de simulação bancária desenvolvida com foco em arquitetura escalável, segurança de dados e experiência do usuário. O projeto implementa funcionalidades críticas de um core bancário, como gestão de contas, transferências peer-to-peer (PIX) e operações de câmbio multi-moeda.

---

## 🏆 Destaques de Engenharia & Resiliência

Além do CRUD básico, este projeto implementa padrões avançados de desenvolvimento de software para garantir robustez em produção:

### 🛡️ Resiliência em Integrações (API Fallback)
Para o sistema de Câmbio, implementei um mecanismo de **Alta Disponibilidade** na consulta de taxas:
1.  **Primary:** Tenta buscar cotações na API principal (AwesomeAPI).
2.  **Fallback Automático:** Se a API principal falhar (timeout ou rate limit), o sistema automaticamente chaveia para uma API secundária (ExchangeRate-API).
3.  **Circuit Breaker (Simulado):** Se ambas falharem, o sistema opera em modo de contingência para não travar a experiência do usuário.

### 🐳 DevOps & Deploy
*   **VPS Linux:** Deploy realizado em servidor Linux real, não apenas localmente.
*   **Docker Compose:** Orquestração completa (Frontend + Backend + Banco) garantindo paridade entre desenvolvimento e produção.
*   **Automação:** Scripts de setup e deploy configurados para facilitar a manutenção.

---

## 🏗️ Arquitetura e Decisões Técnicas

O sistema foi projetado seguindo princípios de **Clean Architecture** e **Separation of Concerns**, garantindo manutenibilidade e testabilidade.

### Backend (NestJS + TypeORM)
O coração da aplicação foi construído sobre o NestJS, escolhido por sua robustez e suporte nativo a TypeScript.
*   **Modularização:** O código é dividido em módulos de domínio (`Auth`, `Users`, `Accounts`, `Transactions`, `Exchange`) para isolar responsabilidades.
*   **DTOs (Data Transfer Objects):** Validação rigorosa de dados de entrada usando `class-validator` para garantir a integridade das requisições.
*   **Segurança:**
    *   Autenticação via **JWT (JSON Web Tokens)** com Guards personalizados.
    *   Hashing de senhas com **Bcrypt** antes da persistência.
    *   Proteção contra injeção de SQL via TypeORM.

### Frontend (React + Vite)
Interface moderna e responsiva focada em performance e UX.
*   **Componentização:** Reutilização de componentes de UI para consistência visual.
*   **Hooks Personalizados:** Gerenciamento eficiente de estado e efeitos colaterais.
*   **Tailwind CSS:** Estilização utilitária para desenvolvimento ágil e design responsivo.
*   **Integração:** Consumo de API via Axios com interceptors para gestão de tokens.

### Banco de Dados (PostgreSQL)
Modelagem relacional robusta para garantir a consistência das transações financeiras.
*   **Entidades:**
    *   `User`: Dados cadastrais e credenciais.
    *   `Account`: Saldos (BRL, USD, EUR) e status da conta.
    *   `Transaction`: Histórico imutável de operações financeiras (log contábil).
*   **Relacionamentos:** Uso de Foreign Keys para garantir integridade referencial entre usuários, contas e transações.

---

## 🚀 Funcionalidades Principais

### 1. Gestão de Identidade e Acesso
*   Cadastro seguro de usuários com validação de dados.
*   Login com geração de token JWT.
*   Proteção de rotas privadas.

### 2. Core Bancário (Transacional)
*   **Visualização de Saldo:** Acompanhamento em tempo real de saldo em Reais.
*   **Transferências (PIX):** Sistema de transferência instantânea entre contas usando CPF como chave.
    *   *Validação:* Verificação de saldo suficiente e existência do destinatário.
    *   *Segurança:* Bloqueio de transferências para a própria conta.

### 3. Investimentos e Câmbio
*   **Carteira Multi-moeda:** Suporte para saldos em Dólar (USD) e Euro (EUR).
*   **Cotações em Tempo Real:** Integração simulada para obter taxas de câmbio atualizadas.
*   **Compra de Moeda:** Operação transacional que debita BRL e credita a moeda estrangeira correspondente, calculando taxas automaticamente.

---

## 💻 Como Executar o Projeto Localmente

O projeto é totalmente conteinerizado com Docker para facilitar o setup.

### Pré-requisitos
*   Docker e Docker Compose.

### Passo a Passo

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/webedmilson/bancoCred.git
    cd bancoCred
    ```

2.  **Configure as Variáveis de Ambiente:**
    Crie um arquivo `.env` na raiz (baseado no `.env.example`):
    ```env
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=postgres
    POSTGRES_DB=bancocred
    JWT_SECRET=segredo_seguro
    ```

3.  **Execute com Docker:**
    ```bash
    docker-compose up --build
    ```

4.  **Acesse a Aplicação:**
    *   **Frontend:** `http://localhost:5173`
    *   **API (Swagger/Backend):** `http://localhost:3000`
    *   **Adminer (DB Manager):** `http://localhost:8080`

---

## 🔮 Roadmap e Melhorias Futuras
