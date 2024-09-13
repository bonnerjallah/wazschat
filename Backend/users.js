const users = [];

const addUser = ({ id, name, room }) => {

    if (!name || !room) {
        console.log("Error: Name and room are required");
        return { error: "Name and room required" };
    }

    const trimmedName = name.trim().toLowerCase();
    const trimmedRoom = room.trim().toLowerCase();

    removeUser(id);

    const existingUser = users.find((user) => user.room === room && user.name === name);

    if (existingUser) {
        console.log(`Error: Username ${name} is already taken in room ${room}`);
        return { error: "Username is taken" };
    }

    const newUser = { id, name: trimmedName, room: trimmedRoom };
    users.push(newUser);

    // console.log(`User added successfully:`, newUser);
    // console.log("Current users:", users);

    return { user: newUser};
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0]; 
    }
    return null; 
}

const getUser = (id) => users.find((user) => user.id === id);

const getUserInRoom = (room) => users.filter((user) => user.room === room);

const getAllRooms = () => {
    const roomMap = new Map();

    users.forEach(user => {
        if (user.room) {
            // If the user's room is an array (user in multiple rooms)
            if (Array.isArray(user.room)) {
                user.room.forEach(roomElem => {
                    if (!roomMap.has(roomElem)) {
                        roomMap.set(roomElem, []); 
                    }
                    roomMap.get(roomElem).push(user); 
                });
            } else {
                // Single room case
                if (!roomMap.has(user.room)) {
                    roomMap.set(user.room, []);
                }
                roomMap.get(user.room).push(user);
            }
        }
    });

    // Convert the Map to an array of objects with room and users
    const roomDetails = Array.from(roomMap.entries()).map(([room, users]) => ({
        room,
        users
    }));
    // console.log("roomdetails", roomDetails)

    return roomDetails;
};

const getCurrentUsers = () => {
    return users.map(elem => elem)
}


module.exports = { addUser, removeUser, getUser, getUserInRoom, getAllRooms, getCurrentUsers };
