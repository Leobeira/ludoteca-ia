@echo off
title Ludoteca IA - Inicializador Automatico
color 0A

echo ==========================================
echo    INICIANDO A LUDOTECA IA COM SUCESSO!
echo ==========================================

cd /d "%~dp0backend"
echo [1/3] Iniciando o Servidor Backend (FastAPI)...
start "Backend - Ludoteca IA" cmd /c "venv\Scripts\activate && uvicorn main:app --reload"

timeout /t 2 >nul

cd /d "%~dp0frontend"
echo [2/3] Iniciando o Servidor Frontend (React/Vite)...
start "Frontend - Ludoteca IA" cmd /c "npm run dev"

timeout /t 3 >nul
echo [3/3] Abrindo o navegador...
start http://localhost:5173

echo ==========================================
echo Tudo rodando perfeitamente! Pode fechar esta janela.
echo ==========================================
timeout /t 5 >nul
exit