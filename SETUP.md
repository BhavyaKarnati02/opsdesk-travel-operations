# OpsDesk – Installation and Setup Guide

## 1. Prerequisites

Before running OpsDesk locally, install:

- Node.js (LTS version recommended)
- npm (included with Node.js)
- Git
- Visual Studio Code or another code editor
- A Firebase project with the required services configured

## 2. Clone the Repository

Open a terminal and run:

```bash
git clone https://github.com/BhavyaKarnati02/opsdesk-travel-operations.git
```

Navigate into the project folder:

```bash
cd opsdesk-travel-operations
```

## 3. Install Dependencies

Run:

```bash
npm install
```

This installs the dependencies specified in the project configuration.

## 4. Configure Firebase

OpsDesk uses Firebase services for authentication and data storage.

1. Open the Firebase Console.
2. Select the Firebase project configured for OpsDesk.
3. Check that Firebase Authentication and Cloud Firestore are enabled.
4. Verify that the application's Firebase configuration is available to the frontend.
5. If environment variables are required, configure them using the variable names expected by the project source code.

**Important:** Never commit private credentials, service-account files, or secret keys to GitHub.

## 5. Run the Application Locally

Start the development server:

```bash
npm run dev
```

Vite will display a local development URL in the terminal, usually:

```text
http://localhost:5173
```

Open that URL in your browser.

## 6. Build for Production

To create a production build, run:

```bash
npm run build
```

To preview the production build locally, run:

```bash
npm run preview
```

## 7. Live Application

https://opsdesk-travel-operations.vercel.app/

## 8. Source Code

https://github.com/BhavyaKarnati02/opsdesk-travel-operations

## 9. Troubleshooting

- If dependencies fail to install, check your Node.js and npm versions.
- If Firebase authentication fails, verify the Firebase configuration and authorized domains.
- If the application does not start, check the terminal for errors.
- If the production build fails, inspect the build error messages and resolve missing dependencies or configuration issues.

## 10. Setup Summary

After installing the prerequisites, cloning the repository, configuring Firebase, and installing dependencies, developers can run OpsDesk locally using the Vite development server.
