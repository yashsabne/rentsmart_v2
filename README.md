 
# RentSmart v2 

**RentSmart v2** is a scalable property rental platform currently under development, 
focused on microservices architecture and containerized deployment using Docker.
 
RentSmart v2 is a modern property rental platform built using a microservices-based architecture. The project is a complete redesign of RentSmart v1, which was originally developed as a monolithic application.

The goal of v2 is to improve scalability, maintainability, deployment flexibility, and service isolation while providing a better developer experience through independent service deployment and containerization.

---

## Overview

RentSmart enables users to discover, list, and manage rental properties through a scalable service-oriented architecture.

The application has been restructured from a monolithic system into multiple independent services, allowing better maintainability, fault isolation, and future scalability.

Directory Structure

Directory structure:
└── yashsabne-rentsmart_v2/
    ├── README.md
    ├── docker-compose.yml
    ├── client/
    │   ├── README.md
    │   ├── apis.js
    │   ├── eslint.config.js
    │   ├── index.html
    │   ├── package.json
    │   ├── vercel.json
    │   ├── vite.config.js
    │   ├── .dockerignore
    │   ├── public/
    │   │   ├── googlede62f64a46aa89f3.html
    │   │   └── sitemap.xml
    │   └── src/
    │       ├── App.jsx
    │       ├── constants.js
    │       ├── index.css
    │       ├── main.jsx
    │       ├── chat/
    │       │   ├── socketContext.jsx
    │       │   ├── useChatEvents.js
    │       │   └── useSocket.js
    │       ├── components/
    │       │   ├── AdvancedSidebar.jsx
    │       │   ├── Dashboardlistingpanel.jsx
    │       │   ├── Helper.Payments.jsx
    │       │   ├── Hero.jsx
    │       │   ├── Pagination.jsx
    │       │   ├── Payments.jsx
    │       │   ├── SaveBtn.jsx
    │       │   ├── ShareButton.jsx
    │       │   ├── VerifyEmailButton.jsx
    │       │   ├── messages/
    │       │   │   ├── ChatArea.jsx
    │       │   │   ├── ConversationList.jsx
    │       │   │   ├── MessageBox.jsx
    │       │   │   ├── MessageBubble.jsx
    │       │   │   ├── messages.css
    │       │   │   ├── MessagesPage.jsx
    │       │   │   ├── PropertyInfoPanel.jsx
    │       │   │   └── TypingIndicator.jsx
    │       │   ├── property/
    │       │   │   ├── ContactCard.jsx
    │       │   │   ├── MessageBox.jsx
    │       │   │   ├── OwnerCard.jsx
    │       │   │   └── PaymentUnlockCard.jsx
    │       │   └── reuse/
    │       │       ├── Footer.jsx
    │       │       └── Navbar.jsx
    │       ├── const_func/
    │       │   └── dashFunction.jsx
    │       ├── constants/
    │       │   └── socketEvents.js
    │       ├── pages/
    │       │   ├── CreateListing.jsx
    │       │   ├── Dashboard.jsx
    │       │   ├── Developer.jsx
    │       │   ├── EditListing.jsx
    │       │   ├── Forgotpassword.jsx
    │       │   ├── help.const.js
    │       │   ├── help.const.jsx
    │       │   ├── Help.jsx
    │       │   ├── HomePage.jsx
    │       │   ├── ListingDetails.jsx
    │       │   ├── Login.jsx
    │       │   ├── PropertyBuyPage.jsx
    │       │   ├── Register.jsx
    │       │   ├── ResetPassword.jsx
    │       │   ├── SavedList.jsx
    │       │   ├── VerifyEmailPage.jsx
    │       │   └── styles/
    │       │       ├── dashboard.css
    │       │       ├── homepage.css
    │       │       ├── listingdetails.css
    │       │       └── propertybuy.css
    │       └── services/
    │           ├── apilisting.js
    │           └── chatApi.js
    └── services/
        ├── activity-service/
        │   ├── app.js
        │   ├── Dockerfile
        │   ├── package.json
        │   └── src/
        │       ├── config/
        │       │   └── db.js
        │       ├── constants/
        │       │   └── activityTypes.js
        │       ├── controllers/
        │       │   └── activityController.js
        │       ├── models/
        │       │   └── ActivityModel.js
        │       ├── routes/
        │       │   └── activityRoutes.js
        │       └── utils/
        │           └── redisClient.js
        ├── auth-service/
        │   ├── app.js
        │   ├── Dockerfile
        │   ├── package.json
        │   ├── .dockerignore
        │   └── src/
        │       ├── config/
        │       │   ├── db.js
        │       │   └── mail.js
        │       ├── controllers/
        │       │   └── authController.js
        │       ├── middleware/
        │       │   ├── authMiddleware.js
        │       │   ├── mailVerified.js
        │       │   ├── rateLimitMiddleware.js
        │       │   └── verifyInternalSecret.js
        │       ├── models/
        │       │   └── User.js
        │       ├── routes/
        │       │   └── authRoutes.js
        │       ├── services/
        │       │   ├── sendForgotPasswordEmail.js
        │       │   └── sendVerificationEmail.js
        │       └── utils/
        │           ├── activityLogger.js
        │           ├── redisClient.js
        │           └── resetMonthlyUsage.js
        ├── chat-service/
        │   ├── Dockerfile
        │   ├── package.json
        │   └── src/
        │       ├── app.js
        │       ├── config/
        │       │   └── db.js
        │       ├── constants/
        │       │   └── events.js
        │       ├── controllers/
        │       │   ├── conversationController.js
        │       │   └── messageController.js
        │       ├── middleware/
        │       │   └── authMiddleware.js
        │       ├── models/
        │       │   ├── Conversation.js
        │       │   └── Message.js
        │       ├── routes/
        │       │   ├── conversationRoutes.js
        │       │   └── messageRoutes.js
        │       ├── services/
        │       │   └── conversationService.js
        │       ├── sockets/
        │       │   └── chatSocket.js
        │       ├── utils/
        │       │   ├── redisClient.js
        │       │   └── slugGenerator.js
        │       └── validators/
        │           ├── conversationValidator.js
        │           └── messageValidator.js
        ├── notification-service/
        │   ├── app.js
        │   ├── Dockerfile
        │   ├── package.json
        │   └── src/
        │       ├── config/
        │       │   └── brevo.js
        │       ├── controller/
        │       │   └── notificationController.js
        │       ├── routes/
        │       │   └── notificationRoutes.js
        │       ├── services/
        │       │   └── sendEmail.js
        │       └── utils/
        │           └── notifyClient.js
        ├── payment-service/
        │   ├── app.js
        │   ├── Dockerfile
        │   ├── package.json
        │   └── src/
        │       ├── config/
        │       │   ├── db.js
        │       │   └── razorpay.js
        │       ├── controller/
        │       │   ├── paymentController.js
        │       │   └── paymentHistoryController.js
        │       ├── middleware/
        │       │   ├── authMiddleware.js
        │       │   └── requireVerifiedEmail.js
        │       ├── models/
        │       │   ├── paymentModel.js
        │       │   └── PromotePayment.js
        │       ├── routes/
        │       │   ├── historyRoutes.js
        │       │   └── paymentRoutes.js
        │       └── utils/
        │           ├── activityLogger.js
        │           ├── razorpay.js
        │           └── sendNotification.js
        ├── property-service/
        │   ├── app.js
        │   ├── Dockerfile
        │   ├── package.json
        │   ├── .dockerignore
        │   ├── const/
        │   │   └── popularCities.js
        │   └── src/
        │       ├── config/
        │       │   ├── cloudinary.js
        │       │   └── db.js
        │       ├── controllers/
        │       │   ├── listingActionController.js
        │       │   ├── promoteController.js
        │       │   ├── propertyController.js
        │       │   ├── savedController.js
        │       │   └── shareController.js
        │       ├── middleware/
        │       │   ├── authMiddleware.js
        │       │   └── requireVerifiedEmail.js
        │       ├── models/
        │       │   ├── Listings.js
        │       │   ├── SavedProperty.js
        │       │   └── Share.js
        │       ├── routes/
        │       │   ├── listingactionsroutes.js
        │       │   ├── promoteRoutes.js
        │       │   ├── propertyRoutes.js
        │       │   ├── savedRoutes.js
        │       │   └── shareRoutes.js
        │       └── utils/
        │           ├── activityLogger.js
        │           ├── generateShareToken.js
        │           └── redisClient.js
        └── redis-service/
            ├── app.js
            ├── Dockerfile
            ├── package.json
            ├── .dockerignore
            └── src/
                ├── config/
                │   └── redis.js
                ├── controllers/
                │   └── redisController.js
                ├── middleware/
                │   └── rateLimitMiddleware.js
                ├── routes/
                │   └── redisRoutes.js
                ├── services/
                │   ├── cacheService.js
                │   ├── otpService.js
                │   ├── pubsubService.js
                │   ├── queueService.js
                │   ├── rateLimitService.js
                │   └── sessionService.js
                └── utils/
                    └── redisKeys.js


