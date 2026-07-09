from django.db import models
from app.models import *


class Hospitalization(BaseModel):
    """
    Bemorning kasalxonaga yotqizilishi.
    """
    patient = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='hospitalizations')
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='hospitalizations')
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='hospitalizations')
    start_date = models.DateField(verbose_name="Boshlash sanasi")
    end_date = models.DateField(verbose_name="Tugatish sanasi", null=True, blank=True)
    diagnosis = models.CharField(max_length=255, verbose_name="Tashxis")
    notes = models.TextField(verbose_name="Izohlar", null=True, blank=True)

    def __str__(self):
        return f"{self.patient.full_name} - {self.diagnosis} ({self.start_date} - {self.end_date or 'Hozirgi'})"


class VitalSign(BaseModel):
    customer = models.ForeignKey(Customer, related_name='vital_signs', on_delete=models.CASCADE)
    hospitalization = models.ForeignKey(Hospitalization, on_delete=models.CASCADE, related_name='vital_signs', null=True, blank=True)
    temperature = models.FloatField()  # Harorat
    blood_pressure = models.CharField(max_length=20)  # Qon bosimi
    heart_rate = models.IntegerField()  # Yurak urishi
    respiratory_rate = models.IntegerField()  # Nafas olish tezligi
    oxygen_saturation = models.IntegerField()  # Kislorod saturatsiyasi
    recorded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer.full_name} - {self.recorded_at}"



class MedicineCategory(BaseModel):
    """
    Dorilar kategoriyalari
    """
    name = models.CharField(max_length=100, verbose_name="Kategoriya nomi")
    description = models.TextField(blank=True, null=True, verbose_name="Tavsif")
    clinic = models.ForeignKey(Clinic, on_delete=models.CASCADE, related_name='medicine_categories')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Dori kategoriyasi"
        verbose_name_plural = "Dori kategoriyalari"

class Medicine(BaseModel):
    """
    Dorilar ro'yxati - yangilangan versiya
    """
    UNIT_CHOICES = (
        ('tablet', 'Tabletka'),
        ('ml', 'Millilitr'),
        ('mg', 'Milligramm'),
        ('g', 'Gramm'),
        ('piece', 'Dona'),
        ('bottle', 'Shisha'),
        ('ampoule', 'Ampula'),
        ('syringe', 'Shprits'),
    )
    
    STATUS_CHOICES = (
        ('active', 'Faol'),
        ('inactive', 'Nofaol'),
        ('discontinued', 'Ishlatilmaydi'),
    )

    name = models.CharField(max_length=255, verbose_name="Dori nomi")
    generic_name = models.CharField(max_length=255, blank=True, null=True, verbose_name="Generik nomi")
    category = models.ForeignKey(MedicineCategory, on_delete=models.CASCADE, related_name='medicines', verbose_name="Kategoriya", null=True, blank=True)
    manufacturer = models.CharField(max_length=255, blank=True, null=True, verbose_name="Ishlab chiqaruvchi")
    
    # Doza va o'lchov birliklari
    dosage_strength = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Doza kuchi", null=True, blank=True)
    dosage_unit = models.CharField(max_length=20, choices=UNIT_CHOICES, verbose_name="Doza o'lchov birligi", null=True, blank=True)
    
    # Narx ma'lumotlari
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Bitta doza narxi", null=True, blank=True)
    retail_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Sotuv narxi", null=True, blank=True)
    
    # Saqlash ma'lumotlari
    stock_quantity = models.PositiveIntegerField(default=0, verbose_name="Ombor miqdori")
    minimum_stock = models.PositiveIntegerField(default=10, verbose_name="Minimal ombor")
    expiry_date = models.DateField(verbose_name="Saqlash muddati", null=True, blank=True)
    
    # Qo'shimcha ma'lumotlar
    description = models.TextField(blank=True, null=True, verbose_name="Tavsif")
    side_effects = models.TextField(blank=True, null=True, verbose_name="Yon ta'sirlar")
    contraindications = models.TextField(blank=True, null=True, verbose_name="Kontrendikatsiyalar")
    instructions = models.TextField(blank=True, null=True, verbose_name="Ko'rsatmalar")
    
    # Status va filial
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', verbose_name="Holat")
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='medicines', verbose_name="Filial")
    
    # Barcode yoki kod
    barcode = models.CharField(max_length=100, blank=True, null=True, verbose_name="Barkod")
    medicine_code = models.CharField(max_length=50, unique=True, verbose_name="Dori kodi", null=True, blank=True)

    def __str__(self):
        dosage_info = f" ({self.dosage_strength} {self.get_dosage_unit_display()})" if self.dosage_strength and self.dosage_unit else ""
        return f"{self.name}{dosage_info}"

    def is_low_stock(self):
        """Ombor kamligini tekshirish"""
        return self.stock_quantity <= self.minimum_stock

    def is_expired(self):
        """Muddati o'tganligini tekshirish"""
        from datetime import date
        if not self.expiry_date:
            return False
        return self.expiry_date < date.today()

    def is_expiring_soon(self, days=30):
        """Tez orada muddati tugaydiganligini tekshirish"""
        from datetime import date, timedelta
        if not self.expiry_date:
            return False
        return self.expiry_date <= date.today() + timedelta(days=days)

    class Meta:
        verbose_name = "Dori"
        verbose_name_plural = "Dorilar"


