from datetime import date, timedelta
from decimal import Decimal
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import *
from app2.models import *
from custom_admin.models import *
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import json
import os
import sys
from pathlib import Path
import django
from django.db.models import Sum

# Telegram bot importlari
sys.path.append(str(Path(__file__).resolve().parent.parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinic.settings')

# Telegram bot funksiyasini import qilish
from telegram_bot.main import send_notification_sync

# Telegram bot funksiyasini alohida faylga ko'chirish
def send_telegram_notification_sync(chat_id, title, message):
    """Sinxron telegram xabarnoma yuborish"""
    try:
        import asyncio
        import os
        import sys
        from pathlib import Path
        
        # Django sozlamalari (faqat bir marta)
        if 'DJANGO_SETTINGS_MODULE' not in os.environ:
            sys.path.append(str(Path(__file__).resolve().parent.parent))
            os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinic.settings')
            import django
            django.setup()
        
        # Telegram bot importlari
        from telegram_bot.main import send_notification_sync
        send_notification_sync(chat_id, title, message)
        
    except Exception as e:
        print(f"Telegram xabarnoma yuborishda xatolik: {e}")

# Notification'lar orasida vaqt oralig'ini tekshirish
from django.core.cache import cache

def should_send_notification(user_id, notification_type, timeout_seconds=30):
    """Bir xil notification'ni qisqa vaqt ichida qayta yubormaslik"""
    cache_key = f"notification_{user_id}_{notification_type}"
    if cache.get(cache_key):
        return False
    cache.set(cache_key, True, timeout_seconds)
    return True

@receiver(post_save, sender=User)
def create_user_notification(sender, instance, created, **kwargs):
    """User yaratilganda yoki o'zgartirilganda notification"""
    if not instance.clinic:
        return
    
    notification_type = "user_created" if created else "user_updated"
    
    # 30 soniya ichida bir xil notification'ni qayta yubormaslik
    if not should_send_notification(instance.id, notification_type, 30):
        return
    
    # Faqat muhim o'zgarishlar uchun notification yuborish
    if created:
        ClinicNotification.objects.create(
            title="Yangi foydalanuvchi qo'shildi",
            message=f"Yangi foydalanuvchi: {instance.get_full_name()} ({instance.clinic.name}) qo'shildi.",
            clinic=instance.clinic,
            status='admin_director'
        )
    else:
        # Faqat muhim maydonlar o'zgarganda notification yuborish
        if kwargs.get('update_fields'):
            # Qaysi maydonlar o'zgartirilganini tekshirish
            updated_fields = kwargs['update_fields']
            important_fields = {'first_name', 'last_name', 'role', 'status', 'phone_number', 'email'}
            
            # Agar muhim maydonlar o'zgarmagan bo'lsa, notification yubormaslik
            if not any(field in updated_fields for field in important_fields):
                return
        
        ClinicNotification.objects.create(
            title="Foydalanuvchi ma'lumotlari o'zgartirildi",
            message=f"Foydalanuvchi: {instance.get_full_name()} ({instance.clinic.name}) ma'lumotlari o'zgartirildi.",
            clinic=instance.clinic,
            status='admin_director'
        )

@receiver(post_save, sender=Meeting)
def create_meeting_notification(sender, instance, created, **kwargs):
    if created:
        ClinicNotification.objects.create(
            title="Yangi uchrashuv qo'shildi",
            message=f"Yangi uchrashuv: {instance.customer.full_name} va {instance.doctor.get_full_name()} ({instance.branch.name}) qo'shildi.",
            clinic=instance.branch.clinic,
            status='admin'
        )
    else:
        ClinicNotification.objects.create(
            title="Uchrashuv ma'lumotlari o'zgartirildi",
            message=f"Uchrashuv: {instance.customer.full_name} va {instance.doctor.get_full_name()} ({instance.branch.name}) ma'lumotlari o'zgartirildi.",
            clinic=instance.branch.clinic,
            status='admin'
        )


@receiver(post_save, sender=Task)
def send_task_notification_to_doctor(sender, instance, created, **kwargs):
    """
    Task yaratilganda yoki yangilanganda doctor uchun xabar yuborish.
    """
    if instance.assignee.role == 'doctor':  # Faqat doctor uchun
        # Real-time xabar yuborish
        message = f"Sizga yangi vazifa berildi: {instance.title}\n{instance.description}\n{instance.created_by.username} tomonidan"

        ClinicNotification.objects.create(
            title="Yangi vazifa",
            message=message,
            clinic=instance.assignee.clinic,
            branch=instance.assignee.branch,
            status='doctor'
        )

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"clinic_notifications_{instance.assignee.id}",
            {
                "type": "notification_message",
                "title": "Yangi vazifa",
                "message": message,
                "timestamp": now().strftime("%Y-%m-%d %H:%M:%S"),
            }
        )

@receiver(post_save, sender=Meeting)
def send_meeting_update_notification_to_doctor(sender, instance, created, **kwargs):
    """
    Meeting o'zgarganda doctor uchun xabar yuborish.
    """
    print(f"Signal ishladi: Meeting ID {instance.id}, Doctor: {instance.doctor}")

    if instance.doctor and instance.doctor.role == 'doctor':  # Faqat doctor uchun
        ClinicNotification.objects.create(
            title="Uchrashuv yangilandi",
            message=f"Sizning uchrashuvingiz yangilandi: {instance.customer.full_name} bilan",
            clinic=instance.branch.clinic,
            branch=instance.branch,
            status='doctor'
        )
        # Real-time xabar yuborish
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"clinic_notifications_{instance.doctor.id}",
            {
                "type": "notification_message",
                "title": "Uchrashuv yangilandi",
                "message": f"Sizning uchrashuvingiz yangilandi: {instance.customer.full_name} bilan",
                "timestamp": now().strftime("%Y-%m-%d %H:%M:%S"),
            }
        )


