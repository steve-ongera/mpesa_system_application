from rest_framework import serializers
from .models import User, Transaction, Wallet, Agent, TransactionCharge, Notification
from django.contrib.auth import authenticate
from decimal import Decimal
from django.db import transaction as db_transaction
from django.utils import timezone


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    
    pin = serializers.CharField(write_only=True, min_length=4, max_length=4)
    confirm_pin = serializers.CharField(write_only=True, min_length=4, max_length=4)
    
    class Meta:
        model = User
        fields = ['phone_number', 'first_name', 'last_name', 'email', 'id_number', 'pin', 'confirm_pin']
    
    def validate_phone_number(self, value):
        """Validate phone number format"""
        if not value.startswith('254'):
            raise serializers.ValidationError("Phone number must start with 254")
        if len(value) != 12:
            raise serializers.ValidationError("Phone number must be 12 digits (254XXXXXXXXX)")
        return value
    
    def validate(self, data):
        """Validate PIN matching"""
        if data['pin'] != data['confirm_pin']:
            raise serializers.ValidationError({"confirm_pin": "PINs do not match"})
        
        # Check if PIN is all digits
        if not data['pin'].isdigit():
            raise serializers.ValidationError({"pin": "PIN must contain only digits"})
        
        return data
    
    def create(self, validated_data):
        """Create user and wallet"""
        validated_data.pop('confirm_pin')
        pin = validated_data.pop('pin')
        
        user = User.objects.create_user(
            phone_number=validated_data['phone_number'],
            pin=pin,
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data.get('email'),
            id_number=validated_data['id_number']
        )
        
        # Create wallet for user
        Wallet.objects.create(user=user)
        
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    
    phone_number = serializers.CharField()
    pin = serializers.CharField(write_only=True)
    
    def validate(self, data):
        """Validate user credentials"""
        phone_number = data.get('phone_number')
        pin = data.get('pin')
        
        if phone_number and pin:
            user = authenticate(username=phone_number, password=pin)
            
            if not user:
                raise serializers.ValidationError("Invalid phone number or PIN")
            
            if not user.is_active:
                raise serializers.ValidationError("User account is disabled")
            
            data['user'] = user
        else:
            raise serializers.ValidationError("Must include phone number and PIN")
        
        return data


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user data"""
    
    full_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'phone_number', 'first_name', 'last_name', 'full_name',
            'email', 'id_number', 'account_balance', 'is_verified',
            'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'account_balance', 'date_joined', 'last_login']


class WalletSerializer(serializers.ModelSerializer):
    """Serializer for wallet data"""
    
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Wallet
        fields = [
            'id', 'user', 'daily_limit', 'transaction_limit',
            'total_sent', 'total_received', 'total_deposited',
            'total_withdrawn', 'is_active', 'is_locked',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'total_sent', 'total_received', 'total_deposited',
            'total_withdrawn', 'created_at', 'updated_at'
        ]


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for transaction data"""
    
    sender_phone = serializers.CharField(source='sender.phone_number', read_only=True)
    receiver_phone = serializers.CharField(source='receiver.phone_number', read_only=True)
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)
    receiver_name = serializers.CharField(source='receiver.full_name', read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'transaction_code', 'transaction_type', 'amount',
            'transaction_cost', 'status', 'description',
            'sender', 'receiver', 'sender_phone', 'receiver_phone',
            'sender_name', 'receiver_name',
            'sender_balance_before', 'sender_balance_after',
            'receiver_balance_before', 'receiver_balance_after',
            'created_at', 'completed_at'
        ]
        read_only_fields = [
            'id', 'transaction_code', 'status', 'transaction_cost',
            'sender_balance_before', 'sender_balance_after',
            'receiver_balance_before', 'receiver_balance_after',
            'created_at', 'completed_at'
        ]