class MedicinePurchase(BaseModel):
    """
    Dorilar sotib olish tarixi
    """
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE, related_name='purchases', verbose_name="Dori")
    supplier = models.CharField(max_length=255, verbose_name="Yetkazib beruvchi")
    quantity = models.PositiveIntegerField(verbose_name="Miqdor")
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Bitta narxi")
    total_cost = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Umumiy narx")
    purchase_date = models.DateField(verbose_name="Sotib olish sanasi")
    expiry_date = models.DateField(verbose_name="Saqlash muddati")
    invoice_number = models.CharField(max_length=100, blank=True, null=True, verbose_name="Faktura raqami")
    notes = models.TextField(blank=True, null=True, verbose_name="Izohlar")
    purchased_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Sotib olgan shaxs")

    def save(self, *args, **kwargs):
        # Umumiy narxni hisoblash
        self.total_cost = self.quantity * self.unit_cost
        super().save(*args, **kwargs)
        
        # Ombor miqdorini yangilash
        self.medicine.stock_quantity += self.quantity
        self.medicine.save()

    def __str__(self):
        return f"{self.medicine.name} - {self.quantity} dona - {self.total_cost} so'm"

    class Meta:
        verbose_name = "Dori sotib olish"
        verbose_name_plural = "Dorilar sotib olish"


class MedicineSale(BaseModel):
    """
    Dorilar sotish tarixi
    """
    SALE_TYPE_CHOICES = (
        ('retail', 'Chakana sotuv'),
        ('wholesale', 'Ommaviy sotuv'),
        ('prescription', "Retsept bo'yicha"),
    )
    
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE, related_name='sales', verbose_name="Dori")
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='medicine_purchases', verbose_name="Mijoz")
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='prescribed_sales', verbose_name="Shifokor")
    quantity = models.PositiveIntegerField(verbose_name="Miqdor")
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Bitta narxi")
    total_price = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Umumiy narx")
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="Chegirma miqdori")
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0, verbose_name="Chegirma foizi")
    final_price = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Yakuniy narx")
    sale_type = models.CharField(max_length=20, choices=SALE_TYPE_CHOICES, default='retail', verbose_name="Sotuv turi")
    prescription_number = models.CharField(max_length=100, blank=True, null=True, verbose_name="Retsept raqami")
    notes = models.TextField(blank=True, null=True, verbose_name="Izohlar")
    sold_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='medicine_sales', verbose_name="Sotgan shaxs")

    def save(self, *args, **kwargs):
        # Dori narxini hisoblash
        medicine_unit_price = self.medicine.retail_price or 0
        if self.medicine.dosage_strength and medicine_unit_price > 0:
            # Agar doza kuchi belgilangan bo'lsa, unga qarab narxni hisoblash
            price_per_unit = medicine_unit_price / self.medicine.dosage_strength
            self.unit_price = price_per_unit
        else:
            # Agar doza kuchi belgilanmagan bo'lsa, to'g'ridan to'g'ri retail narxni ishlatish
            self.unit_price = medicine_unit_price

        # Umumiy narxni hisoblash
        self.total_price = self.quantity * self.unit_price
        
        # Chegirmani hisoblash
        self.discount_amount = 0  # Default qiymat
        if self.discount_percent and self.discount_percent > 0:
            self.discount_amount = (self.total_price * self.discount_percent) / 100
        
        # Yakuniy narxni hisoblash
        self.final_price = self.total_price - (self.discount_amount or 0)
        
        # Ombor miqdorini kamaytirish
        if self.pk is None:  # Yangi yozuv bo'lsa
            if self.medicine.stock_quantity < self.quantity:
                raise ValueError(f"Ombor yetarli emas. Mavjud: {self.medicine.stock_quantity}, Kerak: {self.quantity}")
            self.medicine.stock_quantity -= self.quantity
            self.medicine.save()
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.medicine.name} - {self.customer.full_name} - {self.final_price} so'm"

    class Meta:
        verbose_name = "Dori sotuv"
        verbose_name_plural = "Dorilar sotuv"


