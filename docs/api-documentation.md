# Career Counseling Platform - API Documentation

## 📋 Overview

The Career Counseling Platform API is a RESTful service built with NestJS that provides comprehensive career guidance features including user management, assessments, mentor booking, payments, and career roadmaps.

- **Base URL**: `http://localhost:3001/api/v1`
- **Documentation**: `http://localhost:3001/api/docs`
- **Authentication**: JWT Bearer Token
- **Content Type**: `application/json`

## 🔐 Authentication

### JWT Token Format
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "student|mentor|admin|institution_admin",
  "iat": 1699123456,
  "exp": 1699209856
}
```

### Headers
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

## 📚 API Endpoints

### Authentication Endpoints

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "username": "john_doe",
  "role": "student"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "username": "john_doe",
    "role": "student",
    "isActive": true,
    "emailVerified": false,
    "profile": {
      "firstName": "John",
      "lastName": "Doe"
    }
  },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token",
  "message": "Registration successful. Please check your email to verify your account."
}
```

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "username": "john_doe",
    "role": "student",
    "isActive": true,
    "emailVerified": true,
    "profile": {
      "firstName": "John",
      "lastName": "Doe"
    }
  },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token",
  "message": "Login successful"
}
```

#### GET /auth/google
Initiate Google OAuth login (redirects to Google).

#### GET /auth/google/callback
Handle Google OAuth callback.

#### POST /auth/forgot-password
Request password reset email.

**Request Body:**
```json
{
  "email": "student@example.com"
}
```

#### POST /auth/reset-password
Reset password with token.

**Request Body:**
```json
{
  "token": "reset_token",
  "newPassword": "NewSecurePassword123!"
}
```

#### POST /auth/refresh-token
Refresh access token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

### User Management Endpoints

#### GET /users/profile
Get current user profile (requires authentication).

**Response (200):**
```json
{
  "id": "uuid",
  "email": "student@example.com",
  "username": "john_doe",
  "role": "student",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1995-01-15",
    "gender": "male",
    "phoneNumber": "+1234567890",
    "country": "United States",
    "city": "New York",
    "educationLevel": "Bachelor's Degree",
    "currentOccupation": "Software Developer",
    "bio": "Passionate about technology and learning",
    "interests": ["technology", "programming", "AI"],
    "languages": ["English", "Spanish"]
  }
}
```

#### PUT /users/profile
Update user profile.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phoneNumber": "+1234567890",
  "bio": "Updated bio",
  "interests": ["technology", "AI", "machine learning"]
}
```

#### GET /users/mentors
List available mentors with filtering.

