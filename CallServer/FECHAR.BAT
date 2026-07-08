@echo off

:: Encerrar o servidor Node.js
taskkill /f /im node.exe >nul

:: Encerrar as janelas do Chrome
taskkill /f /im chrome.exe >nul

:: Limpar variáveis de ambiente
set pid=

:: Fechar a janela do CMD
exit
