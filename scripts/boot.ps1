# scripts/boot.ps1
# Script de inicializacao rapida (One-Liner) para IT Quick Tools
# Uso: irm https://raw.githubusercontent.com/marlonigor/itquicktools/main/scripts/boot.ps1 | iex

$ErrorActionPreference = 'Stop'

function Test-IsAdmin {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Ensure-Elevation {
    if (-not (Test-IsAdmin)) {
        Write-Host '[INFO] Solicitando elevacao de privilegios como Administrador...' -ForegroundColor Yellow
        $scriptPath = $MyInvocation.MyCommand.Definition
        if ($scriptPath) {
            Start-Process powershell.exe -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`"" -Verb RunAs
        } else {
            Start-Process powershell.exe -ArgumentList "-NoProfile -ExecutionPolicy Bypass -Command `"irm https://raw.githubusercontent.com/marlonigor/itquicktools/main/scripts/boot.ps1 | iex`"" -Verb RunAs
        }
        exit 0
    }
}

function Ensure-NodeInstalled {
    $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
    if ($null -ne $nodeCmd) {
        return
    }

    Write-Host '[AVISO] Node.js nao encontrado no sistema.' -ForegroundColor Yellow
    Write-Host '[INFO] Instalando Node.js LTS via Winget em segundo plano...' -ForegroundColor Cyan

    $wingetCmd = Get-Command winget -ErrorAction SilentlyContinue
    if ($null -eq $wingetCmd) {
        Write-Host '[ERRO] Nem Node.js nem Winget estao disponiveis nesta maquina.' -ForegroundColor Red
        Write-Host 'Instale o Node.js manualmente em: https://nodejs.org' -ForegroundColor Yellow
        exit 1
    }

    & winget install OpenJS.NodeJS.LTS --silent --accept-source-agreements --accept-package-agreements --disable-interactivity
    $env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path', 'User')
}

function Sync-Repository {
    param([string]$targetDir)

    $zipUrl = 'https://github.com/marlonigor/itquicktools/archive/refs/heads/main.zip'
    $zipPath = Join-Path $env:TEMP 'itquicktools-main.zip'
    $extractPath = Join-Path $env:TEMP 'itquicktools-extract'

    Write-Host '[INFO] Baixando versao mais recente do IT Quick Tools...' -ForegroundColor Cyan
    Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath -UseBasicParsing

    if (Test-Path $extractPath) {
        Remove-Item -Path $extractPath -Recurse -Force
    }

    Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force
    Remove-Item -Path $zipPath -Force

    $sourceDir = Join-Path $extractPath 'itquicktools-main'

    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }

    Copy-Item -Path "$sourceDir\*" -Destination $targetDir -Recurse -Force
    Remove-Item -Path $extractPath -Recurse -Force
}

function Install-Dependencies {
    param([string]$targetDir)

    $modulesDir = Join-Path $targetDir 'node_modules'
    if (-not (Test-Path $modulesDir)) {
        Write-Host '[INFO] Instalando dependencias necessarias...' -ForegroundColor Cyan
        Push-Location $targetDir
        try {
            & npm install --omit=dev --silent
        } finally {
            Pop-Location
        }
    }
}

function Start-Application {
    param([string]$targetDir)

    $entryPoint = Join-Path $targetDir 'index.js'
    Write-Host '[OK] Inicializando IT Quick Tools...' -ForegroundColor Green
    Push-Location $targetDir
    try {
        & node $entryPoint
    } finally {
        Pop-Location
    }
}

function Main {
    Ensure-Elevation

    $appData = [System.Environment]::GetFolderPath('LocalApplicationData')
    $targetDir = Join-Path $appData 'ITQuickTools'

    Ensure-NodeInstalled
    Sync-Repository -targetDir $targetDir
    Install-Dependencies -targetDir $targetDir
    Start-Application -targetDir $targetDir
}

Main
