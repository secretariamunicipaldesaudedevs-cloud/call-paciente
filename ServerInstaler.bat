@echo off
cls

:: Verificar se o Node.js está instalado
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js nao esta instalado. Por favor, instale o Node.js antes de continuar.
    echo Instale o Node.js e volte a executar este script.
    start "" "%~dp0node-v14.17.0-x64.msi"
    pause
    exit /b
)

:: Definir variaveis de caminho
set "sourceFolder=%~dp0chrome-ext-server"
set "destinationFolder=C:\chrome-ext-server"
set "desktopFolder=%userprofile%\Desktop"
set "iconFolder=%destinationFolder%\icones"

:: Verificar se a pasta chrome-ext-server ja existe em C:\
if not exist "%destinationFolder%\" (
    echo Copiando a pasta chrome-ext-server para C:\
    xcopy /E /I /Y "%sourceFolder%" "%destinationFolder%\"
    if %errorlevel% neq 0 (
        echo Falha ao copiar a pasta.
        pause
        exit /b
    ) else (
        echo Pasta copiada com sucesso para C:\chrome-ext-server.
    )
) else (
    echo A pasta chrome-ext-server ja existe em C:. Ignorando a copia.
)

:: Criar atalhos para os arquivos .bat

:: Criar o script VBScript para criar os atalhos
echo Set WshShell = CreateObject("WScript.Shell") > "%temp%\create_shortcuts.vbs"
echo Set shortcut1 = WshShell.CreateShortcut("%desktopFolder%\PAINEL ABRIR.lnk") >> "%temp%\create_shortcuts.vbs"
echo shortcut1.TargetPath = "%destinationFolder%\ABRIR.BAT" >> "%temp%\create_shortcuts.vbs"
echo shortcut1.IconLocation = "%iconFolder%\start.ico" >> "%temp%\create_shortcuts.vbs"
echo shortcut1.Save >> "%temp%\create_shortcuts.vbs"

echo Set WshShell = CreateObject("WScript.Shell") >> "%temp%\create_shortcuts.vbs"
echo Set shortcut2 = WshShell.CreateShortcut("%desktopFolder%\PAINEL FECHAR.lnk") >> "%temp%\create_shortcuts.vbs"
echo shortcut2.TargetPath = "%destinationFolder%\FECHAR.BAT" >> "%temp%\create_shortcuts.vbs"
echo shortcut2.IconLocation = "%iconFolder%\stop.ico" >> "%temp%\create_shortcuts.vbs"
echo shortcut2.Save >> "%temp%\create_shortcuts.vbs"

:: Executar o script VBScript para criar os atalhos
cscript "%temp%\create_shortcuts.vbs"

:: Limpar o arquivo temporario
del "%temp%\create_shortcuts.vbs"

:: Iniciar o servidor Node.js
echo Iniciando o servidor Node.js...
cd /d "%destinationFolder%"
start /min cmd /c "npm run dev"

:: Aguardar um momento para o servidor iniciar
timeout /t 10 >nul

:: Verificar se o servidor Node.js esta em execucao
tasklist /nh /fi "imagename eq node.exe" | find /i "node.exe" >nul
if %errorlevel% neq 0 (
    echo Falha ao iniciar o servidor Node.js.
) else (
    echo Servidor Node.js iniciado com sucesso.
)

:: Abrir as janelas do Chrome
echo Abrindo a janela do Chrome...
timeout /t 5 >nul
start chrome --new-window http://localhost:53525/

:: Finalizar o script
exit
