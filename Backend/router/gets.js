const AppUsers = require("../model/appusermodel")

app.get("/", (req, res) => {
    res.send("Welcome to the Wazschat Backend");
});


const getActiveUsers = async (req, res) => {
    try {
        const result = await AppUsers.find().select("_id username profilePic").exec()

        return res.json(result)
        
    } catch (error) {
        console.log("Error fetching users", error)
        return res.status(500).json({message: "Internal server issue"})
    }
}

module.exports = {getActiveUsers}