@receiver(post_save, sender=Task)
def send_task_notification_to_creator(sender, instance, created, **kwargs):
    """
    Task yaratilganda yoki yangilanganda faqat vazifani yaratgan foydalanuvchiga xabar yuborish.
    """
    message = None  # Default qiymat
    if created:
        message = f"Yangi vazifa yaratildi: {instance.title}\nMuhimligi: {instance.priority}\nBoshlanish vaqti: {instance.start_time}"
    else:
        message = f"Vazifa yangilandi: {instance.title}\nMuhimligi: {instance.priority}\nBoshlanish vaqti: {instance.start_time}"

    # Vazifani yaratgan foydalanuvchiga xabar yuborish
    creator = instance.assignee  # Vazifani yaratgan foydalanuvchi
    print(f"send_task_notification_to_creator signal ishladi {creator.id}")
    if creator:

        ClinicNotification.objects.create(
            title="Vazifa haqida xabar",
            message=message,
            clinic=instance.assignee.clinic,
            branch=instance.assignee.branch,
            status=f'{creator.role}'
        )

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"clinic_notifications_{creator.id}",  # Guruh nomi yaratgan foydalanuvchi ID'si bilan
            {
                "type": "notification_message",
                "title": "Vazifa haqida xabar",
                "message": message,
                "timestamp": now().strftime("%Y-%m-%d %H:%M:%S"),
            }
        )


