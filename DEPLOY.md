# Guia de Deploy - BancoCred (VPS + Domínio)

Este guia cobre desde a preparação da VPS até a configuração do domínio `bancocred.edmilsonrodrigues.com.br`.

Como você já tem o `banctudo` rodando, precisamos ter cuidado para **não usar as mesmas portas** (80 e 3000) e causar conflito.

---

## 1. Configuração Inicial na VPS (Faça uma vez)

Acesse sua VPS via terminal (SSH) e siga os passos:

### 1.1. Escolha a pasta
Você mencionou criar uma pasta específica. Vamos usar `~/bancocred`.
```bash
cd ~
git clone https://github.com/webedmilson/bancocred.git
cd bancocred
```

### 1.2. Configure as Portas (IMPORTANTE)
Como você já tem outro site rodando, as portas `80` e `3000` provavelmente estão ocupadas. Vamos usar `4000` (Front) e `4001` (Back).

1. Crie o arquivo `.env`:
   ```bash
   cp .env.prod.example .env
   nano .env
   ```

2. Adicione/Altere estas linhas no final do arquivo `.env`:
   ```ini
   # Portas para não conflitar com o Banctudo
   APP_PORT=4000
   API_PORT=4001
   
   # Configurações do Banco
   POSTGRES_USER=seu_usuario_banco
   POSTGRES_PASSWORD=sua_senha_secreta
   POSTGRES_DB=bancocred_prod
   JWT_SECRET=sua_chave_jwt_secreta
   ```

### 1.3. Suba o projeto manualmente pela primeira vez
Para garantir que está tudo certo:
```bash
docker compose -f docker-compose.prod.yml up --build -d
```
Se der erro de porta ("Address already in use"), troque as portas no `.env` para outros números (ex: 4002, 4003).

---

## 2. Configurar o Domínio (Subdomínio)

Agora precisamos fazer o `bancocred.edmilsonrodrigues.com.br` apontar para o Docker na porta `4000`.

### Se você usa Nginx na VPS (Recomendado):
1. Crie um arquivo de configuração para o site:
   ```bash
   sudo nano /etc/nginx/sites-available/bancocred
   ```
2. Cole o conteúdo do arquivo `nginx_vps_example.conf` que está na raiz deste projeto.
   *(Certifique-se que as portas no arquivo batem com as do seu `.env`)*.

3. Ative o site e reinicie o Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/bancocred /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Se você usa Apache/cPanel na VPS:
Você precisará criar um **Proxy Reverso** no Apache ou através do painel do cPanel para redirecionar o tráfego do subdomínio para `http://localhost:4000`.

---

## 3. Automatizar com GitHub (O "Jeito FTP com Git")

Agora que a VPS está pronta, vamos ativar o deploy automático. Sempre que você der `git push`, ele atualiza a VPS.

### 3.1. Configure as Secrets no GitHub
No seu repositório do GitHub, vá em **Settings > Secrets and variables > Actions** e adicione:

- `VPS_HOST`: IP da sua VPS.
- `VPS_USER`: Seu usuário (ex: `root`).
- `VPS_SSH_KEY`: Sua chave privada SSH.

### 3.2. Teste
Faça uma alteração no código no seu computador, commite e envie.

---

## 4. Como Atualizar o Projeto (Guia Rápido Git)

Sempre que você fizer alterações no código e quiser enviar para a VPS (via GitHub), siga este ritual no seu terminal local:

1. **Verificar o que mudou:**
   ```bash
   git status
   ```
   *(Isso mostra os arquivos modificados em vermelho)*

2. **Adicionar todas as mudanças:**
   ```bash
   git add .
   ```
   *(Isso prepara todos os arquivos para o envio)*

3. **Salvar a versão (Commit):**
   ```bash
   git commit -m "Descreva aqui o que você fez"
   ```
   *(Ex: `git commit -m "Arrumei a cor do botão"`. Use aspas sempre!)*

4. **Enviar para o GitHub (e VPS):**
   ```bash
   git push origin main
   ```
   *(Isso envia o código para a nuvem. Se o Deploy Automático estiver configurado, a VPS atualiza sozinha. Se não, você precisa entrar na VPS e atualizar manualmente).*

---

## 5. Atualização Manual na VPS (Caso o Deploy Automático falhe)

Se precisar atualizar "na mão":

1. **Acesse a VPS:**
   ```bash
   ssh root@185.239.208.16
   ```

2. **Vá para a pasta e atualize:**
   ```bash
   cd ~/bancocred
   git pull
   docker compose -f docker-compose.prod.yml up -d --build
   ```
