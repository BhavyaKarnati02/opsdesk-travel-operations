# OpsDesk – System Architecture

## 1. Architecture Overview

OpsDesk follows a web application architecture. The frontend provides the user interface, while Firebase services support authentication and data storage.

## 2. Technology Components

### Frontend – React
- Provides the dashboard and application screens.
- Handles user interactions.
- Displays cases, tickets, priorities, communications, and reports.

### Build Tool – Vite
- Supports frontend development and application builds.

### Authentication – Firebase Authentication
- Supports user registration and login.
- Manages authenticated user sessions.

### Database – Cloud Firestore
- Stores application data used by the system.
- Supports retrieval and updates of case-related information.

### Hosting – Vercel
- Hosts the deployed web application.
- Makes the application accessible through its live URL.

## 3. High-Level Architecture

```text
             Support User
                  |
                  v
          OpsDesk Web Interface
                  |
                  v
           React Frontend
                  |
          +-------+-------+
          |               |
          v               v
 Firebase Authentication  Application Data
                          |
                          v
                     Cloud Firestore

                           |
                           v
                     Vercel Hosting
```

## 4. Application Data Flow

1. A user opens the deployed OpsDesk application.
2. Firebase Authentication handles the sign-in process.
3. The frontend displays the dashboard after authentication.
4. Users interact with case and ticket management features.
5. Application data is stored and retrieved through Cloud Firestore.
6. The frontend displays the updated information to the user.

## 5. Main Functional Modules

- Authentication Module
- Dashboard Module
- Case Management Module
- Ticket Linking Module
- Priority and SLA Module
- Smart Routing Module
- Communication Module
- Reports Module

## 6. Deployment Architecture

The application is deployed using Vercel. The source code is maintained in GitHub, and Firebase provides authentication and database services.

**Live Application:**  
https://opsdesk-travel-operations.vercel.app/

**GitHub Repository:**  
https://github.com/BhavyaKarnati02/opsdesk-travel-operations

## 7. Architecture Summary

The architecture separates the user interface, authentication, data storage, and hosting responsibilities. This structure supports organized development and maintenance of the OpsDesk application.