@receiver(post_save, sender=Customer)
def send_customer_notification(sender, instance, created, **kwargs):
    """
    Bemor yaratilganda adminlarga xabar yuborish.
    DIQQAT: bemor filialsiz ham yaratilishi mumkin (branch=None) —
    xabar chiqmasa ham bemor saqlanishi hech qachon buzilmasligi kerak.
    """
    if not created:
        return
    try:
        clinic = getattr(instance, 'clinic', None)
        if clinic is None and instance.branch:
            clinic = instance.branch.clinic
        if clinic is None:
            return

        message = f"Yangi bemor qo'shildi: {instance.full_name}\nTelefon: {instance.phone_number}"

        ClinicNotification.objects.create(
            title="Yangi bemor",
            message=message,
            clinic=clinic,
            branch=instance.branch,
            status='admin'
        )
        # Filial bo'lsa — o'sha filial adminlari, bo'lmasa klinika adminlari
        if instance.branch:
            admins = User.objects.filter(role='admin', branch=instance.branch)
        else:
            admins = User.objects.filter(role='admin', clinic=clinic)
        channel_layer = get_channel_layer()
        for admin in admins:
            async_to_sync(channel_layer.group_send)(
                f"clinic_notifications_{admin.id}",
                {
                    "type": "notification_message",
                    "title": "Yangi bemor",
                    "message": message,
                    "timestamp": now().strftime("%Y-%m-%d %H:%M:%S"),
                }
            )
    except Exception:
        # Xabar yuborishdagi xatolik bemor yaratilishini 500 qilmasin
        pass


@receiver(post_save, sender=Cabinet)
def send_cabinet_notification(sender, instance, created, **kwargs):
    """
    Kabinet yaratilganda yoki tamir holati o'zgarganda faqat o'sha branchga bog'langan admin foydalanuvchilarga xabar yuborish.
    """
    message = ""
    if created:
        message = f"Yangi kabinet qo'shildi: {instance.name}\nFilial: {instance.branch.name}"
    elif instance.status == 'repair':
        message = f"Kabinet tamirga kirdi: {instance.name}\nFilial: {instance.branch.name}"
    elif instance.status == 'available':
        message = f"Kabinet tamirdan chiqdi: {instance.name}\nFilial: {instance.branch.name}"
    elif instance.status == 'creating':
        message = f"Kabinet yaratilmoqda: {instance.name}\nFilial: {instance.branch.name}"

    ClinicNotification.objects.create(
        title="Kabinet haqida xabar",
        message=message,
        clinic=instance.branch.clinic,
        branch=instance.branch,
        status='admin_director'
    )
    # Branchga bog'langan admin foydalanuvchilarni olish
    admins = User.objects.filter(role='admin', branch=instance.branch)
    channel_layer = get_channel_layer()
    for admin in admins:
        async_to_sync(channel_layer.group_send)(
            f"clinic_notifications_{admin.id}",
            {
                "type": "notification_message",
                "title": "Kabinet haqida xabar",
                "message": message,
                "timestamp": now().strftime("%Y-%m-%d %H:%M:%S"),
            }
        )

# Bu signal'ni o'chirib qo'yamiz yoki boshqa nom bilan almashtiramiz
# @receiver(post_save, sender=User)
# def send_employee_notification_to_director(sender, instance, created, **kwargs):
#     # Bu signal'ni o'chirib qo'yamiz chunki yuqoridagi signal yetarli
#     pass

