# Dentical CRM — Ishga tushirish qo'llanmasi

Hammasi o'rnatilgan va tayyor. Ikkala qismni ham ishga tushirish uchun:

## Eng oson yo'l (2 marta bosish)

- `start_backend.bat` — Django backend (http://localhost:8000)
- `start_frontend.bat` — React frontend (http://localhost:3000)

## Qo'lda ishga tushirish

### Backend (Django)
```powershell
cd C:\Users\user\Desktop\Muhammad\Dentical_CRM\dentical_backend
venv\Scripts\activate
python manage.py runserver
```
- Server: http://localhost:8000
- Admin panel: http://localhost:8000/admin/
- Baza (SQLite) yaratilgan, migratsiyalar bajarilgan.
- Admin uchun foydalanuvchi kerak bo'lsa: `python manage.py createsuperuser`

### Frontend (React)
```powershell
cd C:\Users\user\Desktop\Muhammad\Dentical_CRM\dentical_frontend
npm start
```
- Sayt: http://localhost:3000

## Muhim eslatmalar

1. **Frontend hozir production API'ga ulangan** — `src/api/apiService.js` faylida
   `BaseUrl = "https://med-crm-service.uz/api"`. Lokal backend bilan ishlash uchun
   shu faylda quyidagicha o'zgartiring:
   ```js
   export const BaseUrl = "http://localhost:8000/api"
   export const BaseUrlImg = "http://localhost:8000"
   ```

2. **Python 3.14 moslashuvi** — asl `requirements.txt` dagi eski versiyalar
   (Django 5.1, numpy 2.2, pandas 2.2, cffi 1.17...) Python 3.14 da o'rnatilmaydi.
   Shuning uchun `requirements_py314.txt` yaratildi (Django 5.2, yangi versiyalar)
   va venv'ga shu o'rnatildi. Qayta o'rnatish kerak bo'lsa:
   ```powershell
   venv\Scripts\python.exe -m pip install -r requirements_py314.txt
   ```

3. **Telegram bot** — `dentical_backend\.env` faylida `TELEGRAM_BOT_TOKEN`
   hozircha placeholder (soxta). Django ishga tushishi uchun shu yetarli,
   lekin bot haqiqiy ishlashi uchun @BotFather'dan olingan tokenni yozing.
   Botni alohida ishga tushirish: `python telegram_bot\main.py`

4. **Redis (ixtiyoriy)** — WebSocket (real-time bildirishnomalar) va Celery
   ishlashi uchun Redis kerak (127.0.0.1:6379). Windows'da Redis o'rnatilmagan —
   Memurai yoki Docker (`docker run -d -p 6379:6379 redis`) bilan qo'yish mumkin.
   Redis'siz ham oddiy sahifalar/API to'liq ishlaydi, faqat WebSocket ulanishlari
   va Celery vazifalari ishlamaydi.

5. **Celery (ixtiyoriy, Redis kerak)**:
   ```powershell
   venv\Scripts\celery -A clinic worker -l info --pool=solo
   venv\Scripts\celery -A clinic beat -l info
   ```
