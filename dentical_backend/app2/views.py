from django.shortcuts import render
from rest_framework import viewsets, status, generics
from rest_framework.views import APIView
from rest_framework.decorators import action
from app.models import *
from app.pagination import CustomPagination
from app2.models import *
from .serializers import *
from app.serializers import *
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Sum, F
from django.db.models.functions import ExtractMonth, ExtractWeekDay
from datetime import datetime, timedelta, date
from decimal import Decimal
from django.utils import timezone
from django.db.models import Sum
import calendar


class VitalSignViewSet(viewsets.ModelViewSet):
    """
    Hayotiy ko'rsatkichlar bilan ishlash uchun ViewSet.
    """
    queryset = VitalSign.objects.all()
    serializer_class = VitalSignSerializer

    def perform_create(self, serializer):
        """
        Hayotiy ko'rsatkichlarni yaratishda bemor (Customer) ma'lumotlarini ulash.
        """
        customer_id = self.request.data.get('customer_id')
        if customer_id:
            customer = Customer.objects.get(id=customer_id)
            serializer.save(customer=customer)
        else:
            raise ValueError("Customer ID'si talab qilinadi.")
    
    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """
        Bemorning hayotiy ko'rsatkichlari tarixini ko'rsatish.
        """
        customer = Customer.objects.get(pk=pk)
        vital_signs = customer.vital_signs.all().order_by('-recorded_at')
        serializer = VitalSignSerializer(vital_signs, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def chart_data(self, request, pk=None):
        """
        Diagramma uchun bemorning barcha hayotiy ko'rsatkichlarini qaytarish.
        """
        customer = get_object_or_404(Customer, pk=pk)
        vital_signs = customer.vital_signs.all().order_by('recorded_at')  # Vaqt bo'yicha tartiblangan
        data = {
            "temperature": [{"time": vs.recorded_at, "value": vs.temperature} for vs in vital_signs],
            "blood_pressure": [{"time": vs.recorded_at, "value": vs.blood_pressure} for vs in vital_signs],
            "heart_rate": [{"time": vs.recorded_at, "value": vs.heart_rate} for vs in vital_signs],
            "respiratory_rate": [{"time": vs.recorded_at, "value": vs.respiratory_rate} for vs in vital_signs],
            "oxygen_saturation": [{"time": vs.recorded_at, "value": vs.oxygen_saturation} for vs in vital_signs],
        }
        return Response(data)




class MedicineCategoryViewSet(viewsets.ModelViewSet):
    """
    Dorilar kategoriyalari bilan ishlash
    """
    serializer_class = MedicineCategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return MedicineCategory.objects.filter(clinic=user.clinic)

    def perform_create(self, serializer):
        """Kategoriya yaratilganda foydalanuvchining klinikasini avtomatik qo'shish"""
        serializer.save(clinic=self.request.user.clinic)


class MedicineViewSet(viewsets.ModelViewSet):
    """
    Dorilar bilan ishlash
    """
    serializer_class = MedicineSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Medicine.objects.filter(branch__clinic=user.clinic)
        
        # Filtrlash
        category_id = self.request.query_params.get('category_id')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        
        stock_status = self.request.query_params.get('stock_status')
        if stock_status:
            if stock_status == 'low_stock':
                queryset = queryset.filter(stock_quantity__lte=F('minimum_stock'))
            elif stock_status == 'expired':
                queryset = queryset.filter(expiry_date__lt=date.today())
            elif stock_status == 'expiring_soon':
                queryset = queryset.filter(expiry_date__lte=date.today() + timedelta(days=30))
        
        return queryset

    # def perform_create(self, serializer):
    #     if self.request.user.branch is None:
    #         raise ValueError("Foydalanuvchi filiali mavjud emas")
    #     serializer.save(branch=self.request.user.branch)

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Kam ombordagi dorilar"""
        user = request.user
        medicines = Medicine.objects.filter(
            branch__clinic=user.clinic,
            stock_quantity__lte=F('minimum_stock')
        )
        serializer = self.get_serializer(medicines, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def expired(self, request):
        """Muddati o'tgan dorilar"""
        user = request.user
        medicines = Medicine.objects.filter(
            branch__clinic=user.clinic,
            expiry_date__lt=date.today()
        )
        serializer = self.get_serializer(medicines, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def expiring_soon(self, request):
        """Tez orada muddati tugaydigan dorilar"""
        user = request.user
        medicines = Medicine.objects.filter(
            branch__clinic=user.clinic,
            expiry_date__lte=date.today() + timedelta(days=30),
            expiry_date__gt=date.today()
        )
        serializer = self.get_serializer(medicines, many=True)
        return Response(serializer.data)


class MedicinePurchaseViewSet(viewsets.ModelViewSet):
    """
    Dorilar sotib olish bilan ishlash
    """
    serializer_class = MedicinePurchaseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return MedicinePurchase.objects.filter(medicine__branch__clinic=user.clinic)

    def perform_create(self, serializer):
        serializer.save(purchased_by=self.request.user)


class MedicineSaleViewSet(viewsets.ModelViewSet):
    """
    Dorilar sotish bilan ishlash
    """
    serializer_class = MedicineSaleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return MedicineSale.objects.filter(medicine__branch__clinic=user.clinic)

    def perform_create(self, serializer):
        serializer.save(sold_by=self.request.user)

    @action(detail=False, methods=['post'])
    def sell_medicine(self, request):
        """Dori sotish"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Ombor tekshiruvi
            medicine = serializer.validated_data['medicine']
            quantity = serializer.validated_data['quantity']
            
            if medicine.stock_quantity < quantity:
                return Response(
                    {"error": f"Ombor yetarli emas. Mavjud: {medicine.stock_quantity}, Kerak: {quantity}"},
                    status=400
                )
            unit_price = medicine.unit_price
            total_price = unit_price * quantity
            discount_percent = serializer.validated_data.get('discount_percent', 0)
            final_price = total_price - (total_price * discount_percent / 100)
            serializer.save(
                sold_by=request.user,
                total_price=total_price,
                final_price=final_price,
                unit_price=unit_price
            )
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class MedicineStockAdjustmentViewSet(viewsets.ModelViewSet):
    """
    Ombor tuzatish bilan ishlash
    """
    serializer_class = MedicineStockAdjustmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return MedicineStockAdjustment.objects.filter(medicine__branch__clinic=user.clinic)

    def perform_create(self, serializer):
        serializer.save(adjusted_by=self.request.user)


class MedicinePrescriptionViewSet(viewsets.ModelViewSet):
    """
    Retseptlar bilan ishlash
    """
    serializer_class = MedicinePrescriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return MedicinePrescription.objects.filter(doctor__clinic=user.clinic)

    def perform_create(self, serializer):
        serializer.save(doctor=self.request.user)


class PrescriptionItemViewSet(viewsets.ModelViewSet):
    """
    Retsept elementlari bilan ishlash
    """
    serializer_class = PrescriptionItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return PrescriptionItem.objects.filter(prescription__doctor__clinic=user.clinic)


class MedicineHistoryViewSet(viewsets.ModelViewSet):
    """
    Dori berish tarixi bilan ishlash uchun ViewSet.
    """
    queryset = MedicineHistory.objects.all()
    serializer_class = MedicineHistorySerializer


class NurseScheduleViewSet(viewsets.ModelViewSet):
    queryset = NurseSchedule.objects.all()
    serializer_class = NurseScheduleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Filter schedules for the logged-in user if they are a nurse
        user_id = self.request.query_params.get('user_id')
        if user_id:
            return NurseSchedule.objects.filter(user_id=user_id)
        return super().get_queryset()

    def perform_create(self, serializer):
        # Ensure a schedule is created for all 7 days if not already present
        user = serializer.validated_data['user']
        day = serializer.validated_data['day']
        if NurseSchedule.objects.filter(user=user, day=day).exists():
            raise serializers.ValidationError(f"Schedule for {day} already exists for this nurse.")
        serializer.save()


class HospitalizationViewSet(viewsets.ModelViewSet):
    queryset = Hospitalization.objects.all()
    serializer_class = HospitalizationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            return Hospitalization.objects.filter(patient_id=patient_id)
        return super().get_queryset()


class FAQViewSet(viewsets.ModelViewSet):
    """
    FAQ va rasmlar bilan ishlash uchun ViewSet.
    """
    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer

    def create(self, request, *args, **kwargs):
        """
        FAQ yaratish va rasmlarni yuklash.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        uploaded_images = serializer.validated_data.pop('uploaded_images', [])  # Yuklangan rasmlarni olish
        faq = FAQ.objects.create(**serializer.validated_data)

        # Rasmlarni saqlash va FAQ bilan bog'lash
        for image in uploaded_images:
            faq_image = FAQImages.objects.create(image=image)
            faq.images.add(faq_image)

        faq.save()
        return Response(self.get_serializer(faq).data)

class MeetingFilterView(APIView):
    """
    Meeting uchun filtrlash API.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        # Foydalanuvchining klinikasi
        if not user.clinic:
            return Response({"error": "Foydalanuvchi hech qanday klinikaga bog'lanmagan."}, status=400)

        # Branchlar
        branches = Branch.objects.filter(clinic=user.clinic)
        branch_serializer = BranchSerializer(branches, many=True)

        # Bemorlar KLINIKA darajasida — filialidan qat'i nazar barchasi chiqadi
        from django.db.models import Q
        branch_id = request.query_params.get('branch_id')
        customers = Customer.objects.filter(
            Q(clinic=user.clinic) | Q(branch__clinic=user.clinic)
        ).distinct() if branch_id else []
        customer_serializer = CustomerSerializer(customers, many=True)

        # Tanlangan branchga bog'liq Doctors
        doctors = User.objects.filter(branch_id=branch_id, role='doctor') if branch_id else []
        doctor_serializer = DoctorSerializer(doctors, many=True)

        # Tanlangan branchga bog'liq Cabinets
        cabinets = Cabinet.objects.filter(branch_id=branch_id) if branch_id else []
        cabinet_serializer = CabinetSerializer(cabinets, many=True)

        doctor_id = request.query_params.get('doctor')  # Tanlangan shifokor
        cabinet_id = request.query_params.get('cabinet')  # Tanlangan kabinet
        date = request.query_params.get('date')  # Tanlangan sana
        # Band vaqtlar
        busy_times_query = Meeting.objects.filter(branch_id=branch_id)

        if doctor_id:
            busy_times_query = busy_times_query.filter(doctor_id=doctor_id)
        if cabinet_id:
            busy_times_query = busy_times_query.filter(room_id=cabinet_id)
        if date:
            busy_times_query = busy_times_query.filter(date__date=date)  # Faqat sana bo'yicha filtr
        
        busy_times = busy_times_query.all()  # <-- MUHIM: .values('date') emas!
        busy_time_serializer = BusyTimeSerializer(busy_times, many=True)

        return Response({
            "branches": branch_serializer.data,
            "customers": customer_serializer.data,
            "doctors": doctor_serializer.data,
            "cabinets": cabinet_serializer.data,
            "busy_times": busy_time_serializer.data
        })


class PasswordResetRequestView(APIView):
    """
    Foydalanuvchiga 6 xonali tasdiqlash kodini yuborish uchun API.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.get(email=email)
            user.generate_reset_code()  # Tasdiqlash kodini yaratish

            # Email yuborish
            subject = "Parolni tiklash uchun tasdiqlash kodi"
            message = f"Parolni tiklash uchun tasdiqlash kodi: {user.reset_password_code}\n\nKod 10 daqiqa davomida amal qiladi."
            try:
                send_mail(subject, message, settings.EMAIL_HOST_USER, [email])
            except Exception as e:
                logging.error(f"Error sending email: {e}")

            return Response({"detail": "Tasdiqlash kodi emailga yuborildi."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetCodeVerifyView(APIView):
    """
    Tasdiqlash kodini tekshirish va vaqtinchalik token yaratish uchun API.
    """
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = PasswordResetCodeSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            code = serializer.validated_data['code']

            try:
                user = User.objects.get(email=email, reset_password_code=code)
            except User.DoesNotExist:
                return Response({"error": "Email yoki kod noto'g'ri."}, status=status.HTTP_400_BAD_REQUEST)

            # Kodning amal qilish muddatini tekshirish
            if user.reset_password_code_expiry < now():
                return Response({"error": "Tasdiqlash kodi muddati o'tgan."}, status=status.HTTP_400_BAD_REQUEST)

            # Vaqtinchalik token yaratish
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            # Kodni o'chirish
            user.reset_password_code = None
            user.reset_password_code_expiry = None
            user.save()

            return Response({"detail": "Tasdiqlash kodi to'g'ri.", "token": access_token}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetChangeView(APIView):
    """
    Parolni o'zgartirish uchun API (token orqali).
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PasswordResetChangeSerializer(data=request.data)
        if serializer.is_valid():
            new_password = serializer.validated_data['new_password']
            confirm_password = serializer.validated_data['confirm_password']

            if new_password != confirm_password:
                return Response({"error": "Parollar mos emas."}, status=status.HTTP_400_BAD_REQUEST)

            # Foydalanuvchini olish (token orqali)
            user = request.user

            # Parolni o'zgartirish
            user.set_password(new_password)
            user.save()

            return Response({"detail": "Parol muvaffaqiyatli o'zgartirildi."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MarkNotificationAsReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        notification_id = request.data.get('notification_id')

        if not notification_id:
            return Response({"error": "Notification ID is required."}, status=400)

        notification = Notification.objects.get(id=notification_id)
        read_status, created = NotificationReadStatus.objects.get_or_create(
            user=request.user,
            notification=notification
        )
        read_status.is_read = True
        read_status.read_at = now()
        read_status.save()

        return Response({"detail": "Notification marked as read."})


class MarkClinicNotificationAsReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        clinic_notification_id = request.data.get('clinic_notification_id')

        if not clinic_notification_id:
            return Response({"error": "Clinic Notification ID is required."}, status=400)

        clinic_notification = ClinicNotification.objects.get(id=clinic_notification_id)
        read_status, created = ClinicNotificationReadStatus.objects.get_or_create(
            user=request.user,
            clinic_notification=clinic_notification
        )
        read_status.is_read = True
        read_status.read_at = now()
        read_status.save()

        return Response({"detail": "Clinic Notification marked as read."})


class MarkAllNotificationsAsReadView(APIView):
    """
    Foydalanuvchi uchun barcha Notification va ClinicNotification xabarnomalarini o'qilgan deb belgilaydi.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # Notification xabarnomalarini o'qilgan deb belgilash
        notifications = Notification.objects.all()
        for notification in notifications:
            read_status, created = NotificationReadStatus.objects.get_or_create(
                user=request.user,
                notification=notification
            )
            read_status.is_read = True
            read_status.read_at = now()
            read_status.save()

        # ClinicNotification xabarnomalarini o'qilgan deb belgilash
        clinic_notifications = ClinicNotification.objects.all()
        for clinic_notification in clinic_notifications:
            read_status, created = ClinicNotificationReadStatus.objects.get_or_create(
                user=request.user,
                clinic_notification=clinic_notification
            )
            read_status.is_read = True
            read_status.read_at = now()
            read_status.save()

        return Response({"detail": "All notifications marked as read."})


class MarkAllNotificationsAsReadView(APIView):
    """
    Foydalanuvchi uchun barcha Notification xabarnomalarini o'qilgan deb belgilaydi.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        notifications = Notification.objects.all()
        for notification in notifications:
            read_status, created = NotificationReadStatus.objects.get_or_create(
                user=request.user,
                notification=notification
            )
            read_status.is_read = True
            read_status.read_at = now()
            read_status.save()

        return Response({"detail": "All notifications marked as read."})

class MarkAllClinicNotificationsAsReadView(APIView):
    """
    Foydalanuvchi uchun barcha ClinicNotification xabarnomalarini o'qilgan deb belgilaydi.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        clinic_notifications = ClinicNotification.objects.all().filter(
            clinic=request.user.clinic
        )
        for clinic_notification in clinic_notifications:
            read_status, created = ClinicNotificationReadStatus.objects.get_or_create(
                user=request.user,
                clinic_notification=clinic_notification
            )
            read_status.is_read = True
            read_status.read_at = now()
            read_status.save()

        return Response({"detail": "All clinic notifications marked as read."})
    



class UnreadNotificationCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        """
        Foydalanuvchining o'qilmagan bildirishnomalar sonini qaytaradi.
        """
        user = request.user

        # Foydalanuvchiga tegishli NotificationReadStatus yozuvlarini olish
        read_status_notifications = NotificationReadStatus.objects.filter(user=user).values_list('notification_id', flat=True)

        # O'qilmagan bildirishnomalar sonini aniqlash
        unread_count = Notification.objects.filter(
            Q(id__in=read_status_notifications, read_statuses__is_read=False) |
            Q(~Q(id__in=read_status_notifications))
        ).distinct().count()

        return Response({'unread_count': unread_count})


class UnreadClinicNotificationCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        """
        Foydalanuvchining o'qilmagan klinik bildirishnomalar sonini qaytaradi.
        """
        user = request.user

        # Foydalanuvchining o'qigan bildirishnomalari (idlari)
        read_ids = ClinicNotificationReadStatus.objects.filter(user=user, is_read=True).values_list('clinic_notification_id', flat=True)

        # Foydalanuvchining hali o‘qimagan klinik bildirishnomalari
        if user.role == 'doctor':
            unread_count = ClinicNotification.objects.filter(branch=user.branch, status='doctor').exclude(id__in=read_ids).count()
        else:
            unread_count = ClinicNotification.objects.filter(clinic=user.clinic, status='admin_director').exclude(id__in=read_ids).count()

        return Response({'unread_count': unread_count})


class DashboardMetricsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, branch_id=None, *args, **kwargs):
        user = request.user
        clinic = user.clinic

        # Hozirgi oy va o'tgan oyning boshlanish va tugash sanalari
        today = datetime.today()
        first_day_of_this_month = today.replace(day=1)
        first_day_of_last_month = (first_day_of_this_month - timedelta(days=1)).replace(day=1)
        last_day_of_last_month = first_day_of_this_month - timedelta(days=1)

        # Filial bo'yicha ma'lumotlarni olish
        if branch_id == 'all':
            customers = Customer.objects.filter(branch__clinic=clinic, created_at__gte=first_day_of_this_month)
            doctors = User.objects.filter(clinic=clinic, role='doctor', date_joined__gte=first_day_of_this_month)
            cabinets = Cabinet.objects.filter(branch__clinic=clinic, created_at__gte=first_day_of_this_month)
            meetings = Meeting.objects.filter(branch__clinic=clinic, created_at__gte=first_day_of_this_month)
        else:
            customers = Customer.objects.filter(branch_id=branch_id, branch__clinic=clinic, created_at__gte=first_day_of_this_month)
            doctors = User.objects.filter(branch_id=branch_id, clinic=clinic, role='doctor', date_joined__gte=first_day_of_this_month)
            cabinets = Cabinet.objects.filter(branch_id=branch_id, branch__clinic=clinic, created_at__gte=first_day_of_this_month)
            meetings = Meeting.objects.filter(branch_id=branch_id, branch__clinic=clinic, created_at__gte=first_day_of_this_month)

        # O'tgan oy uchun ma'lumotlarni olish
        if branch_id == 'all':
            last_month_customers = Customer.objects.filter(branch__clinic=clinic, created_at__range=[first_day_of_last_month, last_day_of_last_month]).count()
            last_month_doctors = User.objects.filter(clinic=clinic, role='doctor', date_joined__range=[first_day_of_last_month, last_day_of_last_month]).count()
            last_month_cabinets = Cabinet.objects.filter(branch__clinic=clinic, created_at__range=[first_day_of_last_month, last_day_of_last_month]).count()
            last_month_meetings = Meeting.objects.filter(branch__clinic=clinic, created_at__range=[first_day_of_last_month, last_day_of_last_month]).count()
        else:
            last_month_customers = Customer.objects.filter(branch_id=branch_id, branch__clinic=clinic, created_at__range=[first_day_of_last_month, last_day_of_last_month]).count()
            last_month_doctors = User.objects.filter(branch_id=branch_id, clinic=clinic, role='doctor', date_joined__range=[first_day_of_last_month, last_day_of_last_month]).count()
            last_month_cabinets = Cabinet.objects.filter(branch_id=branch_id, branch__clinic=clinic, created_at__range=[first_day_of_last_month, last_day_of_last_month]).count()
            last_month_meetings = Meeting.objects.filter(branch_id=branch_id, branch__clinic=clinic, created_at__range=[first_day_of_last_month, last_day_of_last_month]).count()

        # Hozirgi oy uchun ma'lumotlarni hisoblash
        current_month_customers = customers.count()
        current_month_doctors = doctors.count()
        current_month_cabinets = cabinets.count()
        current_month_meetings = meetings.count()

        # O'zgarish foizini hisoblash
        def calculate_percentage_change(current, previous):
            if previous == 0:
                return 0 if current == 0 else 100
            return round(((current - previous) / previous) * 100, 2)

        customer_growth = calculate_percentage_change(current_month_customers, last_month_customers)
        doctor_growth = calculate_percentage_change(current_month_doctors, last_month_doctors)
        cabinet_growth = calculate_percentage_change(current_month_cabinets, last_month_cabinets)
        meeting_growth = calculate_percentage_change(current_month_meetings, last_month_meetings)

        # Javobni shakllantirish
        data = {
            "customers": {
                "total": current_month_customers,
                "growth": customer_growth
            },
            "doctors": {
                "total": current_month_doctors,
                "growth": doctor_growth
            },
            "cabinets": {
                "total": current_month_cabinets,
                "growth": cabinet_growth
            },
            "meetings": {
                "total": current_month_meetings,
                "growth": meeting_growth
            }
        }

        return Response(data)


class WeeklyAppointmentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, branch_id=None, *args, **kwargs):
        user = request.user
        clinic = user.clinic

        # Bugungi sana va haftaning boshlanish sanasi
        today = datetime.today()
        start_of_week = today - timedelta(days=today.weekday())  # Dushanba

        # Filial bo'yicha uchrashuvlarni olish
        if branch_id == 'all':
            meetings = Meeting.objects.filter(branch__clinic=clinic, date__date__gte=start_of_week)
        else:
            meetings = Meeting.objects.filter(branch_id=branch_id, branch__clinic=clinic, date__date__gte=start_of_week)

        # Haftalik uchrashuvlarni kunlar bo'yicha guruhlash
        weekly_data = meetings.annotate(day=ExtractWeekDay('date')).values('day').annotate(count=Count('id')).order_by('day')

        # Haftalik ma'lumotlarni shakllantirish
        days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        data = {day: 0 for day in days}
        for item in weekly_data:
            data[days[item['day'] - 1]] = item['count']

        return Response({'weekly_appointments': data})


class PatientDistributionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, branch_id=None, *args, **kwargs):
        user = request.user
        clinic = user.clinic

        # Filial bo'yicha mijozlarni olish
        if branch_id == 'all':
            customers = Customer.objects.filter(branch__clinic=clinic)
        else:
            customers = Customer.objects.filter(branch_id=branch_id, branch__clinic=clinic)

        # Jinsi bo'yicha guruhlash
        male_count = customers.filter(gender='male').count()
        female_count = customers.filter(gender='female').count()

        return Response({
            'male': male_count,
            'female': female_count
        })


class MonthlyCustomerTrendView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, branch_id=None, *args, **kwargs):
        user = request.user
        clinic = user.clinic

        # Yil boshidan boshlab mijozlarni olish
        start_of_year = datetime(datetime.today().year, 1, 1)

        if branch_id == 'all':
            customers = Customer.objects.filter(branch__clinic=clinic, created_at__gte=start_of_year)
        else:
            customers = Customer.objects.filter(branch_id=branch_id, branch__clinic=clinic, created_at__gte=start_of_year)

        # Har oy bo'yicha guruhlash
        monthly_data = customers.annotate(month=ExtractMonth('created_at')).values('month').annotate(count=Count('id')).order_by('month')

        # Har oy uchun ma'lumotlarni shakllantirish
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        data = {month: 0 for month in months}
        for item in monthly_data:
            data[months[item['month'] - 1]] = item['count']

        return Response({'monthly_customer_trend': data})


class RecentPatientsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, branch_id=None, *args, **kwargs):
        user = request.user
        clinic = user.clinic

        # Filial bo'yicha mijozlarni olish
        if branch_id == 'all':
            customers = Customer.objects.filter(branch__clinic=clinic).order_by('-created_at')[:5]
        else:
            customers = Customer.objects.filter(branch_id=branch_id, branch__clinic=clinic).order_by('-created_at')[:5]

        # Mijozlar ma'lumotlarini qaytarish
        data = [
            {
                "id": customer.id,
                "full_name": customer.full_name,
                "age": customer.age,
                "diagnosis": customer.status,
                "created_at": customer.created_at.strftime('%Y-%m-%d')
            }
            for customer in customers
        ]

        return Response({"recent_patients": data})

class PendingTasksView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, branch_id=None, *args, **kwargs):
        user = request.user
        clinic = user.clinic

        # Bugungi sana
        today = datetime.today().date()

        # Filial bo'yicha vazifalarni olish
        if branch_id == 'all':
            # Agar `Task` modeli `assignee` orqali filialga bog'langan bo'lsa
            tasks = Task.objects.filter(assignee__clinic=clinic, end_date=today, status='pending')
        else:
            # Agar `Task` modeli `assignee` orqali filialga bog'langan bo'lsa
            tasks = Task.objects.filter(assignee__branch_id=branch_id, assignee__clinic=clinic, end_date=today, status='pending')

        # Vazifalar ma'lumotlarini qaytarish
        data = [
            {
                "title": task.title,
                "assignee": f"{task.assignee.first_name} {task.assignee.last_name}",
                "end_date": task.end_date.strftime('%Y-%m-%d'),
                "priority": task.priority,
                "status": task.status
            }
            for task in tasks
        ]

        return Response({"pending_tasks": data})

class CabinetUtilizationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, branch_id=None, *args, **kwargs):
        user = request.user
        clinic = user.clinic

        # Filial bo'yicha kabinetlardan foydalanish statistikasi
        if branch_id == 'all':
            cabinets = Cabinet.objects.filter(branch__clinic=clinic)
        else:
            cabinets = Cabinet.objects.filter(branch_id=branch_id, branch__clinic=clinic)

        # Har bir kabinet uchun uchrashuvlar sonini hisoblash
        data = []
        for cabinet in cabinets:
            total_meetings = Meeting.objects.filter(room=cabinet).count()
            utilization_percentage = (total_meetings / 100) * 100  # Foydalanish foizi (misol uchun)
            data.append({
                "cabinet_name": cabinet.name,
                "utilization": utilization_percentage
            })

        return Response({"cabinet_utilization": data})


class DoctorDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        # Faqat doktorlar uchun ma'lumotlarni qaytarish
        if user.role != 'doctor':
            return Response({"error": "Access denied. Only doctors can access this dashboard."}, status=403)

        # Bugungi va kechagi sanalar
        today = datetime.today().date()
        yesterday = today - timedelta(days=1)

        # Bugungi uchrashuvlar
        todays_meetings = Meeting.objects.filter(doctor=user, date__date=today)
        todays_meetings_count = todays_meetings.count()

        # Kechagi uchrashuvlar
        yesterdays_meetings_count = Meeting.objects.filter(doctor=user, date__date=yesterday).count()

        # Bugungi uchrashuvlar o'zgarishi
        meeting_change = todays_meetings_count - yesterdays_meetings_count

        # Bugungi vazifalar
        todays_tasks = Task.objects.filter(assignee=user, end_date=today, status='pending')
        todays_tasks_count = todays_tasks.count()

        # Haftalik mijozlar soni
        start_of_week = today - timedelta(days=today.weekday())  # Dushanba
        weekly_customers = Meeting.objects.filter(doctor=user, date__date__gte=start_of_week).values('customer').distinct().count()

        # Bugun bajarilgan vazifalar
        completed_tasks_today = Task.objects.filter(assignee=user, end_date=today, status='completed').count()

        # Javobni shakllantirish
        data = {
            "todays_meetings": {
                "count": todays_meetings_count,
                "change": meeting_change
            },
            "todays_tasks": {
                "count": todays_tasks_count
            },
            "weekly_customers": {
                "count": weekly_customers
            },
            "completed_tasks_today": {
                "count": completed_tasks_today
            }
        }

        return Response(data)


class DoctorAppointmentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        # Faqat doktorlar uchun ma'lumotlarni qaytarish
        if user.role != 'doctor':
            return Response({"error": "Access denied. Only doctors can access this data."}, status=403)

        # Bugungi sana
        today = datetime.today().date()

        # Bugungi uchrashuvlarni olish
        todays_appointments = Meeting.objects.filter(doctor=user, date__date=today).values(
            'customer__full_name', 'date', 'status', 'branch__name'
        ).order_by('date')

        # Umumiy uchrashuvlar soni
        total_appointments = todays_appointments.count()

        return Response({
            "total_appointments": total_appointments,
            "appointments": list(todays_appointments)
        })


class DoctorPatientTrendView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        # Faqat doktorlar uchun ma'lumotlarni qaytarish
        if user.role != 'doctor':
            return Response({"error": "Access denied. Only doctors can access this data."}, status=403)

        # Yil boshidan boshlab mijozlarni olish
        start_of_year = datetime(datetime.today().year, 1, 1)

        # Doktorning yil boshidan boshlab xizmat ko'rsatgan mijozlari
        meetings = Meeting.objects.filter(doctor=user, date__date__gte=start_of_year)

        # Har oy bo'yicha mijozlar sonini hisoblash
        monthly_data = meetings.annotate(month=ExtractMonth('date')).values('month').annotate(
            customer_count=Count('customer', distinct=True)
        ).order_by('month')

        # Har oy uchun ma'lumotlarni shakllantirish
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        data = {month: 0 for month in months}
        for item in monthly_data:
            data[months[item['month'] - 1]] = item['customer_count']

        return Response({"patient_trend": data})


