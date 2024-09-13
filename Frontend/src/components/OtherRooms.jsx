import { useEffect, useState, useRef } from "react"
import { useAuth } from "./AuthContex";
import axios from "axios"
import Cookies from "js-cookie"
import socket from "../socket"

import {useNavigate} from "react-router-dom"

import otherroomstyle from "../styles/otherroomstyle.module.css"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const OtherRooms = () => {

    const {user} = useAuth()
    const navigate = useNavigate()

    const joinModalRef = useRef(null)

    const [roomDetailsInfo, setRoomDetails] = useState([])
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');

    axios.defaults.withCredentials = true
    useEffect(() => {
        if(!user) return;

        const fetchUserData = async () => {
            if(!user) return;
            try {
                const token = Cookies.get("token")
                const response = await axios.get("http://localhost:3001/getappuser", {
                    headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`}
                })

                response.data.valid ? setName(response.data.user.username) : console.error("Invalid user data", response.data)
                
            } catch (error) {
                console.error("Error fetching user data", error)
            }
        }
        fetchUserData()
    }, [user])

    useEffect(() => {

        const initializeSocket = async () => {
            await new Promise((resolve) => {
                if (socket.connected) {
                    resolve();
                } else {
                    socket.once("connect", resolve);
                }
            });
    
            // console.log("socket connected on all room component", socket.connected);

            socket.emit("getAllRooms", { timestamp: new Date().getTime() });
    
            // Listen for "allRoomsInUse" event and handle it
            socket.on("allRoomsInUse", (roomDetails) => {
                setRoomDetails(roomDetails)
            });
        };
    
        initializeSocket();
    
        // Clean up the socket listener on unmount
        return () => {
            socket.off("allRoomsInUse");
        };
    }, []); 


    const handleRoomClick = (e, selectedRoom) => {
        e.preventDefault();
        setRoom(selectedRoom);
    
        joinModalRef.current?.showModal();
        
    };

    const handleJoiningActiveRoom = (e) => {
        e.preventDefault();

        if(name !== "" && room !== ""){
            socket.emit("join", {name, room}, (error) => {
                if(error) {
                    console.error("Error joining room", error);
                    alert(error)
                } else {
                    console.log("Join room successfully")
                    navigate(`/chat?name=${name}&room=${room}`)
                }
            })
        } 

    }
    

    return (
        <div className={otherroomstyle.mainContainer}>
                
            <h3>Active Rooms</h3>
            <>
                <div className={otherroomstyle.roomListWrapper}>

                    <dialog ref={joinModalRef} className={otherroomstyle.joinModalWrapper}>
                        <FontAwesomeIcon icon={faXmark} className={otherroomstyle.xmarkIcon} onClick={() => joinModalRef.current?.close()}/>
                        <div>
                            <label htmlFor="username">
                                User Name:
                                <input
                                placeholder="Name"
                                className={otherroomstyle.joinInput}
                                type="text"
                                value={name}
                                readOnly
                                />
                            </label>
                            
                            <label htmlFor="roomname">
                                Room Name:
                                <input
                                placeholder="Room"
                                className={otherroomstyle.joinInput}
                                type="text"
                                value={room}
                                readOnly
                                />
                            </label>
                        </div>
                        <button className={otherroomstyle.bttn} onClick={handleJoiningActiveRoom}>
                            Join room
                        </button>
                    </dialog>

                    {roomDetailsInfo && roomDetailsInfo.length > 0 ? (
                        <>
                            {roomDetailsInfo.map((elem, id) => (
                                <ul key={id}>
                                    <li onClick={(e) => handleRoomClick(e, elem.room)}>
                                        {elem.room}
                                        <span>
                                            {elem.users.length}
                                        </span>
                                    </li>
                                </ul>
                            ))}
                        </>
                    ) : (
                            <p>No Active Rooms</p> 
                        )
                    }
                </div>
            </>
        </div>
    )
}

export default OtherRooms