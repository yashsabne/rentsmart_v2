**RentSmart v2** is a scalable property rental platform currently under development, 
focused on microservices architecture and containerized deployment using Docker.

The initial version (v1) was built as a monolithic application.
While functional, it had limitations in scalability, maintainability, 
and deployment flexibility.

To address these challenges, v2 is being redesigned with:
- Microservices architecture
- Docker-based containerization
- Improved modular backend structure

Planned Services:
- Auth Service (JWT, Google Auth)
- User Service
- Property Service
- Chat Service (Socket.IO)
- Payment Service (Razorpay)

Each service will run in its own Docker container.

**Redis** is integrated to improve performance and enable fast data access.

Use cases:
- Caching frequently accessed property listings
- Storing user sessions / JWT blacklisting
- Real-time chat message handling (Pub/Sub)
- Rate limiting (to prevent abuse)

The system is designed with scalability and fault isolation in mind, 
ensuring that failure in one service does not impact others.


old repo for reference: https://github.com/yashsabne/rentSmart
