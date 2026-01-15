# Script de Deploy Automático para BancoCred
# Execute este script no PowerShell do seu computador (Windows)

$VPS_IP = '185.239.208.16'
$VPS_USER = Read-Host 'Digite o usuario da VPS (padrao: root)'
if ([string]::IsNullOrWhiteSpace($VPS_USER)) { $VPS_USER = 'root' }

Write-Host '---------------------------------------------------------'
Write-Host 'Iniciando Deploy...'
Write-Host '---------------------------------------------------------'

# Construir a string de conexao
$connectionString = "$VPS_USER@$VPS_IP"

# 1. Verificar conexao e criar pasta
Write-Host '1. Conectando e criando pasta bancocred...'
$createDirCmd = 'mkdir -p ~/bancocred'
& ssh -o StrictHostKeyChecking=no $connectionString $createDirCmd

if ($LASTEXITCODE -ne 0) {
    Write-Error 'ERRO: Nao foi possivel conectar na VPS. Verifique a senha e o IP.'
    exit
}

# 2. Empacotar arquivos
Write-Host '2. Empacotando arquivos locais...'
if (Test-Path 'bancocred-deploy.tar.gz') { Remove-Item 'bancocred-deploy.tar.gz' }
tar -czvf bancocred-deploy.tar.gz . --exclude=node_modules --exclude=dist --exclude=.git --exclude=.env --exclude=bancocred-deploy.tar.gz

# 3. Enviar arquivos
Write-Host '3. Enviando arquivos para a VPS...'
$remotePath = $connectionString + ':~/bancocred/'
& scp -o StrictHostKeyChecking=no bancocred-deploy.tar.gz $remotePath

if ($LASTEXITCODE -ne 0) {
    Write-Error 'ERRO: Falha ao enviar o arquivo. Verifique a conexao.'
    exit
}

# 4. Extrair e Limpar
Write-Host '4. Extraindo arquivos na VPS...'
$extractCmd = 'cd ~/bancocred && tar -xzvf bancocred-deploy.tar.gz && rm bancocred-deploy.tar.gz'
& ssh -o StrictHostKeyChecking=no $connectionString $extractCmd

Write-Host '---------------------------------------------------------'
Write-Host 'SUCESSO: Arquivos enviados!'
Write-Host '---------------------------------------------------------'
Write-Host 'PROXIMOS PASSOS NA VPS:'
Write-Host "1. Acesse a VPS: ssh $connectionString"
Write-Host '2. Instale o Docker: curl -fsSL https://get.docker.com | sh'
Write-Host '3. Entre na pasta: cd bancocred'
Write-Host '4. Copie o env: cp .env.prod.example .env'
Write-Host '5. Inicie: docker compose -f docker-compose.prod.yml up --build -d'
Write-Host '---------------------------------------------------------'
