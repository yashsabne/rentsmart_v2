 
# RentSmart v2
 
**RentSmart v2** is a scalable property rental platform currently under development, 
focused on microservices architecture and containerized deployment using Docker.

RentSmart v2 is a modern property rental platform built using a microservices-based architecture. The project is a complete redesign of RentSmart v1, which was originally developed as a monolithic application.

The goal of v2 is to improve scalability, maintainability, deployment flexibility, and service isolation while providing a better developer experience through independent service deployment and containerization.

---

## Overview

RentSmart enables users to discover, list, and manage rental properties through a scalable service-oriented architecture.

The application has been restructured from a monolithic system into multiple independent services, allowing better maintainability, fault isolation, and future scalability.

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
- Chat Service (Work in Progress)

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
- Redis (Planned)
- Socket.IO (Planned)
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

Planned Docker Components:

- Dockerfile for each service
- Docker Compose orchestration
- Container networking between services

---

## Redis Integration (Planned)

Redis is planned for performance optimization and distributed system support.

Potential Use Cases:

- Property listing caching
- Session management
- JWT blacklisting
- Rate limiting
- Chat Pub/Sub messaging
- Frequently accessed data caching

---
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

- Real-time Chat using Socket.IO
- Google Authentication
- Advanced Property Recommendation System
- Cloudinary Image Management
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

- Real-time chat system
- Redis integration 
- Advanced recommendation engine
- Admin management tools
- Performance optimization
- Security enhancements
- Production-grade deployment architecture
- Img upload and cloudinary integration

This repository represents the first deployment-ready milestone of the project. Future phases will focus on scalability, reliability, observability, and advanced platform capabilities.
  
The system is designed with scalability and fault isolation in mind, 
ensuring that failure in one service does not impact others.

 
