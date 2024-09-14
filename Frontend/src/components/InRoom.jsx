import inroomstyle from "../styles/inroomstyle.module.css"
import socket from "../socket"
import { useEffect, useRef, useState } from "react"

import { useAuth } from "./AuthContex"
import Cookies from "js-cookie"
import axios from "axios"

const frontendURL = import.meta.env.VITE_REACT_APP_FRONTEND_URL

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {faUserPlus, faXmark } from "@fortawesome/free-solid-svg-icons"

const InRoom = ({name, room}) => {  

    const {user} = useAuth()

    const inviteRef = useRef(null)

    const [userData, setUserData] = useState()
    const [roomMembers, setRoomMembers] = useState([])
    const [allOnlineUser, setAllOnlineUsers] = useState([])
    const [usersToInvite, setUsersToInvite] = useState([])
    const [inSameRoom, setInSameRoom] = useState([])
    const [allRegisterMember, setAllRegisterMember] = useState([])


    axios.defaults.withCredentials = true
    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) return;
            try {
                const token = Cookies.get("token");
                const response = await axios.get(`${frontendURL}/getappuser`, {
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
                });
                if (response.data.valid) {
                    setUserData(response.data);
                }
            } catch (error) {
                console.error("Error fetching user data", error);
            }
        };
        fetchUserData();
    }, [user]);

    useEffect(() => {
        const fetchAllRegisterMembers = async () => {
            try {
                const response = await axios.get(`${frontendURL}/getActiveUsers`);
                setAllRegisterMember(response.data);
            } catch (error) {
                console.log("Error fetching data", error);
            }
        };
        fetchAllRegisterMembers();
    }, []);

    useEffect(() => {
        if (room) {
            const userInSameRoom = () => {
                const sameRoomUsers = allOnlineUser.filter(elem => elem.room === room);
                const inSameRoom = allRegisterMember.filter(member =>
                    sameRoomUsers.some(elem => elem.name === member.username)
                );
                setInSameRoom(inSameRoom);
            };

            userInSameRoom(room);
        }
    }, [room, allOnlineUser, allRegisterMember]);

    useEffect(() => {
        if (room) {
            const userToIv = () => {
                const invites = allOnlineUser.filter(elem => elem.room !== room);
                const isToInvite = allRegisterMember.filter(member =>
                    invites.some(invite => invite.name === member.username)
                );
                setUsersToInvite(isToInvite);
            };

            userToIv();
        }
    }, [room, allOnlineUser, allRegisterMember]);

    useEffect(() => {
        const handleRoomMember = (newMembers) => {
            // console.log("Received allUsers event:", newMembers);
            if (newMembers) {
                setRoomMembers(newMembers);
            }
        };
    
        const handleCurrentUsers = (curUsers) => {
            // console.log("Received currentusers event:", curUsers);
            if (curUsers) {
                setAllOnlineUsers(curUsers);
            }
        };
    
        socket.on("allUsers", handleRoomMember);
        socket.on("currentusers", handleCurrentUsers);
    
        return () => {
            socket.off("allUsers", handleRoomMember);
            socket.off("currentusers", handleCurrentUsers);
        };
    }, []);
    


    return (
        <div className={inroomstyle.mainContainer}>
            <div className={inroomstyle.header}>
                <FontAwesomeIcon icon={faUserPlus} className={inroomstyle.headerIcon} onClick={() => inviteRef.current?.showModal()}/>                    
            </div>

            <dialog ref={inviteRef} className={inroomstyle.inviteDialogModule}>
                <FontAwesomeIcon icon={faXmark} onClick={() => inviteRef.current?.close()} className={inroomstyle.closeButton}/>
                <div className={inroomstyle.inviteListContainer}>
                    {usersToInvite && usersToInvite.length > 0 ? (
                        <div className={inroomstyle.inviteList}>
                            <h3>Invite user to Room</h3>
                            {usersToInvite.map((elem, id) => (
                                <div key={id} className={inroomstyle.inviteItem}>
                                    {elem.profilePic ? (
                                        <img src={`${frontendURL}/profilePics/${elem.profilePic}`} alt={`Profile of ${elem.username.charAt(0).toUpperCase()}`} />
                                    ) : (
                                        <div className={inroomstyle.noProfilePic}>
                                            <div className={inroomstyle.noUserNameWrapper}>
                                                {elem.username.charAt(0).toUpperCase()}
                                            </div>
                                        </div>
                                    )}
                                    <p>{elem.username || 'Unknown User'}</p>

                                    <button className={inroomstyle.bttn}>Invite</button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No users to invite</p>
                    )}
                </div>
            </dialog>

            <>
                {inSameRoom && inSameRoom.length > 0 ? (
                    <div className={inroomstyle.memberListWrapper}>
                        <h3>Active in room</h3>
                        {inSameRoom.map((membElem, index) => (
                            <div key={index} className={inroomstyle.activeUserInfoWrapper}>
                                <div className={inroomstyle.userImageWrapper}>
                                    {membElem.profilePic ? (
                                        <img src={`${frontendURL}/profilePics/${membElem.profilePic}`} alt={`${membElem.username.charAt(0).toUpperCase()}`} />
                                    ) : (
                                        <div className={inroomstyle.noUserNameWrapper}>
                                            {membElem.username.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                {membElem.username || 'Unknown User'}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>No active members in the room</div>
                )}
            </>
        </div>
    )
}

export default InRoom