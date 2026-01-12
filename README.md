# 🏦 BancoCred

Bem-vindo ao **BancoCred**, uma plataforma financeira moderna e segura desenvolvida para simplificar suas operações bancárias e investimentos.

## 🚀 Sobre o Projeto

O BancoCred é uma aplicação Full Stack que simula as operações de um banco digital real. Com uma interface intuitiva e um backend robusto, o sistema permite:

*   **Gestão de Conta:** Acompanhamento de saldo em tempo real.
*   **Transferências (PIX):** Envio de dinheiro instantâneo para outros usuários.
*   **Investimentos:** Compra e venda de moedas estrangeiras (Dólar e Euro) com cotações atualizadas.
*   **Segurança:** Autenticação via JWT e proteção de dados.

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando as melhores práticas e ferramentas do mercado:

### Frontend
*   **React + Vite:** Para uma interface rápida e reativa.
*   **TypeScript:** Tipagem estática para maior segurança no código.
*   **Tailwind CSS:** Estilização moderna e responsiva.
*   **Lucide React:** Ícones elegantes e leves.
*   **Axios:** Comunicação eficiente com a API.

### Backend
*   **NestJS:** Framework Node.js progressivo e escalável.
*   **TypeORM:** ORM poderoso para gerenciamento de banco de dados.
*   **PostgreSQL:** Banco de dados relacional robusto.
*   **JWT (JSON Web Token):** Autenticação segura.
*   **Docker:** Containerização para fácil deploy e consistência de ambiente.

## 📦 Como Rodar o Projeto

### Pré-requisitos
*   Docker e Docker Compose instalados.

### 1. Clonar o Repositório
```bash
git clone https://github.com/webedmilson/bancoCred.git
cd bancoCred
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto (use o `.env.example` como base):

```bash
# Exemplo de .env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=sua_senha_aqui
POSTGRES_DB=bancocred
JWT_SECRET=seu_segredo_jwt
```

### 3. Rodar com Docker (Recomendado)

**Modo Desenvolvimento:**
```bash
docker-compose up --build
```
Acesse:
*   Frontend: `http://localhost:5173`
*   Backend API: `http://localhost:3000`
*   Gerenciador de Banco (Adminer): `http://localhost:8080`

**Modo Produção (VPS):**
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```
Acesse:
*   Aplicação: `http://seu-dominio-ou-ip` (Porta 80)

## 🔒 Funcionalidades Detalhadas

### Dashboard
Visão geral da conta, com saldo atualizado e atalhos rápidos para as principais funções.

### Área Pix
Realize transferências informando apenas o CPF do destinatário. O sistema valida a existência da conta e impede transferências para si mesmo.

### Investimentos (Câmbio)
Acompanhe a cotação do Dólar e Euro em tempo real e realize aportes na sua carteira internacional de forma simples e visual.

---
Desenvolvido por **Edmilson** 🚀
