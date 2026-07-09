@echo off
REM Dentical CRM - Backend (Django) ishga tushirish
cd /d "%~dp0dentical_backend"
call venv\Scripts\activate.bat
python manage.py runserver 0.0.0.0:8000
