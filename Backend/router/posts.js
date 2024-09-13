const AppUsers = require("../model/appusermodel")
const path = require("path")
const fs = require ("fs")


const updateUserData =  async (req, res) => {
    console.log("update data", req.body)
    console.log("file data", req.file)
    try {
        const {userId, username, pwd, email, bio} = req.body
        const profilePic = req.file ? path.basename(req.file.path) : ""


        user = await AppUsers.findById(userId)

        if(!user) {
            return res.status(404).json({message:"User Not found"})
        }

        if(username !== "") user.username = username;
        if(pwd !== "") user.pwd = pwd;
        if(email !== "") user.email = email;
        if(bio !== "") user.bio = bio

        if (profilePic) {
            // Handle profile picture deletion if user has an existing one
            if (user.profilePic && user.profilePic !== "") {
                const previousPic = path.join(__dirname, "../../profilePics", user.profilePic);
                
                if (fs.existsSync(previousPic)) {
                    try {
                        fs.unlink(previousPic, (err) => {
                            if (err) {
                                console.log("Error deleting previous profile picture", err);
                            } else {
                                console.log("Previous profile pic deleted successfully");
                            }
                        });
                    } catch (error) {
                        console.error("Error deleting previous profile pic", error);
                    }
                } else {
                    console.log("Previous profile pic not found, skipping deletion.");
                }
            }
            
            // Assign new profile picture to the user
            user.profilePic = profilePic;
        }
        
        
        console.log("user", user)

        await user.save()

        return res.status(200).json({message: "User data updated successfully"})

    } catch (error) {
        console.log("Error updating user data", error)
        return res.status(500).json({message:"Internal server issue"})
    }
}

module.exports = {updateUserData}