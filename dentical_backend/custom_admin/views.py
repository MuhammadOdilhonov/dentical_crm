from datetime import datetime
from datetime import timedelta
from datetime import date
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import viewsets, status, filters
from .models import *
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from .serializers import *
from rest_framework.permissions import IsAdminUser
from app.serializers import LoginSerializer
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from app.serializers import *
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from app.pagination import *
from decimal import Decimal

class ClinicSubscriptionViewSet(viewsets.ModelViewSet):
    queryset = ClinicSubscription.objects.all()
    serializer_class = ClinicSubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Faqat superuserlar va `role=director` bo'lgan foydalanuvchilar uchun ma'lumotlarni cheklash.
        """
        user = self.request.user
        if user.is_superuser:
            return ClinicSubscription.objects.all()
        elif user.role == 'director':
            return ClinicSubscription.objects.filter(clinic__director=user)
        return ClinicSubscription.objects.none()
    
    def create(self, request, *args, **kwargs):
        clinic_id = request.data.get('clinic')
        if ClinicSubscription.objects.filter(clinic_id=clinic_id, status='active').exists():
            return Response(
                {"clinic": "Ushbu klinikaning faol obunasi allaqachon mavjud."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().create(request, *args, **kwargs)

class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [IsAdminUser]  # Faqat superuserlar uchun ruxsat


class ClinicDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, clinic_id, *args, **kwargs):
            try:
                clinic = Clinic.objects.get(id=clinic_id)
                subscription = ClinicSubscription.objects.filter(clinic=clinic).first()
                director = User.objects.filter(clinic=clinic, role='director').first()

                # Klinikaga tegishli barcha branchlar
                branches = Branch.objects.filter(clinic=clinic)

                # Klinikaga bog'liq barcha modellar uchun taxminiy hajm hisoblash (obyekt soniga asoslangan)
                user_count = User.objects.filter(clinic=clinic).count()
                branch_count = branches.count()
                patient_count = Customer.objects.filter(branch__in=branches).count()
                appointment_count = Customer.objects.filter(branch__in=branches).count()
                meeting_count = Meeting.objects.filter(branch__in=branches).count()

                # Taxminiy saqlash hajmi (MB) — bu siz belgilagan o'rtacha qiymatlar asosida
                total_storage_used_mb = (
                    user_count * 0.2 +           # Har bir foydalanuvchi ~0.2 MB
                    branch_count * 0.5 +         # Har bir filial ~0.5 MB
                    patient_count * 0.3 +        # Har bir bemor ~0.3 MB
                    appointment_count * 0.1 +    # Har bir qabul ~0.1 MB
                    meeting_count * 0.15         # Har bir uchrashuv ~0.15 MB
                )

                total_storage_used_gb = round(total_storage_used_mb / 1024, 2)  # MB -> GB

                data = {
                    "clinic_name": clinic.name,
                    "director": f"{director.first_name} {director.last_name}" if director else "Noma'lum",
                    # "address": clinic.address,
                    "phone": clinic.phone_number,
                    "email": clinic.email,
                    "status": clinic.is_active,
                    "storage": {
                        "used": total_storage_used_gb,
                        "allocated": subscription.plan.storage_limit_gb if subscription else 0,
                        "remaining": round(float(subscription.plan.storage_limit_gb) - total_storage_used_gb, 2) if subscription else 0
                    }
                }
                return Response(data, status=200)

            except Clinic.DoesNotExist:
                return Response({"error": "Klinika topilmadi."}, status=404)
    def patch(self, request, clinic_id, *args, **kwargs):
        clinic = get_object_or_404(Clinic, pk=clinic_id)
        serializer = ClinicSerializer(clinic, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, clinic_id, *args, **kwargs):
        clinic = get_object_or_404(Clinic, pk=clinic_id)
        clinic.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class BranchListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, clinic_id, *args, **kwargs):
        branches = Branch.objects.filter(clinic_id=clinic_id)
        data = []

        for branch in branches:
            # Foydalanuvchilarni rollar bo'yicha hisoblash
            doctors = User.objects.filter(branch=branch, role="doctor").count()
            administrators = User.objects.filter(branch=branch, role="admin").count()
            nurses = User.objects.filter(branch=branch, role="nurse").count()
            total_employees = User.objects.filter(branch=branch).count()

            # Bemorlarni hisoblash
            patients = Customer.objects.filter(branch=branch).count()

            # Filial ma'lumotlarini yig'ish
            data.append({
                "name": branch.name,
                "address": branch.address,
                "phone": branch.phone_number,
                "doctors": doctors,
                "administrators": administrators,
                "nurses": nurses,
                "total_employees": total_employees,
                "patients": patients
            })

        return Response(data, status=200)


class SubscriptionDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, clinic_id, *args, **kwargs):
        try:
            subscription = ClinicSubscription.objects.filter(clinic_id=clinic_id, status='active').first()
            data = {
                "plan_name": subscription.plan.name,
                "start_date": subscription.start_date,
                "end_date": subscription.end_date,
                "discount": subscription.discount,
                "trial_period": subscription.plan.trial_period_days
            }
            return Response(data, status=200)
        except ClinicSubscription.DoesNotExist:
            return Response({"error": "Obuna ma'lumotlari topilmadi."}, status=404)


class FinancialDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, clinic_id, *args, **kwargs):
        try:
            clinic = Clinic.objects.get(id=clinic_id)
            subscription = ClinicSubscription.objects.filter(clinic=clinic).first()

            branches = Branch.objects.filter(clinic=clinic)

            # Klinikaga bog'liq ma'lumotlar soni
            user_count = User.objects.filter(clinic=clinic).count()
            branch_count = branches.count()
            patient_count = Customer.objects.filter(branch__in=branches).count()
            customer_count = Customer.objects.filter(branch__in=branches).count()
            meeting_count = Meeting.objects.filter(branch__in=branches).count()

            # Taxminiy saqlash hajmini hisoblash (MB)
            total_storage_used_mb = (
                user_count * 0.2 +
                branch_count * 0.5 +
                patient_count * 0.3 +
                customer_count * 0.1 +
                meeting_count * 0.15
            )
            total_storage_used_gb = round(total_storage_used_mb / 1024, 2)
            
            # Moliyaviy hisoblash
            storage_cost_per_gb = 10000  # So'm
            data_storage_cost = total_storage_used_gb * storage_cost_per_gb
            data_storage_cost = total_storage_used_gb * storage_cost_per_gb
            subscription_price = subscription.plan.price if subscription else 0

            discount_amount = Decimal(0)
            if subscription and subscription.discount:
                try:
                    discount_percentage = Decimal(subscription.discount.strip('%')) / Decimal(100)
                    discount_amount = subscription_price * (Decimal(1) - discount_percentage)
                except ValueError:
                    discount_amount = subscription_price  # Agar discount noto'g'ri formatda bo'lsa, to'liq narxni hisoblaymiz

            # Klinikaga ajratilgan joyning summasini hisoblash
            allocated_storage_cost = Decimal(0)
            if subscription and subscription.plan.storage_limit_gb:
                allocated_storage_cost = Decimal(subscription.plan.storage_limit_gb) * Decimal(storage_cost_per_gb)
            net_profit = round(discount_amount - allocated_storage_cost, 2)
            data = {
                "subscription_price": round(subscription_price, 2),  # Tarif narxi
                "discount_amount": round(discount_amount, 2),       # Discountdan keyingi summa
                "data_storage_cost": round(data_storage_cost, 2),   # Saqlash narxi
                "allocated_storage_cost": round(allocated_storage_cost, 2),  # Ajratilgan joy summasi
                "net_profit": net_profit,                           # Net foyda
                "estimated_storage_used_gb": total_storage_used_gb  # Taxminiy ishlatilgan joy
            }
            return Response(data, status=200)

        except Clinic.DoesNotExist:
            return Response({"error": "Klinika topilmadi."}, status=404)



class BranchStatisticsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, clinic_id, *args, **kwargs):
        branches = Branch.objects.filter(clinic_id=clinic_id)
        data = []

        for branch in branches:
            # Xodimlar statistikasi
            doctors = User.objects.filter(branch=branch, role="doctor").count()
            admins = User.objects.filter(branch=branch, role="admin").count()
            nurses = User.objects.filter(branch=branch, role="nurse").count()
            total_employees = User.objects.filter(branch=branch).count()

            # Bemorlar statistikasi
            total_patients = Customer.objects.filter(branch=branch).count()
            daily_patients = Customer.objects.filter(branch=branch, created_at__date__gte=datetime.now().date()).count()
            monthly_patients = Customer.objects.filter(branch=branch, created_at__date__gte=(datetime.now() - timedelta(days=30))).count()
            yearly_patients = Customer.objects.filter(branch=branch, created_at__date__gte=(datetime.now() - timedelta(days=365))).count()

            # Filial ma'lumotlarini yig'ish
            data.append({
                "branch_name": branch.name,
                "employees": {
                    "total": total_employees,
                    "doctors": doctors,
                    "admins": admins,
                    "nurses": nurses,
                },
                "patients": {
                    "total": total_patients,
                    "daily": daily_patients,
                    "monthly": monthly_patients,
                    "yearly": yearly_patients,
                }
            })

        return Response(data, status=200)


class ApiIssueViewSet(viewsets.ModelViewSet):
    queryset = ApiIssue.objects.all().order_by('-reported_at')
    serializer_class = ApiIssueSerializer

    def get_permissions(self):
        """
        POST so'rovlar uchun `AllowAny`, boshqa operatsiyalar uchun `IsAuthenticated`.
        """
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        """
        PATCH so'rovlar uchun alohida serializer ishlatish.
        """
        if self.action in ['update', 'partial_update']:
            return ApiIssueUpdateSerializer
        return super().get_serializer_class()

    def partial_update(self, request, *args, **kwargs):
        """
        Statusni yangilash va hal qilingan vaqtni qo'shish.
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Muammo holati muvaffaqiyatli yangilandi."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SuperuserLoginView(APIView):
    permission_classes = [AllowAny]  # Superuser login uchun ruxsatni boshqarish

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            user = authenticate(username=username, password=password)

            if user and user.is_superuser:  # Faqat superuserlarni tekshirish
                refresh = RefreshToken.for_user(user)
                return Response({
                    'token': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'role': user.role,
                        'is_superuser': user.is_superuser
                    }
                })
            return Response(
                {'error': "Faqat superuserlar tizimga kira oladi yoki noto'g'ri login/parol."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ClinicListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, *args, **kwargs):
        clinics = Clinic.objects.all()
        paginator = CustomPagination()
        result_page = paginator.paginate_queryset(clinics, request)

        data = []

        for clinic in result_page:  # SHU YERDA o‘zgartirish kiritildi
            branches = Branch.objects.filter(clinic=clinic)
            branch_count = branches.count()
            total_employees = User.objects.filter(branch__in=branches).count()

            subscription = ClinicSubscription.objects.filter(clinic=clinic, status='active').first()
            subscription_plan = subscription.plan.name if subscription and subscription.plan else "Noma'lum"
            storage_limit = subscription.plan.storage_limit_gb if subscription and subscription.plan else 0

            storage_used = 0
            for branch in branches:
                patients_storage = branch.users.count() * 0.01
                employees_storage = branch.users.count() * 0.005
                storage_used += patients_storage + employees_storage
            storage_used = round(storage_used, 2)

            director = User.objects.filter(clinic=clinic, role="director").first()
            director_name = f"{director.first_name} {director.last_name}" if director else "Noma'lum"

            status = "Faol" if getattr(clinic, "is_active", True) else "Faol emas"

            data.append({
                "id": clinic.id,
                "clinic_name": clinic.name,
                "director": director_name,
                "branches": branch_count,
                "employees": total_employees,
                "subscription_plan": subscription_plan,
                "storage": f"{storage_used} GB / {storage_limit} GB",
                "subscription_period": f"{subscription.start_date} - {subscription.end_date}" if subscription else "Noma'lum",
                "status": status,
            })

        return paginator.get_paginated_response(data)


class ClinicSubscriptionHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ClinicSubscription.objects.all().order_by('-start_date')
    serializer_class = ClinicSubscriptionSerializer
    permission_classes = [IsAdminUser]  # Faqat superuserlar uchun ruxsat


class ClinicSubscriptionHistoryInIDView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, clinic_id, *args, **kwargs):
        user = request.user
        # Faqat superuser yoki shu klinikaning direktori ko‘ra oladi
        if not (user.is_superuser or (user.role == 'director' and user.clinic_id == clinic_id)):
            return Response({"detail": "Ruxsat yo‘q."}, status=403)

        subscriptions = ClinicSubscription.objects.filter(clinic_id=clinic_id).order_by('-start_date')

        # Pagination
        paginator = PageNumberPagination()
        paginator.page_size = int(request.query_params.get('page_size', 10))
        result_page = paginator.paginate_queryset(subscriptions, request)

        data = []
        for sub in result_page:
            data.append({
                "plan": sub.plan.name if sub.plan else None,
                "start_date": sub.start_date,
                "end_date": sub.end_date,
                "status": sub.status,
                "discount": sub.discount,
                "paid_amount": sub.paid_amount,
                # "created_at": sub.created_at,
                # "updated_at": sub.updated_at,
            })
        return paginator.get_paginated_response(data)