class DoctorWeeklyTasksView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        # Faqat doktorlar uchun ma'lumotlarni qaytarish
        if user.role != 'doctor':
            return Response({"error": "Access denied. Only doctors can access this data."}, status=403)

        # Haftaning boshlanish sanasi (Dushanba)
        today = datetime.today().date()
        start_of_week = today - timedelta(days=today.weekday())

        # Shu haftaning vazifalarini olish
        tasks = Task.objects.filter(
            assignee=user,
            start_date__gte=start_of_week,
            status__in=['pending', 'in_progress']
        ).order_by('start_date')

        # Vazifalar ma'lumotlarini shakllantirish
        data = [
            {
                "title": task.title,
                "description": task.description,
                "start_date": task.start_date.strftime('%Y-%m-%d'),
                "end_date": task.end_date.strftime('%Y-%m-%d'),
                "priority": task.priority,
                "status": task.status
            }
            for task in tasks
        ]

        return Response({"weekly_tasks": data})


class DoctorMonthlyMeetingsStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        # Faqat doktorlar uchun ma'lumotlarni qaytarish
        if user.role != 'doctor':
            return Response({"error": "Access denied. Only doctors can access this data."}, status=403)

        # Hozirgi oyning boshlanish sanasi
        today = datetime.today()
        first_day_of_month = today.replace(day=1)

        # Uchrashuvlarni status bo'yicha hisoblash
        meetings = Meeting.objects.filter(
            doctor=user,
            date__date__gte=first_day_of_month
        ).values('status').annotate(count=Count('id'))

        # Statuslar bo'yicha ma'lumotlarni shakllantirish
        status_data = {status: 0 for status in ['accepted', 'finished', 'cancelled']}
        for meeting in meetings:
            if meeting['status'] in status_data:
                status_data[meeting['status']] = meeting['count']

        return Response({"monthly_meetings_status": status_data})


class DoctorWeeklyCustomersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        # Faqat doktorlar uchun ma'lumotlarni qaytarish
        if user.role != 'doctor':
            return Response({"error": "Access denied. Only doctors can access this data."}, status=403)

        # Haftaning boshlanish sanasi (Dushanba)
        today = datetime.today().date()
        start_of_week = today - timedelta(days=today.weekday())

        # Shu haftada kelgan mijozlarni olish
        customers = Meeting.objects.filter(
            doctor=user,
            date__date__gte=start_of_week
        ).values('customer__full_name', 'customer__age', 'customer__status', 'date').distinct()

        # Mijozlar ma'lumotlarini shakllantirish
        data = [
            {
                "full_name": customer['customer__full_name'],
                "age": customer['customer__age'],
                "status": customer['customer__status'],
                "last_visit": customer['date'].strftime('%Y-%m-%d')
            }
            for customer in customers
        ]

        return Response({"weekly_customers": data})


class ContactRequestViewSet(viewsets.ModelViewSet):
    queryset = ContactRequest.objects.all().order_by('-created_at')
    serializer_class = ContactRequestSerializer

    def get_permissions(self):
        """
        POST so'rovlar uchun ruxsatni `AllowAny` qilib qo'yamiz,
        GET so'rovlar uchun esa faqat superuserlar ko'rishi mumkin.
        """
        if self.action == 'create':  # POST uchun
            return [AllowAny()]
        return [IsAdminUser()]  # GET uchun


class TodayStatsView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request, branch_id='all', *args, **kwargs):
        user = request.user
        clinic = user.clinic
        today = date.today()

        # Customers
        customers = Customer.objects.filter(branch__clinic=clinic, created_at__date=today)
        # Meetings
        meetings = Meeting.objects.filter(branch__clinic=clinic, date__date=today)

        if branch_id != 'all':
            customers = customers.filter(branch_id=branch_id)
            meetings = meetings.filter(branch_id=branch_id)

        return Response({
            "date": today,
            "branch_id": branch_id,
            "customers_count": customers.count(),
            "meetings_count": meetings.count()
        })




class CustomerDebtViewSet(viewsets.ModelViewSet):
    queryset = CustomerDebt.objects.all()
    serializer_class = CustomerDebtSerializer
     # Faqat admin/superuser uchun





class CustomerDebtStatsView(APIView):
    def get(self, request, customer_id):
        user = request.user
        clinic = getattr(user, 'clinic', None)
        if not clinic:
            return Response({"detail": "Siz hech qaysi klinikaga biriktirilmagansiz."}, status=403)

        customer = Customer.objects.filter(id=customer_id, branch__clinic=clinic).first()
        if not customer:
            return Response({"detail": "Customer not found in your clinic."}, status=404)

        meetings = Meeting.objects.filter(customer=customer, branch__clinic=clinic)
        result = []

        for meeting in meetings:
            # Total service amount
            total_service_amount = sum(ds.amount for ds in meeting.dental_services.all())

            # Barcha debt yozuvlarini olish
            debts_qs = CustomerDebt.objects.filter(meeting=meeting, customer=customer)

            # Default qiymatlar
            amount_paid = 0
            discount = 0
            debt = total_service_amount

            if debts_qs.exists():
                agg = debts_qs.aggregate(
                    amount_paid_total=Sum('amount_paid'),
                    discount_total=Sum('discount'),
                    discount_percent_total=Sum('discount_procent'),
                )
                amount_paid = agg['amount_paid_total'] or 0
                discount_amount = agg['discount_total'] or 0
                discount_percent = agg['discount_percent_total'] or 0

                # foizli chegirma summaga aylantiriladi (100% dan oshmasin)
                percent_discount_amount = total_service_amount * min(discount_percent, 100) / 100

                meeting_debt = total_service_amount - amount_paid - discount_amount - percent_discount_amount
            else:
                meeting_debt = total_service_amount

            
            debt_comments = []
            for debt in debts_qs:
                debt_comments.append({
                    "id": debt.id,
                    "comment": debt.comment,
                    "amount_paid": debt.amount_paid,
                    "discount": debt.discount,
                    "discount_procent": debt.discount_procent,
                    "updated_at": debt.updated_at,
                    "created_at": debt.created_at,
                })
            result.append({
                "meeting_id": meeting.id,
                "meeting_date": meeting.date,
                "total_service_amount": total_service_amount,
                "amount_paid": amount_paid,
                "discount": discount,
                "debt": max(meeting_debt, 0),  # Manfiy chiqmasligi uchun
                "debt_comments": debt_comments,
            })

        return Response({
            "customer_id": customer.id,
            "customer_name": customer.full_name,
            "debts": result
        })

class CustomerDebtSummaryView(APIView):
    """
    Customerning umumiy to'lagan summasi, umumiy qarzdorligi va umumiy xizmat narxlarini qaytaruvchi API.
    """
    def get(self, request, customer_id):
        user = request.user
        clinic = getattr(user, 'clinic', None)
        if not clinic:
            return Response({"detail": "Siz hech qaysi klinikaga biriktirilmagansiz."}, status=403)

        # Customerni tekshirish
        customer = Customer.objects.filter(id=customer_id, branch__clinic=clinic).first()
        if not customer:
            return Response({"detail": "Customer not found in your clinic."}, status=404)

        # Customerning barcha meetingslarini olish
        meetings = Meeting.objects.filter(customer=customer, branch__clinic=clinic)

        # Umumiy xizmat narxlari, to'langan summa va qarzdorlikni hisoblash
        total_service_amount = 0
        total_amount_paid = 0
        total_debt = 0
        total_discount = 0

        for meeting in meetings:
            # Xizmat narxlarini hisoblash
            meeting_service_amount = sum([ds.amount for ds in meeting.dental_services.all()])
            total_service_amount += meeting_service_amount

            # Qarzdorlik ma'lumotlarini olish
            debts = CustomerDebt.objects.filter(meeting=meeting, customer=customer)

            if debts.exists():
                total_amount_paid += sum([d.amount_paid for d in debts])
                total_discount += sum([d.discount for d in debts])
                total_debt += meeting_service_amount - sum([d.amount_paid for d in debts]) - sum([d.discount for d in debts])
            else:
                total_debt += meeting_service_amount

        return Response({
            "customer_id": customer.id,
            "customer_name": customer.full_name,
            "total_service_amount": total_service_amount,
            "total_amount_paid": total_amount_paid,
            "total_discount": total_discount,
            "total_debt": total_debt
        })


