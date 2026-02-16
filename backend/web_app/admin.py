from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import (
    User, Transaction, Wallet, Agent,
    TransactionCharge, Notification
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin interface for User model"""
    
    list_display = [
        'phone_number', 'full_name', 'account_balance',
        'is_verified', 'is_active', 'date_joined'
    ]
    list_filter = ['is_active', 'is_verified', 'is_staff', 'date_joined']
    search_fields = ['phone_number', 'first_name', 'last_name', 'id_number', 'email']
    ordering = ['-date_joined']
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('phone_number', 'first_name', 'last_name', 'email', 'id_number')
        }),
        ('Account Information', {
            'fields': ('account_balance', 'is_verified')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Important dates', {
            'fields': ('last_login', 'date_joined')
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'phone_number', 'first_name', 'last_name', 'id_number',
                'password1', 'password2', 'is_staff', 'is_active'
            )
        }),
    )
    
    readonly_fields = ['date_joined', 'last_login']
    
    def full_name(self, obj):
        return obj.full_name
    full_name.short_description = 'Full Name'


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    """Admin interface for Transaction model"""
    
    list_display = [
        'transaction_code', 'transaction_type', 'amount',
        'transaction_cost', 'status', 'created_at', 'get_status_badge'
    ]
    list_filter = ['transaction_type', 'status', 'created_at']
    search_fields = ['transaction_code', 'sender__phone_number', 'receiver__phone_number']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Transaction Details', {
            'fields': (
                'transaction_code', 'transaction_type', 'amount',
                'transaction_cost', 'status', 'description'
            )
        }),
        ('Parties', {
            'fields': ('sender', 'receiver')
        }),
        ('Balance Tracking', {
            'fields': (
                'sender_balance_before', 'sender_balance_after',
                'receiver_balance_before', 'receiver_balance_after'
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'completed_at')
        }),
    )
    
    readonly_fields = [
        'transaction_code', 'sender_balance_before', 'sender_balance_after',
        'receiver_balance_before', 'receiver_balance_after',
        'created_at', 'completed_at'
    ]
    
    def get_status_badge(self, obj):
        """Display status with color badge"""
        colors = {
            'PENDING': '#FFA500',
            'COMPLETED': '#28A745',
            'FAILED': '#DC3545',
            'REVERSED': '#6C757D',
        }
        color = colors.get(obj.status, '#6C757D')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            obj.get_status_display()
        )
    get_status_badge.short_description = 'Status Badge'
    
    def has_add_permission(self, request):
        """Disable add transaction from admin"""
        return False


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    """Admin interface for Wallet model"""
    
    list_display = [
        'user', 'get_balance', 'daily_limit', 'transaction_limit',
        'is_active', 'is_locked', 'updated_at'
    ]
    list_filter = ['is_active', 'is_locked', 'created_at']
    search_fields = ['user__phone_number', 'user__first_name', 'user__last_name']
    ordering = ['-updated_at']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Limits', {
            'fields': ('daily_limit', 'transaction_limit')
        }),
        ('Statistics', {
            'fields': (
                'total_sent', 'total_received',
                'total_deposited', 'total_withdrawn'
            )
        }),
        ('Status', {
            'fields': ('is_active', 'is_locked')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    readonly_fields = [
        'total_sent', 'total_received', 'total_deposited',
        'total_withdrawn', 'created_at', 'updated_at'
    ]
    
    def get_balance(self, obj):
        """Display user balance"""
        return f"KES {obj.user.account_balance:,.2f}"
    get_balance.short_description = 'Current Balance'


@admin.register(Agent)
class AgentAdmin(admin.ModelAdmin):
    """Admin interface for Agent model"""
    
    list_display = [
        'agent_number', 'store_name', 'location',
        'float_balance', 'is_verified', 'is_active', 'created_at'
    ]
    list_filter = ['is_active', 'is_verified', 'created_at']
    search_fields = ['agent_number', 'store_name', 'location', 'user__phone_number']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Agent Details', {
            'fields': ('user', 'agent_number', 'store_name', 'location')
        }),
        ('Financial', {
            'fields': ('float_balance', 'total_commission_earned', 'commission_rate')
        }),
        ('Status', {
            'fields': ('is_active', 'is_verified')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    readonly_fields = ['agent_number', 'total_commission_earned', 'created_at', 'updated_at']
    
    def save_model(self, request, obj, form, change):
        """Generate agent number if new"""
        if not change:  # New agent
            import random
            import string
            obj.agent_number = 'AG' + ''.join(random.choices(string.digits, k=8))
        super().save_model(request, obj, form, change)


@admin.register(TransactionCharge)
class TransactionChargeAdmin(admin.ModelAdmin):
    """Admin interface for TransactionCharge model"""
    
    list_display = [
        'transaction_type', 'get_amount_range', 'charge',
        'is_active', 'updated_at'
    ]
    list_filter = ['transaction_type', 'is_active']
    ordering = ['transaction_type', 'min_amount']
    
    fieldsets = (
        ('Charge Details', {
            'fields': ('transaction_type', 'min_amount', 'max_amount', 'charge')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def get_amount_range(self, obj):
        """Display amount range"""
        return f"KES {obj.min_amount:,.2f} - {obj.max_amount:,.2f}"
    get_amount_range.short_description = 'Amount Range'


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """Admin interface for Notification model"""
    
    list_display = [
        'user', 'notification_type', 'title',
        'is_read', 'created_at', 'get_read_status'
    ]
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['user__phone_number', 'title', 'message']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Notification Details', {
            'fields': ('user', 'notification_type', 'title', 'message', 'transaction')
        }),
        ('Status', {
            'fields': ('is_read', 'read_at')
        }),
        ('Timestamps', {
            'fields': ('created_at',)
        }),
    )
    
    readonly_fields = ['created_at', 'read_at']
    
    def get_read_status(self, obj):
        """Display read status with icon"""
        if obj.is_read:
            return format_html(
                '<span style="color: green;">✓ Read</span>'
            )
        return format_html(
            '<span style="color: orange;">⊗ Unread</span>'
        )
    get_read_status.short_description = 'Status'


# Customize admin site
admin.site.site_header = 'M-Pesa System Administration'
admin.site.site_title = 'M-Pesa Admin'
admin.site.index_title = 'Welcome to M-Pesa System Admin Panel'