# O'rniga faqat director uchun alohida signal
@receiver(post_save, sender=User)
def send_employee_notification_to_director_only(sender, instance, created, **kwargs):
    """Xodimlar haqida faqat director'larga xabar yuborish"""
    branch = getattr(instance, 'branch', None)
    clinic = getattr(instance, 'clinic', None)
    
    if not clinic:
        return  # Klinika yo'q bo'lsa signal ishlamasin
    
    # Faqat muhim o'zgarishlar uchun
    if created:
        message = (
            f"Yangi xodim qo'shildi:\n"
            f"- F.I.O: {instance.get_full_name()}\n"
            f"- Lavozim: {instance.get_role_display()}\n"
            f"- Telefon: {instance.phone_number}\n"
            f"- Email: {instance.email}"
        )
        
        if branch:
            message += f"\n- Filial: {branch.name}"
        
        ClinicNotification.objects.create(
            title="Yangi xodim qo'shildi",
            message=message,
            clinic=clinic,
            branch=branch,
            status='director'
        )
    else:
        # Faqat muhim maydonlar o'zgarganda
        if kwargs.get('update_fields'):
            updated_fields = kwargs['update_fields']
            important_fields = {'first_name', 'last_name', 'role', 'status', 'phone_number', 'email'}
            
            if not any(field in updated_fields for field in important_fields):
                return
        
        message = (
            f"Xodim ma'lumotlari o'zgartirildi:\n"
            f"- F.I.O: {instance.get_full_name()}\n"
            f"- Lavozim: {instance.get_role_display()}\n"
            f"- Telefon: {instance.phone_number}\n"
            f"- Email: {instance.email}\n"
            f"- Holati: {instance.get_status_display()}"
        )
        
        if branch:
            message += f"\n- Filial: {branch.name}"
        
        ClinicNotification.objects.create(
            title="Xodim ma'lumotlari o'zgartirildi",
            message=message,
            clinic=clinic,
            branch=branch,
            status='director'
        )

@receiver(post_save, sender=Task)
def send_task_status_notification(sender, instance, created, **kwargs):

    """
    Vazifa bajarilmagan yoki kechikkan bo'lsa faqat vazifani yaratgan foydalanuvchiga xabar yuborish.
    """
    print("send_task_status_notification signal ishladi")
    message = None  # Default qiymat

    if instance.status == 'overdue':
        message = f"Vazifa kechikdi: {instance.title}\nBajarilishi kerak edi: {instance.end_date}"
    elif instance.status == 'in_progress':
        message = f"Vazifa bajarilmoqda: {instance.title}\nBajarilishi kerak: {instance.end_date}"

    # Faqat message aniqlangan bo'lsa, xabar yuborish
    if message:
        creator = instance.assignee  # Vazifani yaratgan foydalanuvchi
        
        if creator:

            ClinicNotification.objects.create(
                title="Vazifa holati",
                message=message,
                clinic=creator.clinic,
                branch=creator.branch,
                status=f'{creator.role}'
            )

            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"clinic_notifications_{creator.id}",
                {
                    "type": "notification_message",
                    "title": "Vazifa holati",
                    "message": message,
                    "timestamp": now().strftime("%Y-%m-%d %H:%M:%S"),
                }
            )

@receiver(post_save, sender=Clinic)
def assign_free_subscription(sender, instance, created, **kwargs):
    if created:  # Faqat yangi klinika yaratilganda ishlaydi
        # 14 kunlik bepul tarifni olish
        free_plan = SubscriptionPlan.objects.filter(name__icontains="Trial").first()
        if free_plan:
            ClinicSubscription.objects.create(
                clinic=instance,
                plan=free_plan,
                start_date=date.today(),
                end_date=date.today() + timedelta(days=10),
                discount="100%",  # Bepul bo'lgani uchun 100% chegirma
                status="active"
            )


