# Guia de Configuração de Proxy Reverso (Nginx)

Atualmente, sua VPS tem um conflito de portas: o **Bancotudo** está usando a porta `80` (HTTP) diretamente. Para ter múltiplos sites (Bancotudo + Bancocred) na mesma VPS, precisamos colocar um "Gerente de Tráfego" (Nginx) na frente.

## 🚨 Passo 1: Liberar a porta 80 (Modificar o Bancotudo)

Você precisa mover o Bancotudo para uma porta interna (ex: 4002) para dar lugar ao Nginx.

1.  Acesse a pasta do Bancotudo na VPS (ex: `cd ~/bancotudo` ou `cd ~/banctudo`).
2.  Edite o `docker-compose.yml`:
    ```yaml
    # Procure o serviço 'frontend' e mude as portas:
    ports:
      - "4002:80"   # Mude de 80:80 para 4002:80
      - "444:443"   # Mude de 443:443 para 444:443 (se houver HTTPS)
    ```
3.  Reinicie o Bancotudo:
    ```bash
    docker-compose up -d
    ```
    *Neste momento, o site Bancotudo ficará fora do ar até completarmos o passo 3.*

## 📦 Passo 2: Instalar o Nginx

Agora que a porta 80 está livre, instale o Nginx no servidor (fora do Docker):

```bash
sudo apt update
sudo apt install nginx -y
```

## ⚙️ Passo 3: Configurar os Sites

### 3.1. Configurar o BancoCred
Crie o arquivo: `sudo nano /etc/nginx/sites-available/bancocred`

```nginx
server {
    listen 80;
    server_name bancocred.edmilsonrodrigues.com.br;

    location / {
        proxy_pass http://localhost:4000; # Porta do BancoCred Frontend
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:4001; # Porta do BancoCred Backend
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3.2. Configurar o Bancotudo (Para voltar ao ar)
Crie o arquivo: `sudo nano /etc/nginx/sites-available/bancotudo`

```nginx
server {
    listen 80;
    server_name edmilsonrodrigues.com.br www.edmilsonrodrigues.com.br; # Ajuste para o domínio correto

    location / {
        proxy_pass http://localhost:4002; # Nova porta que definimos no Passo 1
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🚀 Passo 4: Ativar e Validar

1.  Ative os sites:
    ```bash
    sudo ln -s /etc/nginx/sites-available/bancocred /etc/nginx/sites-enabled/
    sudo ln -s /etc/nginx/sites-available/bancotudo /etc/nginx/sites-enabled/
    ```

2.  Remova o site padrão do Nginx (para evitar conflitos):
    ```bash
    sudo rm /etc/nginx/sites-enabled/default
    ```

3.  Teste e Reinicie:
    ```bash
    sudo nginx -t
    sudo systemctl restart nginx
    ```

Agora ambos os sites devem funcionar nas mesmas portas 80/443, sendo roteados pelo nome do domínio!
