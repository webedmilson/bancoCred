# Guia de Deploy - BancoCred

Este guia descreve os passos para publicar a aplicação BancoCred em sua VPS.

## 1. Instalação do Docker na VPS

Antes de tudo, conecte-se na sua VPS e instale o Docker, pois o erro `docker-compose not found` indica que ele não está instalado.

Rode este comando na VPS:
```bash
curl -fsSL https://get.docker.com | sh
```

Verifique se instalou corretamente:
```bash
docker compose version
```

## 2. Enviar os Arquivos (Do seu computador)

Use o script automático `deploy.ps1` que está na raiz do projeto (no seu Windows).
Abra o PowerShell na pasta do projeto e rode:

```powershell
.\deploy.ps1
```

Isso vai criar a pasta `bancocred` na VPS e enviar todos os arquivos.

## 3. Iniciar a Aplicação (Na VPS)

Depois de enviar os arquivos, volte para o terminal da VPS:

1. Entre na pasta:
   ```bash
   cd ~/bancocred
   ```

2. Crie o arquivo de configuração:
   ```bash
   cp .env.prod.example .env
   ```
   *Se der erro de "No such file", é porque o passo 2 (Enviar Arquivos) não funcionou.*

3. Edite as configurações (opcional, mas recomendado para mudar senhas):
   ```bash
   nano .env
   ```

4. Suba o sistema (use `docker compose` em vez de `docker-compose`):
   ```bash
   docker compose -f docker-compose.prod.yml up --build -d
   ```

### Solução de Problemas Comuns

- **Erro `docker-compose not found`**: O Docker não está instalado ou é uma versão antiga. Use o comando de instalação acima e depois use `docker compose` (com espaço).
- **Erro `No such file or directory`**: Os arquivos não foram enviados. Rode o `deploy.ps1` novamente no seu computador local e fique atento a erros de senha/conexão.
