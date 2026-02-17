from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import RegexValidator, MinValueValidator
from decimal import Decimal
import uuid


class UserManager(BaseUserManager):
    """Custom user manager for phone number authentication"""
    
    def create_user(self, phone_number, pin, **extra_fields):
        if not phone_number:
            raise ValueError('Phone number is required')
        if not pin:
            raise ValueError('PIN is required')
        
        user = self.model(phone_number=phone_number, **extra_fields)
        user.set_password(pin)  # This hashes the PIN
        user.save(using=self._db)
        return user
    
    def create_superuser(self, phone_number, pin, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        return self.create_user(phone_number, pin, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model using phone number for authentication"""
    
    phone_regex = RegexValidator(
        regex=r'^254\d{9}$',
        message="Phone number must be in format: 254XXXXXXXXX"
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone_number = models.CharField(
        max_length=12,
        unique=True,
        validators=[phone_regex]
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(blank=True, null=True)
    id_number = models.CharField(max_length=20, unique=True)
    pin = models.IntegerField(default = 0000)
    
    # Account details
    account_balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    
    # User status
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    
    # Timestamps
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'id_number', 'pin']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.phone_number} - {self.first_name} {self.last_name}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class Transaction(models.Model):
    """Model for all financial transactions"""
    
    TRANSACTION_TYPES = (
        ('SEND', 'Send Money'),
        ('RECEIVE', 'Receive Money'),
        ('DEPOSIT', 'Deposit'),
        ('WITHDRAW', 'Withdraw'),
    )
    
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('REVERSED', 'Reversed'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction_code = models.CharField(max_length=20, unique=True, editable=False)
    
    # Transaction parties
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_transactions',
        null=True,
        blank=True
    )
    receiver = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='received_transactions',
        null=True,
        blank=True
    )
    
    # Transaction details
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('1.00'))]
    )
    transaction_cost = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=Decimal('0.00')
    )
    
    # Status and metadata
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    description = models.TextField(blank=True)
    
    # Balance tracking
    sender_balance_before = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    sender_balance_after = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    receiver_balance_before = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    receiver_balance_after = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'transactions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['transaction_code']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.transaction_code} - {self.transaction_type} - {self.amount}"
    
    def save(self, *args, **kwargs):
        if not self.transaction_code:
            # Generate unique transaction code
            import random
            import string
            self.transaction_code = 'TXN' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=12))
        super().save(*args, **kwargs)


class Wallet(models.Model):
    """Wallet model for tracking user's financial activity"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wallet')
    
    # Wallet limits
    daily_limit = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('150000.00')
    )
    transaction_limit = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('70000.00')
    )
    
    # Tracking
    total_sent = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    total_received = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    total_deposited = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    total_withdrawn = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    
    # Status
    is_active = models.BooleanField(default=True)
    is_locked = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'wallets'
    
    def __str__(self):
        return f"Wallet - {self.user.phone_number}"


class Agent(models.Model):
    """Agent model for deposit and withdrawal agents"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='agent_profile')
    
    # Agent details
    agent_number = models.CharField(max_length=10, unique=True)
    store_name = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    
    # Agent float (money available for transactions)
    float_balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    
    # Commission tracking
    total_commission_earned = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00')
    )
    commission_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('2.00'),  # 2% commission
        help_text="Commission percentage"
    )
    
    # Status
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'agents'
    
    def __str__(self):
        return f"{self.agent_number} - {self.store_name}"


class TransactionCharge(models.Model):
    """Model for transaction charges/fees"""
    
    TRANSACTION_TYPE_CHOICES = (
        ('SEND', 'Send Money'),
        ('WITHDRAW', 'Withdraw'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE_CHOICES)
    
    # Amount range
    min_amount = models.DecimalField(max_digits=12, decimal_places=2)
    max_amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Charge
    charge = models.DecimalField(max_digits=6, decimal_places=2)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'transaction_charges'
        ordering = ['min_amount']
        unique_together = ['transaction_type', 'min_amount', 'max_amount']
    
    def __str__(self):
        return f"{self.transaction_type}: {self.min_amount}-{self.max_amount} = {self.charge}"


class Notification(models.Model):
    """Model for user notifications"""
    
    NOTIFICATION_TYPES = (
        ('TRANSACTION', 'Transaction'),
        ('SECURITY', 'Security'),
        ('PROMOTIONAL', 'Promotional'),
        ('SYSTEM', 'System'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    
    # Notification details
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    
    # Related transaction (if applicable)
    transaction = models.ForeignKey(
        Transaction,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications'
    )
    
    # Status
    is_read = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['is_read']),
        ]
    
    def __str__(self):
        return f"{self.user.phone_number} - {self.title}"