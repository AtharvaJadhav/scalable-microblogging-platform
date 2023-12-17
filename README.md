# Scalable Microblogging Platform with Cloud-Native Architecture

## Project Overview

This semester project involves the development of a scalable microblogging platform leveraging cloud-native architecture. The platform, akin to Reddit, allows users to create, edit, delete, and view posts with image support.

## Official Features Implemented
1. **User Management**: Includes user sign-ups, sign-in, and password recovery workflows.
2. **Content Posting**: Allows posting, editing, and deleting of long posts with image support.
3. **Feed View**: Displays posts from users in chronological order or top sorted order.        
4. **Content Moderation**: Prohibits users from posting inappropriate or spam content.         

## Technologies
Our platform leverages a variety of cutting-edge technologies:
- Frontend: React, Next.js, URQL (GraphQL Client), Firebase
- Backend: Node.js, Express.js, TypeORM, PostgreSQL, Redis (for session management and email queuing), GraphQL (Apollo Server)

## Technical Specifications
- **APIs**: Powered by OpenAPI spec-based REST APIs. Microservices architecture has been implemented.
- **Single Sign-On (SSO)**: Implemented using Firebase, supporting federated sign-up (e.g., Google).
- **Two-Factor Authentication**: Enabled through Google Authenticator or similar systems.
- **CI/CD Workflow**: Robust CI/CD practices for streamlined development and deployment.
- **Repository**: All code is managed in this repository.
- **Database Systems**: NoSQL database is used.
- **Caching System**: Employed caching mechanisms using Redis.
- **Queues/Streams**: Integration of queue for efficient data handling.
- **Observability Tools**: Comprehensive logs, metrics, and traces implementation using Splunk.
- **BI Dashboard**: A business intelligence dashboard showcasing key metrics and data.
- **Docker Deployment**: All application components are deployable via Docker.


## Installations 
- Node - (16.20.2)
- Postgres SQL
- Redis
  
## How to Run
- Detailed instructions on setting up and running the platform will be included here.

1. Run Docker Container for Redis
   - ```docker-compose up -d``` or Install and run redis on local.
     
2. Backend

- ```cd server```
- ```npm install``` or ```yarn```
- ```npm run watch``` or ```yarn watch```
- ```npm run dev``` or ```yarn dev```

3. Frontend

- ```cd web```
- ```npm install``` or ```yarn```
- ```npm run dev```
  
## Team

- **Omkar Nagarkar**
- **Sangram Jagtap**
- **Purvil Patel**
- **Atharva Jadhav**

## Future Scope of Improvement
- Enhanced User Experience: Implementing more interactive UI elements.
- Advanced Analytics: Integrating analytics for user engagement and post interactions.
- Increased Scalability: Further optimizing backend services for higher traffic.
- Mobile Responsiveness: Ensuring seamless experience across various devices.
  
### License
- This project is licensed under the MIT License.

Troubleshooting:     
- If you encounter any issues with the Docker setup, ensure Docker is running correctly on your system and you have the necessary permissions.     
- For issues related to Python dependencies, ensure you are using the correct version of Python and have all the required packages installed.    
