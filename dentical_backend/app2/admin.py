from django.contrib import admin
from .models import *

@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ('question', 'branch', 'get_images')

    def get_images(self, obj):
        return ", ".join([image.image.url for image in obj.images.all()])
    get_images.short_description = "Rasmlar"

@admin.register(FAQImages)
class FAQImagesAdmin(admin.ModelAdmin):
    list_display = ('image',)

@admin.register(MedicineCategory)
class MedicineCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'clinic', 'created_at']
    list_filter = ['clinic']
    search_fields = ['name']


@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'category', 'dosage_strength', 'dosage_unit', 
        'stock_quantity', 'unit_price', 'retail_price', 
        'expiry_date', 'status', 'branch'
    ]
    list_filter = ['category', 'status', 'branch', 'dosage_unit']
    search_fields = ['name', 'generic_name', 'medicine_code', 'barcode']
    readonly_fields = ['is_low_stock', 'is_expired', 'is_expiring_soon']
    
    fieldsets = (
        ('Asosiy ma\'lumotlar', {
            'fields': ('name', 'generic_name', 'category', 'manufacturer')
        }),
        ('Doza va narx', {
            'fields': ('dosage_strength', 'dosage_unit', 'unit_price', 'retail_price')
        }),
        ('Ombor ma\'lumotlari', {
            'fields': ('stock_quantity', 'minimum_stock', 'expiry_date')
        }),
        ('Qo\'shimcha ma\'lumotlar', {
            'fields': ('description', 'side_effects', 'contraindications', 'instructions')
        }),
        ('Status va kodlar', {
            'fields': ('status', 'branch', 'barcode', 'medicine_code')
        }),
    )


@admin.register(MedicinePurchase)
class MedicinePurchaseAdmin(admin.ModelAdmin):
    list_display = [
        'medicine', 'supplier', 'quantity', 'unit_cost', 
        'total_cost', 'purchase_date', 'purchased_by'
    ]
    list_filter = ['purchase_date', 'supplier', 'medicine__category']
    search_fields = ['medicine__name', 'supplier', 'invoice_number']
    readonly_fields = ['total_cost']


@admin.register(MedicineSale)
class MedicineSaleAdmin(admin.ModelAdmin):
    list_display = [
        'medicine', 'customer', 'quantity', 'unit_price', 
        'total_price', 'final_price', 'sale_type', 'sold_by'
    ]
    list_filter = ['sale_type', 'created_at', 'medicine__category']
    search_fields = ['medicine__name', 'customer__full_name', 'prescription_number']
    readonly_fields = ['total_price', 'final_price']


@admin.register(MedicineStockAdjustment)
class MedicineStockAdjustmentAdmin(admin.ModelAdmin):
    list_display = [
        'medicine', 'adjustment_type', 'quantity', 
        'reason', 'adjusted_by', 'created_at'
    ]
    list_filter = ['adjustment_type', 'created_at', 'medicine__category']
    search_fields = ['medicine__name', 'reason']


@admin.register(MedicinePrescription)
class MedicinePrescriptionAdmin(admin.ModelAdmin):
    list_display = [
        'customer', 'doctor', 'prescription_date', 
        'diagnosis', 'is_active'
    ]
    list_filter = ['prescription_date', 'is_active', 'doctor']
    search_fields = ['customer__full_name', 'doctor__get_full_name', 'diagnosis']


@admin.register(PrescriptionItem)
class PrescriptionItemAdmin(admin.ModelAdmin):
    list_display = [
        'prescription', 'medicine', 'dosage', 
        'frequency', 'duration', 'quantity'
    ]
    list_filter = ['medicine__category', 'prescription__prescription_date']
    search_fields = ['medicine__name', 'prescription__customer__full_name']


# Boshqa modellar uchun oddiy ro'yxatdan o'tkazish
admin.site.register(VitalSign)
admin.site.register(MedicineSchedule)
admin.site.register(MedicineHistory)
admin.site.register(NurseSchedule)  
admin.site.register(Hospitalization)
admin.site.register(NurseNote)
admin.site.register(NotificationReadStatus)
admin.site.register(ClinicNotificationReadStatus)
admin.site.register(ContactRequest)
admin.site.register(CustomerDebt)