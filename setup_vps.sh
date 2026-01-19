#!/bin/bash

# ==========================================
# Script de Configuração Automática - BancoCred
# ==========================================

# Definições
APP_DIR="$HOME/bancocred"
DOMAIN="bancocred.edmilsonrodrigues.com.br"
PORT_APP=4000
PORT_API=4001

# Cores para output
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}>>> Iniciando configuração do BancoCred na VPS...${NC}"

# 1. Verificar/Instalar Docker
if ! command -v docker &> /dev/null; then
    echo "Docker não encontrado. Instalando..."
    curl -fsSL https://get.docker.com | sh
else
    echo "Docker já está instalado."
fi

# 2. Preparar Pasta do Projeto
if [ -d "$APP_DIR" ]; then
    echo "A pasta $APP_DIR já existe."
else
    echo "Criando pasta $APP_DIR..."
    mkdir -p "$APP_DIR"
fi

# 3. Clonar Repositório
# Nota: O usuário precisará garantir que o git clone funciona (chave SSH ou repo público)
if [ ! -d "$APP_DIR/.git" ]; then
    echo -e "${GREEN}>>> Qual é a URL do seu repositório GitHub? (ex: https://github.com/usuario/bancocred.git)${NC}"
    read -r REPO_URL
    git clone "$REPO_URL" "$APP_DIR"
else
    echo "Repositório já clonado. Atualizando..."
    cd "$APP_DIR" && git pull
fi

# 4. Configurar .env
cd "$APP_DIR"
if [ ! -f ".env" ]; then
    echo "Criando arquivo .env baseado no exemplo..."
    cp .env.prod.example .env
    
    # Atualizar portas no .env para evitar conflito
    # Sed é usado para substituir ou adicionar as linhas
    if grep -q "APP_PORT=" .env; then
        sed -i "s/APP_PORT=.*/APP_PORT=$PORT_APP/" .env
    else
        echo "APP_PORT=$PORT_APP" >> .env
    fi
    
    if grep -q "API_PORT=" .env; then
        sed -i "s/API_PORT=.*/API_PORT=$PORT_API/" .env
    else
        echo "API_PORT=$PORT_API" >> .env
    fi
    
    echo -e "${GREEN}>>> Arquivo .env criado! IMPORTANTE: Edite-o depois para colocar senhas reais.${NC}"
fi

# 5. Configurar Nginx (Se existir)
if command -v nginx &> /dev/null; then
    echo "Configurando Nginx..."
    CONF_FILE="/etc/nginx/sites-available/bancocred"
    
    # Precisamos de sudo para mexer no nginx
    if [ -f "$CONF_FILE" ]; then
        echo "Configuração do Nginx já existe."
    else
        echo "Criando configuração do Nginx..."
        # Criar arquivo temporário e mover com sudo
        cat > nginx_bancocred.tmp <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:$PORT_APP;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:$PORT_API;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
        sudo mv nginx_bancocred.tmp "$CONF_FILE"
        sudo ln -s "$CONF_FILE" /etc/nginx/sites-enabled/
        
        echo "Reiniciando Nginx..."
        sudo nginx -t && sudo systemctl restart nginx
    fi
else
    echo "Nginx não encontrado. Pulei esta etapa."
fi

echo -e "${GREEN}>>> Configuração concluída!${NC}"
echo "Próximos passos:"
echo "1. Edite o arquivo .env com suas senhas: nano ~/bancocred/.env"
echo "2. Suba os containers: cd ~/bancocred && docker compose -f docker-compose.prod.yml up --build -d"
