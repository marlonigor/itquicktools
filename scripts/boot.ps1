# scripts/boot.ps1
# Script de inicializacao rapida (One-Liner) para IT Quick Tools
# Uso: irm https://raw.githubusercontent.com/marlonigor/itquicktools/main/scripts/boot.ps1 | iex

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

function Test-IsAdmin {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Invoke-Elevation {
    if (Test-IsAdmin) {
        return
    }

    Write-Host '[INFO] Solicitando elevacao de privilegios como Administrador...' -ForegroundColor Yellow
    $scriptPath = $PSCommandPath

    if ($scriptPath -and (Test-Path $scriptPath)) {
        Start-Process powershell.exe -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', "`"$scriptPath`"") -Verb RunAs
    } else {
        $bootCommand = "Invoke-RestMethod 'https://raw.githubusercontent.com/marlonigor/itquicktools/main/scripts/boot.ps1' | Invoke-Expression"
        Start-Process powershell.exe -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', $bootCommand) -Verb RunAs
    }
    exit 0
}

function Refresh-NodeEnvironmentPath {
    $machinePath = [System.Environment]::GetEnvironmentVariable('Path', 'Machine')
    $userPath = [System.Environment]::GetEnvironmentVariable('Path', 'User')
    $env:Path = "$machinePath;$userPath"

    $fallbackNode = 'C:\Program Files\nodejs'
    if ((Test-Path $fallbackNode) -and ($env:Path -notlike "*$fallbackNode*")) {
        $env:Path = "$fallbackNode;$env:Path"
    }
}

function Install-NodeWithWinget {
    $wingetCmd = Get-Command winget -ErrorAction SilentlyContinue
    if ($null -eq $wingetCmd) {
        Write-Host '[ERRO] Nem Node.js nem Winget estao disponiveis nesta maquina.' -ForegroundColor Red
        Write-Host 'Instale o Node.js manualmente em: https://nodejs.org' -ForegroundColor Yellow
        exit 1
    }

    $prevEAP = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        & winget install OpenJS.NodeJS.LTS --silent --accept-source-agreements --accept-package-agreements --disable-interactivity
    } finally {
        $ErrorActionPreference = $prevEAP
    }

    Refresh-NodeEnvironmentPath
}

function Assert-NodeInstalled {
    $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
    if ($null -ne $nodeCmd) {
        return
    }

    Write-Host '[AVISO] Node.js nao encontrado no sistema.' -ForegroundColor Yellow
    Write-Host '[INFO] Instalando Node.js LTS via Winget em segundo plano...' -ForegroundColor Cyan
    Install-NodeWithWinget
}

function Copy-DirectoryContent {
    param([string]$sourceDir, [string]$targetDir)

    Get-ChildItem -Path $sourceDir -Recurse | ForEach-Object {
        $relativePath = $_.FullName.Substring($sourceDir.Length + 1)
        $destination = Join-Path $targetDir $relativePath
        if ($_.PSIsContainer) {
            if (-not (Test-Path $destination)) {
                New-Item -ItemType Directory -Path $destination -Force | Out-Null
            }
        } else {
            Copy-Item -Path $_.FullName -Destination $destination -Force
        }
    }
}

function Update-LocalRepository {
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

    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }

    $sourceDir = Join-Path $extractPath 'itquicktools-main'
    Copy-DirectoryContent -sourceDir $sourceDir -targetDir $targetDir
    Remove-Item -Path $extractPath -Recurse -Force
}

function Install-AppDependency {
    param([string]$targetDir)

    $modulesDir = Join-Path $targetDir 'node_modules'
    if (Test-Path $modulesDir) {
        return
    }

    Write-Host '[INFO] Instalando dependencias necessarias...' -ForegroundColor Cyan
    Push-Location $targetDir
    $prevEAP = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        & npm install --omit=dev --silent
    } finally {
        $ErrorActionPreference = $prevEAP
        Pop-Location
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

function Invoke-Bootstrapper {
    Invoke-Elevation

    $appData = [System.Environment]::GetFolderPath('LocalApplicationData')
    $targetDir = Join-Path $appData 'ITQuickTools'

    Assert-NodeInstalled
    Update-LocalRepository -targetDir $targetDir
    Install-AppDependency -targetDir $targetDir
    Start-Application -targetDir $targetDir
}

Invoke-Bootstrapper
