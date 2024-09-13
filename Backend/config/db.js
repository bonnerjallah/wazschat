const mongoose = require("mongoose");

const connectDB = async () => {
    try {

        await mongoose.connect(process.env.VITE_DBURI, {dbName: "wazschat"})

        console.log("Mongodb connected")
        
    } catch (err) {
        console.error("MongoDB connection error", err)
    }
}

module.exports = connectDB