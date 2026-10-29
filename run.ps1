$ErrorActionPreference = 'Stop'
$pythonPath = Join-Path $PSScriptRoot '.venv\Scripts\python.exe'
if (-not (Test-Path $pythonPath)) { throw 'Önce .\setup.ps1 çalıştırın.' }
Write-Host 'Laboratuvar: http://127.0.0.1:5000'
& $pythonPath (Join-Path $PSScriptRoot 'app.py')

