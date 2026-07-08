@echo off

echo Fechando servidor...
taskkill /F /IM node.exe

echo Fazendo backup...
xcopy C:\chrome-ext-server C:\BackupPainel /E /Y

echo Atualizando arquivos...
xcopy "\\SERVIDOR\PainelESUS\Atualizacao\chrome-ext-server" ^
"C:\chrome-ext-server" /E /Y

cd /d C:\chrome-ext-server

call npm install

start /min cmd /c "npm run dev"

echo Atualização concluída.

pause