@receiver(post_save, sender=Meeting)
def send_meeting_notification_to_customer(sender, instance, created, **kwargs):
    """Meeting yaratilganda yoki o'zgartirilganda bemorga xabar yuborish"""
    try:
        customer = instance.customer
        chat_id = customer.telegram_chat_id
        
        if not chat_id:
            print(f"⚠️ {customer.full_name} ning telegram_chat_id'si yo'q")
            return

        if created:
            title = "Yangi qabul yaratildi"
            message = f"""
                🏥 Yangi qabullingiz yaratildi:
                👨‍⚕️ Shifokor: Dr.{instance.doctor.get_full_name()}
                📅 Sana: {instance.date.strftime('%d.%m.%Y %H:%M')}
                🏥 Xona: {instance.room.name}
                📝 Izoh: {instance.comment or "Yo'q"}
            """
        else:
            title = "Qabul ma'lumotlari o'zgartirildi"
            message = f"""
                Qabullingiz ma'lumotlari o'zgartirildi:

                👨‍⚕️ Shifokor: Dr.{instance.doctor.get_full_name()}
                📅 Sana: {instance.date.strftime('%d.%m.%Y %H:%M')}
                🏥 Xona: {instance.room.name}
                📊 Status: {instance.get_status_display()}
                📝 Izoh: {instance.comment or "Yo'q"}
                """

        
        # Telegram orqali xabar yuborish
        import os
        import requests
        
        bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
        if bot_token:
            url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
            data = {
                'chat_id': chat_id,
                'text': f" <b>{title}</b>\n\n{message}\n\n⏰ {instance.created_at.strftime('%Y-%m-%d %H:%M:%S')}",
                'parse_mode': 'HTML'
            }
            
            response = requests.post(url, data=data, timeout=10)
            if response.status_code == 200:
                print(f"✅ Bemor uchun xabar yuborildi: {customer.full_name} - {title}")
            else:
                print(f"❌ Bemor uchun xabar yuborishda xatolik: {response.status_code}")
        
    except Exception as e:
        print(f"❌ Bemor uchun xabar yuborishda xatolik: {e}")

@receiver(post_save, sender=CustomerDebt)
def send_payment_notification_to_customer(sender, instance, created, **kwargs):
    """To'lov qilinganda bemorga xabar yuborish"""
    try:
        customer = instance.customer
        chat_id = customer.telegram_chat_id
        
        if not chat_id:
            print(f"⚠️ {customer.full_name} ning telegram_chat_id'si yo'q")
            return
        
        # Faqat to'lov qilinganda xabar yuborish
        if instance.amount_paid > 0:
            # Barcha to'lovlarni hisoblash
            all_debts = CustomerDebt.objects.filter(
                meeting=instance.meeting, 
                customer=customer
            )
            total_paid = all_debts.aggregate(total=Sum('amount_paid'))['total'] or 0
            total_discount = all_debts.aggregate(total=Sum('discount'))['total'] or 0
            
            # Xizmat narxini hisoblash
            total_service_cost = sum(service.amount for service in instance.meeting.dental_services.all())
            remaining_debt = total_service_cost - total_paid - total_discount
            
            title = "To'lov qilindi"
            message = (
                f"💰 To'lov qilindi:\n\n"
                f"💰 To'langan summa: {instance.amount_paid:,.0f} so'm\n"
                f"🎁 Chegirma: {instance.discount:,.0f} so'm\n"
                f"📅 Sana: {instance.created_at.strftime('%d.%m.%Y %H:%M')}\n"
                f"👨‍⚕️ Shifokor: Dr.{instance.meeting.doctor.get_full_name()}\n\n"
                f"💰 <b>Umumiy holat:</b>\n"
                f"💰 Jami xizmat narxi: {total_service_cost:,.0f} so'm\n"
                f"💳 Jami to'langan: {total_paid:,.0f} so'm\n"
                f"💸 Qolgan qarz: {remaining_debt:,.0f} so'm"
            )
            
            if instance.comment:
                message += f"\n📝 Izoh: {instance.comment}"
            
            # Telegram orqali xabar yuborish
            import os
            import requests
            
            bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
            if bot_token:
                url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
                data = {
                    'chat_id': chat_id,
                    'text': f" <b>{title}</b>\n\n{message}\n\n⏰ {instance.created_at.strftime('%Y-%m-%d %H:%M:%S')}",
                    'parse_mode': 'HTML'
                }
                
                response = requests.post(url, data=data, timeout=10)
                if response.status_code == 200:
                    print(f"✅ To'lov xabari yuborildi: {customer.full_name} - {instance.amount_paid:,.0f} so'm")
                else:
                    print(f"❌ To'lov xabari yuborishda xatolik: {response.status_code}")
        
    except Exception as e:
        print(f"❌ To'lov xabari yuborishda xatolik: {e}")