---

## Current Features

### Authentication & User Management

- User Registration
- User Login
- JWT Authentication
- Email Verification
- Protected Routes
- Authentication Middleware
- Service-based Authentication Architecture

### Property Management

- Create Property Listings
- Browse Available Properties
- Property Details Page
- Search and Filter Properties
- Similar Property Recommendations
- Property Management APIs

### Activity Tracking

- User Activity Logging
- Login Activity Tracking
- Property-related Activity Tracking
- Centralized Activity Service

### Notification System

- Email Verification Workflow
- Notification Service Architecture
- Email-based User Communication

### Payment Integration

- Dedicated Payment Service
- Service-to-Service Communication Structure
- Payment Workflow Foundation

### Frontend

- React
- Vite
- Responsive Design
- Environment-based Configuration
- Modular Component Architecture

---

## Architecture

RentSmart v2 follows a microservices architecture where each domain is separated into its own service.

Current Services:

- Auth Service
- Property Service
- Activity Service
- Payment Service
- Notification Service
- Chat Service
- Redis Service 

Benefits of the Architecture:

- Independent service development
- Easier maintenance
- Better scalability
- Improved fault isolation
- Flexible deployment options
- Clear separation of concerns

---

## Technology Stack

### Frontend

- React
- Vite
- JavaScript
- CSS 

