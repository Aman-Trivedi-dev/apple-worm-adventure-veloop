# 🍎 Apple Worm Adventure

**Apple Worm Adventure** is a full-stack browser-based puzzle game where players control a worm, collect apples, solve levels, and progress through increasingly challenging puzzles.

## 🚀 Project Overview

The project combines an interactive gaming experience with a backend-powered reward system. It includes player accounts, game progress, a virtual coin wallet, boosters, and rewarded-ad functionality.

## ✨ Features

- Interactive worm puzzle gameplay.
- Multiple game levels and level progression.
- Keyboard and touch controls.
- Score and move tracking.
- Game restart and hint functionality.
- Player registration and login.
- Wallet and coin management.
- Booster and rewards shop.
- Rewarded-ad mock integration.
- Server-side reward validation.
- Duplicate reward prevention.
- Responsive game interface.

## 🛠️ Technologies Used

### Frontend
- React.js
- Vite
- JavaScript
- CSS

### Backend
- Node.js
- Express.js
- REST APIs
- JWT Authentication

### Database
- MongoDB
- Mongoose

### Development Tools
- Git
- GitHub
- VS Code

## 📁 Project Structure

```text
apple-worm-adventure/
│
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── game/
│       ├── hooks/
│       ├── services/
│       └── utils/
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   └── server.js
│
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Aman-Trivedi-dev/apple-worm-adventure-veloop.git
```

### 2. Open the project

```bash
cd apple-worm-adventure-veloop
```

### 3. Install frontend dependencies

```bash
cd client
npm install
```

### 4. Install backend dependencies

Open another terminal:

```bash
cd server
npm install
```

### 5. Configure environment variables

Create a `.env` file inside the `server` directory.

Add the required configuration:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
GAME_NAME=Apple Worm Adventure
```

Create a `.env` file inside the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

**Important:** Replace the example values with your actual configuration. Never upload `.env` files or private credentials to GitHub.

### 6. Run the application

Start the backend using the development script configured in `server/package.json`.

Start the frontend using:

```bash
cd client
npm run dev
```

Open the local URL displayed by Vite in your browser.

## 🎮 Reward System

The game includes a virtual wallet and reward-related functionality.

Current reward functionality includes:

- Coin rewards for completed ad sessions.
- Booster purchases.
- Wallet balance management.
- Wallet transaction history.
- Duplicate reward protection.
- Cooldown and daily reward limits.

**Note:** The current ad reward integration uses a mock provider for development and testing. A real rewarded-ad provider and its server-side verification must be configured before production use.

## 🔐 Security

- JWT-based authentication.
- Protected backend routes.
- Server-side wallet operations.
- Reward validation.
- Duplicate transaction protection.
- Environment-based configuration.

## 🌐 Deployment

Deployment is planned using:

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |

**Live Demo:** Coming soon.

## 👨‍💻 Developer

**Aman Trivedi**

B.Tech – Computer Science and Engineering

GitHub: [Aman-Trivedi-dev](https://github.com/Aman-Trivedi-dev)

## 📌 Project Status

The application is under active development. Additional features, testing, and production deployment are in progress.

---

⭐ If you like this project, consider giving the repository a star!

