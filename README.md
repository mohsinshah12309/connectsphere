<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:5F4DE0,50:7C6CFF,100:2EE6C9&height=220&section=header&text=ConnectSphere&fontSize=60&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=A%20full-stack%20MERN%20social%20platform%20with%20real-time%20notifications&descAlignY=58&descSize=18" width="100%"/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=20&duration=3000&pause=1000&color=7C6CFF&center=true&vCenter=true&width=600&lines=Connect.+Share.+Follow.+In+real-time.;Built+with+the+MERN+stack+%2B+Socket.io;Glassmorphism+UI+%C2%B7+JWT+Auth+%C2%B7+Live+Notifications" alt="Typing SVG" />

<br/>

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

</div>

---

## 📖 About

**ConnectSphere** is a full-stack social media platform built as a capstone MERN project. It extends a REST API into a complete, production-style social app — JWT authentication, image uploads, a follow/feed system, live Socket.io notifications, and a polished React frontend with a glassmorphism, dark space-themed UI.

No UI component libraries were used — every surface, animation, and interaction (glass cards, the particle/planet background, the like-button pop, the notification bell) is hand-built in plain CSS Modules.

---

## ✨ Features

| Category | What it does |
|---|---|
| 🔐 **Authentication** | JWT-based register/login, bcrypt password hashing, protected routes enforced server-side |
| 👤 **Profiles** | Avatar & cover photo upload, bio editing, follower/following lists in a modal |
| 📝 **Posts** | Create/edit/delete with optional image upload, tags, ownership enforced server-side |
| 🧭 **Feed vs. Explore** | Feed shows only followed users + own posts; Explore shows everyone, paginated |
| ❤️ **Likes & Comments** | Optimistic UI updates, ownership-aware comment deletion (author or post owner) |
| 🔔 **Real-time Notifications** | Socket.io pushes live like/comment/follow events; persisted history via REST |
| 🔍 **Search** | Debounced live user search by name |
| 🎨 **UI** | Glassmorphism throughout, animated space background (parallax starfield + drifting planets), fully responsive |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React (Vite) | SPA framework |
| | React Router | Client-side routing |
| | Context API | Global auth & socket state |
| | Axios | HTTP client with JWT interceptor |
| | Socket.io-client | Real-time notification stream |
| | CSS Modules | Scoped styling — no UI libraries |
| **Backend** | Node.js + Express | REST API server |
| | MongoDB + Mongoose | Database & schema modeling |
| | JWT (jsonwebtoken) | Stateless authentication |
| | bcryptjs | Password hashing |
| | Multer + Cloudinary | Image upload & hosting |
| | Socket.io | Real-time server-to-client events |
| **Dev Tools** | Nodemon | Backend auto-restart |
| | Concurrently | Run client + server with one command |
| | Postman | API testing & collection export |

---

## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph Client["React Client (Vite)"]
        A[Pages] --> B[Components]
        B --> C[Axios Instance]
        B --> D[Socket.io Client]
    end

    subgraph Server["Express Server"]
        E[Routes] --> F[Controllers]
        F --> G[Mongoose Models]
        F --> H[Socket.io Server]
    end

    subgraph External["External Services"]
        I[(MongoDB Atlas)]
        J[Cloudinary]
    end

    C -->|REST / JWT| E
    D <-->|WebSocket| H
    G --> I
    F --> J
```

---

## 📂 Project Structure

```
connectsphere/
├── server/
│   ├── config/          # DB + Cloudinary config
│   ├── models/          # User, Post, Comment, Notification
│   ├── routes/          # Express route definitions
│   ├── controllers/     # Business logic
│   ├── middleware/      # auth, upload, error handling
│   ├── socket/          # Socket.io notification handler
│   └── server.js        # Entry point
└── client/
    └── src/
        ├── api/          # Axios instance
        ├── context/      # AuthContext, SocketContext
        ├── hooks/        # useAuth, useNotifications
        ├── components/   # Navbar, PostCard, FollowButton, etc.
        └── pages/        # Login, Feed, Explore, Profile, PostDetail
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (LTS)
- MongoDB Atlas account
- Cloudinary account

### 1. Clone the repo
```bash
git clone https://github.com/mohsinshah12309/connectsphere.git
cd connectsphere
```

### 2. Install dependencies
```bash
# Root (for running both together)
npm install

# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 3. Configure environment variables
Copy the example files and fill in your own values:
```bash
cp server/.env.example server/.env
```
Then set `MONGODB_URI`, `JWT_SECRET`, and your `CLOUDINARY_*` keys in `server/.env`.

### 4. Run the app
```bash
# From the project root — runs client + server together
npm run dev
```
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

---

## 📡 API Overview

| Resource | Base Route |
|---|---|
| Auth | `/api/auth` |
| Users | `/api/users` |
| Posts | `/api/posts` |
| Comments | `/api/comments` |
| Notifications | `/api/notifications` |

All responses follow a consistent shape:
```json
{ "success": true, "message": "...", "data": { } }
```

A full Postman collection is included in the repo for testing every endpoint.

---

## 📸 Screenshots

> _Add screenshots of the Feed, Profile, and Explore pages here once the app is deployed — drag images into this section on GitHub and they'll auto-embed._

<!--
![Feed](./docs/screenshots/feed.png)
![Profile](./docs/screenshots/profile.png)
-->

---

## 👤 Author

**Muhammad Mohsin Ali Shah**
BS Software Engineering, FAST-NUCES (CFD Campus)

- GitHub: [@mohsinshah12309](https://github.com/mohsinshah12309)
- LinkedIn: [mohsin-alishah-96b0302b6](https://linkedin.com/in/mohsin-alishah-96b0302b6)

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:2EE6C9,50:7C6CFF,100:5F4DE0&height=100&section=footer" width="100%"/>

</div>