class ClinicSelectListView(APIView):
    permission_classes = [IsAuthenticated]  # Faqat autentifikatsiya qilingan foydalanuvchilar uchun

    def get(self, request, *args, **kwargs):
        search_query = request.query_params.get('search', '')  # Qidiruv so'rovi
        clinics = Clinic.objects.filter(name__icontains=search_query)  # Klinikalarni qidiruv bo'yicha filtrlash
        data = clinics.values('id', 'name')  # Faqat kerakli maydonlarni qaytarish
        return Response(data, status=200)


class SubscriptionPlanSelectListView(APIView):
    permission_classes = [IsAuthenticated]  # Faqat autentifikatsiya qilingan foydalanuvchilar uchun

    def get(self, request, *args, **kwargs):
        search_query = request.query_params.get('search', '')  # Qidiruv so'rovi
        plans = SubscriptionPlan.objects.filter(name__icontains=search_query)  # Rejalarni qidiruv bo'yicha filtrlash
        data = plans.values('id', 'name', 'price', 'storage_limit_gb', 'trial_period_days')  # Faqat kerakli maydonlarni qaytarish
        return Response(data, status=200)


class ClinicTariffStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        clinic = request.user.clinic

        # Eng so‘nggi faol subscription
        subscription = ClinicSubscription.objects.filter(
            clinic=clinic, status='active'
        ).order_by('-end_date').first()
        if not subscription:
            return Response({"detail": "Faol tarif topilmadi."}, status=404)

        plan = subscription.plan

        # Klinikadagi userlar statistikasi
        total_directors = User.objects.filter(role='director', clinic=clinic).count()
        total_admins = User.objects.filter(role='admin', clinic=clinic).count()
        total_doctors = User.objects.filter(role='doctor', clinic=clinic).count()
        total_branches = Branch.objects.filter(clinic=clinic).count()

        data = {
            "tariff": {
                "name": plan.name,
                "description": plan.description,
                "storage_limit_gb": plan.storage_limit_gb,
                "trial_period_days": plan.trial_period_days,
                "price": plan.price,
                "director_limit": plan.director_limit,
                "admin_limit": plan.admin_limit,
                "doctor_limit": plan.doctor_limit,
                "branch_limit": plan.branch_limit,
            },
            "usage": {
                "directors": total_directors,
                "admins": total_admins,
                "doctors": total_doctors,
                "branches": total_branches,
            },
            "limits": {
                "directors_left": max(plan.director_limit - total_directors, 0),
                "admins_left": max(plan.admin_limit - total_admins, 0),
                "doctors_left": max(plan.doctor_limit - total_doctors, 0),
                "branches_left": max(plan.branch_limit - total_branches, 0),
            },
            "subscription": {
                "start_date": subscription.start_date,
                "end_date": subscription.end_date,
                "status": subscription.status,
                "paid_amount": subscription.paid_amount,
                "discount": subscription.discount,
                "description_discount": subscription.description_discount,
            }
        }
        return Response(data)


