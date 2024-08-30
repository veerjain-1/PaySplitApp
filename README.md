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





## Features

- **User Authentication**: Secure sign-up and login using Firebase Authentication.
- **Expense Tracking**: Add, edit, and view shared expenses.
- **Group Management**: Create and manage groups for splitting expenses.
- **Real-Time Updates**: Automatically update expense data for all users in a group.







## Contributing

We welcome contributions to PaySplit! Please follow these guidelines:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes and add tests if applicable.
4. Submit a pull request with a clear description of your changes.



For any questions or inquiries, please contact me at jainveer321@gmail.com




## Project Structure

```plaintext

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


