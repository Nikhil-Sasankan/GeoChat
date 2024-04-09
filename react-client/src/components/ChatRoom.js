import React, { useEffect, useState } from 'react'
import { over } from 'stompjs';
import SockJS from 'sockjs-client';
import "./ChatRoom.css"

var stompClient = null;
const ChatRoom = ({ chatsessionroom, usergeolocation }) => {
    const [privateChats, setPrivateChats] = useState(new Map());
    const [publicChats, setPublicChats] = useState([]);
    const [tab, setTab] = useState("CHATROOM");
    const ipaddress = 'http://localhost:8080'
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

    // Predefined arrays of adjectives and nouns for the random name generator
    const adjectives = [
        "Mighty",
        "Squishy",
        "Flamboyant",
        "Sporky",
        "Zesty",
        "Fuzzy",
        "Wacky",
        "Jolly",
        "Sparkling",
        "Giggly",
        "Peculiar",
        "Whimsical",
        "Silly",
        "Bubbly",
        "Quirky",
        "Lively",
        "Dazzling",
        "Cheeky",
        "Glittery",
        "Radiant",
        "Charming",
        "Playful",
        "Cozy",
        "Dapper",
        "Fancy",
        "Sassy",
        "Snazzy",
        "Witty",
        "Enchanting",
        "Dynamic",
        "Vibrant",
        "Clever",
        "Happy-go-lucky",
        "Funky",
        "Jovial",
        "Gleeful",
        "Sunny",
        "Bouncy",
        "Energetic",
        "Punny",
        "Dreamy",
        "Luminous",
        "Vivacious",
        "Zippy",
        "Merry",
        "Sprightly",
    ];

    const nouns = [
        "Pickle",
        "Squirrel",
        "Unicorn",
        "Pancake",
        "Noodle",
        "Cupcake",
        "Rainbow",
        "Marshmallow",
        "Jellybean",
        "Bubble",
        "Cookie",
        "Snickerdoodle",
        "Doodle",
        "Muffin",
        "Pudding",
        "Gummy Bear",
        "Cinnamon Roll",
        "Sugarplum",
        "Sparkle",
        "Twinkle",
        "Starlight",
        "Dreamer",
        "Whisper",
        "Moonbeam",
        "Petal",
        "Sunshine",
        "Blossom",
        "Dazzle",
        "Harmony",
        "Melody",
        "Breeze",
        "Wonder",
        "Magic",
        "Fairy",
        "Sprite",
        "Pegasus",
        "Lullaby",
        "Serenade",
        "Comet",
        "Nova",
        "Galaxy",
        "Aurora",
        "Enchantment",
        "Bliss",
        "Jubilee",
        "Miracle",
        "Serendipity",
        "Charisma",
        "Fantasy",
        "Marvel",
      ];
      
    // Random Name Generator Function
    const generateRandomName = () => {
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        return `${adjective} ${noun}`;
    };

    const generateRandomUsername = () => {
        const randomName = generateRandomName();
        setUserData({ ...userData, "username": randomName });
    }

    const createUserSession = async () => {
        try {
            // Creating the session for the user once all the details are there 
            const response = await fetch('http://192.168.0.105:8080/createusersession', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    "userdetails": {
                        "latitude": usergeolocation.userlatitude,
                        "longitude": usergeolocation.userlongitude,
                        "username": userData.username
                    },
                    "chatroomdetails": {
                        "chatroomid": chatsessionroom.chatroomid,
                        "chatroomname": chatsessionroom.chatroomname,
                        "latitude": chatsessionroom.latitude,
                        "longitude": chatsessionroom.longitude
                    }
                })
            })

            const data = await response.json();
            console.log("User Data Saved Successfully --- >", data)
        } catch (error) {
            console.log(error)
        }
    }

    const connect = () => {
        // using the POST to create a session
        createUserSession();

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
        console.log(payload);
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
                chatroomid: chatsessionroom.chatroomid
            };
            console.log(chatMessage);
            stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
            setUserData({ ...userData, "message": "" });
        }
    }

    const sendPrivateValue = () => {
        if (stompClient) {
            var chatMessage = {
                senderName: userData.username,
                receiverName: tab,
                chatroomid: chatsessionroom.chatroomid,
                message: userData.message,
                status: "MESSAGE"
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
                        <ul className="chat-messages">
                            {publicChats.map((chat, index) => (
                                <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                                    {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
                                    <div className="message-data">{chat.message}</div>
                                    {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
                                </li>
                            ))}
                        </ul>

                        <div className="send-message">
                            <input type="text" className="input-message" placeholder="enter the message" value={userData.message} onKeyPress={handleKeyPressSendMessage} onChange={handleMessage} />
                            <button type="button" className="send-button" onClick={sendValue}>Send</button>
                        </div>
                    </div>}
                    {tab !== "CHATROOM" && <div className="chat-content">
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
                    </div>}
                </div>
                :

                <div className="register">
                    <input
                        id="user-name"
                        placeholder="Enter your name"
                        name="userName"
                        value={userData.username}
                        onChange={handleUsername}
                        onKeyPress={handleKeyPressRegisterUser}
                        margin="normal"
                    />
                    <button className="button-random" onClick={generateRandomUsername}>
                        Random
                    </button>
                    <button className="button-register" onClick={registerUser}>
                        Enter Chat room
                    </button>

                </div>}
        </div>
    )
}

export default ChatRoom
