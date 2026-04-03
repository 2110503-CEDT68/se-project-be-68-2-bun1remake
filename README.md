# ฺBun1 Hotel Booking System - Backend API


## 📋 Project Overview

A comprehensive RESTful API for a hotel booking system built with **Node.js, Express, and MongoDB**. The system allows users to register, login, search for hotels, and manage bookings, while admins can manage all bookings and hotel information.

##  Tech Stack

- **Runtime:** Node.js (Bun compatible)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Testing:** Postman/Newman
- **Environment:** .env configuration

---

## 📂 Project Structure

```
be-project-68-bun1/
├── config/
│   ├── db.js              # Database connection
│   └── config.env         # Environment variables
├── controllers/
│   ├── Auth.js            # Authentication logic
│   ├── Hotels.js          # Hotel CRUD operations
│   └── bookings.js        # Booking management
├── models/
│   ├── User.js            # User schema
│   ├── Hotel.js           # Hotel schema
│   └── booking.js         # Booking schema
├── routes/
│   ├── auth.js            # Auth endpoints
│   ├── Hotel.js           # Hotel endpoints
│   └── bookings.js        # Booking endpoints
├── middleware/
│   └── auth.js            # JWT verification & role authorization
├── Bun1.postman_collection.json  # API test suite
├── env.json               # Postman environment
├── server.js              # Entry point
├── package.json           # Dependencies
└── README.md              # This file
```

---

## 📡 API Endpoints

### **Auth Endpoints**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/register` | Start registration and send OTP email | No |
| POST | `/api/v1/auth/register/initiate` | Start registration and send OTP email | No |
| POST | `/api/v1/auth/verify-otp` | Verify OTP and activate account | No |
| POST | `/api/v1/auth/resend-otp` | Resend OTP for pending account | No |
| POST | `/api/v1/auth/login` | Login user | No |
| GET | `/api/v1/auth/me` | Get current user profile | Yes |
| GET | `/api/v1/auth/logout` | Logout user | Yes |
| PUT | `/api/v1/auth/users/:id/role` | Promote user to admin | Admin |

### **Hotel Endpoints**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/hotels` | Get all hotels (with search) | No |
| GET | `/api/v1/hotels/:id` | Get single hotel | No |
| POST | `/api/v1/hotels` | Create hotel | Admin |
| PUT | `/api/v1/hotels/:id` | Update hotel | Admin |
| DELETE | `/api/v1/hotels/:id` | Delete hotel | Admin |

### **Booking Endpoints**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/bookings` | Get user bookings (admin: all) | Yes |
| GET | `/api/v1/bookings/:id` | Get single booking | Yes |
| POST | `/api/v1/hotels/:hotelId/bookings` | Create booking | Yes |
| PUT | `/api/v1/bookings/:id` | Update booking | Yes |
| DELETE | `/api/v1/bookings/:id` | Delete booking | Yes |
| GET | `/api/v1/hotels/:hotelId/bookings` | Get bookings by hotel | Admin |

---

##  Testing

### Run Full Test Suite
```bash
newman run ./Bun1.postman_collection.json -e env.json
```

#### Test Coverage
- User registration and authentication
- Hotel CRUD operations
- Booking creation, updates, deletion
- Admin role management
- Access control validation (negative tests)
- Status transitions and pagination

### Import Postman Collection
1. Open Postman
2. Click "Import" 
3. Select `Bun1.postman_collection.json`
4. Import `env.json` as environment
5. Run all requests

---

##  Example Requests

  Please look at /models folder

---

---

## 👨‍💻 Developer Notes

### Making Changes
1. Always run tests after changes: `newman run ./Bun1.postman_collection.json -e env.json`
2. Update this README if adding new features
3. Commit frequently with clear messages
4. Use feature branches for new developments

