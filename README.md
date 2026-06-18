# Damage Report System (AF System)

A web-based management system for tracking damage reports and managing user roles. The system is designed with a hybrid storage approach, supporting both MongoDB and a local JSON fallback for environments without a database.

## Features

- **Role Management**: Create and manage user roles with specific permissions (User, Process, View Only).
- **Damage Reporting**: Track reports with details such as branch, product name, problem description, and status.
- **Hybrid Storage**: Automatically falls back to local `reports.json` and `roles.json` if MongoDB is unavailable.
- **Deployment Ready**: Configured for deployment on Render via `render.yaml`.
- **Responsive Dashboard**: Web interface for interacting with reports and roles.

## Project Structure

```
C:\ACC_CODE\
├── damage-report\          # Main application directory
│   ├── public\             # Frontend HTML/CSS/JS files
│   ├── server.js           # Express server with MongoDB/JSON logic
│   ├── package.json        # Node.js dependencies and scripts
│   ├── reports.json        # Local storage for reports (fallback)
│   └── roles.json          # Local storage for roles (fallback)
├── render.yaml             # Render deployment configuration
└── README.md               # Project documentation
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Optional, system will use JSON fallback if not found)

### Installation

1. Navigate to the `damage-report` directory:
   ```bash
   cd damage-report
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

1. Start the server:
   ```bash
   npm start
   ```
2. Open your browser and navigate to `http://localhost:3000`.

## Configuration

- **PORT**: Defaults to `3000`. Can be set via environment variable.
- **MONGODB_URI**: Connection string for MongoDB. Defaults to `mongodb://localhost:27017/damage-report`.

## Deployment

This project is configured for [Render](https://render.com/). The `render.yaml` file in the root directory handles the service configuration automatically.
