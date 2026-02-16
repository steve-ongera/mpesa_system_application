# M-Pesa System - Backend (Django REST API)

## Overview
A comprehensive M-Pesa-like mobile money system built with Django REST Framework. Features include user authentication with phone number and PIN, money transfers, deposits, withdrawals, and transaction history.

## Features
- ✅ Phone number + PIN authentication
- ✅ JWT token-based authorization
- ✅ Send money between users
- ✅ Deposit and withdraw money
- ✅ Transaction history with filters
- ✅ Real-time balance updates
- ✅ Transaction charges/fees
- ✅ Agent management
- ✅ Notifications system
- ✅ Wallet management

## Models (6 Core Models)
1. **User** - Custom user model with phone authentication
2. **Transaction** - All financial transactions
3. **Wallet** - User wallet with limits and statistics
4. **Agent** - Deposit/withdrawal agents
5. **TransactionCharge** - Transaction fees configuration
6. **Notification** - User notifications

## Project Structure
```
backend/
├── models.py           # Database models
├── serializers.py      # DRF serializers
├── views.py           # ViewSets for API endpoints
├── urls.py            # App URL configuration
├── main_urls.py       # Project URL configuration
├── settings.py        # Django settings
├── admin.py           # Admin interface
└── requirements.txt   # Python dependencies
```

## Setup Instructions

### 1. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Create Django Project Structure
```bash
# Create project
django-admin startproject mpesa_project .

# Create app
python manage.py startapp mpesa_app
```

### 4. Configure Settings
Copy the contents of `settings.py` to `mpesa_project/settings.py`

### 5. Copy Files to Correct Locations
```bash
# Copy models
cp models.py mpesa_app/models.py

# Copy serializers
cp serializers.py mpesa_app/serializers.py

# Copy views
cp views.py mpesa_app/views.py

# Copy app urls
cp urls.py mpesa_app/urls.py

# Copy admin
cp admin.py mpesa_app/admin.py

# Copy main urls
cp main_urls.py mpesa_project/urls.py
```

### 6. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 7. Create Superuser
```bash
python manage.py createsuperuser
# Enter phone number (format: 254XXXXXXXXX)
# Enter PIN (4 digits)
```

### 8. Load Sample Transaction Charges (Optional)
```bash
python manage.py shell
```
Then run:
```python
from mpesa_app.models import TransactionCharge
from decimal import Decimal

# Send money charges
charges_send = [
    (1, 100, 0),
    (101, 500, 5),
    (501, 1000, 10),
    (1001, 2500, 15),
    (2501, 5000, 25),
    (5001, 10000, 45),
    (10001, 20000, 70),
    (20001, 150000, 105),
]

for min_amt, max_amt, charge in charges_send:
    TransactionCharge.objects.create(
        transaction_type='SEND',
        min_amount=Decimal(min_amt),
        max_amount=Decimal(max_amt),
        charge=Decimal(charge),
        is_active=True
    )

# Withdraw charges
charges_withdraw = [
    (10, 500, 10),
    (501, 1000, 25),
    (1001, 2500, 50),
    (2501, 5000, 70),
    (5001, 10000, 130),
    (10001, 150000, 180),
]

for min_amt, max_amt, charge in charges_withdraw:
    TransactionCharge.objects.create(
        transaction_type='WITHDRAW',
        min_amount=Decimal(min_amt),
        max_amount=Decimal(max_amt),
        charge=Decimal(charge),
        is_active=True
    )

print("Transaction charges loaded successfully!")
```

### 9. Run Development Server
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/`

## API Endpoints

### Authentication
- `POST /api/v1/auth/register/` - Register new user
- `POST /api/v1/auth/login/` - Login user
- `POST /api/v1/auth/logout/` - Logout user
- `POST /api/v1/token/refresh/` - Refresh access token

### User Management
- `GET /api/v1/users/profile/` - Get user profile
- `PUT /api/v1/users/update-profile/` - Update profile
- `POST /api/v1/users/change-pin/` - Change PIN
- `GET /api/v1/users/balance/` - Check balance

### Transactions
- `GET /api/v1/transactions/` - List transactions (with filters)
- `GET /api/v1/transactions/{id}/` - Get transaction details
- `POST /api/v1/transactions/send-money/` - Send money
- `POST /api/v1/transactions/deposit/` - Deposit money
- `POST /api/v1/transactions/withdraw/` - Withdraw money
- `GET /api/v1/transactions/recent/` - Get recent transactions
- `GET /api/v1/transactions/statistics/` - Get transaction stats

### Wallet
- `GET /api/v1/wallets/my-wallet/` - Get user wallet

### Agents
- `GET /api/v1/agents/` - List agents
- `GET /api/v1/agents/nearby/` - Get nearby agents

### Notifications
- `GET /api/v1/notifications/` - List notifications
- `POST /api/v1/notifications/{id}/mark-read/` - Mark as read
- `POST /api/v1/notifications/mark-all-read/` - Mark all as read
- `GET /api/v1/notifications/unread-count/` - Get unread count
- `DELETE /api/v1/notifications/clear-all/` - Clear all notifications

### Transaction Charges
- `GET /api/v1/charges/` - List transaction charges

## Example API Requests

### 1. Register User
```bash
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "254712345678",
    "first_name": "John",
    "last_name": "Doe",
    "id_number": "12345678",
    "email": "john@example.com",
    "pin": "1234",
    "confirm_pin": "1234"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "254712345678",
    "pin": "1234"
  }'
```

### 3. Send Money (with Bearer token)
```bash
curl -X POST http://localhost:8000/api/v1/transactions/send-money/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "receiver_phone": "254798765432",
    "amount": "1000",
    "pin": "1234",
    "description": "Payment for goods"
  }'
```

### 4. Check Balance
```bash
curl -X GET http://localhost:8000/api/v1/users/balance/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Admin Interface
Access the admin panel at `http://localhost:8000/admin/`

Features:
- User management
- Transaction monitoring
- Wallet management
- Agent management
- Transaction charges configuration
- Notification management

## Testing
```bash
# Run tests
python manage.py test

# Run with coverage
pytest --cov=mpesa_app
```

## Security Notes
1. Always use HTTPS in production
2. Change SECRET_KEY in production
3. Set DEBUG=False in production
4. Use environment variables for sensitive data
5. Implement rate limiting for API endpoints
6. Enable CORS only for trusted domains

## Next Steps
After setting up the backend:
1. Test all endpoints with Postman/Thunder Client
2. Create sample users and transactions
3. Verify transaction charges are working
4. Set up the React frontend
5. Connect frontend to backend APIs

## Troubleshooting

### Migration Issues
```bash
python manage.py makemigrations mpesa_app
python manage.py migrate mpesa_app
```

### Database Reset
```bash
python manage.py flush
python manage.py migrate
python manage.py createsuperuser
```

### Port Already in Use
```bash
python manage.py runserver 8001
```

## Technologies Used
- Django 4.2+
- Django REST Framework
- JWT Authentication
- SQLite (Development) / PostgreSQL (Production)
- CORS Headers