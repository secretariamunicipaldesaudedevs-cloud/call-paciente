@echo off
cd C:\chrome-ext-server

:: Iniciar o servidor Node.js em uma nova janela minimizada
start /min cmd /c "npm run dev"
timeout /t 5 >nul

:: Obter o PID da janela do Node.js
for /f "tokens=2" %%a in ('tasklist /nh /fi "imagename eq node.exe" /fo csv') do (
    for /f "tokens=2 delims=," %%b in ("%%a") do (
        set "pid=%%b"
    )
)

:: Minimizar a janela do Node.js
powershell -windowstyle hidden -command "(New-Object -ComObject Shell.Application).Windows() | Where-Object {$_.LocationURL -match 'cmd.exe' -and $_.LocationURL -match '%pid%'} | ForEach-Object {$_.InvokeVerb('Minimize')}"

timeout /t 5 >nul

:: Abrir a segunda janela do Chrome na URL especificada
start chrome --new-window http://localhost:53525/
