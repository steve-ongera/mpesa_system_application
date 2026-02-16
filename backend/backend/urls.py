from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from django.http import JsonResponse


def api_root(request):
    """API root endpoint"""
    return JsonResponse({
        'message': 'Welcome to M-Pesa System API',
        'version': '1.0.0',
        'endpoints': {
            'admin': '/admin/',
            'api': '/api/v1/',
            'auth': {
                'register': '/api/v1/auth/register/',
                'login': '/api/v1/auth/login/',
                'logout': '/api/v1/auth/logout/',
                'refresh': '/api/v1/token/refresh/',
            },
            'user': {
                'profile': '/api/v1/users/profile/',
                'update_profile': '/api/v1/users/update-profile/',
                'change_pin': '/api/v1/users/change-pin/',
                'balance': '/api/v1/users/balance/',
            },
            'transactions': {
                'list': '/api/v1/transactions/',
                'send_money': '/api/v1/transactions/send-money/',
                'deposit': '/api/v1/transactions/deposit/',
                'withdraw': '/api/v1/transactions/withdraw/',
                'recent': '/api/v1/transactions/recent/',
                'statistics': '/api/v1/transactions/statistics/',
            },
            'wallet': {
                'my_wallet': '/api/v1/wallets/my-wallet/',
            },
            'agents': {
                'list': '/api/v1/agents/',
                'nearby': '/api/v1/agents/nearby/',
            },
            'notifications': {
                'list': '/api/v1/notifications/',
                'unread_count': '/api/v1/notifications/unread-count/',
                'mark_all_read': '/api/v1/notifications/mark-all-read/',
            }
        }
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('mpesa_app.urls')),
    path('api/v1/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', api_root, name='api-root'),
]