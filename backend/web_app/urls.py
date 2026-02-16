from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AuthViewSet, UserViewSet, TransactionViewSet,
    WalletViewSet, AgentViewSet, TransactionChargeViewSet,
    NotificationViewSet
)

# Create router
router = DefaultRouter()

# Register viewsets
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'users', UserViewSet, basename='user')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'wallets', WalletViewSet, basename='wallet')
router.register(r'agents', AgentViewSet, basename='agent')
router.register(r'charges', TransactionChargeViewSet, basename='charge')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
]