class SendMoneySerializer(serializers.Serializer):
    """Serializer for sending money"""
    
    receiver_phone = serializers.CharField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    pin = serializers.CharField(write_only=True)
    description = serializers.CharField(required=False, allow_blank=True)
    
    def validate_amount(self, value):
        """Validate amount"""
        if value < Decimal('1.00'):
            raise serializers.ValidationError("Amount must be at least 1.00")
        if value > Decimal('150000.00'):
            raise serializers.ValidationError("Amount exceeds maximum limit of 150,000")
        return value
    
    def validate_receiver_phone(self, value):
        """Validate receiver phone number"""
        if not value.startswith('254'):
            raise serializers.ValidationError("Phone number must start with 254")
        
        try:
            receiver = User.objects.get(phone_number=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("Receiver not found")
        
        return value
    
    def validate(self, data):
        """Validate transaction"""
        user = self.context['request'].user
        
        # Verify PIN
        if not user.check_password(data['pin']):
            raise serializers.ValidationError({"pin": "Invalid PIN"})
        
        # Check if sending to self
        if data['receiver_phone'] == user.phone_number:
            raise serializers.ValidationError("Cannot send money to yourself")
        
        # Calculate total cost
        amount = data['amount']
        transaction_cost = self.calculate_transaction_cost(amount)
        total_cost = amount + transaction_cost
        
        # Check balance
        if user.account_balance < total_cost:
            raise serializers.ValidationError(
                f"Insufficient balance. Required: {total_cost}, Available: {user.account_balance}"
            )
        
        data['transaction_cost'] = transaction_cost
        data['total_cost'] = total_cost
        
        return data
    
    def calculate_transaction_cost(self, amount):
        """Calculate transaction cost based on amount"""
        try:
            charge = TransactionCharge.objects.get(
                transaction_type='SEND',
                min_amount__lte=amount,
                max_amount__gte=amount,
                is_active=True
            )
            return charge.charge
        except TransactionCharge.DoesNotExist:
            # Default charge if no charge found
            return Decimal('0.00')
    
    @db_transaction.atomic
    def create(self, validated_data):
        """Create transaction and update balances"""
        user = self.context['request'].user
        receiver = User.objects.get(phone_number=validated_data['receiver_phone'])
        amount = validated_data['amount']
        transaction_cost = validated_data['transaction_cost']
        total_cost = validated_data['total_cost']
        
        # Lock rows for update
        sender = User.objects.select_for_update().get(id=user.id)
        receiver = User.objects.select_for_update().get(id=receiver.id)
        
        # Record balances before transaction
        sender_balance_before = sender.account_balance
        receiver_balance_before = receiver.account_balance
        
        # Update sender balance
        sender.account_balance -= total_cost
        sender.save()
        
        # Update receiver balance
        receiver.account_balance += amount
        receiver.save()
        
        # Create transaction record
        transaction = Transaction.objects.create(
            sender=sender,
            receiver=receiver,
            transaction_type='SEND',
            amount=amount,
            transaction_cost=transaction_cost,
            status='COMPLETED',
            description=validated_data.get('description', ''),
            sender_balance_before=sender_balance_before,
            sender_balance_after=sender.account_balance,
            receiver_balance_before=receiver_balance_before,
            receiver_balance_after=receiver.account_balance,
            completed_at=timezone.now()
        )
        
        # Update wallet statistics
        sender_wallet = Wallet.objects.get(user=sender)
        sender_wallet.total_sent += amount
        sender_wallet.save()
        
        receiver_wallet = Wallet.objects.get(user=receiver)
        receiver_wallet.total_received += amount
        receiver_wallet.save()
        
        # Create notifications
        Notification.objects.create(
            user=sender,
            notification_type='TRANSACTION',
            title='Money Sent',
            message=f'You sent {amount} to {receiver.phone_number}. Transaction cost: {transaction_cost}',
            transaction=transaction
        )
        
        Notification.objects.create(
            user=receiver,
            notification_type='TRANSACTION',
            title='Money Received',
            message=f'You received {amount} from {sender.phone_number}',
            transaction=transaction
        )
        
        return transaction


class DepositSerializer(serializers.Serializer):
    """Serializer for deposit money"""
    
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    agent_number = serializers.CharField(required=False)
    reference = serializers.CharField(required=False, allow_blank=True)
    
    def validate_amount(self, value):
        """Validate amount"""
        if value < Decimal('10.00'):
            raise serializers.ValidationError("Minimum deposit amount is 10.00")
        if value > Decimal('300000.00'):
            raise serializers.ValidationError("Maximum deposit amount is 300,000")
        return value
    
    @db_transaction.atomic
    def create(self, validated_data):
        """Create deposit transaction"""
        user = self.context['request'].user
        amount = validated_data['amount']
        
        # Lock user for update
        user = User.objects.select_for_update().get(id=user.id)
        
        # Record balance before
        balance_before = user.account_balance
        
        # Update balance
        user.account_balance += amount
        user.save()
        
        # Create transaction
        transaction = Transaction.objects.create(
            receiver=user,
            transaction_type='DEPOSIT',
            amount=amount,
            status='COMPLETED',
            description=f"Deposit via {validated_data.get('agent_number', 'Direct')}",
            receiver_balance_before=balance_before,
            receiver_balance_after=user.account_balance,
            completed_at=timezone.now()
        )
        
        # Update wallet
        wallet = Wallet.objects.get(user=user)
        wallet.total_deposited += amount
        wallet.save()
        
        # Create notification
        Notification.objects.create(
            user=user,
            notification_type='TRANSACTION',
            title='Deposit Successful',
            message=f'You deposited {amount}. New balance: {user.account_balance}',
            transaction=transaction
        )
        
        return transaction


class WithdrawSerializer(serializers.Serializer):
    """Serializer for withdraw money"""
    
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    agent_number = serializers.CharField()
    pin = serializers.CharField(write_only=True)
    
    def validate_amount(self, value):
        """Validate amount"""
        if value < Decimal('10.00'):
            raise serializers.ValidationError("Minimum withdrawal amount is 10.00")
        if value > Decimal('150000.00'):
            raise serializers.ValidationError("Maximum withdrawal amount is 150,000")
        return value
    
    def validate_agent_number(self, value):
        """Validate agent exists"""
        try:
            Agent.objects.get(agent_number=value, is_active=True)
        except Agent.DoesNotExist:
            raise serializers.ValidationError("Agent not found or inactive")
        return value
    
    def validate(self, data):
        """Validate withdrawal"""
        user = self.context['request'].user
        
        # Verify PIN
        if not user.check_password(data['pin']):
            raise serializers.ValidationError({"pin": "Invalid PIN"})
        
        # Calculate cost
        amount = data['amount']
        transaction_cost = self.calculate_transaction_cost(amount)
        total_cost = amount + transaction_cost
        
        # Check balance
        if user.account_balance < total_cost:
            raise serializers.ValidationError(
                f"Insufficient balance. Required: {total_cost}, Available: {user.account_balance}"
            )
        
        data['transaction_cost'] = transaction_cost
        data['total_cost'] = total_cost
        
        return data
    
    def calculate_transaction_cost(self, amount):
        """Calculate withdrawal cost"""
        try:
            charge = TransactionCharge.objects.get(
                transaction_type='WITHDRAW',
                min_amount__lte=amount,
                max_amount__gte=amount,
                is_active=True
            )
            return charge.charge
        except TransactionCharge.DoesNotExist:
            return Decimal('0.00')
    
    @db_transaction.atomic
    def create(self, validated_data):
        """Create withdrawal transaction"""
        user = self.context['request'].user
        amount = validated_data['amount']
        transaction_cost = validated_data['transaction_cost']
        total_cost = validated_data['total_cost']
        agent = Agent.objects.get(agent_number=validated_data['agent_number'])
        
        # Lock user for update
        user = User.objects.select_for_update().get(id=user.id)
        
        # Record balance before
        balance_before = user.account_balance
        
        # Update balance
        user.account_balance -= total_cost
        user.save()
        
        # Create transaction
        transaction = Transaction.objects.create(
            sender=user,
            transaction_type='WITHDRAW',
            amount=amount,
            transaction_cost=transaction_cost,
            status='COMPLETED',
            description=f"Withdrawal at {agent.store_name}",
            sender_balance_before=balance_before,
            sender_balance_after=user.account_balance,
            completed_at=timezone.now()
        )
        
        # Update wallet
        wallet = Wallet.objects.get(user=user)
        wallet.total_withdrawn += amount
        wallet.save()
        
        # Create notification
        Notification.objects.create(
            user=user,
            notification_type='TRANSACTION',
            title='Withdrawal Successful',
            message=f'You withdrew {amount} at {agent.store_name}. Transaction cost: {transaction_cost}',
            transaction=transaction
        )
        
        return transaction


class AgentSerializer(serializers.ModelSerializer):
    """Serializer for agent data"""
    
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Agent
        fields = [
            'id', 'user', 'agent_number', 'store_name', 'location',
            'float_balance', 'total_commission_earned', 'commission_rate',
            'is_active', 'is_verified', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'agent_number', 'float_balance', 'total_commission_earned',
            'created_at', 'updated_at'
        ]


class TransactionChargeSerializer(serializers.ModelSerializer):
    """Serializer for transaction charges"""
    
    class Meta:
        model = TransactionCharge
        fields = [
            'id', 'transaction_type', 'min_amount', 'max_amount',
            'charge', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notifications"""
    
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'title', 'message',
            'transaction', 'is_read', 'created_at', 'read_at'
        ]
        read_only_fields = ['created_at', 'read_at']


class BalanceSerializer(serializers.Serializer):
    """Serializer for balance check"""
    
    account_balance = serializers.DecimalField(max_digits=12, decimal_places=2)
    phone_number = serializers.CharField()
    full_name = serializers.CharField()


class TransactionHistorySerializer(serializers.Serializer):
    """Serializer for transaction history with filters"""
    
    transaction_type = serializers.ChoiceField(
        choices=['ALL', 'SEND', 'RECEIVE', 'DEPOSIT', 'WITHDRAW'],
        required=False,
        default='ALL'
    )
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    status = serializers.ChoiceField(
        choices=['ALL', 'PENDING', 'COMPLETED', 'FAILED', 'REVERSED'],
        required=False,
        default='ALL'
    )