class CustomerFilterMeetingsView(APIView):
    def get(self, request, customer_id):
        user = request.user
        clinic = getattr(user, 'clinic', None)
        if not clinic:
            return Response({"detail": "Siz hech qaysi klinikaga biriktirilmagansiz."}, status=403)

        # Mijozni tekshirish
        customer = Customer.objects.filter(id=customer_id, branch__clinic=clinic).first()
        if not customer:
            return Response({"detail": "Customer not found in your clinic."}, status=404)

        # Mijozga tegishli barcha meetinglar
        meetings = (
            Meeting.objects
            .filter(customer=customer, branch__clinic=clinic)
            .prefetch_related('dental_services')  # N+1 muammoni oldini olish
            .order_by('-date')
        )

        result = []
        for meeting in meetings:
            total_service_amount = meeting.dental_services.aggregate(
                total=Sum('amount')
            )['total'] or 0

            result.append({
                "meeting_id": meeting.id,
                "meeting_date": meeting.date,
                "status": meeting.status,
                "total_service_amount": total_service_amount,
                "dental_services": [
                    {
                        "id": ds.id,
                        "name": ds.name,
                        "amount": ds.amount,
                        "teeth_number": ds.teeth_number
                    }
                    for ds in meeting.dental_services.all()
                ]
            })

        return Response({
            "customer_id": customer.id,
            "customer_name": customer.full_name,
            "meetings": result
        })


class MedicineScheduleViewSet(viewsets.ModelViewSet):
    """
    Dori berish jadvali bilan ishlash uchun ViewSet.
    """
    queryset = MedicineSchedule.objects.all()
    serializer_class = MedicineScheduleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return MedicineSchedule.objects.filter(
            patient__branch__clinic=user.clinic
        )

    def perform_create(self, serializer):
        serializer.save(doctor=self.request.user)


class MedicineHistoryViewSet(viewsets.ModelViewSet):
    """
    Dori berish tarixi bilan ishlash uchun ViewSet.
    """
    queryset = MedicineHistory.objects.all()
    serializer_class = MedicineHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return MedicineHistory.objects.filter(
            schedule__patient__branch__clinic=user.clinic
        )

    def perform_create(self, serializer):
        serializer.save(nurse=self.request.user)


