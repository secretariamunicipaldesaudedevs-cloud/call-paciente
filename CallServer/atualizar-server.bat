@echo off

echo Fechando servidor...
::taskkill /F /IM node.exe

echo Fazendo backup...
xcopy C:\chrome-ext-server C:\BackupPainel /E /Y

echo Atualizando arquivos...
xcopy "C:\Users\jose.mendez\Desktop\DEV\PainelEsusPEC\painel-server-deploys" ^
"C:\chrome-ext-server" /E /Y

cd /d C:\chrome-ext-server

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

call npm install

start /min cmd /c "npm run dev"

curl http://localhost:53525/reload
powershell Invoke-WebRequest http://localhost:53525/reload

echo Atualização concluída.

pause