**Query Parameters:**
- `expertise`: Filter by expertise area
- `rating`: Minimum rating
- `availability`: Filter by availability
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response (200):**
```json
{
  "mentors": [
    {
      "id": "uuid",
      "user": {
        "firstName": "Jane",
        "lastName": "Expert",
        "profilePictureUrl": "https://example.com/avatar.jpg"
      },
      "expertiseAreas": ["software development", "career guidance"],
      "yearsOfExperience": 8,
      "currentCompany": "Tech Corp",
      "currentPosition": "Senior Developer",
      "hourlyRate": 75.00,
      "rating": 4.8,
      "totalSessions": 150,
      "isVerified": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### Assessment Endpoints

#### GET /assessments
List available assessments.

**Response (200):**
```json
{
  "assessments": [
    {
      "id": "uuid",
      "title": "Logical Reasoning Assessment",
      "description": "Test your logical and analytical thinking skills",
      "type": "aptitude",
      "timeLimitMinutes": 45,
      "category": "reasoning",
      "difficultyLevel": 3,
      "isActive": true
    }
  ]
}
```

#### GET /assessments/:id
Get specific assessment details.

#### POST /assessments/:id/take
Start taking an assessment.

**Response (200):**
```json
{
  "sessionId": "uuid",
  "assessment": {
    "id": "uuid",
    "title": "Logical Reasoning Assessment",
    "instructions": "Answer all questions to the best of your ability...",
    "timeLimitMinutes": 45
  },
  "questions": [
    {
      "id": "uuid",
      "questionText": "If all roses are flowers...",
      "questionType": "multiple_choice",
      "options": [
        {"value": "A", "text": "All roses are red"},
        {"value": "B", "text": "Some roses might be red"}
      ],
      "orderIndex": 1
    }
  ],
  "startedAt": "2023-11-05T10:00:00Z"
}
```

#### POST /assessments/:id/submit
Submit assessment responses.

**Request Body:**
```json
{
  "sessionId": "uuid",
  "responses": {
    "question_uuid_1": "B",
    "question_uuid_2": "A"
  }
}
```

**Response (200):**
```json
{
  "resultId": "uuid",
  "rawScore": 18,
  "percentageScore": 90.0,
  "categoryScores": {
    "logical": 85,
    "analytical": 95
  },
  "recommendations": "You show strong analytical skills...",
  "completedAt": "2023-11-05T10:45:00Z"
}
```

#### GET /assessments/results
Get user's assessment results.

### Booking Endpoints

#### GET /bookings
List user's bookings.

**Query Parameters:**
- `status`: Filter by booking status
- `upcoming`: Boolean for upcoming bookings only
- `page`: Page number
- `limit`: Items per page

**Response (200):**
```json
{
  "bookings": [
    {
      "id": "uuid",
      "title": "Career Guidance Session",
      "scheduledAt": "2023-11-10T14:00:00Z",
      "durationMinutes": 60,
      "status": "confirmed",
      "mentor": {
        "user": {
          "firstName": "Jane",
          "lastName": "Expert"
        },
        "expertiseAreas": ["career guidance"]
      },
      "meetingUrl": "https://meet.example.com/room123",
      "amount": 75.00,
      "currency": "USD"
    }
  ]
}
```

#### POST /bookings
Create a new booking.

**Request Body:**
```json
{
  "mentorId": "uuid",
  "scheduledAt": "2023-11-10T14:00:00Z",
  "durationMinutes": 60,
  "title": "Career Guidance Session",
  "description": "Discuss career transition options"
}
```

#### PUT /bookings/:id
Update a booking.

#### DELETE /bookings/:id
Cancel a booking.

### Payment Endpoints

#### GET /payments
List user's payment history.

#### POST /payments/create-intent
Create Stripe payment intent.

**Request Body:**
```json
{
  "bookingId": "uuid",
  "amount": 7500,
  "currency": "usd"
}
```

#### POST /payments/confirm
Confirm payment.

### Roadmap Endpoints

#### GET /roadmaps
List user's career roadmaps.

#### POST /roadmaps
Create a new roadmap.

#### GET /roadmaps/:id
Get specific roadmap with steps.

#### PUT /roadmaps/:id/steps/:stepId/complete
Mark a roadmap step as complete.

### Admin Endpoints

#### GET /admin/users
List all users (admin only).

#### GET /admin/analytics
Get platform analytics.

#### POST /admin/mentors/:id/verify
Verify a mentor account.

## 📊 Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Rate Limited |
| 500 | Internal Server Error |

## 🔒 Rate Limiting

- **Default**: 100 requests per minute per IP
- **Authentication endpoints**: 5 requests per minute per IP
- **File uploads**: 10 requests per minute per user

## 📝 Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ],
  "timestamp": "2023-11-05T10:00:00Z",
  "path": "/api/v1/auth/register"
}
```

## 🧪 Testing with cURL

### Register User
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!"
  }'
```

### Get Profile (with token)
```bash
curl -X GET http://localhost:3001/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🚀 SDK Usage Examples

### JavaScript/TypeScript
```typescript
// API Client setup
const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Register user
const registerUser = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Get user profile
const getUserProfile = async () => {
  const response = await apiClient.get('/users/profile');
  return response.data;
};
```

This API documentation provides comprehensive guidance for integrating with the Career Counseling Platform backend services.