class MedicineStatisticsView(APIView):
    """
    Dorilar statistikasi
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        clinic = user.clinic
        
        # Bugungi sana
        today = date.today()
        start_of_month = today.replace(day=1)
        
        # Asosiy statistikalar
        total_medicines = Medicine.objects.filter(branch__clinic=clinic).count()
        low_stock_medicines = Medicine.objects.filter(
            branch__clinic=clinic,
            stock_quantity__lte=F('minimum_stock')
        ).count()
        expired_medicines = Medicine.objects.filter(
            branch__clinic=clinic,
            expiry_date__lt=today
        ).count()
        expiring_soon_medicines = Medicine.objects.filter(
            branch__clinic=clinic,
            expiry_date__lte=today + timedelta(days=30),
            expiry_date__gt=today
        ).count()
        
        # Umumiy ombor qiymati
        total_stock_value = Medicine.objects.filter(
            branch__clinic=clinic
        ).aggregate(
            total=Sum(F('stock_quantity') * F('unit_price'))
        )['total'] or Decimal('0')
        
        # Oylik sotuvlar
        monthly_sales = MedicineSale.objects.filter(
            medicine__branch__clinic=clinic,
            created_at__gte=start_of_month
        ).aggregate(
            total=Sum('final_price')
        )['total'] or Decimal('0')
        
        # Oylik sotib olishlar
        monthly_purchases = MedicinePurchase.objects.filter(
            medicine__branch__clinic=clinic,
            created_at__gte=start_of_month
        ).aggregate(
            total=Sum('total_cost')
        )['total'] or Decimal('0')
        
        # Foyda marjasi
        profit_margin = Decimal('0')
        if monthly_purchases > 0:
            profit_margin = ((monthly_sales - monthly_purchases) / monthly_purchases) * 100
        
        data = {
            'total_medicines': total_medicines,
            'low_stock_medicines': low_stock_medicines,
            'expired_medicines': expired_medicines,
            'expiring_soon_medicines': expiring_soon_medicines,
            'total_stock_value': total_stock_value,
            'monthly_sales': monthly_sales,
            'monthly_purchases': monthly_purchases,
            'profit_margin': profit_margin
        }
        
        return Response(data)


class MedicineSalesChartView(APIView):
    """
    Sotuvlar grafigi uchun ma'lumotlar
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        clinic = user.clinic
        
        # Oxirgi 12 oy
        end_date = date.today()
        start_date = end_date - timedelta(days=365)
        
        sales_data = MedicineSale.objects.filter(
            medicine__branch__clinic=clinic,
            created_at__date__range=[start_date, end_date]
        ).values('created_at__month').annotate(
            total_sales=Sum('final_price'),
            total_quantity=Sum('quantity')
        ).order_by('created_at__month')
        
        # Oylar nomlari
        months = ['Yan', 'Feb', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']
        
        chart_data = []
        for item in sales_data:
            chart_data.append({
                'month': months[item['created_at__month'] - 1],
                'sales': float(item['total_sales']),
                'quantity': item['total_quantity']
            })
        
        return Response({'sales_chart': chart_data})


class MedicineStockChartView(APIView):
    """
    Ombor grafigi uchun ma'lumotlar
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        clinic = user.clinic
        
        # Kategoriyalar bo'yicha ombor
        stock_by_category = Medicine.objects.filter(
            branch__clinic=clinic
        ).values('category__name').annotate(
            total_quantity=Sum('stock_quantity'),
            total_value=Sum(F('stock_quantity') * F('unit_price'))
        )
        
        # Status bo'yicha ombor
        stock_by_status = {
            'normal': Medicine.objects.filter(
                branch__clinic=clinic,
                stock_quantity__gt=F('minimum_stock'),
                expiry_date__gt=date.today()
            ).count(),
            'low_stock': Medicine.objects.filter(
                branch__clinic=clinic,
                stock_quantity__lte=F('minimum_stock')
            ).count(),
            'expired': Medicine.objects.filter(
                branch__clinic=clinic,
                expiry_date__lt=date.today()
            ).count(),
            'expiring_soon': Medicine.objects.filter(
                branch__clinic=clinic,
                expiry_date__lte=date.today() + timedelta(days=30),
                expiry_date__gt=date.today()
            ).count()
        }
        
        return Response({
            'stock_by_category': list(stock_by_category),
            'stock_by_status': stock_by_status
        })


class MedicineSearchView(APIView):
    """
    Dorilarni qidirish
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        query = request.query_params.get('q', '')
        
        if not query:
            return Response({'medicines': []})
        
        medicines = Medicine.objects.filter(
            branch__clinic=user.clinic,
        ).filter(
            Q(name__icontains=query) |
            Q(generic_name__icontains=query) |
            Q(medicine_code__icontains=query) |
            Q(barcode__icontains=query)
        )[:10]
        
        serializer = MedicineSerializer(medicines, many=True)
        return Response({'medicines': serializer.data})


class MedicineBarcodeView(APIView):
    """
    Barkod orqali dori qidirish
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        barcode = request.query_params.get('barcode', '')
        
        if not barcode:
            return Response({'error': 'Barkod kiritilmagan'}, status=400)
        
        try:
            medicine = Medicine.objects.get(
                branch__clinic=user.clinic,
                barcode=barcode
            )
            serializer = MedicineSerializer(medicine)
            return Response(serializer.data)
        except Medicine.DoesNotExist:
            return Response({'error': 'Dori topilmadi'}, status=404)


class MedicineExpiryReportView(APIView):
    """
    Muddati tugaydigan dorilar hisoboti
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        days = int(request.query_params.get('days', 30))
        
        expiry_date = date.today() + timedelta(days=days)
        
        medicines = Medicine.objects.filter(
            branch__clinic=user.clinic,
            expiry_date__lte=expiry_date,
            expiry_date__gte=date.today()
        ).order_by('expiry_date')
        
        serializer = MedicineSerializer(medicines, many=True)
        return Response({
            'days': days,
            'medicines': serializer.data
        })


class MedicineLowStockReportView(APIView):
    """
    Kam ombordagi dorilar hisoboti
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        
        medicines = Medicine.objects.filter(
            branch__clinic=user.clinic,
            stock_quantity__lte=F('minimum_stock')
        ).order_by('stock_quantity')
        
        serializer = MedicineSerializer(medicines, many=True)
        return Response({
            'medicines': serializer.data
        })



def get_statistics(period: str):
    today = now().date()
    debts = CustomerDebt.objects.all()
    
    if period == "daily":
        start_date = today
        end_date = today
    elif period == "monthly":
        start_date = today.replace(day=1)
        last_day = (start_date.replace(month=start_date.month % 12 + 1, day=1) - timedelta(days=1))
        end_date = last_day
    elif period == "quarterly":
        quarter = (today.month - 1) // 3 + 1
        start_month = 3 * (quarter - 1) + 1
        start_date = today.replace(month=start_month, day=1)
        if start_month + 2 > 12:
            end_date = today.replace(year=today.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            end_date = today.replace(month=start_month + 3, day=1) - timedelta(days=1)
    elif period == "yearly":
        start_date = today.replace(month=1, day=1)
        end_date = today.replace(month=12, day=31)
    else:
        raise ValueError("Invalid period. Choose: daily, monthly, quarterly, yearly.")

    queryset = debts.filter(meeting__created_at__date__range=[start_date, end_date])

    stats = queryset.aggregate(
        total_paid=Sum("amount_paid"),
        total_discount=Sum("discount"),
        count=Count("id"),
    )

    return {
        "period": period,
        "total_paid": stats["total_paid"] or 0,
        "total_discount": stats["total_discount"] or 0,
        "count": stats["count"],
    }



class CustomerDebtStatisticsView(APIView):
    def get(self, request, *args, **kwargs):
        period = request.query_params.get("period", "monthly")  # default = monthly

        try:
            data = get_statistics(period)
            return Response(data, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class CustomerDebtDynamicStatisticsAPIView(APIView):
    """
    API orqali mijoz qarzlari statistikasi:
    - yillik (12 oy bo‘yicha)
    - oylik (shu oyning kunlari bo‘yicha)
    - chorak (shu chorakdagi 3 oy bo‘yicha)
    - dinamik (interval bo‘yicha, masalan: ?start_date=2025-01-01&end_date=2025-01-31)
    """

    def get(self, request, *args, **kwargs):
        stat_type = request.query_params.get("type", "yearly")  # default yearly
        today = now().date()

        if stat_type == "yearly":
            data = self.get_yearly_statistics(today)

        elif stat_type == "monthly":
            data = self.get_monthly_statistics(today)

        elif stat_type == "quarterly":
            data = self.get_quarterly_statistics(today)

        elif stat_type == "dynamic":
            start_date = request.query_params.get("start_date")
            end_date = request.query_params.get("end_date")
            data = self.get_dynamic_statistics(start_date, end_date)

        else:
            return Response({"error": "Noto‘g‘ri type parametri!"}, status=400)

        return Response({"type": stat_type, "data": data})

    # 📊 YILLIK
    def get_yearly_statistics(self, today):
        year = today.year
        data = []
        for month in range(1, 13):
            total = (
                CustomerDebt.objects.filter(meeting__date__year=year, meeting__date__month=month)
                .aggregate(total=Sum("amount_paid"))
                .get("total") or 0
            )
            data.append({
                "month": calendar.month_name[month],
                "total_amount": total
            })
        return data

    # 📊 OYLIK
    def get_monthly_statistics(self, today):
        year, month = today.year, today.month
        days_in_month = calendar.monthrange(year, month)[1]
        data = []
        for day in range(1, days_in_month + 1):
            total = (
                CustomerDebt.objects.filter(meeting__date__year=year, meeting__date__month=month, meeting__date__day=day)
                .aggregate(total=Sum("amount_paid"))
                .get("total") or 0
            )
            data.append({
                "day": day,
                "total_amount": total
            })
        return data

    # 📊 CHORAK
    def get_quarterly_statistics(self, today):
        year, month = today.year, today.month
        quarter = (month - 1) // 3 + 1
        start_month = (quarter - 1) * 3 + 1
        data = []
        for m in range(start_month, start_month + 3):
            total = (
                CustomerDebt.objects.filter(meeting__date__year=year, meeting__date__month=m)
                .aggregate(total=Sum("amount_paid"))
                .get("total") or 0
            )
            data.append({
                "month": calendar.month_name[m],
                "total_amount": total
            })
        return data

    # 📊 DINAMIK (start_date, end_date)
    def get_dynamic_statistics(self, start_date, end_date):
        try:
            start = start_date or (now().date() - timedelta(days=30))
            end = end_date or now().date()
        except Exception:
            return {"error": "Sana formati noto‘g‘ri! YYYY-MM-DD bo‘lishi kerak."}

        debts = (
            CustomerDebt.objects.filter(meeting__date__range=[start, end])
            .values("meeting__date")
            .annotate(total=Sum("amount_paid"))
            .order_by("meeting__date")
        )

        return [
            {
                "date": d["meeting__date"],
                "total_amount": d["total"]
            }
            for d in debts
        ]



class CustomerMedicineView(generics.ListAPIView):
    serializer_class = CustomerMedicineSerializer
    pagination_class = CustomPagination

    def get_queryset(self):
        customer_id = self.kwargs["customer_id"]
        return MedicineSale.objects.filter(customer_id=customer_id)