# ClinicNotification signal'ini yangilash - bemor uchun ham xabar yuborish
@receiver(post_save, sender=ClinicNotification)
def send_clinic_notification_to_telegram(sender, instance, created, **kwargs):
    """ClinicNotification yaratilganda telegram orqali xabarnoma yuborish"""
    if created:
        print(f" Yangi notification yaratildi: {instance.title}")
        print(f"📝 Xabar: {instance.message}")
        print(f" Klinika: {instance.clinic.name}")
        print(f"👥 Status: {instance.status}")
        
        from app.models import User, Customer
        
        # Xabarnoma kimlarga yuborilishi kerakligini aniqlash
        status = instance.status
        
        if status == 'admin':
            users = User.objects.filter(role='admin', clinic=instance.clinic, is_active=True)
        elif status == 'director':
            users = User.objects.filter(role='director', clinic=instance.clinic, is_active=True)
        elif status == 'doctor':
            users = User.objects.filter(role='doctor', clinic=instance.clinic, is_active=True)
        elif status == 'admin_director':
            users = User.objects.filter(role__in=['admin', 'director'], clinic=instance.clinic, is_active=True)
        elif status == 'customer':
            # Bemor uchun xabar
            if instance.customer:
                customers = [instance.customer]
            else:
                customers = []
            users = []
        else:
            users = User.objects.filter(clinic=instance.clinic, is_active=True)
            customers = []
        
        # Foydalanuvchilarga xabar yuborish
        for user in users:
            try:
                chat_id = user.telegram_chat_id
                
                if chat_id and chat_id.strip():
                    print(f"📱 {user.get_full_name()} uchun telegram xabarnoma yuborilmoqda...")
                    
                    import os
                    import requests
                    
                    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
                    if bot_token:
                        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
                        data = {
                            'chat_id': chat_id,
                            'text': f" <b>{instance.title}</b>\n\n{instance.message}\n\n⏰ {instance.created_at.strftime('%Y-%m-%d %H:%M:%S')}",
                            'parse_mode': 'HTML'
                        }
                        
                        response = requests.post(url, data=data, timeout=10)
                        if response.status_code == 200:
                            print(f"✅ Telegram xabarnoma yuborildi: {user.get_full_name()}")
                        else:
                            print(f"❌ Telegram API xatolik: {response.status_code}")
                    else:
                        print("❌ TELEGRAM_BOT_TOKEN topilmadi")
                else:
                    print(f"⚠️ {user.get_full_name()} ning telegram_chat_id'si yo'q")
                    
            except Exception as e:
                print(f"❌ {user.get_full_name()} uchun xabar yuborishda xatolik: {e}")
        
        # Bemorga xabar yuborish (agar customer status bo'lsa)
        if status == 'customer' and instance.customer:
            try:
                customer = instance.customer
                chat_id = customer.telegram_chat_id
                
                if chat_id and chat_id.strip():
                    print(f"📱 {customer.full_name} uchun telegram xabarnoma yuborilmoqda...")
                    
                    import os
                    import requests
                    
                    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
                    if bot_token:
                        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
                        data = {
                            'chat_id': chat_id,
                            'text': f" <b>{instance.title}</b>\n\n{instance.message}\n\n⏰ {instance.created_at.strftime('%Y-%m-%d %H:%M:%S')}",
                            'parse_mode': 'HTML'
                        }
                        
                        response = requests.post(url, data=data, timeout=10)
                        if response.status_code == 200:
                            print(f"✅ Bemor uchun telegram xabarnoma yuborildi: {customer.full_name}")
                        else:
                            print(f"❌ Bemor uchun telegram API xatolik: {response.status_code}")
                    else:
                        print("❌ TELEGRAM_BOT_TOKEN topilmadi")
                else:
                    print(f"⚠️ {customer.full_name} ning telegram_chat_id'si yo'q")
                    
            except Exception as e:
                print(f"❌ {customer.full_name} uchun xabar yuborishda xatolik: {e}")
        
        print("-" * 50)