class InactiveClinicViewSet(viewsets.ModelViewSet):
    queryset = InactiveClinic.objects.select_related('clinic').all()
    permission_classes = [IsAdminUser]
    serializer_class = InactiveClinicSerializer  # Yangi serializer yozing

    @action(detail=True, methods=['post'])
    def add_days(self, request, pk=None):
        obj = self.get_object()
        days = int(request.data.get('days', 1))
        comment = request.data.get('comment', '')

        obj.inactive_days += days
        obj.comment = comment
        obj.save(update_fields=['inactive_days', 'comment'])

        # Klinikaga email yuborish
        clinic = obj.clinic
        if clinic.email:
            from django.core.mail import send_mail
            send_mail(
                subject="Klinikangiz faol emasligi haqida ogohlantirish",
                message=f"Hurmatli {clinic.name}, sizning klinikangizga {days} kun qo‘shildi.\n\nIzoh: {comment}",
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[clinic.email],
                fail_silently=True,
            )

        return Response({'status': 'days added', 'inactive_days': obj.inactive_days, 'comment': obj.comment})

    @action(detail=True, methods=['post'])
    def notify(self, request, pk=None):
        obj = self.get_object()
        clinic = obj.clinic
        if clinic.email:
            send_mail(
                subject="Klinika faol emasligi haqida ogohlantirish",
                message=f"Hurmatli {clinic.name}, sizning klinikangiz foydalanuvchilari {obj.inactive_days} kundan beri faol emas.",
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[clinic.email],
                fail_silently=True,
            )
            obj.notified = True
            obj.save(update_fields=['notified'])
            return Response({'status': 'notified'})
        return Response({'error': 'Clinic email not found'}, status=status.HTTP_400_BAD_REQUEST)



