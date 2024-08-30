# PaySplit

## Overview

PaySplit is a modern web application designed to help users track and manage shared expenses with friends or groups. Whether you're planning a trip, sharing rent, or splitting bills, PaySplit makes it easy to keep track of who owes what and ensures everyone is on the same page.

## Status

**Currently Private:** The project is not publicly accessible at the moment. We are in the process of finalizing API keys and addressing some personal information concerns. Please check back later for updates or contact us for more information.

## Tech Stack

### Backend
- **Node.js**: JavaScript runtime for server-side logic.
- **Express.js**: Web framework for building the backend API.
- **MongoDB**: NoSQL database for storing user data, expenses, and balances.
- **Mongoose**: ODM for MongoDB to facilitate data modeling and validation.

### Frontend
- **React.js**: Frontend library for building user interfaces.
- **Redux**: State management for handling complex application state.

### Authentication
- **Firebase Authentication**: Service for user authentication and management.

### Containerization
- **Docker**: Containerization for consistent development and deployment.

### Development Tools
- **Postman**: API testing tool for validating and debugging endpoints.
- **Webpack**: Module bundler for frontend assets.
- **Babel**: JavaScript compiler for using modern JavaScript features.
- **Jest**: Testing framework for ensuring code reliability.

## Project Structure

project-root/
├── backend/
│   ├── src/
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # Express routes
│   │   ├── controllers/     # Route handlers
│   │   ├── config/          # Configuration files (db, auth, etc.)
│   │   └── app.js           # Main application file
│   ├── Dockerfile           # Dockerfile for backend
│   └── docker-compose.yml   # Docker Compose file
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── redux/           # Redux setup
│   │   ├── services/        # API service files
│   │   └── App.js           # Main React app file
│   ├── Dockerfile           # Dockerfile for frontend
│   └── public/              # Public assets
└── README.md                # Project documentation




## Features

- **User Authentication**: Secure sign-up and login using Firebase Authentication.
- **Expense Tracking**: Add, edit, and view shared expenses.
- **Group Management**: Create and manage groups for splitting expenses.
- **Real-Time Updates**: Automatically update expense data for all users in a group.

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) (version 14.x or later)
- [Docker](https://www.docker.com/products/docker-desktop) (optional, for containerization)

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/paysplit.git
   cd paysplit/backend
Install dependencies:

bash
Copy code
npm install
Configure environment variables:

Create a .env file in the backend directory.
Add your MongoDB connection string and Firebase configuration.
Start the backend server:

bash
Copy code
npm start
Frontend Setup
Navigate to the frontend directory:

bash
Copy code
cd ../frontend
Install dependencies:

bash
Copy code
npm install
Configure environment variables:

Create a .env file in the frontend directory.
Add Firebase configuration and API endpoints.
Start the development server:

bash
Copy code
npm start
Docker Setup (Optional)
Build and start containers:

bash
Copy code
docker-compose up --build
Access the app at http://localhost:3000.

Testing
Backend: Use Postman to test API endpoints.
Frontend: Run unit tests with Jest:
bash
Copy code
cd ../frontend
npm test
Contributing
We welcome contributions to PaySplit! Please follow these guidelines:

Fork the repository.
Create a feature branch.
Make your changes and add tests if applicable.
Submit a pull request with a clear description of your changes.
Contact
For any questions or inquiries, please contact us at [your-email@example.com].

License
This project is licensed under the MIT License. See the LICENSE file for details.
