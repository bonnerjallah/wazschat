import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";
import OtherRooms from "./OtherRooms";
import { useAuth } from "./AuthContex";
import axios from "axios"
import Cookies from "js-cookie"

const frontendURL = import.meta.env.VITE_REACT_APP_FRONTEND_URL

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faGear } from "@fortawesome/free-solid-svg-icons";

import joinstyle from "../styles/joinstyle.module.css";


const Join = () => {

    const {user, logOut} = useAuth()

    const dialogRef = useRef(null)
    const bioRef = useRef(null)

    const [userData, setUserData] = useState({
        user:{
            username: ""
        }
    });
    const [name, setName] = useState('')
    const [room, setRoom] = useState('');
    const [profilePicUrl, setProfilePicUrl] = useState('')
    const [userUpdateInfoData, setUserUpdateInfoData] = useState({
        username: "",
        pwd: "",
        email: "",
        bio: ""
    })

    const navigate = useNavigate(); 

    axios.defaults.withCredentials = true
    useEffect(() => {
        const fetchUserData = async () => {
            if(!user) return;

            try {
                const token = Cookies.get("token")
                const response = await axios.get(`${frontendURL}/getappuser`, {
                    headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`}
                })

                if(response.data.valid){
                    setUserData(response.data)
                    setName(response.data.user.username)
                }
                
            } catch (error) {
                console.error("Error fetching user data", error)
            }
        }

        fetchUserData()
    }, [user])   

    useEffect(() => {
        const initializeSocket = async () => {
            await new Promise((resolve) => {
                if(socket.connected) {
                    resolve()
                } else {
                    socket.once("connect", resolve)
                }
            })

            // console.log("socket connected on join room", socket.connected)

            socket.on("connect_error", (err) => {
                console.error("Socket connection error:", err);
            });
        }

        initializeSocket()

        // Clean up the socket connection on unmount
        return () => {
            socket.off("connect");
            socket.off("connect_error");
        };
    }, []);

    const handleLogOut = async () => {
        try {
            const response = await axios.post(`${frontendURL}/logout`, {}, {
                withCredentials: true
            })

            if(response.status === 200) {
                socket.disconnect()
                console.log("response data", response.data)
            }

        } catch (error) {
            console.error("Error loging out user", error)
        }

        logOut()

        navigate("/")

    }

    const handleClick = (e) => {
        e.preventDefault(); 

        if (name !== "" && room !== "") {
            socket.emit("join", { name, room }, (error) => {
                if (error) {
                    console.error("Error joining room:", error);
                    alert(error); 
                } else {
                    console.log("Joined the room successfully");
                    navigate(`/Chat?name=${name}&room=${room}`);
                }
            });            

        } else {
            alert("Please enter both name and room");
        }
    };

    const handleProfilePic = (e) => {
        setProfilePicUrl(e.target.files[0])
    }

    const handleUserInputUpdateData = (e) => {
        const {name, value} = e.target
        setUserUpdateInfoData((prev) => ({...prev, [name]: value}))
    }

    const handleChangedDataSubmit = async (e) => {
        e.preventDefault()

        const formData = new FormData()

        const userId = userData.user._id

        formData.append("userId", userId)
        formData.append("username", userUpdateInfoData.username)
        formData.append("email", userUpdateInfoData.email)
        formData.append("pwd", userUpdateInfoData.pwd)
        formData.append("bio", userUpdateInfoData.bio)

        if(profilePicUrl){
            formData.append("profilePic", profilePicUrl, profilePicUrl.name)
        }

        try {
            const response = await axios.post(`${frontendURL}/updateUserData`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            
            if(response.status === 200) {
                console.log("User data upated successfully")
            }

            setUserUpdateInfoData({
                username:"",
                email:"",
                pwd:"",
                bio:""
            })

            bioRef.current.close()

            
        } catch (error) {
            console.log("Error submiting user change data", error)
        }
    }


    return (
        <div className={joinstyle.mainContainer}>

            <div className={joinstyle.usernameWrapper}>
                <div className={joinstyle.profilePicImageWrapper}>
                    {userData && userData.user && userData.user.profilePic ? (
                        <img
                            src={`${frontendURL}/profilePics/${userData.user.profilePic}`}
                            alt={`${userData.user.username.charAt(0).toUpperCase()}`}
                        />
                    ) : (
                        <div className={joinstyle.noProfilePic}>{`${userData.user.username.charAt(0).toUpperCase()}`}</div>
                    )}
                </div>
                <p>{userData ? userData.user.username : 'Unknown User'}</p>
            </div>

            <div className={joinstyle.logoutAndSettingWrapper}>
                <button onClick={handleLogOut}>
                    LogOut
                </button>
                <FontAwesomeIcon icon={faGear} className={joinstyle.gearIcon}  onClick={() => bioRef.current?.showModal()}/>
            </div>

            <dialog ref={bioRef} className={joinstyle.bioModal}>
                <FontAwesomeIcon icon={faXmark} className={joinstyle.xmarkIcon} onClick={() => bioRef.current?.close()}/>
                <form onSubmit={handleChangedDataSubmit} encType="multipart/form-data" method="POST">
                <label htmlFor="UserName">
                        Change UserName:
                        <input type="text" name="username" id="UserName" value={userUpdateInfoData.username}  onChange={handleUserInputUpdateData}/>
                    </label>

                    <label htmlFor="Password">
                        Change Password:
                        <input type="password" name="pwd" id="Password" value={userUpdateInfoData.pwd}  onChange={handleUserInputUpdateData}/>
                    </label>

                    <label htmlFor="Email">
                        Change Email:
                        <input type="email" name="email" id="Email" value={userUpdateInfoData.email} onChange={handleUserInputUpdateData} />
                    </label>

                    <label htmlFor="ProfilePic" className={joinstyle.customPicUploadButton}>
                        Change Profile Pic:
                        <input type="file" name="profilePic" id="ProfilePic" accept="image/*" onChange={handleProfilePic} />
                    </label>

                    <label htmlFor="Bio">
                        Bio:
                        <textarea name="bio" id="Bio" value={userUpdateInfoData.bio} onChange={handleUserInputUpdateData}></textarea>
                    </label>

                    <button type="submit">Submit</button>
                </form>
            </dialog>

            <div className={joinstyle.headerWrapper}>
                <h1>Waz's Chat</h1>

                <button onClick={() => dialogRef.current?.showModal()}>
                    Create A Room
                </button>
            </div>

            <div className={joinstyle.otherRoomWrapper}>
                <OtherRooms />
            </div>

            <dialog ref={dialogRef} className={joinstyle.joinModalWrapper} >
                <FontAwesomeIcon icon={faXmark} className={joinstyle.xmarkIcon} onClick={() => dialogRef.current?.close()}/>
                <div className={joinstyle.formContainer}>
                    <h1>Join Room</h1>
                    <div className={joinstyle.InputWrapper}>
                        <input
                            placeholder="Name"
                            className={joinstyle.joinInput}
                            type="text"
                            value={name || ""}
                            readOnly
                        />
                    
                        <input
                            placeholder="Room"
                            className={joinstyle.joinInput}
                            type="text"
                            onChange={(event) => setRoom(event.target.value)}
                        />
                    </div>
                    <button className={joinstyle.bttn} onClick={handleClick}>
                        Join room
                    </button>
                </div>
            </dialog>
            
        </div>
    );
};

export default Join;