class ClinicNotifyView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, clinic_id):
        title = request.data.get('title')
        message = request.data.get('message')
        if not title or not message:
            return Response({'error': 'title va message majburiy.'}, status=400)

        # Klinikani va direktorini topish
        clinic = get_object_or_404(Clinic, pk=clinic_id)
        director = clinic.users.filter(role='director').first()

        # Notification modeliga yozish
        ClinicNotification.objects.create(
            title=title,
            message=message,
            clinic=clinic,
            status='director'
        )

        # Real-time notification (WebSocket)
        if director:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"clinic_notifications_{director.id}",
                {
                    "type": "notification_message",
                    "title": title,
                    "message": message,
                    "timestamp": now().strftime("%Y-%m-%d %H:%M:%S"),
                }
            )

        # Klinikaga email yuborish
        if clinic.email:
            send_mail(
                subject=title,
                message=message,
                from_email="noreply@yourdomain.uz",
                recipient_list=[clinic.email],
                fail_silently=True,
            )

        return Response({'status': 'notification sent'})



class TargetViewSet(viewsets.ModelViewSet):
    queryset = Target.objects.all().order_by('-created_at')
    serializer_class = TargetSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'phone_number', 'clinic_name', 'location']
    ordering_fields = ['created_at']

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'destroy', 'update', 'partial_update']:
            return [IsAdminUser()]
        return [AllowAny()]

    def get_queryset(self):
        queryset = Target.objects.all().order_by('-created_at')
        status_param = self.request.query_params.get('status')
        location_param = self.request.query_params.get('location')
        if status_param:
            queryset = queryset.filter(status=status_param)
        if location_param:
            queryset = queryset.filter(location__icontains=location_param)
        return queryset


class TargetStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response({
            "total": Target.objects.count(),
            "yangi": Target.objects.filter(status='yangi').count(),
            "aloqada": Target.objects.filter(status='aloqada').count(),
            "mijozga_aylandi": Target.objects.filter(status='mijozga_aylandi').count(),
            "rad_etildi": Target.objects.filter(status='rad_etildi').count(),
            "raqam_xato": Target.objects.filter(status='raqam_xato').count(),
            "telefon_kotarmadi": Target.objects.filter(status='telefon_kotarmadi').count(),
        })


class SuperAdminClinicCreateView(APIView):
    """
    SuperAdmin tomonidan yangi klinika + direktor yaratish.
    Direktor uchun tasodifiy parol yaratiladi va login ma'lumotlari
    ko'rsatilgan email (gmail) manziliga yuboriladi.
    Ixtiyoriy: plan_id berilsa, klinikaga tarif ham biriktiriladi.
    """
    permission_classes = [IsAdminUser]

    def post(self, request, *args, **kwargs):
        from django.db import transaction
        from django.template.loader import render_to_string
        from django.utils.crypto import get_random_string

        data = request.data
        clinic_name = data.get('clinic_name') or data.get('name')
        full_name = data.get('full_name') or clinic_name
        phone_number = data.get('phone_number')
        license_number = data.get('license_number')
        email = data.get('email')
        director_first_name = data.get('director_first_name', 'Director')
        director_last_name = data.get('director_last_name', '')
        director_phone = data.get('director_phone', phone_number or '')

        # Majburiy maydonlarni tekshirish
        errors = {}
        if not clinic_name:
            errors['clinic_name'] = "Klinika nomi majburiy."
        if not phone_number:
            errors['phone_number'] = "Telefon raqami majburiy."
        if not license_number:
            errors['license_number'] = "Litsenziya raqami majburiy."
        if not email:
            errors['email'] = "Email majburiy."
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        # Unikallikni tekshirish
        if Clinic.objects.filter(email=email).exists():
            return Response({"email": "Bu email bilan klinika allaqachon mavjud."}, status=status.HTTP_400_BAD_REQUEST)
        if Clinic.objects.filter(license_number=license_number).exists():
            return Response({"license_number": "Bu litsenziya raqami allaqachon mavjud."}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({"email": "Bu email bilan foydalanuvchi allaqachon mavjud."}, status=status.HTTP_400_BAD_REQUEST)

        password = get_random_string(length=10)

        try:
            with transaction.atomic():
                clinic = Clinic.objects.create(
                    full_name=full_name,
                    name=clinic_name,
                    phone_number=phone_number,
                    license_number=license_number,
                    email=email,
                    is_active=True,
                    logo=request.FILES.get('logo'),  # Ixtiyoriy logo
                )
                director = User.objects.create_user(
                    username=email,
                    email=email,
                    password=password,
                    clinic=clinic,
                    role='director',
                    specialization='director',
                    first_name=director_first_name,
                    last_name=director_last_name,
                    phone_number=director_phone,
                    status='faol',
                    password_changed=False,  # Birinchi kirishda parolni o'zgartirishi shart
                )

                # Ixtiyoriy: tarif biriktirish
                subscription = None
                plan_id = data.get('plan_id') or data.get('plan')
                if plan_id:
                    try:
                        plan = SubscriptionPlan.objects.get(pk=plan_id)
                    except SubscriptionPlan.DoesNotExist:
                        raise ValueError("Tanlangan tarif topilmadi.")
                    start_date = data.get('start_date') or date.today()
                    end_date = data.get('end_date')
                    if not end_date:
                        days = plan.trial_period_days or 30
                        end_date = (datetime.strptime(str(start_date), '%Y-%m-%d').date()
                                    if isinstance(start_date, str) else start_date) + timedelta(days=days)
                    subscription = ClinicSubscription.objects.create(
                        clinic=clinic,
                        plan=plan,
                        start_date=start_date,
                        end_date=end_date,
                        status='active',
                        paid_amount=data.get('paid_amount') or 0,
                        discount=data.get('discount'),
                    )
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"Klinika yaratishda xatolik: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        # Login ma'lumotlarini emailga yuborish
        email_sent = False
        email_error = None
        context = {
            'clinic_name': clinic.name,
            'full_name': f"{director_first_name} {director_last_name}".strip(),
            'username': email,
            'password': password,
            'plan_name': subscription.plan.name if subscription else None,
            'end_date': subscription.end_date if subscription else None,
            'login_url': settings.FRONTEND_URL,
        }
        plain_message = (
            f"Assalomu alaykum, {context['full_name']}!\n\n"
            f"Sizning \"{clinic.name}\" klinikangiz Dentical CRM tizimida muvaffaqiyatli ro'yxatdan o'tkazildi.\n\n"
            f"Kirish ma'lumotlari:\n"
            f"Login: {email}\n"
            f"Parol: {password}\n\n"
            f"Tizimga kirish: {settings.FRONTEND_URL}\n\n"
            f"Xavfsizlik uchun tizimga kirgach parolni o'zgartirishingizni tavsiya qilamiz.\n\n"
            f"Hurmat bilan,\nDentical CRM jamoasi"
        )
        try:
            html_message = render_to_string('email/clinic_created.html', context)
            send_mail(
                subject=f"Dentical CRM — \"{clinic.name}\" klinikasi yaratildi",
                message=plain_message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
                html_message=html_message,
                fail_silently=False,
            )
            email_sent = True
        except Exception as e:
            email_error = str(e)

        return Response({
            "message": "Klinika va direktor muvaffaqiyatli yaratildi.",
            "clinic": {"id": clinic.id, "name": clinic.name, "email": clinic.email},
            "director": {"id": director.id, "email": director.email},
            "credentials": {"login": email, "password": password},
            "subscription": {
                "plan": subscription.plan.name,
                "start_date": subscription.start_date,
                "end_date": subscription.end_date,
            } if subscription else None,
            "email_sent": email_sent,
            "email_error": email_error,
        }, status=status.HTTP_201_CREATED)


class SuperAdminDashboardView(APIView):
    """SuperAdmin bosh sahifasi uchun umumiy analitika."""
    permission_classes = [IsAdminUser]

    def get(self, request, *args, **kwargs):
        from django.db.models import Sum, Count
        from django.db.models.functions import TruncMonth

        today = date.today()

        total_clinics = Clinic.objects.count()
        active_clinics = Clinic.objects.filter(is_active=True).count()

        active_subs = ClinicSubscription.objects.filter(
            status='active', start_date__lte=today, end_date__gte=today
        )

        # Umumiy va joriy oy daromadi (to'langan summalar bo'yicha)
        total_revenue = ClinicSubscription.objects.aggregate(t=Sum('paid_amount'))['t'] or 0
        month_start = today.replace(day=1)
        monthly_revenue = ClinicSubscription.objects.filter(
            start_date__gte=month_start
        ).aggregate(t=Sum('paid_amount'))['t'] or 0

        # Oylik dinamika (oxirgi 12 oy): yangi klinikalar va tushum
        year_ago = (month_start - timedelta(days=365)).replace(day=1)
        clinics_by_month = (
            Clinic.objects.filter(created_at__date__gte=year_ago)
            .annotate(month=TruncMonth('created_at'))
            .values('month').annotate(count=Count('id')).order_by('month')
        )
        revenue_by_month = (
            ClinicSubscription.objects.filter(start_date__gte=year_ago)
            .annotate(month=TruncMonth('start_date'))
            .values('month').annotate(total=Sum('paid_amount')).order_by('month')
        )

        # Tariflar taqsimoti
        plan_distribution = (
            active_subs.values('plan__name').annotate(count=Count('id')).order_by('-count')
        )

        # Muddati tugashiga 30 kun qolgan obunalar
        expiring_soon = []
        for sub in active_subs.filter(end_date__lte=today + timedelta(days=30)).select_related('clinic', 'plan').order_by('end_date')[:20]:
            expiring_soon.append({
                "clinic_id": sub.clinic.id,
                "clinic_name": sub.clinic.name,
                "plan": sub.plan.name,
                "end_date": sub.end_date,
                "days_left": (sub.end_date - today).days,
            })

        # Oxirgi qo'shilgan klinikalar
        latest_clinics = [{
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "created_at": c.created_at.date(),
            "is_active": c.is_active,
        } for c in Clinic.objects.order_by('-created_at')[:5]]

        return Response({
            "clinics": {
                "total": total_clinics,
                "active": active_clinics,
                "inactive": total_clinics - active_clinics,
                "with_active_subscription": active_subs.values('clinic').distinct().count(),
            },
            "users": {
                "total": User.objects.filter(is_superuser=False).count(),
                "directors": User.objects.filter(role='director').count(),
                "admins": User.objects.filter(role='admin', is_superuser=False).count(),
                "doctors": User.objects.filter(role='doctor', is_superuser=False).count(),
                "nurses": User.objects.filter(role='nurse').count(),
            },
            "patients_total": Customer.objects.count(),
            "meetings_total": Meeting.objects.count(),
            "revenue": {
                "total": total_revenue,
                "this_month": monthly_revenue,
            },
            "charts": {
                "clinics_by_month": [
                    {"month": item['month'].strftime('%Y-%m'), "count": item['count']}
                    for item in clinics_by_month
                ],
                "revenue_by_month": [
                    {"month": item['month'].strftime('%Y-%m'), "total": item['total'] or 0}
                    for item in revenue_by_month
                ],
                "plan_distribution": [
                    {"plan": item['plan__name'], "count": item['count']}
                    for item in plan_distribution
                ],
            },
            "expiring_soon": expiring_soon,
            "latest_clinics": latest_clinics,
            "leads": {
                "total": Target.objects.count(),
                "yangi": Target.objects.filter(status='yangi').count(),
                "mijozga_aylandi": Target.objects.filter(status='mijozga_aylandi').count(),
            },
        })