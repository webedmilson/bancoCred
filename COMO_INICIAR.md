# Como Iniciar o Projeto BancoCred Localmente

Este guia explica como rodar o projeto completo (Banco de Dados, Backend e Frontend) na sua máquina.

## Pré-requisitos

1.  **Docker Desktop** instalado e rodando (ícone da baleia parado na barra de tarefas).
2.  **Node.js** instalado.

---

## Passo 1: Iniciar o Banco de Dados (Docker)

Abra um terminal na pasta raiz do projeto (`bancocred`) e execute:

```bash
docker-compose up -d db adminer
```
*Isso vai baixar e iniciar o PostgreSQL e o Adminer.*

---

## Passo 2: Iniciar o Backend (NestJS)

Abra um **segundo terminal**, entre na pasta do backend e inicie o servidor:

```bash
cd backend
npm run start:dev
```
*Aguarde aparecer "Nest application successfully started".*

---

## Passo 3: Iniciar o Frontend (React)

Abra um **terceiro terminal**, entre na pasta do frontend e inicie a interface:

```bash
cd frontend
npm run dev
```
*Acesse o link que aparecerá (geralmente http://localhost:5173).*

---

## Acessos

*   **Frontend (Site):** [http://localhost:5173](http://localhost:5173)
*   **Backend (API):** [http://localhost:3000](http://localhost:3000)
*   **Swagger (Documentação da API):** [http://localhost:3000/api](http://localhost:3000/api)
*   **Adminer (Gerenciador de Banco):** [http://localhost:8090](http://localhost:8090)
    *   **Sistema:** PostgreSQL
    *   **Servidor:** db
    *   **Usuário:** postgres
    *   **Senha:** postgres
    *   **Banco de Dados:** bancocred

---

## Dica: Rodando tudo via Docker (Opcional)

Se preferir não usar terminais separados e rodar tudo dentro do Docker (como na VPS), basta rodar na raiz:

```bash
docker-compose up -d
```
*Neste caso, o Frontend estará em [http://localhost:5175](http://localhost:5175) (porta definida no docker-compose).*
