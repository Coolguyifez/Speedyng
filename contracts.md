# Speedy Car Dealership - Backend Implementation Contracts

## Overview
This document outlines the API contracts, data models, and integration plan for connecting the Speedy Car Dealership frontend with the backend.

## Current Mock Data (frontend/src/mock.js)
- **cars**: Array of 10 car listings with full details
- **categories**: 6 car categories with counts
- **locations**: 5 Nigerian locations
- **conditions**: 3 condition types (Brand New, Foreign Used, Nigerian Used)
- **testimonials**: 3 customer testimonials
- **mockChatResponses**: AI assistant mock responses

## Backend Implementation Plan

### 1. Database Models (MongoDB)

#### User Model
```python
{
    "_id": ObjectId,
    "name": str,
    "email": str (unique, indexed),
    "phone": str,
    "password": str (hashed),
    "role": str (enum: "user", "admin"),
    "favorites": [ObjectId],  # Array of car IDs
    "created_at": datetime,
    "updated_at": datetime
}
```

#### Car Model
```python
{
    "_id": ObjectId,
    "name": str,
    "category": str,  # Sedans, SUVs, Trucks, Luxury, Budget, Foreign Used
    "price": int,
    "condition": str,  # Brand New, Foreign Used, Nigerian Used
    "location": str,  # Lagos, Abuja, Port Harcourt, Benin
    "image": str,  # Primary image URL
    "images": [str],  # Array of image URLs
    "year": int,
    "mileage": str,
    "transmission": str,  # Automatic, Manual
    "fuel_type": str,  # Petrol, Diesel, Electric, Hybrid
    "description": str,
    "features": [str],
    "verified": bool,
    "created_at": datetime,
    "updated_at": datetime
}
```

#### ChatSession Model
```python
{
    "_id": ObjectId,
    "user_id": ObjectId (optional),
    "session_id": str (unique),
    "messages": [
        {
            "role": str,  # "user" or "assistant"
            "content": str,
            "timestamp": datetime
        }
    ],
    "created_at": datetime,
    "updated_at": datetime
}
```

#### ContactSubmission Model
```python
{
    "_id": ObjectId,
    "name": str,
    "email": str,
    "phone": str,
    "message": str,
    "status": str,  # pending, contacted, resolved
    "created_at": datetime
}
```

### 2. API Endpoints

#### Authentication APIs
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (returns JWT token)
- `GET /api/auth/me` - Get current user profile (requires auth)
- `POST /api/auth/logout` - Logout user

#### Car APIs (Public)
- `GET /api/cars` - Get all cars with filters
  - Query params: category, location, condition, min_price, max_price, search
- `GET /api/cars/{id}` - Get single car details
- `GET /api/cars/featured` - Get featured cars (limit 6)

#### Car APIs (Admin Only)
- `POST /api/cars` - Add new car
- `PUT /api/cars/{id}` - Update car
- `DELETE /api/cars/{id}` - Delete car

#### User Favorites APIs (Auth Required)
- `GET /api/favorites` - Get user's favorite cars
- `POST /api/favorites/{car_id}` - Add car to favorites
- `DELETE /api/favorites/{car_id}` - Remove car from favorites

#### Contact APIs
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all contact submissions (Admin only)

#### AI Chat APIs
- `POST /api/chat` - Send message to AI assistant
  - Body: { session_id, message }
  - Response: { response, session_id }
- `GET /api/chat/{session_id}` - Get chat history

#### Categories & Stats APIs
- `GET /api/categories` - Get all categories with car counts
- `GET /api/stats` - Get dashboard statistics (total cars, by condition, etc.)

### 3. Frontend Integration Points

#### Replace Mock Data
1. **HomePage.jsx**
   - Replace `cars` mock with API call to `/api/cars/featured`
   - Replace `categories` with API call to `/api/categories`
   - Replace `testimonials` (keep as static or create testimonials API)

2. **CarsPage.jsx**
   - Replace `cars` filter logic with API call to `/api/cars?filters`
   - Implement API-based filtering instead of client-side

3. **CarDetailsPage.jsx**
   - Replace car lookup with API call to `/api/cars/{id}`
   - Implement favorites toggle with API calls

4. **ChatWidget.jsx**
   - Replace mock responses with API calls to `/api/chat`
   - Implement session management
   - Use Google Gemini for AI responses

5. **ContactPage.jsx**
   - Replace form submission mock with API call to `/api/contact`

6. **LoginPage.jsx & RegisterPage.jsx**
   - Replace localStorage mock with API calls to `/api/auth/login` and `/api/auth/register`
   - Store JWT token in localStorage
   - Implement protected routes

7. **AdminPanel.jsx**
   - Replace local state management with API calls for CRUD operations
   - Add authentication check (redirect if not admin)
   - Integrate with `/api/cars` endpoints

### 4. Google Gemini Integration
- Use Emergent LLM key for Gemini API
- Configure system prompt for car dealership assistant:
  - Help users find cars based on budget
  - Answer questions about car features, maintenance
  - Recommend cars for Nigerian roads
  - Guide users to contact or book inspection
- Store conversation history in database

### 5. Authentication Flow
1. User logs in → Backend validates → Returns JWT token
2. Frontend stores token in localStorage
3. Protected routes check for token
4. API calls include token in Authorization header
5. Backend verifies token for protected endpoints

### 6. File Upload (if needed for admin)
- Implement file upload for car images
- Store images in persistent location
- Return image URLs to store in database

### 7. Environment Variables Needed
```
# Backend .env
MONGO_URL=<existing>
DB_NAME=<existing>
JWT_SECRET=<generate>
JWT_EXPIRATION=7d
EMERGENT_LLM_KEY=<from emergent_integrations_manager>
```

### 8. Testing Checklist
- [ ] User registration and login
- [ ] Car listing with filters
- [ ] Car details page with real data
- [ ] Favorites add/remove
- [ ] Admin CRUD operations for cars
- [ ] AI chat with Gemini integration
- [ ] Contact form submission
- [ ] Protected routes (admin panel)
- [ ] Search functionality

## Notes
- All mock data in `mock.js` will remain for fallback/development
- Frontend should handle loading states and errors gracefully
- Implement pagination for car listings (e.g., 12 cars per page)
- Add proper error messages and validation
