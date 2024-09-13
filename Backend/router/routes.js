const express = require("express");
const multer = require("multer")
const path = require("path")

const router = express.Router();


router.use(express.json())
router.use(express.urlencoded({extended:true}))

const {login, register, refreshToken, getAppusers, validateAccessToken, logOut } = require("../controller/controllers")
const {getActiveUsers} = require("./gets")
const {updateUserData} = require("./posts")

router.use("/profilePics", express.static(path.join(__dirname, "../../profilePics")))



const storage = multer.diskStorage({
    destination:(req, file, cb) => {
        cb(null, path.join(__dirname, "../../profilePics"))
    },
    filename:(req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }

})

const upload = multer({
    storage: storage,
    limits: {fileSize:5000000},
    fileFilter: (req, file, cb) => {
        const fileType = /jpeg|jpg|png|jfif|webp/i;
        const mimeType = fileType.test(file.mimetype)
        const extname = fileType.test(path.extname(file.originalname))

        if(mimeType && extname ) {
            return cb(null, true)
        }

        cb(new Error("Give proper file format to upload"))
    }
})


router.post("/login", login);
router.post("/register", register);
router.post("/refresh_token", refreshToken)
router.get("/getappuser", validateAccessToken, getAppusers)
router.post("/logout", logOut)
router.get("/getActiveUsers", getActiveUsers)
router.post("/updateUserData", upload.single("profilePic"), updateUserData)



module.exports = router;