class MedicineStockAdjustment(BaseModel):
    """
    Ombor miqdorini tuzatish
    """
    ADJUSTMENT_TYPE_CHOICES = (
        ('addition', "Qo'shish"),
        ('subtraction', 'Ayirish'),
        ('correction', 'Tuzatish'),
        ('damage', 'Zarar'),
        ('expiry', "Muddati o'tgan"),
    )
    
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE, related_name='stock_adjustments', verbose_name="Dori")
    adjustment_type = models.CharField(max_length=20, choices=ADJUSTMENT_TYPE_CHOICES, verbose_name="Tuzatish turi")
    quantity = models.PositiveIntegerField(verbose_name="Miqdor")
    reason = models.CharField(max_length=255, verbose_name="Sabab")
    notes = models.TextField(blank=True, null=True, verbose_name="Izohlar")
    adjusted_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Tuzatgan shaxs")

    def save(self, *args, **kwargs):
        # Ombor miqdorini tuzatish
        if self.adjustment_type == 'addition':
            self.medicine.stock_quantity += self.quantity
        elif self.adjustment_type in ['subtraction', 'damage', 'expiry']:
            if self.medicine.stock_quantity < self.quantity:
                raise ValueError(f"Ombor yetarli emas. Mavjud: {self.medicine.stock_quantity}, Kerak: {self.quantity}")
            self.medicine.stock_quantity -= self.quantity
        elif self.adjustment_type == 'correction':
            # Tuzatish uchun eski miqdorni o'chirib, yangisini qo'shamiz
            pass
        
        self.medicine.save()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.medicine.name} - {self.get_adjustment_type_display()} - {self.quantity}"

    class Meta:
        verbose_name = "Ombor tuzatish"
        verbose_name_plural = "Ombor tuzatishlar"


class MedicinePrescription(BaseModel):
    """
    Retseptlar
    """
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='prescriptions', verbose_name="Bemor")
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='prescriptions', verbose_name="Shifokor")
    prescription_date = models.DateField(verbose_name="Retsept sanasi")
    diagnosis = models.CharField(max_length=255, verbose_name="Tashxis")
    notes = models.TextField(blank=True, null=True, verbose_name="Izohlar")
    is_active = models.BooleanField(default=True, verbose_name="Faol")

    def __str__(self):
        return f"{self.customer.full_name} - {self.doctor.get_full_name()} - {self.prescription_date}"

    class Meta:
        verbose_name = "Retsept"
        verbose_name_plural = "Retseptlar"


class PrescriptionItem(BaseModel):
    """
    Retsept elementlari
    """
    prescription = models.ForeignKey(MedicinePrescription, on_delete=models.CASCADE, related_name='items', verbose_name="Retsept")
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE, verbose_name="Dori")
    dosage = models.CharField(max_length=100, verbose_name="Doza")
    frequency = models.CharField(max_length=100, verbose_name="Qanday berish")
    duration = models.CharField(max_length=100, verbose_name="Davomiyligi")
    quantity = models.PositiveIntegerField(verbose_name="Miqdor")
    instructions = models.TextField(blank=True, null=True, verbose_name="Ko'rsatmalar")

    def __str__(self):
        return f"{self.medicine.name} - {self.dosage}"

    class Meta:
        verbose_name = "Retsept elementi"
        verbose_name_plural = "Retsept elementlari"

class MedicineSchedule(BaseModel):
    """
    Dori berish jadvali.
    """
    patient = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='medicine_schedules')
    hospitalization = models.ForeignKey(Hospitalization, on_delete=models.CASCADE, related_name='medicine_schedules', null=True, blank=True)
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='prescribed_medicines')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='medicine_schedules')
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE, related_name='schedules')
    start_date = models.DateField(verbose_name="Boshlash sanasi")
    end_date = models.DateField(verbose_name="Tugatish sanasi")
    times_per_day = models.JSONField(verbose_name="Kunlik vaqtlar (soatlar)")
    instructions = models.TextField(verbose_name="Qo'shimcha ko'rsatmalar", blank=True, null=True)

    def __str__(self):
        return f"{self.patient.full_name} - {self.medicine.name}"


