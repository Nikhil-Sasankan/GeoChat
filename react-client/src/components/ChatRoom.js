import React, { useEffect, useRef, useState } from 'react'
import { over } from 'stompjs';
import SockJS from 'sockjs-client';
import { generateRandomName, profileiconames } from './Utility';
import { ipaddress, createUserSession } from './APIService';
import "./ChatRoom.css"
import LoopIcon from '@mui/icons-material/Loop';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Import carousel styles
import { Carousel } from 'react-responsive-carousel';
import EmojiPicker from 'emoji-picker-react';


var stompClient = null;

const ChatRoom = ({ chatsessionroom, usergeolocation }) => {

    const [privateChats, setPrivateChats] = useState(new Map());
    const [publicChats, setPublicChats] = useState([]);
    const olderpublicchats = useRef([])
    const useridref = useRef('')
    const [enterisDisabled, setenterIsDisabled] = useState([])
    const [tab, setTab] = useState("CHATROOM");
    const chatContentRef = useRef(null); // Ref for chat-content
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [selectedporfile, setselectedprofile] = useState(0)
    // to indicate the unread messages 
    const [unreadMessages, setUnreadMessages] = useState({});
    const [selectEmoji, setselectEmoji] = useState(false)

    const [userData, setUserData] = useState({
        userId: '',
        username: '',
        receivername: '',
        connected: false,
        message: '',
        selectedProfile: profileiconames[0]
    });
    useEffect(() => {
        console.log(userData);
    }, [userData]);


    // Function to reset unread messages for a sender
    const markAsRead = (senderName) => {
        setUnreadMessages((prevUnread) => ({
            ...prevUnread,
            [senderName]: false, // Mark sender as read
        }));
    };

    const handleProfileSelect = (profile) => {
        setUserData({ ...userData, selectedProfile: profileiconames[profile] });
    };

    const generateRandomUsername = () => {
        let randomName = generateRandomName();
        setselectedprofile(parseInt(profileiconames.length * Math.random()))
        while (chatsessionroom.userspresent != null && chatsessionroom.userspresent.includes(randomName)) {
            randomName = generateRandomName();
        }
        setenterIsDisabled(false)
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
        createUserSession({ usergeolocation, userData, chatsessionroom }).then((response) => {
            console.log(response);
            olderpublicchats.current = [...response.data.oldermessages]
            useridref.current=[response.data.userdata.userid]
            let Sock = new SockJS(ipaddress + '/ws');
            stompClient = over(Sock);
            stompClient.connect({}, onConnected, onError);
        });
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
            status: "JOIN",
            chatroomid: chatsessionroom.chatroomid
        };
        if(olderpublicchats.current!==null && olderpublicchats.current.length!==0){
            publicChats.push(...olderpublicchats.current);
            setPublicChats(publicChats);  
        }
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
                if (!privateChats.get(payloadData.senderName)) {
                    privateChats.set(payloadData.senderName, []);
                    setPrivateChats(new Map(privateChats));
                }
                
                publicChats.push(payloadData);
                setPublicChats([...publicChats]);
                break;
            default:
                console.log("NO MESSAGE ACTION")
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
        setUnreadMessages((prevUnread) => ({
            ...prevUnread,
            [payloadData.senderName]: true, // Mark sender as having unread messages
        }));
    }

    const onError = (err) => {
        console.log(err);
    }

    const handleMessage = (event) => {
        const { value } = event.target;
        setUserData({ ...userData, "message": value });
    }
    const sendValue = () => {
        if (stompClient) {
            var chatMessage = {
                senderName: userData.username,
                senderid: userData.userId,
                message: userData.message,
                status: "MESSAGE",
                messagetype: "text",
                chatroomid: chatsessionroom.chatroomid,
                selectedProfile: userData.selectedProfile
            };
            stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
            setUserData({ ...userData, "message": "" });
        }
    }

    const sendPrivateValue = () => {
        if (stompClient) {
            var chatMessage = {
                senderName: userData.username,
                senderid: userData.userId,
                receiverName: tab,
                chatroomid: chatsessionroom.chatroomid,
                message: userData.message,
                messagetype: "text",
                status: "MESSAGE",
                selectedProfile: userData.selectedProfile
            };

            if (userData.username !== tab) {
                privateChats.get(tab).push(chatMessage);
                setPrivateChats(new Map(privateChats));
            }
            stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
            setUserData({ ...userData, "message": "" });
        }
    }

    const handleUsername = (event) => {
        const { value } = event.target;
        setUserData({ ...userData, "username": value });

        if (chatsessionroom.userspresent != null && chatsessionroom.userspresent.includes(value)) {
            setenterIsDisabled(true)
            setErrorDialogOpen("ALREADY_EXISTS"); // Show the error dialog
        } else if (value == null || value === "") {
            setenterIsDisabled(true)
            setErrorDialogOpen("INVALID_USERNAME"); // Show the error dialog
        } else {
            setenterIsDisabled(false)
            setErrorDialogOpen("VALID"); // Show the error dialog
        }
    }


    const registerUser = () => {
        connect();
    }

    const handleKeyPressRegisterUser = (event) => {
        if (event.key === 'Enter') {
            registerUser();
        }
    }

    const handleKeyPublicPressSendMessage = (event) => {
        if (!(userData.message == null || userData.message === "") && event.key === 'Enter') {
            sendValue();
        }
    }
    const handleKeyPrivatePressSendMessage = (event) => {
        if (!(userData.message == null || userData.message === "") && event.key === 'Enter') {
            sendPrivateValue();
        }
    }
    const handleEmojiSelect = (emoji) => {
        setUserData({ ...userData, "message": userData.message + emoji.emoji });
    }

    return (

        <div className="container">
            {userData.connected ?
                <div className="chat-box">
                    <div className='chat-title'>{chatsessionroom.chatroomname}  <div className='chat-title id'>#{chatsessionroom.chatroomjoinid}</div></div>
                    <div className="member-list">
                        <ul>
                            <li onClick={() => { setTab("CHATROOM") }} className={`member chatroom ${tab === "CHATROOM" && "active"}`}>Chatroom</li>
                            {[...privateChats.keys()].map((name, index) => (
                                <li onClick={() => { setTab(name); markAsRead(name); }} className={`member ${tab === name && "active"} ${name === userData.username && "self"} ${tab !== name && unreadMessages[name] && "unread"}  `} key={index}  >{name === userData.username ? "You" : name} {tab !== name && unreadMessages[name] && "🔘"}</li>
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
                                    <div className="message-data" style={{ maxWidth: Math.min(window.innerWidth * 0.4, Math.max(chat.message.length,chat.date.length) * 9) + "px" }}>{chat.message}{<div className='msg-date' >{chat.date}</div>}</div>
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
                            <input type="text" className="input-message" placeholder="enter the message" value={userData.message} onKeyPress={handleKeyPublicPressSendMessage} onChange={handleMessage} />
                            {selectEmoji && <div className="emoji-picker-container">
                                <EmojiPicker previewConfig={{ showPreview: false }} searchDisabled={true} width={"300px"} height={"300px"} reactionsDefaultOpen={true} onEmojiClick={handleEmojiSelect} />
                            </div>}
                            <button className='emoji-button' onClick={() => setselectEmoji(c => !c)}>😀</button>
                            <button type="button" className="send-button" disabled={userData.message == null || userData.message === ""} onClick={sendValue}>Send</button>
                        </div>
                    </div>}
                    {tab !== "CHATROOM" && <div className="chat-content">
                        <ul className="chat-messages">
                            {[...privateChats.get(tab)].map((chat, index) => (
                                <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                                    {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
                                    <div className="message-data" style={{ maxWidth: Math.min(window.innerWidth * 0.4, chat.message.length * 9) + "px" }} >{chat.message}</div>
                                    {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
                                </li>
                            ))}
                        </ul>

                        <div className="send-message">

                            <input type="text" className="input-message" placeholder="enter the message" value={userData.message} onKeyPress={handleKeyPrivatePressSendMessage} onChange={handleMessage} />
                            {selectEmoji && <div className="emoji-picker-container">
                                <EmojiPicker previewConfig={{ showPreview: false }} searchDisabled={true} width={"300px"} height={"300px"} reactionsDefaultOpen={true} onEmojiClick={handleEmojiSelect} />
                            </div>}
                            <button className='emoji-button' onClick={() => setselectEmoji(c => !c)}>😀</button>
                            <button type="button" className="send-button" disabled={userData.message == null || userData.message === ""} onClick={sendPrivateValue}>Send</button>
                        </div>
                    </div>}
                </div>
                :

                <div className="register">
                    <Carousel
                        className='profile-carousels'
                        showThumbs={false}
                        showArrows={true}
                        infiniteLoop={true}
                        centerMode={true} // Center the images
                        centerSlidePercentage={100} // Centered slide takes full width
                        selectedItem={selectedporfile} // Selected item index
                        onChange={(element) => handleProfileSelect(element)}
                    >
                        {profileiconames.map((element, index) => (
                            <div key={index} className='profile-image-container'>
                                <img className='profile-image' src={process.env.PUBLIC_URL + "/profileicons/" + element} alt={"Profile" + element} />
                            </div>
                        ))}
                    </Carousel>
                    <div>
                        {enterisDisabled === true && errorDialogOpen === "INVALID_USERNAME" && <div className='error-message'> ❌ Enter a valid username.</div>}
                        {enterisDisabled === true && errorDialogOpen === "ALREADY_EXISTS" && <div className='error-message'> ❌ Username already exists.</div>}
                        {enterisDisabled === false && <div className='noerror-message'>✅ Username Available</div>}

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
                    <button className={`button-register ${enterisDisabled ? 'disabled' : ''}`} disabled={enterisDisabled} onClick={registerUser}>
                        Enter Chat Room
                    </button>

                </div>}
        </div>
    )
}

export default ChatRoom
