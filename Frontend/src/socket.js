// socket.js
import { io } from "socket.io-client";
const frontendURL = import.meta.env.VITE_REACT_APP_FRONTEND_URL


const socket = io(frontendURL, {
    transports: ["websocket"],
    reconnectionAttempts: 5
});

console.log(`WebSocket connection attempt to: ${frontendURL}`);


export default socket;
