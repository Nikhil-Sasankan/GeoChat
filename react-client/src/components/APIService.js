export const ipaddress = 'https://geochatbackend.onrender.com';
// export const ipaddress = 'http://192.168.0.100:8080'

// ----------------------------- API to fetch the available chatrooms ---------------------------------// 
export const getAvailableChatRooms = async (userlatitude, userlongitude, chatroomjoinid) => {
    try {
        console.log("Making request")
        const response = await fetch(ipaddress + '/getavailablerooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                user: {
                    latitude: userlatitude,
                    longitude: userlongitude
                },
                // To pass a chatroom join unique key in case the user want to discover or find any room
                // except for the ones in his surroundings
                roomkey: chatroomjoinid
            })
        })
        const data = await response.json();
        console.log("Fetched data for rooms available sucessfully : " + data.data)
        return data.data;
    } catch (error) {
        console.log(error)
    }
}


// --------------- API to create a session for the user --------------------------//
export const createUserSession = async ({usergeolocation,userData,chatsessionroom}) => {
    try {
        // Creating the session for the user once all the details are there 
        const response = await fetch(ipaddress+'/createusersession', {
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
        return data;
    } catch (error) {
        console.log(error)
    }
}

// ----------------------------- API to create the chatrooms ----------------------------------//
export const createChatRoomAPIMethod = async (createchatroomname, createlat, createlng, secretKey, ifisprivate) => {
    console.log("Executing the create API")
    try {
        // Fetching the available chatrooms using the user location
        const response = await fetch(ipaddress + '/createchatroom', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                chatroomname: createchatroomname,
                latitude: createlat,
                citycode: "Pune",
                statecode: "Maharashtra",
                longitude: createlng,
                secretKey: secretKey,
                isprivate: ifisprivate
            })
        })
        const data = await response.json();
        console.log("Room successfully created ", data)
        return data;
    } catch (error) {
        console.log(error)
    }
}



//----------------------------- API to delete the chatrooms-----------------------------------------//
export const deleteChatRoomAPIMethod = async (createchatroomname, usersecretKey, userchatroomjoinid) => {
    console.log("Executing Delete API...")
    try {
        // Fetching the available chatrooms using the user location
        const response = await fetch(ipaddress + '/deletechatroom', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                chatroomname: createchatroomname,
                secretKey: usersecretKey,
                chatroomjoinid: userchatroomjoinid
            })
        })

        const data = await response.json();
        console.log("Room successfully deleted ", data)
        return data;

    } catch (error) {
        console.log(error)
    }
}