from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q
from django.utils import timezone
from datetime import datetime, timedelta

from .models import (
    User, Transaction, Wallet, Agent, 
    TransactionCharge, Notification
)
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserSerializer,
    TransactionSerializer, WalletSerializer, AgentSerializer,
    TransactionChargeSerializer, NotificationSerializer,
    SendMoneySerializer, DepositSerializer, WithdrawSerializer,
    BalanceSerializer, TransactionHistorySerializer
)


class AuthViewSet(viewsets.GenericViewSet):
    """ViewSet for authentication operations"""
    
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'], url_path='register')
    def register(self, request):
        """Register a new user"""
        serializer = UserRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'status': 'success',
                'message': 'Registration successful',
                'data': {
                    'user': UserSerializer(user).data,
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'status': 'error',
            'message': 'Registration failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], url_path='login')
    def login(self, request):
        """Login user"""
        serializer = UserLoginSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'status': 'success',
                'message': 'Login successful',
                'data': {
                    'user': UserSerializer(user).data,
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                }
            }, status=status.HTTP_200_OK)
        
        return Response({
            'status': 'error',
            'message': 'Login failed',
            'errors': serializer.errors
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    @action(detail=False, methods=['post'], url_path='logout', permission_classes=[IsAuthenticated])
    def logout(self, request):
        """Logout user by blacklisting refresh token"""
        try:
            refresh_token = request.data.get('refresh_token')
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response({
                'status': 'success',
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': 'Logout failed',
                'errors': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for user operations"""
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter queryset to current user"""
        return User.objects.filter(id=self.request.user.id)
    
    @action(detail=False, methods=['get'], url_path='profile')
    def profile(self, request):
        """Get current user profile"""
        serializer = self.get_serializer(request.user)
        return Response({
            'status': 'success',
            'data': serializer.data
        })
    
    @action(detail=False, methods=['put'], url_path='update-profile')
    def update_profile(self, request):
        """Update user profile"""
        user = request.user
        serializer = self.get_serializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'status': 'success',
                'message': 'Profile updated successfully',
                'data': serializer.data
            })
        
        return Response({
            'status': 'error',
            'message': 'Profile update failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], url_path='change-pin')
    def change_pin(self, request):
        """Change user PIN"""
        user = request.user
        old_pin = request.data.get('old_pin')
        new_pin = request.data.get('new_pin')
        confirm_pin = request.data.get('confirm_pin')
        
        if not all([old_pin, new_pin, confirm_pin]):
            return Response({
                'status': 'error',
                'message': 'All fields are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify old PIN
        if not user.check_password(old_pin):
            return Response({
                'status': 'error',
                'message': 'Invalid old PIN'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check new PIN format
        if len(new_pin) != 4 or not new_pin.isdigit():
            return Response({
                'status': 'error',
                'message': 'PIN must be 4 digits'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check PIN matching
        if new_pin != confirm_pin:
            return Response({
                'status': 'error',
                'message': 'PINs do not match'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update PIN
        user.set_password(new_pin)
        user.save()
        
        return Response({
            'status': 'success',
            'message': 'PIN changed successfully'
        })
    
    @action(detail=False, methods=['get'], url_path='balance')
    def check_balance(self, request):
        """Check account balance"""
        user = request.user
        data = {
            'account_balance': user.account_balance,
            'phone_number': user.phone_number,
            'full_name': user.full_name
        }
        serializer = BalanceSerializer(data)
        
        return Response({
            'status': 'success',
            'data': serializer.data
        })


class TransactionViewSet(viewsets.ModelViewSet):
    """ViewSet for transaction operations"""
    
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter transactions for current user"""
        user = self.request.user
        return Transaction.objects.filter(
            Q(sender=user) | Q(receiver=user)
        ).select_related('sender', 'receiver').order_by('-created_at')
    
    def list(self, request):
        """List all transactions with optional filters"""
        queryset = self.get_queryset()
        
        # Apply filters
        transaction_type = request.query_params.get('transaction_type')
        status_filter = request.query_params.get('status')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if transaction_type and transaction_type != 'ALL':
            queryset = queryset.filter(transaction_type=transaction_type)
        
        if status_filter and status_filter != 'ALL':
            queryset = queryset.filter(status=status_filter)
        
        if start_date:
            try:
                start = datetime.strptime(start_date, '%Y-%m-%d')
                queryset = queryset.filter(created_at__gte=start)
            except ValueError:
                pass
        
        if end_date:
            try:
                end = datetime.strptime(end_date, '%Y-%m-%d')
                end = end.replace(hour=23, minute=59, second=59)
                queryset = queryset.filter(created_at__lte=end)
            except ValueError:
                pass
        
        # Pagination
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'status': 'success',
            'data': serializer.data
        })
    
    def retrieve(self, request, pk=None):
        """Get transaction details"""
        try:
            transaction = self.get_queryset().get(pk=pk)
            serializer = self.get_serializer(transaction)
            return Response({
                'status': 'success',
                'data': serializer.data
            })
        except Transaction.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Transaction not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'], url_path='send-money')
    def send_money(self, request):
        """Send money to another user"""
        serializer = SendMoneySerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            transaction = serializer.save()
            return Response({
                'status': 'success',
                'message': 'Money sent successfully',
                'data': TransactionSerializer(transaction).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'status': 'error',
            'message': 'Transaction failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], url_path='deposit')
    def deposit(self, request):
        """Deposit money"""
        serializer = DepositSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            transaction = serializer.save()
            return Response({
                'status': 'success',
                'message': 'Deposit successful',
                'data': TransactionSerializer(transaction).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'status': 'error',
            'message': 'Deposit failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], url_path='withdraw')
    def withdraw(self, request):
        """Withdraw money"""
        serializer = WithdrawSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            transaction = serializer.save()
            return Response({
                'status': 'success',
                'message': 'Withdrawal successful',
                'data': TransactionSerializer(transaction).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'status': 'error',
            'message': 'Withdrawal failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='recent')
    def recent_transactions(self, request):
        """Get recent transactions (last 10)"""
        queryset = self.get_queryset()[:10]
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'status': 'success',
            'data': serializer.data
        })
    
    @action(detail=False, methods=['get'], url_path='statistics')
    def statistics(self, request):
        """Get transaction statistics"""
        user = request.user
        wallet = Wallet.objects.get(user=user)
        
        # Get transactions for current month
        today = timezone.now()
        start_of_month = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        monthly_sent = Transaction.objects.filter(
            sender=user,
            transaction_type='SEND',
            status='COMPLETED',
            created_at__gte=start_of_month
        ).count()
        
        monthly_received = Transaction.objects.filter(
            receiver=user,
            transaction_type='RECEIVE',
            status='COMPLETED',
            created_at__gte=start_of_month
        ).count()
        
        return Response({
            'status': 'success',
            'data': {
                'total_sent': wallet.total_sent,
                'total_received': wallet.total_received,
                'total_deposited': wallet.total_deposited,
                'total_withdrawn': wallet.total_withdrawn,
                'monthly_sent_count': monthly_sent,
                'monthly_received_count': monthly_received,
                'current_balance': user.account_balance
            }
        })


class WalletViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for wallet operations"""
    
    queryset = Wallet.objects.all()
    serializer_class = WalletSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter wallet for current user"""
        return Wallet.objects.filter(user=self.request.user).select_related('user')
    
    @action(detail=False, methods=['get'], url_path='my-wallet')
    def my_wallet(self, request):
        """Get current user's wallet"""
        try:
            wallet = Wallet.objects.get(user=request.user)
            serializer = self.get_serializer(wallet)
            return Response({
                'status': 'success',
                'data': serializer.data
            })
        except Wallet.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Wallet not found'
            }, status=status.HTTP_404_NOT_FOUND)


class AgentViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for agent operations"""
    
    queryset = Agent.objects.filter(is_active=True, is_verified=True)
    serializer_class = AgentSerializer
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """List all active agents"""
        queryset = self.get_queryset()
        
        # Optional location filter
        location = request.query_params.get('location')
        if location:
            queryset = queryset.filter(location__icontains=location)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'status': 'success',
            'data': serializer.data
        })
    
    @action(detail=False, methods=['get'], url_path='nearby')
    def nearby_agents(self, request):
        """Get nearby agents (simplified - just return all for now)"""
        queryset = self.get_queryset()[:10]
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'status': 'success',
            'data': serializer.data
        })


class TransactionChargeViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for transaction charges"""
    
    queryset = TransactionCharge.objects.filter(is_active=True)
    serializer_class = TransactionChargeSerializer
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """List all transaction charges"""
        queryset = self.get_queryset()
        
        # Optional transaction type filter
        transaction_type = request.query_params.get('transaction_type')
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'status': 'success',
            'data': serializer.data
        })


class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet for notification operations"""
    
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter notifications for current user"""
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')
    
    def list(self, request):
        """List all notifications"""
        queryset = self.get_queryset()
        
        # Optional read status filter
        is_read = request.query_params.get('is_read')
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
        
        # Pagination
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'status': 'success',
            'data': serializer.data
        })
    
    @action(detail=True, methods=['post'], url_path='mark-read')
    def mark_as_read(self, request, pk=None):
        """Mark notification as read"""
        try:
            notification = self.get_queryset().get(pk=pk)
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save()
            
            serializer = self.get_serializer(notification)
            return Response({
                'status': 'success',
                'message': 'Notification marked as read',
                'data': serializer.data
            })
        except Notification.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Notification not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_as_read(self, request):
        """Mark all notifications as read"""
        notifications = self.get_queryset().filter(is_read=False)
        count = notifications.update(is_read=True, read_at=timezone.now())
        
        return Response({
            'status': 'success',
            'message': f'{count} notifications marked as read'
        })
    
    @action(detail=False, methods=['get'], url_path='unread-count')
    def unread_count(self, request):
        """Get count of unread notifications"""
        count = self.get_queryset().filter(is_read=False).count()
        
        return Response({
            'status': 'success',
            'data': {
                'unread_count': count
            }
        })
    
    @action(detail=False, methods=['delete'], url_path='clear-all')
    def clear_all(self, request):
        """Delete all notifications"""
        count = self.get_queryset().delete()[0]
        
        return Response({
            'status': 'success',
            'message': f'{count} notifications deleted'
        })