import { useEffect, useState } from "react";
import queryString from "query-string";
import ScrollToBottom from "react-scroll-to-bottom";
import socket from "../socket";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faFaceSmile, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import chatstyle from "../styles/chatstyle.module.css";

import InRoom from "./InRoom";

const Chat = () => {
    const navigate = useNavigate()
    const location = useLocation();

    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [welcomeMessage, setWelcomeMessage] = useState();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [iconMove, setIconMove] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    

    useEffect(() => {
        const { name, room } = queryString.parse(location.search);

        setName(name);
        setRoom(room);

        const handleWelcomeMessage = (message) => {

            const userName = message.user.name.charAt(0).toUpperCase() + message.user.name.slice(1)
            message.user.name = userName
            setWelcomeMessage(message)
        };

        const handleMessage = (message) => {
            if (message) {
                setMessages((prevMessages) => [...prevMessages, message]);  
            }
        };

        const initializeSocket = async () => {
            await new Promise((resolve) => {
                if (socket.connected) {
                    resolve();
                } else {
                    socket.once("connect", resolve);
                }
            });

            // console.log("Socket connected:", socket.connected);

            socket.emit("join", { name, room }, (error) => {
                if (error) {
                    console.error("Join error:", error);
                }
            });

            socket.once("welcomeMessage", handleWelcomeMessage);
            socket.on("message", handleMessage);

            socket.on("connect_error", (err) => {
                console.error("Socket connection error:", err);
            });
        };

        initializeSocket();        

        return () => {
            socket.off("connect");
            socket.off("connect_error");
            socket.off("welcomeMessage", handleWelcomeMessage);
            socket.off("message", handleMessage);
        };
    }, [location.search]);

    const handleEmojiSelected = (emoji) => {
        setMessage((prevMessage) => prevMessage + emoji.native);
        setShowEmojiPicker(false)
    };

    const toggleEmojiPicker = () => {
        setShowEmojiPicker((prev) => !prev);
    };

    const handleKeydown = (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    };

    const handleClick = () => {
        sendMessage();
    };

    const sendMessage = () => {
        if (message.trim() !== "") { 
            const now = new Date();
            const time = now.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });

            const messageData = {
                room,
                user: name,
                text: message, 
                time,
                id: socket.id
            };

            socket.emit("sendMessage", messageData, () => {});
            setMessage("");
        }
    };



    return (
        <div className={chatstyle.mainContainer}>

            <div className={chatstyle.inRoomWrapper}>
                <InRoom name={name} room={room} />
            </div>

            <div className={chatstyle.contentWrapper}>

                <NavLink to="/join" className={chatstyle.exitIcon} >
                    <FontAwesomeIcon icon={faRightFromBracket} />
                </NavLink>

                <div className={chatstyle.welcomeBox}>
                    <p>Welcome, <span >{welcomeMessage && welcomeMessage.user ? welcomeMessage.user.name : ""} !!</span> </p>
                    <p>Room: <span >{welcomeMessage && welcomeMessage.user ? welcomeMessage.user.room : ""}</span> </p>
                </div>

                <div className={chatstyle.chatbody}>
                    {messages && messages.length > 0 && (
                        <ScrollToBottom className={chatstyle.scrollWrapper}>
                            {messages.map((elem, id) => (
                                <div 
                                    key={id} 
                                    className={`${chatstyle.msgContainer} ${name === elem.user ? chatstyle.you : chatstyle.other}`}
                                >
                                    <div className={chatstyle.messageWrapper}>
                                        <p>{elem.text}</p>
                                    </div>
                                    <div className={chatstyle.messageMeta}>
                                        <p>{elem.time}</p> <strong>{elem.user}</strong>
                                    </div>
                                </div>
                            ))}
                        </ScrollToBottom>
                    )}
                </div>

                <div className={chatstyle.chatfooter}>
                    <div className={chatstyle.textInputWrapper}>
                        <div className={chatstyle.iconButtonWrapper}>
                            <FontAwesomeIcon 
                                icon={faFaceSmile}  
                                onClick={toggleEmojiPicker} 
                                className={ showEmojiPicker ? chatstyle.iconButton : chatstyle.iconBttn }
                            />
                        </div>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeydown}
                        />
                        <div className={chatstyle.customPicker}>
                            {showEmojiPicker && (
                                <Picker 
                                    data={data} 
                                    onEmojiSelect={handleEmojiSelected}  
                                />
                            )}
                        </div>
                    </div>
                    <button 
                        className={chatstyle.bttn} 
                        onClick={handleClick} 
                        onMouseEnter={() => setIconMove(true)} 
                        onMouseLeave={() => setIconMove(false)}
                    >
                        Send 
                        <FontAwesomeIcon 
                            icon={faPaperPlane} 
                            className={iconMove ? chatstyle.iconSlide : chatstyle.iconSlideBack }
                        />
                    </button>
                </div>
            </div>

        </div>
    );
};

export default Chat;
