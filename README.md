# 💰 M-Pesa System - Full Stack Mobile Money Application

<div align="center">

![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)
![Django](https://img.shields.io/badge/Django-4.2+-green.svg)
![React](https://img.shields.io/badge/React-18.2+-61DAFB.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

A comprehensive full-stack mobile money system built with Django REST Framework and React, featuring phone number authentication, money transfers, deposits, withdrawals, and real-time transaction management.

[Features](#-features) •
[Tech Stack](#-tech-stack) •
[Installation](#-installation) •
[API Documentation](#-api-documentation) •
[Project Structure](#-detailed-project-structure) •
[Screenshots](#-screenshots)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Detailed Project Structure](#-detailed-project-structure)
- [Installation](#-installation)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Authentication Flow](#-authentication-flow)
- [Transaction Flow](#-transaction-flow)
- [Usage Examples](#-usage-examples)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

The M-Pesa System is a production-ready mobile money platform that replicates the core functionality of popular mobile money services. Built with modern technologies and best practices, it demonstrates mastery of:

- **RESTful API Design** - Clean, versioned API architecture
- **Authentication & Authorization** - JWT-based secure authentication
- **Transaction Management** - ACID-compliant financial transactions
- **State Management** - Efficient client-side state with Zustand
- **Real-time Updates** - Live balance and notification updates
- **Security** - PIN hashing, token refresh, database locking

### 🎓 Learning Objectives

This project is designed to master:
- Django REST Framework ViewSets and Serializers
- Custom user authentication with phone numbers
- Financial transaction handling with database locks
- JWT authentication with token refresh
- React state management and API integration
- Full-stack application architecture

---

## ✨ Features

### 🔐 Authentication & Security
- ✅ **Phone Number Authentication** - Login with phone number + 4-digit PIN
- ✅ **JWT Tokens** - Secure token-based authentication with auto-refresh
- ✅ **PIN Security** - Hashed PINs using Django's password hashers
- ✅ **User Verification** - Account verification system
- ✅ **Session Management** - Secure logout with token blacklisting

### 💸 Transaction Management
- ✅ **Send Money** - Transfer money between users with transaction fees
- ✅ **Deposit Money** - Add money to account via agents
- ✅ **Withdraw Money** - Withdraw cash at agent locations
- ✅ **Transaction History** - Complete transaction logs with filters
- ✅ **Transaction Charges** - Configurable fee structure
- ✅ **Real-time Balance** - Instant balance updates

### 📊 User Dashboard
- ✅ **Account Balance** - Current balance display
- ✅ **Recent Transactions** - Last 10 transactions
- ✅ **Transaction Statistics** - Monthly and lifetime stats
- ✅ **Quick Actions** - Fast access to common operations
- ✅ **Wallet Information** - Limits and usage tracking

### 🏪 Agent System
- ✅ **Agent Registration** - Become a deposit/withdrawal agent
- ✅ **Agent Locator** - Find nearby agents
- ✅ **Float Management** - Agent cash balance tracking
- ✅ **Commission System** - Automatic commission calculation

### 🔔 Notifications
- ✅ **Transaction Alerts** - Real-time transaction notifications
- ✅ **Security Alerts** - Account activity notifications
- ✅ **System Messages** - Important updates
- ✅ **Read/Unread Status** - Notification management

### 👤 User Management
- ✅ **Profile Management** - Update personal information
- ✅ **PIN Change** - Secure PIN update
- ✅ **Wallet Limits** - Daily and per-transaction limits
- ✅ **Account Status** - Active/inactive account management

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Python | 3.11+ | Programming language |
| Django | 4.2+ | Web framework |
| Django REST Framework | 3.14+ | REST API |
| djangorestframework-simplejwt | 5.3+ | JWT authentication |
| django-cors-headers | 4.3+ | CORS handling |
| django-filter | 23.5+ | API filtering |
| PostgreSQL/SQLite | Latest | Database |

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.2+ | UI library |
| Vite | 5.0+ | Build tool |
| React Router | 6.21+ | Routing |
| Zustand | 4.4+ | State management |
| Axios | 1.6+ | HTTP client |
| Tailwind CSS | 3.4+ | Styling |
| Lucide React | 0.303+ | Icons |
| React Hot Toast | 2.4+ | Notifications |
| date-fns | 3.0+ | Date formatting |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Browser    │  │  Mobile Web  │  │   Desktop    │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│         └──────────────────┴──────────────────┘                  │
│                            │                                      │
└────────────────────────────┼──────────────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │   React App      │
                    │  (Port: 5173)    │
                    │                  │
                    │  - Components    │
                    │  - State Store   │
                    │  - API Service   │
                    └────────┬─────────┘
                             │
                    HTTP/HTTPS (Axios)
                             │
┌────────────────────────────┼──────────────────────────────────────┐
│                   API GATEWAY LAYER                               │
│                    ┌────────▼─────────┐                          │
│                    │  Django Server   │                          │
│                    │  (Port: 8000)    │                          │
│                    │                  │                          │
│                    │  - CORS Config   │                          │
│                    │  - JWT Auth      │                          │
│                    │  - Rate Limiting │                          │
│                    └────────┬─────────┘                          │
└─────────────────────────────┼──────────────────────────────────────┘
                              │
┌─────────────────────────────┼──────────────────────────────────────┐
│                   APPLICATION LAYER                               │
│                    ┌────────▼─────────┐                          │
│                    │   URL Router     │                          │
│                    └────────┬─────────┘                          │
│                             │                                     │
│    ┌────────────────────────┼────────────────────────┐           │
│    │                        │                        │           │
│    ▼                        ▼                        ▼           │
│ ┌──────┐              ┌──────────┐            ┌──────────┐      │
│ │ Auth │              │Transaction│            │   User   │      │
│ │ViewSet│             │ ViewSet   │            │ ViewSet  │      │
│ └──┬───┘              └─────┬─────┘            └────┬─────┘      │
│    │                        │                        │           │
│    ▼                        ▼                        ▼           │
│ ┌──────────┐          ┌──────────┐            ┌──────────┐      │
│ │  Auth    │          │Transaction│            │   User   │      │
│ │Serializer│          │Serializer │            │Serializer│      │
│ └────┬─────┘          └─────┬─────┘            └────┬─────┘      │
│      │                      │                        │           │
└──────┼──────────────────────┼────────────────────────┼───────────┘
       │                      │                        │
┌──────┼──────────────────────┼────────────────────────┼───────────┐
│      │            BUSINESS LOGIC LAYER               │           │
│      │                      │                        │           │
│      ▼                      ▼                        ▼           │
│ ┌────────────────────────────────────────────────────────┐      │
│ │                    Django ORM                          │      │
│ └────────────────────────────────────────────────────────┘      │
│                             │                                    │
└─────────────────────────────┼────────────────────────────────────┘
                              │
┌─────────────────────────────┼────────────────────────────────────┐
│                      DATA LAYER                                  │
│                    ┌────────▼─────────┐                          │
│                    │    Database      │                          │
│                    │ SQLite/PostgreSQL│                          │
│                    │                  │                          │
│  ┌────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐               │
│  │  User  │ │Transaction│ │ Wallet │ │  Agent   │               │
│  │ Table  │ │  Table    │ │ Table  │ │  Table   │               │
│  └────────┘ └──────────┘ └────────┘ └──────────┘               │
│  ┌──────────────┐ ┌────────────────┐                           │
│  │TransactionCharge│ │ Notification │                           │
│  │    Table      │ │    Table       │                           │
│  └──────────────┘ └────────────────┘                           │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📁 Detailed Project Structure

```
mpesa_system/
│
├── 📄 README.md                           # This file - Main project documentation
├── 📄 PROJECT_README.md                   # Detailed project overview
├── 📄 SETUP_GUIDE.md                      # Step-by-step setup instructions
├── 📄 .gitignore                          # Git ignore file
├── 📄 LICENSE                             # Project license
│
├── 📂 backend/                            # Django Backend Application
│   │
│   ├── 📂 mpesa_project/                  # Django Project Directory (Created during setup)
│   │   ├── 📄 __init__.py
│   │   ├── 📄 settings.py                 # ← Copy from backend/settings.py
│   │   ├── 📄 urls.py                     # ← Copy from backend/main_urls.py
│   │   ├── 📄 wsgi.py                     # WSGI config
│   │   └── 📄 asgi.py                     # ASGI config
│   │
│   ├── 📂 mpesa_app/                      # Main Django Application (Created during setup)
│   │   │
│   │   ├── 📂 migrations/                 # Database migrations
│   │   │   ├── 📄 __init__.py
│   │   │   ├── 📄 0001_initial.py         # Initial migration (auto-generated)
│   │   │   └── ...
│   │   │
│   │   ├── 📄 __init__.py
│   │   ├── 📄 models.py                   # ⭐ 6 Core Models (User, Transaction, Wallet, Agent, etc.)
│   │   ├── 📄 serializers.py              # ⭐ DRF Serializers with validation
│   │   ├── 📄 views.py                    # ⭐ ViewSets for API endpoints
│   │   ├── 📄 urls.py                     # ⭐ App URL routing
│   │   ├── 📄 admin.py                    # ⭐ Django Admin configuration
│   │   ├── 📄 apps.py                     # App configuration
│   │   ├── 📄 tests.py                    # Unit tests
│   │   └── 📄 signals.py                  # Django signals (optional)
│   │
│   ├── 📂 logs/                           # Application logs (auto-created)
│   │   └── 📄 mpesa_system.log
│   │
│   ├── 📂 media/                          # User uploaded files (auto-created)
│   ├── 📂 staticfiles/                    # Collected static files (auto-created)
│   │
│   ├── 📄 manage.py                       # Django management script
│   ├── 📄 db.sqlite3                      # SQLite database (auto-created)
│   ├── 📄 requirements.txt                # ⭐ Python dependencies
│   ├── 📄 BACKEND_README.md               # ⭐ Backend setup guide
│   ├── 📄 .env.example                    # Environment variables template
│   └── 📄 pytest.ini                      # Pytest configuration
│
├── 📂 frontend/                           # React Frontend Application
│   │
│   ├── 📂 public/                         # Static assets
│   │   ├── 📄 vite.svg                    # Vite logo
│   │   └── 📄 favicon.ico                 # App favicon
│   │
│   ├── 📂 src/                            # Source code
│   │   │
│   │   ├── 📂 assets/                     # Images, fonts, icons
│   │   │   ├── 📂 images/
│   │   │   ├── 📂 fonts/
│   │   │   └── 📂 icons/
│   │   │
│   │   ├── 📂 components/                 # React Components
│   │   │   │
│   │   │   ├── 📂 common/                 # Reusable common components
│   │   │   │   ├── 📄 Button.jsx          # Custom button component
│   │   │   │   ├── 📄 Input.jsx           # Form input component
│   │   │   │   ├── 📄 Card.jsx            # Card container
│   │   │   │   ├── 📄 Modal.jsx           # Modal dialog
│   │   │   │   ├── 📄 Spinner.jsx         # Loading spinner
│   │   │   │   ├── 📄 Alert.jsx           # Alert messages
│   │   │   │   ├── 📄 Badge.jsx           # Badge component
│   │   │   │   └── 📄 Dropdown.jsx        # Dropdown menu
│   │   │   │
│   │   │   ├── 📂 layout/                 # Layout components
│   │   │   │   ├── 📄 Header.jsx          # App header with navigation
│   │   │   │   ├── 📄 Sidebar.jsx         # Sidebar navigation
│   │   │   │   ├── 📄 Footer.jsx          # App footer
│   │   │   │   ├── 📄 DashboardLayout.jsx # Dashboard layout wrapper
│   │   │   │   └── 📄 AuthLayout.jsx      # Authentication pages layout
│   │   │   │
│   │   │   └── 📂 features/               # Feature-specific components
│   │   │       ├── 📄 TransactionCard.jsx         # Single transaction display
│   │   │       ├── 📄 TransactionList.jsx         # List of transactions
│   │   │       ├── 📄 TransactionFilter.jsx       # Transaction filters
│   │   │       ├── 📄 BalanceCard.jsx             # Balance display
│   │   │       ├── 📄 QuickActions.jsx            # Quick action buttons
│   │   │       ├── 📄 StatisticsCard.jsx          # Statistics display
│   │   │       ├── 📄 NotificationItem.jsx        # Single notification
│   │   │       ├── 📄 NotificationList.jsx        # Notifications list
│   │   │       ├── 📄 AgentCard.jsx               # Agent information card
│   │   │       └── 📄 PinInput.jsx                # PIN input component
│   │   │
│   │   ├── 📂 pages/                      # Page components
│   │   │   │
│   │   │   ├── 📂 Auth/                   # Authentication pages
│   │   │   │   ├── 📄 Login.jsx           # Login page
│   │   │   │   ├── 📄 Register.jsx        # Registration page
│   │   │   │   └── 📄 ForgotPin.jsx       # Forgot PIN page
│   │   │   │
│   │   │   ├── 📂 Dashboard/              # Dashboard pages
│   │   │   │   ├── 📄 Dashboard.jsx       # Main dashboard
│   │   │   │   └── 📄 Home.jsx            # Home page
│   │   │   │
│   │   │   ├── 📂 Transactions/           # Transaction pages
│   │   │   │   ├── 📄 SendMoney.jsx       # Send money page
│   │   │   │   ├── 📄 Deposit.jsx         # Deposit page
│   │   │   │   ├── 📄 Withdraw.jsx        # Withdraw page
│   │   │   │   ├── 📄 History.jsx         # Transaction history
│   │   │   │   └── 📄 Details.jsx         # Transaction details
│   │   │   │
│   │   │   ├── 📂 Profile/                # Profile pages
│   │   │   │   ├── 📄 Profile.jsx         # User profile
│   │   │   │   ├── 📄 EditProfile.jsx     # Edit profile
│   │   │   │   ├── 📄 Settings.jsx        # Settings page
│   │   │   │   ├── 📄 ChangePin.jsx       # Change PIN
│   │   │   │   └── 📄 Wallet.jsx          # Wallet information
│   │   │   │
│   │   │   ├── 📂 Notifications/          # Notification pages
│   │   │   │   └── 📄 Notifications.jsx   # Notifications list
│   │   │   │
│   │   │   ├── 📂 Agents/                 # Agent pages
│   │   │   │   ├── 📄 AgentList.jsx       # List of agents
│   │   │   │   └── 📄 AgentDetails.jsx    # Agent details
│   │   │   │
│   │   │   └── 📄 NotFound.jsx            # 404 page
│   │   │
│   │   ├── 📂 services/                   # API Services
│   │   │   ├── 📄 api.js                  # ⭐ Axios configuration & API calls
│   │   │   ├── 📄 authService.js          # Authentication service
│   │   │   ├── 📄 transactionService.js   # Transaction service
│   │   │   └── 📄 userService.js          # User service
│   │   │
│   │   ├── 📂 store/                      # State Management
│   │   │   ├── 📄 index.js                # ⭐ Zustand stores (Auth, Transaction, Wallet, etc.)
│   │   │   ├── 📄 authStore.js            # Auth store (alternative split)
│   │   │   ├── 📄 transactionStore.js     # Transaction store
│   │   │   └── 📄 uiStore.js              # UI state store
│   │   │
│   │   ├── 📂 hooks/                      # Custom React Hooks
│   │   │   ├── 📄 useAuth.js              # Authentication hook
│   │   │   ├── 📄 useTransaction.js       # Transaction operations hook
│   │   │   ├── 📄 useBalance.js           # Balance fetching hook
│   │   │   └── 📄 useNotifications.js     # Notifications hook
│   │   │
│   │   ├── 📂 utils/                      # Utility Functions
│   │   │   ├── 📄 formatters.js           # Format currency, dates, phone numbers
│   │   │   ├── 📄 validators.js           # Form validation functions
│   │   │   ├── 📄 constants.js            # App constants
│   │   │   ├── 📄 helpers.js              # Helper functions
│   │   │   └── 📄 api-errors.js           # API error handling
│   │   │
│   │   ├── 📂 routes/                     # Route Configuration
│   │   │   ├── 📄 ProtectedRoute.jsx      # Protected route wrapper
│   │   │   ├── 📄 PublicRoute.jsx         # Public route wrapper
│   │   │   └── 📄 routes.jsx              # Route definitions
│   │   │
│   │   ├── 📂 contexts/                   # React Contexts
│   │   │   ├── 📄 AuthContext.jsx         # Auth context provider
│   │   │   └── 📄 ThemeContext.jsx        # Theme context
│   │   │
│   │   ├── 📄 App.jsx                     # Main App component
│   │   ├── 📄 main.jsx                    # Entry point
│   │   ├── 📄 index.css                   # Global styles
│   │   └── 📄 vite-env.d.ts               # Vite type definitions
│   │
│   ├── 📂 tests/                          # Test files
│   │   ├── 📄 setup.js                    # Test setup
│   │   └── 📂 components/                 # Component tests
│   │
│   ├── 📄 index.html                      # HTML template
│   ├── 📄 package.json                    # ⭐ Node.js dependencies
│   ├── 📄 package-lock.json               # Lock file
│   ├── 📄 vite.config.js                  # Vite configuration
│   ├── 📄 tailwind.config.js              # Tailwind CSS config
│   ├── 📄 postcss.config.js               # PostCSS config
│   ├── 📄 eslint.config.js                # ESLint configuration
│   ├── 📄 .env.example                    # Environment variables template
│   ├── 📄 FRONTEND_README.md              # ⭐ Frontend setup guide
│   └── 📄 .gitignore                      # Git ignore
│
├── 📂 docs/                               # Additional Documentation
│   ├── 📄 API.md                          # API documentation
│   ├── 📄 DATABASE.md                     # Database schema
│   ├── 📄 DEPLOYMENT.md                   # Deployment guide
│   ├── 📄 CONTRIBUTING.md                 # Contribution guidelines
│   └── 📂 images/                         # Documentation images
│
└── 📂 scripts/                            # Utility Scripts
    ├── 📄 setup.sh                        # Setup script (Linux/Mac)
    ├── 📄 setup.bat                       # Setup script (Windows)
    ├── 📄 seed_data.py                    # Database seeding script
    └── 📄 backup.sh                       # Database backup script
```

### 📊 File Statistics

| Category | Files | Lines of Code |
|----------|-------|---------------|
| Backend (Python) | 8 | ~2,500 |
| Frontend (JavaScript) | 2+ | ~500+ |
| Documentation | 4 | ~3,000 |
| Configuration | 5 | ~200 |
| **Total** | **19+** | **~6,200+** |

---

## 🚀 Installation

### Prerequisites

- **Python** 3.11 or higher
- **Node.js** 18.0 or higher
- **pip** (Python package manager)
- **npm** or **yarn** (Node package manager)
- **Git** (version control)
- **PostgreSQL** (optional, for production)

### Backend Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd mpesa_system/backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create Django project and app
django-admin startproject mpesa_project .
python manage.py startapp mpesa_app

# 5. Copy configuration files
cp settings.py mpesa_project/settings.py
cp main_urls.py mpesa_project/urls.py
cp models.py mpesa_app/models.py
cp serializers.py mpesa_app/serializers.py
cp views.py mpesa_app/views.py
cp urls.py mpesa_app/urls.py
cp admin.py mpesa_app/admin.py

# 6. Run migrations
python manage.py makemigrations
python manage.py migrate

# 7. Create superuser
python manage.py createsuperuser

# 8. Load sample data (optional)
python manage.py shell < scripts/seed_data.py

# 9. Run development server
python manage.py runserver
```

Backend will be available at: `http://localhost:8000`

### Frontend Setup

```bash
# 1. Navigate to frontend directory
cd ../frontend

# 2. Install dependencies
npm install

# 3. Setup Tailwind CSS
npx tailwindcss init -p

# 4. Create configuration files
# Copy tailwind.config.js, vite.config.js as needed

# 5. Run development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

### Quick Start (All-in-One)

```bash
# Run from project root
./scripts/setup.sh  # Linux/Mac
# or
scripts\setup.bat   # Windows
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Endpoints Overview

| Category | Method | Endpoint | Description | Auth |
|----------|--------|----------|-------------|------|
| **Auth** | POST | `/auth/register/` | Register new user | ❌ |
| | POST | `/auth/login/` | Login user | ❌ |
| | POST | `/auth/logout/` | Logout user | ✅ |
| | POST | `/token/refresh/` | Refresh access token | ❌ |
| **User** | GET | `/users/profile/` | Get user profile | ✅ |
| | PUT | `/users/update-profile/` | Update profile | ✅ |
| | POST | `/users/change-pin/` | Change PIN | ✅ |
| | GET | `/users/balance/` | Check balance | ✅ |
| **Transactions** | GET | `/transactions/` | List transactions | ✅ |
| | GET | `/transactions/{id}/` | Get transaction | ✅ |
| | POST | `/transactions/send-money/` | Send money | ✅ |
| | POST | `/transactions/deposit/` | Deposit money | ✅ |
| | POST | `/transactions/withdraw/` | Withdraw money | ✅ |
| | GET | `/transactions/recent/` | Recent transactions | ✅ |
| | GET | `/transactions/statistics/` | Transaction stats | ✅ |
| **Wallet** | GET | `/wallets/my-wallet/` | Get wallet info | ✅ |
| **Agents** | GET | `/agents/` | List agents | ✅ |
| | GET | `/agents/nearby/` | Nearby agents | ✅ |
| **Notifications** | GET | `/notifications/` | List notifications | ✅ |
| | POST | `/notifications/{id}/mark-read/` | Mark as read | ✅ |
| | POST | `/notifications/mark-all-read/` | Mark all read | ✅ |
| | GET | `/notifications/unread-count/` | Unread count | ✅ |
| **Charges** | GET | `/charges/` | Transaction charges | ✅ |

### Example Requests

#### Register User
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

#### Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "254712345678",
    "pin": "1234"
  }'
```

#### Send Money
```bash
curl -X POST http://localhost:8000/api/v1/transactions/send-money/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "receiver_phone": "254798765432",
    "amount": "1000.00",
    "pin": "1234",
    "description": "Payment for services"
  }'
```

For complete API documentation, see [API.md](docs/API.md)

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│     User     │◄────────┤  Transaction │────────►│     User     │
│              │  sender  │              │ receiver│              │
│ - id (PK)    │         │ - id (PK)    │         │              │
│ - phone      │         │ - sender_id  │         │              │
│ - pin        │         │ - receiver_id│         │              │
│ - balance    │         │ - amount     │         │              │
│ - ...        │         │ - type       │         │              │
└──────┬───────┘         │ - status     │         └──────────────┘
       │                 └──────────────┘
       │ 1:1                   │ N:1
       │                       │
       ▼                       ▼
┌──────────────┐         ┌──────────────┐
│    Wallet    │         │Notification  │
│              │         │              │
│ - id (PK)    │         │ - id (PK)    │
│ - user_id    │         │ - user_id    │
│ - limits     │         │ - type       │
│ - totals     │         │ - message    │
└──────────────┘         └──────────────┘

       │ 1:1
       │
       ▼
┌──────────────┐
│    Agent     │
│              │
│ - id (PK)    │
│ - user_id    │
│ - store_name │
│ - location   │
└──────────────┘
```

### Core Tables

#### 1. User
- **Primary Key**: UUID
- **Authentication**: phone_number + hashed PIN
- **Fields**: phone_number, first_name, last_name, email, id_number, account_balance
- **Relationships**: 
  - One-to-One with Wallet
  - One-to-Many with Transactions (as sender/receiver)
  - One-to-Many with Notifications

#### 2. Transaction
- **Primary Key**: UUID
- **Unique**: transaction_code
- **Types**: SEND, RECEIVE, DEPOSIT, WITHDRAW
- **Status**: PENDING, COMPLETED, FAILED, REVERSED
- **Fields**: amount, transaction_cost, balance snapshots
- **Relationships**: 
  - Many-to-One with User (sender)
  - Many-to-One with User (receiver)

#### 3. Wallet
- **Primary Key**: UUID
- **One-to-One**: User
- **Fields**: daily_limit, transaction_limit, totals, status flags
- **Purpose**: Track limits and cumulative statistics

#### 4. Agent
- **Primary Key**: UUID
- **One-to-One**: User
- **Fields**: agent_number, store_name, location, float_balance, commission
- **Purpose**: Manage cash-in/cash-out agents

#### 5. TransactionCharge
- **Primary Key**: UUID
- **Purpose**: Configurable transaction fees
- **Fields**: transaction_type, min_amount, max_amount, charge

#### 6. Notification
- **Primary Key**: UUID
- **Many-to-One**: User
- **Types**: TRANSACTION, SECURITY, PROMOTIONAL, SYSTEM
- **Fields**: title, message, is_read, timestamps

For detailed schema, see [DATABASE.md](docs/DATABASE.md)

---

## 🔐 Authentication Flow

```
┌──────────┐                  ┌──────────┐                  ┌──────────┐
│  Client  │                  │   API    │                  │ Database │
└────┬─────┘                  └────┬─────┘                  └────┬─────┘
     │                             │                             │
     │ 1. POST /auth/register/     │                             │
     │─────────────────────────────►                             │
     │   (phone, name, PIN)        │                             │
     │                             │ 2. Hash PIN                 │
     │                             │────────►                    │
     │                             │                             │
     │                             │ 3. CREATE User & Wallet     │
     │                             │────────────────────────────►│
     │                             │                             │
     │                             │ 4. Generate JWT Tokens      │
     │                             │◄───────────────────────────►│
     │                             │                             │
     │ 5. Return tokens + user     │                             │
     │◄─────────────────────────────                             │
     │   {access, refresh, user}   │                             │
     │                             │                             │
     │ 6. Store tokens locally     │                             │
     │                             │                             │
     │ 7. POST /transactions/send  │                             │
     │─────────────────────────────►                             │
     │   Authorization: Bearer     │                             │
     │                             │ 8. Verify JWT               │
     │                             │────────►                    │
     │                             │                             │
     │                             │ 9. Verify PIN               │
     │                             │────────────────────────────►│
     │                             │                             │
     │                             │ 10. Process Transaction     │
     │                             │◄───────────────────────────►│
     │                             │                             │
     │ 11. Return response         │                             │
     │◄─────────────────────────────                             │
     │                             │                             │
```

### Token Lifecycle

1. **Access Token**: 24 hours validity
2. **Refresh Token**: 7 days validity
3. **Auto-refresh**: Frontend automatically refreshes on 401
4. **Blacklist**: Refresh tokens blacklisted on logout

---

## 💸 Transaction Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    SEND MONEY TRANSACTION                        │
└─────────────────────────────────────────────────────────────────┘

User A (Sender)                                        User B (Receiver)
Balance: $1000                                         Balance: $500
      │                                                      │
      │ 1. Initiate Send: $100 to User B + PIN              │
      ▼                                                      │
┌──────────────┐                                             │
│  Validation  │                                             │
│              │                                             │
│ ✓ PIN valid  │                                             │
│ ✓ Receiver   │                                             │
│   exists     │                                             │
│ ✓ Calculate  │                                             │
│   fees: $5   │                                             │
│ ✓ Balance OK │                                             │
└──────┬───────┘                                             │
       │                                                      │
       │ 2. Database Transaction (ACID)                      │
       ▼                                                      │
┌──────────────┐                                             │
│  START TXN   │                                             │
└──────┬───────┘                                             │
       │                                                      │
       │ 3. Lock rows (SELECT FOR UPDATE)                    │
       ▼                                                      │
   Lock User A                                           Lock User B
       │                                                      │
       │ 4. Record balances before                           │
       ├────────► Before: $1000                              │
       │                                             Before: $500
       │                                                      │
       │ 5. Deduct from sender                               │
       ├────────► $1000 - $105 = $895                        │
       │          (amount + fee)                             │
       │                                                      │
       │ 6. Add to receiver                                  │
       │                                      $500 + $100 = $600◄──┤
       │                                                      │
       │ 7. Record balances after                            │
       ├────────► After: $895                                │
       │                                              After: $600
       │                                                      │
       │ 8. Create Transaction record                        │
       │          - Code: TXN123ABC...                       │
       │          - Type: SEND                               │
       │          - Amount: $100                             │
       │          - Fee: $5                                  │
       │          - Status: COMPLETED                        │
       │                                                      │
       │ 9. Update Wallet stats                              │
       ├────────► total_sent += $100                         │
       │                                    total_received += $100◄──┤
       │                                                      │
       │ 10. Create Notifications                            │
       ├────────► "You sent $100"                            │
       │                              "You received $100"◄───┤
       │                                                      │
       ▼                                                      ▼
┌──────────────┐                                    ┌──────────────┐
│  COMMIT TXN  │                                    │   SUCCESS    │
└──────────────┘                                    └──────────────┘
       │                                                      │
       │ 11. Return success response                         │
       ▼                                                      │
  Final Balance: $895                          Final Balance: $600
```

### Transaction Types

1. **SEND**: User to User transfer
2. **DEPOSIT**: Add money to account
3. **WITHDRAW**: Remove money from account
4. **RECEIVE**: Passive transaction record

### Transaction States

- **PENDING**: Transaction initiated
- **COMPLETED**: Successfully processed
- **FAILED**: Transaction failed
- **REVERSED**: Transaction reversed/refunded

---

## 💻 Usage Examples

### Register and Login

```javascript
// Register
const response = await authAPI.register({
  phone_number: "254712345678",
  first_name: "John",
  last_name: "Doe",
  id_number: "12345678",
  email: "john@example.com",
  pin: "1234",
  confirm_pin: "1234"
});

// Login
const loginResponse = await authAPI.login({
  phone_number: "254712345678",
  pin: "1234"
});

// Store tokens
const { access, refresh } = loginResponse.data.data.tokens;
localStorage.setItem('access_token', access);
localStorage.setItem('refresh_token', refresh);
```

### Send Money

```javascript
const transaction = await transactionAPI.sendMoney({
  receiver_phone: "254798765432",
  amount: "1000.00",
  pin: "1234",
  description: "Payment for services"
});

console.log(transaction.data.data.transaction_code);
```

### Check Balance

```javascript
const balance = await userAPI.getBalance();
console.log(`Balance: KES ${balance.data.data.account_balance}`);
```

### Transaction History

```javascript
const transactions = await transactionAPI.getTransactions({
  transaction_type: 'SEND',
  status: 'COMPLETED',
  start_date: '2024-01-01',
  end_date: '2024-12-31'
});
```

---

## 🧪 Testing

### Backend Tests

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test mpesa_app

# With coverage
pytest --cov=mpesa_app tests/

# Run specific test
python manage.py test mpesa_app.tests.TestTransactionAPI
```

### Frontend Tests

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

### API Testing with cURL

```bash
# Test registration
./scripts/test_api.sh register

# Test login
./scripts/test_api.sh login

# Test send money
./scripts/test_api.sh send
```

---

## 🚢 Deployment

### Backend Deployment (Production)

```bash
# 1. Update settings for production
DEBUG = False
ALLOWED_HOSTS = ['yourdomain.com']
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        # ... PostgreSQL config
    }
}

# 2. Collect static files
python manage.py collectstatic

# 3. Run migrations
python manage.py migrate

# 4. Use production server (Gunicorn)
gunicorn mpesa_project.wsgi:application --bind 0.0.0.0:8000
```

### Frontend Deployment

```bash
# 1. Update API URL
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1

# 2. Build for production
npm run build

# 3. Deploy dist/ folder to hosting
# - Vercel
# - Netlify
# - AWS S3 + CloudFront
```

For detailed deployment guide, see [DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## 📊 Performance Considerations

- **Database Indexing**: Indexed on transaction_code, phone_number, created_at
- **Query Optimization**: select_related() and prefetch_related() used
- **Transaction Locking**: SELECT FOR UPDATE prevents race conditions
- **API Pagination**: 20 items per page default
- **Caching**: Redis recommended for production
- **Rate Limiting**: Implement rate limiting for API endpoints

---

## 🔒 Security Best Practices

✅ **Implemented:**
- PIN hashing with Django's password hashers
- JWT token authentication
- Token blacklisting on logout
- CORS configuration
- Database transaction locks
- Input validation

🔲 **Recommended for Production:**
- SSL/TLS (HTTPS)
- Rate limiting (django-ratelimit)
- IP whitelisting for admin
- Database backups
- Monitoring and logging
- 2FA for admin accounts

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Code Style

- **Python**: Follow PEP 8
- **JavaScript**: Use ESLint configuration
- **Commits**: Use conventional commits

For detailed guidelines, see [CONTRIBUTING.md](docs/CONTRIBUTING.md)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- Django REST Framework documentation
- React.js community
- M-Pesa for inspiration
- All contributors

---

## 📞 Support

- **Documentation**: Check the docs/ folder
- **Issues**: GitHub Issues
- **Email**: support@yourproject.com

---

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ User authentication
- ✅ Basic transactions
- ✅ Transaction history
- ✅ Notifications

### Phase 2 (Planned)
- ⬜ Mobile app (React Native)
- ⬜ Bill payments
- ⬜ Merchant payments
- ⬜ QR code transactions

### Phase 3 (Future)
- ⬜ Loans and credit
- ⬜ Investment features
- ⬜ International transfers
- ⬜ Analytics dashboard

---

## 📈 Project Stats

- **Created**: January 2024
- **Language**: Python, JavaScript
- **Framework**: Django, React
- **Status**: Active Development
- **Contributors**: 1+
- **Stars**: ⭐ Star us on GitHub!

---

<div align="center">

**Made with ❤️ by developers, for developers**

[⬆ Back to Top](#-mpesa-system---full-stack-mobile-money-application)

</div>