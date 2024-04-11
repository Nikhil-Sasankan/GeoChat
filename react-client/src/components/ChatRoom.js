import React, { useEffect, useRef, useState } from 'react'
import { over } from 'stompjs';
import SockJS from 'sockjs-client';
import { generateRandomName } from './Utility';
import { ipaddress, createUserSession } from './APIService';
import "./ChatRoom.css"
import LoopIcon from '@mui/icons-material/Loop';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Import carousel styles
import { Carousel } from 'react-responsive-carousel';

var stompClient = null;

const ChatRoom = ({ chatsessionroom, usergeolocation }) => {
    const profileiconames = [
        "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg"
    ]

    const [privateChats, setPrivateChats] = useState(new Map());
    const [publicChats, setPublicChats] = useState([]);
    const [tab, setTab] = useState("CHATROOM");
    const chatContentRef = useRef(null); // Ref for chat-content 
    const [userData, setUserData] = useState({
        userId: '',
        username: '',
        receivername: '',
        connected: false,
        message: ''
    });
    useEffect(() => {
        console.log(userData);
    }, [userData]);


    const handleProfileSelect = (profile) => {
        console.log("profileid", profileiconames[profile])
        setUserData({ ...userData, selectedProfile: profileiconames[profile] });
    };

    const generateRandomUsername = () => {
        const randomName = generateRandomName();
        setUserData({ ...userData, "username": randomName });
    }

    const scrollToBottom = () => {
        if (chatContentRef.current) {
            chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
        }
    };
    useEffect(() => {
        scrollToBottom();
    }, [publicChats, privateChats]); // Add any other dependencies as needed

    const connect = () => {
        // using the POST to create a session
        createUserSession({ usergeolocation, userData, chatsessionroom });

        let Sock = new SockJS(ipaddress + '/ws');
        stompClient = over(Sock);
        stompClient.connect({}, onConnected, onError);

        // calling post to create a user with all those details 
    }

    const onConnected = () => {
        setUserData({ ...userData, "connected": true });
        stompClient.subscribe('/chatroom/public/' + chatsessionroom.chatroomid, onMessageReceived);
        stompClient.subscribe('/user/' + userData.username + '/private' + chatsessionroom.chatroomid, onPrivateMessage);
        console.log("Subscribing to the chatroom server")
        userJoin();
    }

    const userJoin = () => {
        var chatMessage = {
            senderName: userData.username,
            status: "JOIN"
        };
        stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
    }

    const onMessageReceived = (payload) => {
        var payloadData = JSON.parse(payload.body);
        switch (payloadData.status) {
            case "JOIN":
                if (!privateChats.get(payloadData.senderName)) {
                    privateChats.set(payloadData.senderName, []);
                    setPrivateChats(new Map(privateChats));
                }
                break;
            case "MESSAGE":
                publicChats.push(payloadData);
                setPublicChats([...publicChats]);
                break;
        }
    }

    const onPrivateMessage = (payload) => {
        var payloadData = JSON.parse(payload.body);
        if (privateChats.get(payloadData.senderName)) {
            privateChats.get(payloadData.senderName).push(payloadData);
            setPrivateChats(new Map(privateChats));
        } else {
            let list = [];
            list.push(payloadData);
            privateChats.set(payloadData.senderName, list);
            setPrivateChats(new Map(privateChats));
        }
    }

    const onError = (err) => {
        console.log(err);
    }

    const handleMessage = (event) => {
        const { value } = event.target;
        console.log("Value of message : " + value)
        setUserData({ ...userData, "message": value });
    }
    const sendValue = () => {
        if (stompClient) {
            var chatMessage = {
                senderName: userData.username,
                message: userData.message,
                status: "MESSAGE",
                messagetype: "text",
                chatroomid: chatsessionroom.chatroomid,
                selectedProfile: userData.selectedProfile
            };
            console.log(chatMessage);
            stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
            setUserData({ ...userData, "message": "" });
        }
    }

    // const sendPrivateValue = () => {
    //     if (stompClient) {
    //         var chatMessage = {
    //             senderName: userData.username,
    //             receiverName: tab,
    //             chatroomid: chatsessionroom.chatroomid,
    //             message: userData.message,
    //             status: "MESSAGE"
    //         };

    //         if (userData.username !== tab) {
    //             privateChats.get(tab).push(chatMessage);
    //             setPrivateChats(new Map(privateChats));
    //         }
    //         stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
    //         setUserData({ ...userData, "message": "" });
    //     }
    // }

    const handleUsername = (event) => {
        const { value } = event.target;
        setUserData({ ...userData, "username": value });
    }

    const registerUser = () => {
        connect();
    }

    const handleKeyPressRegisterUser = (event) => {
        if (event.key === 'Enter') {
            registerUser();
        }
    }

    const handleKeyPressSendMessage = (event) => {
        if (event.key === 'Enter') {
            sendValue();
        }
    }

    return (
        <div className="container">
            {userData.connected ?
                <div className="chat-box">
                    <div className='chat-title'>{chatsessionroom.chatroomname}</div>
                    <div className="member-list">
                        <ul>
                            <li onClick={() => { setTab("CHATROOM") }} className={`member ${tab === "CHATROOM" && "active"}`}>Chatroom</li>
                            {[...privateChats.keys()].map((name, index) => (
                                <li onClick={() => { setTab(name) }} className={`member ${tab === name && "active"}`} key={index}>{name}</li>
                            ))}
                        </ul>
                    </div>
                    {tab === "CHATROOM" && <div className="chat-content">
                        <ul className="chat-messages" ref={chatContentRef}>
                            {publicChats.map((chat, index) => (
                                <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                                    {chat.senderName !== userData.username && <>
                                        <img className='avatar-image' src={process.env.PUBLIC_URL + "/profileicons/" + chat.selectedProfile} alt={"AvatarProf"} />
                                        <div className="avatar">
                                            {chat.senderName}
                                        </div></>}
                                    <div className="message-data">{chat.message}</div>
                                    {chat.senderName === userData.username && <>
                                        <div className="avatar self">
                                            {chat.senderName}
                                        </div>
                                        <img className='avatar-image' src={process.env.PUBLIC_URL + "/profileicons/" + userData.selectedProfile} alt={"AvatarProf"} />
                                    </>
                                    }
                                </li>
                            ))}
                        </ul>

                        <div className="send-message">
                            <input type="text" className="input-message" placeholder="enter the message" value={userData.message} onKeyPress={handleKeyPressSendMessage} onChange={handleMessage} />
                            <button type="button" className="send-button" onClick={sendValue}>Send</button>
                        </div>
                    </div>}
                    {/* {tab !== "CHATROOM" && <div className="chat-content">
                        <ul className="chat-messages">
                            {[...privateChats.get(tab)].map((chat, index) => (
                                <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                                    {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
                                    <div className="message-data">{chat.message}</div>
                                    {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
                                </li>
                            ))}
                        </ul>

                        <div className="send-message">
                            <input type="text" className="input-message" placeholder="enter the message" value={userData.message} onChange={handleMessage} />
                            <button type="button" className="send-button" onClick={sendPrivateValue}>Send</button>
                        </div>
                    </div>} */}
                </div>
                :

                <div className="register">
                    <Carousel
                        className='profile-carousels'
                        showThumbs={false}
                        showArrows={true}
                        centerMode={true} // Center the images
                        centerSlidePercentage={100} // Centered slide takes full width
                        selectedItem={0} // Selected item index
                        onChange={(element) => handleProfileSelect(element)}
                    >
                        {profileiconames.map((element, index) => (
                            <div key={index} className='profile-image-container'>
                                <img className='profile-image' src={process.env.PUBLIC_URL + "/profileicons/" + element} alt={"Profile" + element} />
                            </div>
                        ))}
                    </Carousel>
                    <div>
                        <input
                            id="user-name"
                            placeholder="Enter your name"
                            name="userName"
                            value={userData.username}
                            onChange={handleUsername}
                            onKeyPress={handleKeyPressRegisterUser}
                            margin="normal"
                            className='input-username'
                        />
                        <button className="button-random" onClick={generateRandomUsername}>
                            <LoopIcon />
                        </button>
                    </div>
                    <button className="button-register" onClick={registerUser}>
                        Enter Chat room
                    </button>

                </div>}
        </div>
    )
}

export default ChatRoom
