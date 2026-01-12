# Como Rodar o Projeto BancoCred

Este guia explica como iniciar o projeto passo a passo sempre que você ligar o computador.

## ⚠️ Pré-requisito Importante
Certifique-se de que o **Docker Desktop** esteja aberto e rodando antes de começar.

---

## Passo 1: Iniciar o Banco de Dados (Docker)
Abra o terminal (PowerShell ou CMD) na pasta do projeto e execute:

```bash
cd c:\Users\webed\Documents\trae_projects\BI\bancoCred
docker-compose up -d db
```

*Isso vai iniciar o banco de dados PostgreSQL na porta 5433 (para não conflitar com seu postgres local).*

---

## Passo 2: Iniciar o Backend
Abra um **novo terminal** (ou uma nova aba), navegue até a pasta do backend e inicie o servidor:

```bash
cd c:\Users\webed\Documents\trae_projects\BI\bancoCred\backend
npm run start:dev
```

*Aguarde aparecer "Nest application successfully started".*
*O backend rodará em: http://localhost:3000*

---

## Passo 3: Iniciar o Frontend
Abra um **terceiro terminal**, navegue até a pasta do frontend e inicie a aplicação:

```bash
cd c:\Users\webed\Documents\trae_projects\BI\bancoCred\frontend
npm run dev
```

*O frontend rodará em: http://localhost:5175*

---

## 🔗 Links de Acesso

- **Aplicação (Frontend):** http://localhost:5175
- **API (Backend):** http://localhost:3000
- **Banco de Dados (Adminer - Opcional):** Se precisar ver o banco visualmente, abra o terminal na pasta raiz e execute:
  ```bash
  cd c:\Users\webed\Documents\trae_projects\BI\bancoCred
  docker-compose up -d adminer
  ```
  Depois acesse: http://localhost:8080

## � Credenciais do Banco de Dados
Caso precise conectar manualmente (via Adminer ou DBeaver):

- **Host:** localhost
- **Porta:** 5433
- **Banco de Dados (Database):** bancocred
- **Usuário:** postgres
- **Senha:** postgres
- **Sistema:** PostgreSQL

## �🛑 Como Parar Tudo
Para parar o banco de dados e liberar memória quando terminar de trabalhar:

```bash
docker-compose stop
```
