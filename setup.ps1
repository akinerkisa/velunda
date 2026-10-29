$ErrorActionPreference = 'Stop'
$venvPath = Join-Path $PSScriptRoot '.venv'
if (-not (Test-Path $venvPath)) { py -m venv $venvPath }
& (Join-Path $venvPath 'Scripts\python.exe') -m pip install -r (Join-Path $PSScriptRoot 'requirements.txt')
Write-Host 'Kurulum tamam. .\run.ps1 ile laboratuvarı başlatın.'

