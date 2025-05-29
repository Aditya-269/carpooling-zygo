 # RideShare - Modern Carpooling Platform

A full-stack carpooling application that connects drivers and passengers for shared rides, built with React, Node.js, and MongoDB.

## 🌟 Features

- Real-time ride matching and booking
- Live chat between drivers and passengers
- Secure payment processing with PayPal
- Real-time notifications
- User authentication and profile management
- Ride history and tracking
- Responsive design for all devices
- Google Maps integration for location services

## 🏗️ Project Structure

```
carpooling-zygo/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── context/      # React context providers
│   │   ├── store/        # Redux store configuration
│   │   ├── services/     # API services
│   │   └── utils/        # Utility functions
│   └── public/           # Static files
│
└── server/                # Backend Node.js application
    ├── config/           # Configuration files
    ├── controllers/      # Route controllers
    ├── models/          # Database models
    ├── routes/          # API routes
    ├── utils/           # Utility functions
    └── index.js         # Application entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/carpooling-zygo.git
cd carpooling-zygo
```

2. Install dependencies:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables:

Create `.env` in server directory:
```
PORT=
MONGO=
ORIGIN=
JWT_SECRET=
ACCESS_TOKEN_EXPIRY=
NODE_ENV=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

Create `.env` in client directory:
```
VITE_REACT_API_URI=
VITE_GOOGLE_MAPS_API_KEY=
VITE_CLOUDINARY_PRESET=
VITE_CLOUDINARY_CLOUD_NAME=
REACT_APP_PAYPAL_CLIENT_ID=
```

4. Start the development servers:

```bash
# Start server (from server directory)
npm run dev

# Start client (from client directory)
npm run dev
```

## 🛠️ Technologies Used

### Frontend
- React 18
- Vite
- Tailwind CSS
- Radix UI Components
- Socket.IO Client
- React Router
- Redux
- React Hook Form
- Zod
- PayPal Integration

### Backend
- Node.js
- Express
- MongoDB
- Socket.IO
- JWT Authentication
- Mongoose
- Cookie Parser
- CORS

## 📡 API Endpoints

### Authentication
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- POST `/api/auth/logout` - User logout

### Users
- GET `/api/users` - Get user profile
- PUT `/api/users` - Update user profile
- GET `/api/users/:id` - Get specific user

### Rides
- GET `/api/rides` - Get available rides
- POST `/api/rides` - Create new ride
- PUT `/api/rides/:id` - Update ride
- DELETE `/api/rides/:id` - Cancel ride

### Chat
- GET `/api/chat` - Get chat history
- POST `/api/chat` - Send message
- GET `/api/chat/:rideId` - Get ride chat

### Payments
- POST `/api/payments` - Process payment
- GET `/api/payments/history` - Get payment history

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:
1. User registers/logs in
2. Server generates JWT
3. Token stored in HTTP-only cookie
4. Token required for protected routes

## 💬 Real-time Features

Socket.IO is used for real-time features:
- Live chat between users
- Real-time ride updates
- Instant notifications
- Ride status changes

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px

## 🔒 Security Features

- CORS configuration
- JWT authentication
- HTTP-only cookies
- Input validation
- Rate limiting
- Secure headers

## 🚀 Deployment

### Frontend (Vercel)
1. Build the application:
```bash
cd client
npm run build
```
2. Deploy to Vercel using their dashboard

### Backend (Render)
1. Set up environment variables
2. Configure MongoDB connection
3. Deploy using Render dashboard

## 📚 Additional Resources

- [React Documentation](https://reactjs.org/)
- [Express Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