### Backend

- Node.js
- Express.js
- MongoDB
- JWT Authentication

### Additional Technologies

- Docker (Containerization)
- Redis (Caching & Distributed Infrastructure)
- Socket.IO (Real-Time Communication)
- Razorpay Integration

---

## Docker Support

The project is being prepared for containerized deployment using Docker.

Each service can be packaged independently, allowing:

- Consistent development environments
- Simplified deployment
- Service isolation
- Improved scalability
- Easier infrastructure management
 
---

## Redis Service

A dedicated Redis service is as part of the RentSmart infrastructure layer to improve performance, scalability, and inter-service communication.

Redis will operate as a centralized in-memory data store shared across microservices and containerized deployments.

 
 
## Security & Trust Features

RentSmart is being developed with a strong focus on user safety, trust, and platform accountability.

Current Security Features:

- JWT-based Authentication
- Protected Routes
- Email Verification
- Activity Logging
- Service-level Authentication Middleware
- Environment-based Configuration
- Secure API Communication Structure

Planned Security Enhancements:

- Suspicious Activity Monitoring
- Rate Limiting and Abuse Prevention
- Property Verification Workflow
- User Reporting and Moderation System
- Suspicious Activity Analysis
- Security-focused Audit Logs
- Advanced Authorization Controls
- Fraud Prevention and Risk Monitoring
- User Reputation and Trust Scoring

Safety Features (Planned):

- Emergency Contact Management
- Trusted Contact Sharing Between Verified Users
- Safety Check-In Mechanisms
- Emergency Alert Notifications
- Activity-based Safety Monitoring
- Optional Contact Visibility for Enhanced User Security
- Verified Identity and Profile Validation Workflows

The objective is to create a secure rental ecosystem where users can confidently interact, communicate, and conduct property-related transactions while maintaining privacy, accountability, and platform trust.
## Planned Features
 
- Google Authentication
- Advanced Property Recommendation System
- Property Analytics
- Docker Compose Deployment
- CI/CD Pipeline

---

## Environment Configuration

Frontend Environment Variables:

```env
VITE_AUTH_API=http://localhost:5000
VITE_PROPERTY_API=http://localhost:5001
VITE_PAYMENT_API=http://localhost:5002
VITE_NOTIF_API=http://localhost:5003
VITE_ACTIVITY_API=http://localhost:5004
VITE_CHAT_API=http://localhost:5005
```

Example Production Configuration:

```env
VITE_AUTH_API=https://auth-service.onrender.com
VITE_PROPERTY_API=https://property-service.onrender.com
VITE_PAYMENT_API=https://payment-service.onrender.com
VITE_NOTIF_API=https://notification-service.onrender.com
VITE_ACTIVITY_API=https://activity-service.onrender.com
VITE_CHAT_API=https://chat-service.onrender.com
```

Backend Service Communication Example:

```env
AUTH_SERVICE_URL=http://localhost:5000
PROPERTY_SERVICE_URL=http://localhost:5001
PAYMENT_SERVICE_URL=http://localhost:5002
NOTIFICATION_SERVICE_URL=http://localhost:5003
ACTIVITY_SERVICE_URL=http://localhost:5004
CHAT_SERVICE_URL=http://localhost:5005
```

Docker Service Communication Example:

```env
AUTH_SERVICE_URL=http://auth-service:5000
PROPERTY_SERVICE_URL=http://property-service:5001
PAYMENT_SERVICE_URL=http://payment-service:5002
NOTIFICATION_SERVICE_URL=http://notification-service:5003
ACTIVITY_SERVICE_URL=http://activity-service:5004
CHAT_SERVICE_URL=http://chat-service:5005
```

---

## Project Status

RentSmart v2 is currently in Phase 1 of development.

The core microservices architecture has been established, and the primary platform functionalities such as authentication, property management, activity tracking, notifications, and frontend integration are operational.

The current focus is on:

- Service stabilization
- Environment-based configuration
- Deployment preparation
- Inter-service communication improvements
- Infrastructure setup

Several major features and architectural improvements are still under development, including:
  
- Admin management tools
- Performance optimization
- Security enhancements
- Production-grade deployment architecture 

This repository represents the first deployment-ready milestone of the project. Future phases will focus on scalability, reliability, observability, and advanced platform capabilities.
  
The system is designed with scalability and fault isolation in mind, 
ensuring that failure in one service does not impact others.

 
