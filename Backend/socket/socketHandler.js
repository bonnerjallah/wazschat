const { addUser, removeUser, getUser, getUserInRoom, getAllRooms, getCurrentUsers } = require("../users");

function socketHandler(io) {
    io.on("connection", (socket) => {
        console.log("New client connected with ID:", socket.id);

        
        //Emit all rooms
        const emitRoomDetails = () => {
            const roomDetails = getAllRooms();
            socket.emit("allRoomsInUse", roomDetails);
        };

        emitRoomDetails();

        const getControllerUser = () => {
            const controllerUser = getUser(socket.id)
            console.log(controllerUser)
            io.emit("user", controllerUser)
        }

        getControllerUser()

        //Set Username
        socket.on("setUsername", (username) => {
            socket.name = username;
            console.log(`Username set for socket ${username}`)
            io.emit("allRoomsInUse", getAllRooms());
            io.emit("user", getUser(socket.id))
        })

        
        socket.on("join", ({ name, room }, callback) => {
            console.log(`User ${name} attempting to join room ${room}`);

            // Add user and handle any errors
            const { user, error } = addUser({ id: socket.id, name, room });

            if (error) {
                console.log(`Error: ${error}`);
                if (typeof callback === "function") callback(error);
                return;
            }

            // Join the room
            socket.join(user.room);

            // Welcome message to the user who just joined
            const roomInfo = user.room;
            let newRoomInfo;
            if (typeof roomInfo === "number") {
                newRoomInfo = roomInfo;
            } else if (typeof roomInfo === "string") {
                newRoomInfo = roomInfo.charAt(0).toUpperCase() + roomInfo.slice(1);
            }

            socket.emit("welcomeMessage", { user: "admin", user });

            // Notify other users in the room
            socket.broadcast.to(user.room).emit("message", { user: "admin", text: `${user.name} has joined the room.` });

            // Emit updated room details to everyone when a new room is joined
            io.emit("allRoomsInUse", getAllRooms());

            // Emit all online users
            io.emit("currentusers",getCurrentUsers())

            // All users in room
            const allUsersInRoom = getUserInRoom(user.room);
            io.to(user.room).emit("allUsers", allUsersInRoom.map(userElem => userElem.name));

            // Acknowledge the successful join
            if (typeof callback === "function") callback();
        });

        socket.on("sendMessage", (message, callback) => {
            const user = getUser(socket.id);
            if (user) {
                console.log(`Message from ${user.name} in room ${user.room}:`, message);
                io.to(user.room).emit("message", message);
                if (typeof callback === "function") callback();
            } else {
                console.log("Error: User not found");
            }
        });

        socket.on("disconnect", () => {
            console.log("User disconnected with ID:", socket.id);
            const user = removeUser(socket.id);
            if (user) {
                io.to(user.room).emit("message", { user: "admin", text: `${user.name} has left the room.` });
                const allUsersInRoom = getUserInRoom(user.room);
                console.log("Emitting updated allUsers to room:", user.room, allUsersInRoom.map(userElem => userElem.name));
                io.to(user.room).emit("allUsers", allUsersInRoom.map(userElem => userElem.name));
            }
        });
    });
}

module.exports = socketHandler;