class MedicineHistory(BaseModel):
    """
    Dori berish tarixi.
    """
    schedule = models.ForeignKey(MedicineSchedule, on_delete=models.CASCADE, related_name='history')
    given_at = models.DateTimeField(auto_now_add=True, verbose_name="Berilgan vaqt")
    nurse = models.ForeignKey(User, on_delete=models.CASCADE, related_name='given_medicines', verbose_name="Hamshira")
    notes = models.TextField(verbose_name="Izohlar", blank=True, null=True)

    def __str__(self):
        return f"{self.schedule.medicine.name} - {self.given_at}"


class NurseSchedule(BaseModel):
    DAYS_OF_WEEK = (
        ('monday', 'Dushanba'),
        ('tuesday', 'Seshanba'),
        ('wednesday', 'Chorshanba'),
        ('thursday', 'Payshanba'),
        ('friday', 'Juma'),
        ('saturday', 'Shanba'),
        ('sunday', 'Yakshanba'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='schedules')
    day = models.CharField(max_length=10, choices=DAYS_OF_WEEK)
    start_time = models.TimeField(default="09:00")
    end_time = models.TimeField(default="18:00")
    is_working = models.BooleanField(default=True)

    class Meta:
        unique_together = ('user', 'day')  # Ensure each nurse has only one schedule per day

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.get_day_display()}"

class NurseNote(BaseModel):
    """
    Hamshira yozuvlari.
    """
    hospitalization = models.ForeignKey(Hospitalization, on_delete=models.CASCADE, related_name='nurse_notes')
    nurse = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes', limit_choices_to={'role': 'nurse'})
    note = models.TextField(verbose_name="Yozuv")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.hospitalization.patient.full_name} - {self.created_at.strftime('%Y-%m-%d %H:%M:%S')}"
    
class FAQImages(BaseModel):
    image = models.ImageField(upload_to='faq_images/', verbose_name="Rasm")

class FAQ(BaseModel):
    """
    Tez-tez so'raladigan savollar.
    """
    question = models.CharField(max_length=255, verbose_name="Savol")
    images = models.ManyToManyField(FAQImages, related_name='faq_images', verbose_name="Rasmlar", null=True, blank=True)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='faqs', verbose_name="Filial")

    def __str__(self):
        return self.question


class NotificationReadStatus(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notification_read_statuses')
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name='read_statuses')
    is_read = models.BooleanField(default=False)  # O'qilgan yoki o'qilmaganligini belgilaydi
    read_at = models.DateTimeField(null=True, blank=True)  # O'qilgan vaqt

    class Meta:
        unique_together = ('user', 'notification')  # Har bir foydalanuvchi uchun noyob yozuv
        verbose_name = "Notification Read Status"
        verbose_name_plural = "Notification Read Statuses"

    def __str__(self):
        return f"{self.user} - {self.notification.title} - {'Read' if self.is_read else 'Unread'}"


class ClinicNotificationReadStatus(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='clinic_notification_read_statuses')
    clinic_notification = models.ForeignKey(ClinicNotification, on_delete=models.CASCADE, related_name='read_statuses')
    is_read = models.BooleanField(default=False)  # O'qilgan yoki o'qilmaganligini belgilaydi
    read_at = models.DateTimeField(null=True, blank=True)  # O'qilgan vaqt

    class Meta:
        unique_together = ('user', 'clinic_notification')  # Har bir foydalanuvchi uchun noyob yozuv
        verbose_name = "Clinic Notification Read Status"
        verbose_name_plural = "Clinic Notification Read Statuses"

    def __str__(self):
        return f"{self.user} - {self.clinic_notification.title} - {'Read' if self.is_read else 'Unread'}"


class ContactRequest(models.Model):
    STATUS_CHOICES = (
        ('new', 'Yangi'),
        ('connected', 'Bog‘lanilgan'),
    )

    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone_number = models.CharField(max_length=20)
    clinic_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')  # Yangi status maydoni
    description = models.TextField(null=True, blank=True)  # Qo'shimcha izoh

    def __str__(self):
        return f"{self.name} - {self.clinic_name}"



class CustomerDebt(BaseModel):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='debts')
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name='debts')
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Mijoz to‘lagan summa
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)     # Chegirma miqdori
    discount_procent = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # Chegirma foizi
    comment = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.customer} - Berilgan summa: {self.amount_paid} so'm"