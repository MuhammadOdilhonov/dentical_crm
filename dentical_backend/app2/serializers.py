import datetime
from rest_framework import serializers, viewsets
from rest_framework.permissions import IsAuthenticated
from app.models import *
from app2.models import *
from django.utils.timezone import localtime, make_aware
from .views import *
import pytz



class VitalSignSerializer(serializers.ModelSerializer):
    class Meta:
        model = VitalSign
        fields = '__all__'

class CustomerSerializer(serializers.ModelSerializer):
    vital_signs = VitalSignSerializer(many=True, read_only=True)

    class Meta:
        model = Customer
        fields = '__all__'


class MedicineSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    is_expiring_soon = serializers.BooleanField(read_only=True)
    stock_status = serializers.CharField(read_only=True)

    class Meta:
        model = Medicine
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']  # branch ni read_only qilish

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['is_low_stock'] = instance.is_low_stock()
        data['is_expired'] = instance.is_expired()
        data['is_expiring_soon'] = instance.is_expiring_soon()
        
        if instance.is_expired():
            data['stock_status'] = 'expired'
        elif instance.is_low_stock():
            data['stock_status'] = 'low_stock'
        elif instance.is_expiring_soon():
            data['stock_status'] = 'expiring_soon'
        else:
            data['stock_status'] = 'normal'
        
        return data


class MedicineScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicineSchedule
        fields = '__all__'


class MedicineHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicineHistory
        fields = '__all__'


class NurseScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = NurseSchedule
        fields = ['id', 'user', 'day', 'start_time', 'end_time', 'is_working']

class HospitalizationSerializer(serializers.ModelSerializer):
    vital_signs = VitalSignSerializer(many=True, read_only=True)
    medicine_schedules = MedicineScheduleSerializer(many=True, read_only=True)

    class Meta:
        model = Hospitalization
        fields = '__all__'

class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'specialization']

class BusyTimeSerializer(serializers.ModelSerializer):
    time = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Meeting
        fields = ['time']

    def get_time(self, obj):
        return obj.date.strftime('%H:%M')



class FAQImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQImages
        fields = ['id', 'image']  # Rasm ID va fayl yo'li

class FAQSerializer(serializers.ModelSerializer):
    images = FAQImageSerializer(many=True, read_only=True)  # Rasmlarni o'qish uchun
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )  # Rasmlarni yuklash uchun

    class Meta:
        model = FAQ
        fields = ['id', 'question', 'branch', 'images', 'uploaded_images']




class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Bu email bilan foydalanuvchi topilmadi.")
        return value

class PasswordResetCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)

class PasswordResetChangeSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)


class NotificationReadStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationReadStatus
        fields = ['id', 'user', 'notification', 'is_read', 'read_at']


class ClinicNotificationReadStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClinicNotificationReadStatus
        fields = ['id', 'user', 'clinic_notification', 'is_read', 'read_at']


class ContactRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactRequest
        fields = ['id', 'name', 'email', 'phone_number', 'clinic_name', 'created_at', 'status', 'description']


class CustomerDebtSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerDebt
        fields = '__all__'

    def validate(self, attrs):
        customer = attrs.get('customer')
        meeting = attrs.get('meeting')
        if meeting and customer and meeting.customer != customer:
            raise serializers.ValidationError("Meetingda ulangan bemor boshqa. Faqat meetingdagi customer uchun qarzdorlik kiritish mumkin.")
        return attrs

class MedicineCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicineCategory
        fields = ['id', 'name', 'description', 'clinic', 'created_at', 'updated_at']
        read_only_fields = ['clinic', 'created_at', 'updated_at']  # clinic ni read_only qilish


class MedicinePurchaseSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='medicine.name', read_only=True)
    purchased_by_name = serializers.CharField(source='purchased_by.get_full_name', read_only=True)

    class Meta:
        model = MedicinePurchase
        fields = '__all__'


class MedicineSaleSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='medicine.name', read_only=True)
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.get_full_name', read_only=True)
    sold_by_name = serializers.CharField(source='sold_by.get_full_name', read_only=True)

    class Meta:
        model = MedicineSale
        fields = '__all__'
        read_only_fields = ['total_price', 'unit_price', 'final_price', 'sold_by']  # created_at va updated_at ni read_only qilish


class MedicineStockAdjustmentSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='medicine.name', read_only=True)
    adjusted_by_name = serializers.CharField(source='adjusted_by.get_full_name', read_only=True)

    class Meta:
        model = MedicineStockAdjustment
        fields = '__all__'


class PrescriptionItemSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='medicine.name', read_only=True)

    class Meta:
        model = PrescriptionItem
        fields = '__all__'


class MedicinePrescriptionSerializer(serializers.ModelSerializer):
    items = PrescriptionItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.get_full_name', read_only=True)

    class Meta:
        model = MedicinePrescription
        fields = '__all__'


class MedicineStatisticsSerializer(serializers.Serializer):
    total_medicines = serializers.IntegerField()
    low_stock_medicines = serializers.IntegerField()
    expired_medicines = serializers.IntegerField()
    expiring_soon_medicines = serializers.IntegerField()
    total_stock_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    monthly_sales = serializers.DecimalField(max_digits=15, decimal_places=2)
    monthly_purchases = serializers.DecimalField(max_digits=15, decimal_places=2)
    profit_margin = serializers.DecimalField(max_digits=5, decimal_places=2)


class CustomerDebtStatSerializer(serializers.Serializer):
    period = serializers.CharField()
    total_paid = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_discount = serializers.DecimalField(max_digits=12, decimal_places=2)
    count = serializers.IntegerField()


class CustomerMedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicineSale
        fields = "__all__"