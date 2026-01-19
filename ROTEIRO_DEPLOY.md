# Roteiro de Publicação e Deploy - BancoCred

Este guia descreve o passo a passo para salvar suas alterações no Git (GitHub) e atualizar a versão que está rodando no servidor (VPS).

## Parte 1: Publicando Alterações no Git (Local)

Sempre que você finalizar uma tarefa ou fizer uma alteração importante no código, siga estes passos no seu computador (Trae IDE):

1.  **Verificar arquivos modificados:**
    Abra o terminal e digite:
    ```bash
    git status
    ```
    *Isso mostra quais arquivos foram alterados (vermelho) ou estão prontos para serem salvos (verde).*

2.  **Adicionar as alterações:**
    Para preparar todos os arquivos modificados:
    ```bash
    git add .
    ```

3.  **Salvar (Commit) com uma mensagem:**
    Descreva brevemente o que foi feito (ex: "Adicionado PgAdmin", "Corrigido erro de login"):
    ```bash
    git commit -m "Sua mensagem aqui"
    ```

4.  **Enviar para o GitHub (Push):**
    Envie as alterações para o repositório remoto:
    ```bash
    git push origin main
    ```

---

## Parte 2: Atualizando a VPS (Servidor)

Após enviar as alterações para o GitHub, você precisa atualizar o servidor para baixar o código novo e reiniciar os serviços.

1.  **Acessar a VPS:**
    No terminal, conecte-se ao servidor:
    ```bash
    ssh 185.239.208.16
    ```

2.  **Entrar na pasta do projeto:**
    ```bash
    cd ~/bancocred
    ```

3.  **Baixar as atualizações do GitHub:**
    ```bash
    git pull
    ```
    *Se houver alterações, você verá uma lista de arquivos atualizados.*

4.  **Recriar os containers (Deploy):**
    Este comando para os serviços antigos, reconstrói o que mudou e sobe tudo novamente:
    ```bash
    docker-compose -f docker-compose.prod.yml up -d --build
    ```
    *O `--build` garante que, se você mudou algo no `Dockerfile` (como a versão do Node), ele vai reconstruir a imagem.*

5.  **Verificar se está tudo rodando:**
    ```bash
    docker ps
    ```
    *Você deve ver os containers `bancocred_frontend_prod`, `bancocred_backend_prod`, `bancocred_db_prod` e `bancocred_pgadmin_prod` com status "Up".*

---

## Cheat Sheet (Comandos Úteis na VPS)

*   **Ver logs do Backend (erros, prints):**
    ```bash
    docker logs -f bancocred_backend_prod
    ```
    *(Pressione `Ctrl + C` para sair)*

*   **Ver logs do Frontend:**
    ```bash
    docker logs -f bancocred_frontend_prod
    ```

*   **Acessar o banco de dados via PgAdmin:**
    *   **URL:** `http://185.239.208.16:5050`
    *   **Email:** `admin@bancocred.com` (ou o que estiver no `.env`)
    *   **Senha:** `admin1234` (ou o que estiver no `.env`)

*   **Editar variáveis de ambiente (.env):**
    ```bash
    nano .env
    ```
    *(Edite, pressione `Ctrl + O` para salvar, `Enter` para confirmar e `Ctrl + X` para sair)*

*   **Reiniciar apenas um serviço específico:**
    ```bash
    docker-compose -f docker-compose.prod.yml restart backend
    ```

---

## Resumo Rápido para Atualização

1.  **Local:** `git add .` -> `git commit -m "..."` -> `git push`
2.  **VPS:** `ssh ...` -> `cd bancocred` -> `git pull` -> `docker-compose -f docker-compose.prod.yml up -d --build`
