const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const socketHandler = require("./socket/socketHandler");
const connectDB = require('./config/db');
const router = require("./router/routes");

const cookieParser = require("cookie-parser")

const app = express();

// Middleware Initialization
app.use(cookieParser()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.VITE_PORT || 3001


// CORS setup for Express
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
}));


//CORS setup for socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});


//DataBase connection
connectDB();


//Routers and endpoint
app.use("/", router);


// Socket.io connection
socketHandler(io)


// Start the server
server.listen(PORT, () => {
    console.log("Server is running on port 3001");
});
