# Script para testar webhook do Mercado Pago via PowerShell
# Uso: .\test-webhook.ps1

param(
    [string]$Type = "test",  # "test" ou "payment"
    [switch]$ListEvents
)

# Cores
$ColorGreen = @{ ForegroundColor = 'Green' }
$ColorRed = @{ ForegroundColor = 'Red' }
$ColorYellow = @{ ForegroundColor = 'Yellow' }
$ColorCyan = @{ ForegroundColor = 'Cyan' }

Write-Host "`n🧪 Teste de Webhook Mercado Pago" @ColorCyan
Write-Host "════════════════════════════════════════════════════════" @ColorCyan

$BaseUrl = "http://localhost:5000"

# Teste 1: Verificar se servidor está online
Write-Host "`n1️⃣  Verificando se servidor está online..." @ColorYellow
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/health" -Method GET -ErrorAction SilentlyContinue
    Write-Host "✅ Servidor online!" @ColorGreen
} catch {
    Write-Host "❌ Servidor offline!" @ColorRed
    Write-Host "⚠️  Inicie o servidor com: cd backend && npm run dev" @ColorYellow
    exit
}

# Teste 2: Webhook simples
if ($Type -eq "test") {
    Write-Host "`n2️⃣  Enviando webhook de teste..." @ColorYellow
    
    $body = @{
        test    = $true
        message = "Teste webhook $(Get-Date -Format 'HH:mm:ss')"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/webhooks/test" `
            -Method POST `
            -Headers @{ "Content-Type" = "application/json" } `
            -Body $body
        
        Write-Host "✅ Webhook recebido com sucesso!" @ColorGreen
        Write-Host "Resposta:" @ColorCyan
        $response | ConvertTo-Json | Write-Host @ColorGreen
    } catch {
        Write-Host "❌ Erro ao enviar webhook:" @ColorRed
        Write-Host $_.Exception.Message @ColorRed
    }
}

# Teste 3: Webhook de pagamento com assinatura
if ($Type -eq "payment") {
    Write-Host "`n2️⃣  Gerando assinatura válida..." @ColorYellow
    
    # Gerar assinatura HMAC-SHA256
    $id = "11111111"
    $timestamp = [Math]::Floor((Get-Date).ToUniversalTime().Subtract(
        (Get-Date "1970-01-01")).TotalSeconds)
    $secret = "493dbc57510ad42d631469b2d854b4a53a53b374c4939e289388eedcf4dfaa7c"
    
    $data = "$id|$timestamp|$secret"
    $signature = (
        [System.Security.Cryptography.HMACSHA256]::new(
            [System.Text.Encoding]::UTF8.GetBytes($secret)
        ).ComputeHash(
            [System.Text.Encoding]::UTF8.GetBytes($data)
        ) | ForEach-Object { $_.ToString("x2") }
    ) -join ""
    
    Write-Host "✅ Assinatura gerada: $($signature.Substring(0, 20))..." @ColorGreen
    
    Write-Host "`n3️⃣  Enviando webhook de pagamento..." @ColorYellow
    
    $payload = @{
        id   = $id
        type = "payment"
        data = @{
            id                  = 12345678
            status              = "approved"
            external_reference  = "ORDER_12345"
        }
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/webhooks/mercadopago" `
            -Method POST `
            -Headers @{
                "Content-Type"      = "application/json"
                "x-signature"       = $signature
                "x-signature-ts"    = $timestamp
            } `
            -Body $payload
        
        Write-Host "✅ Webhook processado com sucesso!" @ColorGreen
        Write-Host "Resposta:" @ColorCyan
        $response | ConvertTo-Json | Write-Host @ColorGreen
    } catch {
        Write-Host "❌ Erro ao processar webhook:" @ColorRed
        Write-Host $_.Exception.Message @ColorRed
    }
}

# Listar eventos
if ($ListEvents) {
    Write-Host "`n4️⃣  Listando eventos processados..." @ColorYellow
    
    # Você precisará de um JWT token válido aqui
    # Por enquanto, mostraremos o comando
    $token = "seu_jwt_token_aqui"
    
    Write-Host "Para listar eventos, use:" @ColorCyan
    Write-Host "
curl http://localhost:5000/api/webhooks/events \`
  -H `"Authorization: Bearer \$token`"
" @ColorYellow
}

Write-Host "`n════════════════════════════════════════════════════════" @ColorCyan
Write-Host "✨ Testes concluído!" @ColorGreen
Write-Host ""
