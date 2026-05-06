# AgroSmart - Smart Irrigation System for Hilly Regions

![AgroSmart](https://img.shields.io/badge/AgroSmart-Smart%20Irrigation-green)
![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb)

AgroSmart is a comprehensive smart irrigation platform designed specifically for farmers in hilly regions. It helps optimize water usage, automate irrigation decisions, and improve crop yields through real-time monitoring and intelligent control.

## 🌟 Features

### For Farmers
- **Real-time Monitoring**: Track soil moisture, temperature, humidity, and water tank levels
- **Smart Irrigation Control**: Manual and automated irrigation with intelligent recommendations
- **SMS Alerts**: Receive instant notifications for critical events (low moisture, low water, etc.)
- **Crop Database**: Access detailed information about crops suitable for hilly regions
- **Analytics Dashboard**: Visualize historical data and irrigation patterns
- **Mobile Responsive**: Access from any device - smartphone, tablet, or desktop

### Technical Features
- **Real-time Updates**: Socket.io for live data synchronization
- **RESTful API**: Well-structured backend with comprehensive endpoints
- **Intelligent Logic**: Automated irrigation decisions based on crop requirements
- **Data Logging**: Complete history of sensor readings and irrigation events
- **Secure Authentication**: JWT-based user authentication
- **Scalable Architecture**: MongoDB for flexible data storage

## 🏗️ Architecture

```
AgroSmart/
├── backend/          # Node.js + Express API
│   ├── models/       # MongoDB schemas
│   ├── routes/       # API endpoints
│   ├── controllers/  # Business logic
│   ├── services/     # External services (SMS, etc.)
│   └── config/       # Configuration files
│
└── frontend/         # React + Vite application
    ├── src/
    │   ├── pages/    # Main application pages
    │   ├── components/ # Reusable UI components
    │   ├── services/ # API and Socket.io clients
    │   ├── context/  # React context providers
    │   └── styles/   # Global styles
    └── public/       # Static assets
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB** v5 or higher
- **npm** or **yarn**

### Installation

#### 1. Clone the repository

```bash
cd AgroSmartHill
```

#### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file (already created with defaults):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/agrosmart
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
FRONTEND_URL=http://localhost:5173
```

#### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

### 🗄️ Database Setup

1. **Start MongoDB**:
   ```bash
   # Windows (if MongoDB is installed as a service)
   net start MongoDB
   
   # Or run mongod directly
   mongod
   ```

2. **Seed the Crop Database**:
   ```bash
   cd backend
   node seedCrops.js
   ```

   This will populate the database with 8 crops suitable for hilly regions (Tomato, Potato, Cabbage, Maize, Ginger, Strawberry, Beans, Cardamom).

### ▶️ Running the Application

#### Start Backend Server

```bash
cd backend
npm run dev
```

The API will be available at `http://localhost:5000`

#### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`

## 📱 Usage

### First Time Setup

1. **Register a new account**:
   - Open `http://localhost:5173`
   - Click on "Register" tab
   - Fill in your details (name, email, password, phone, farm details)
   - Click "Register"

2. **Login**:
   - Use your email and password to login
   - You'll be redirected to the dashboard

### Dashboard Features

- **Sensor Cards**: View real-time soil moisture, temperature, humidity, and water tank levels
- **Moisture Gauge**: Visual representation of soil moisture status
- **Irrigation Control**: Start/stop irrigation manually
- **Alerts**: View recent system alerts and notifications

### Irrigation Control

- Navigate to "Irrigation Control" from the sidebar
- View irrigation statistics (total irrigations, water used, etc.)
- See irrigation history with detailed logs
- Manual control with confirmation dialogs

### Crop Database

- Browse crops suitable for hilly regions
- Search and filter by category
- View detailed water requirements and growing tips
- Learn about optimal environmental conditions

### Analytics

- View historical trends for soil moisture, temperature, and humidity
- Analyze water tank levels over time
- Track irrigation patterns (manual vs automatic)
- Select different time ranges (7, 14, or 30 days)

### Settings

- Update profile information
- Configure farm details
- Set alert preferences (SMS/Email)
- Customize alert thresholds




## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Twilio** - SMS notifications
- **bcryptjs** - Password hashing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Material-UI** - Component library
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Socket.io Client** - Real-time updates
- **React Router** - Navigation

## 📦 Production Build

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

## 👥 Support

For support, email your-email@example.com or create an issue in the repository.

## 🙏 Acknowledgments

- Designed for farmers in hilly regions facing water scarcity challenges
- Built with modern web technologies for reliability and scalability
- Focused on accessibility and ease of use

---

**Made with ❤️ for sustainable agriculture**
