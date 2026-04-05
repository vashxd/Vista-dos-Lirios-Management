@echo off
echo Iniciando Vista dos Lirios - Backend API...
set PHPRC=C:\Users\hscjr\php-custom.ini
cd /d "%~dp0backend"
php artisan serve --port=8000
