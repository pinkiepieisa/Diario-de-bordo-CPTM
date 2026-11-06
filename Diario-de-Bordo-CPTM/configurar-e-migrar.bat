@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

if not exist package.json (
  echo ERRO: coloque este arquivo na pasta Diario-de-Bordo-CPTM, onde esta o package.json.
  pause
  exit /b 1
)

findstr /c:"buildFigmaConfig" src\payload.config.ts >nul 2>&1
if %errorlevel%==0 (
  echo ERRO: src\payload.config.ts ainda e o original. Substitua pelo arquivo novo e rode de novo.
  pause
  exit /b 1
)

if exist .env goto :temenv
echo.
echo === Vamos criar o arquivo .env ===
echo Crie um banco gratis em neon.tech e copie a connection string.
echo Use so o final ?sslmode=require (apague "&channel_binding=require" se existir).
echo.
set /p "DB=Cole a connection string: "
set /p "AE=E-mail do administrador: "
set /p "AP=Senha do administrador (min 8, sem os caracteres % ! ^ &): "
for /f "usebackq" %%i in (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) do set SECRET=%%i
> .env echo DATABASE_URL=!DB!
>> .env echo PAYLOAD_SECRET=!SECRET!
>> .env echo NEXT_PUBLIC_SITE_URL=http://localhost:3000
>> .env echo ADMIN_EMAIL=!AE!
>> .env echo ADMIN_PASSWORD=!AP!
echo .env criado.
:temenv

set NODE_OPTIONS=--no-deprecation

echo.
echo === 1/3 Gerando import map ===
call pnpm exec payload generate:importmap
if errorlevel 1 goto :erro

echo.
echo === 2/3 Criando migration ===
if exist src\migrations\*_inicial.ts goto :jatem
call pnpm exec payload migrate:create inicial
if errorlevel 1 goto :erro
:jatem

echo.
echo === 3/3 Aplicando migration no banco ===
call pnpm exec payload migrate
if errorlevel 1 goto :erro

echo.
echo Tudo certo! Abrindo o app em http://localhost:3000 (Ctrl+C para parar)
call pnpm exec next dev
goto :fim

:erro
echo.
echo Deu erro. Copie a mensagem acima e me envie.
:fim
pause

