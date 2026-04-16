# 🎉 Event Management Dashboard

A beautiful, modern full-stack event management application with real-time updates, built with React, Node.js, Express, MongoDB, and Socket.IO.

## ✨ Features

- **🔐 Authentication**: Secure JWT-based login/signup for users and organizers
- **👥 Role-based Access**: Different dashboards for users and event organizers
- **📅 Event Management**: Create, view, and manage events with full CRUD operations
- **📝 Event Registration**: Users can register for events with real-time updates
- **🔄 Real-time Updates**: Live registration counts using Socket.IO
- **📱 Responsive Design**: Modern, mobile-friendly UI with glassmorphism effects
- **🎨 Beautiful UI**: Gradient backgrounds, smooth animations, and intuitive design

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router, Axios, Socket.IO Client
- **Backend**: Node.js, Express.js, Socket.IO Server
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Custom CSS with modern design patterns

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret_here
PORT=5000
```

Start the backend:
```bash
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 🌐 App URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📱 User Guide

### For Users:
1. **Sign Up/Login**: Create an account or log in
2. **Browse Events**: View all available events on the home page
3. **Event Details**: Click on event titles to see full details
4. **Register**: Click "Register Now" to join events
5. **Dashboard**: View your registered events in the dashboard

### For Organizers:
1. **Sign Up**: Choose "Organizer" role during signup
2. **Create Events**: Use the dashboard to create new events
3. **Manage Events**: View all your events and registration counts
4. **Real-time Updates**: See live registration updates

## 🎨 UI Features

- **Glassmorphism Design**: Modern frosted glass effects
- **Gradient Backgrounds**: Beautiful color transitions
- **Smooth Animations**: Hover effects and transitions
- **Responsive Layout**: Works on all device sizes
- **Loading States**: User-friendly loading indicators
- **Error Handling**: Clear error messages and validation

## 📁 Project Structure

```
event-dashboard/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Event.js
│   │   ├── Registration.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── events.js
│   │   ├── registrations.js
│   │   └── notifications.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   ├── Dashboard.js
│   │   │   └── EventDetails.js
│   │   ├── api.js
│   │   ├── socket.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event (organizers only)
- `PUT /api/events/:id` - Update event (organizers only)
- `DELETE /api/events/:id` - Delete event (organizers only)
- `POST /api/events/:id/register` - Register for event

### Registrations
- `GET /api/registrations/mine` - Get user's registrations

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark notification as read

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Protected routes with middleware
- Input validation and sanitization
- CORS configuration for frontend-backend communication

## 🚀 Deployment

### Backend Deployment
1. Set environment variables on your hosting platform
2. Deploy to services like Heroku, Railway, or Vercel
3. Ensure MongoDB connection string is properly configured

### Frontend Deployment
1. Build the production version: `npm run build`
2. Deploy the `build` folder to services like Netlify, Vercel, or GitHub Pages
3. Update API base URL in production if needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with ❤️ using modern web technologies**
