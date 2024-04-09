import React from 'react'
import ChatRoom from './components/ChatRoom'
import { useState } from "react";
import Results from './components/Results';
import HomePage from './components/HomePage'

const App = () => {
  const [currentPage, setCurrentPage] = useState("HOME_PAGE");
  const [availableRooms, setAvailableRooms] = useState([]);
  const [usergeolocation, setUsergeolocation] = useState();
  const [chatsessionroom,setchatsessionroom] = useState();

  const ipaddress = 'http://localhost:8080'

  const handleCreateAPI = async (createchatroomname,createlat,createlng ,secretKey,isprivate)=>{
        try{
          let data = await createChatRoomAPIMethod(createchatroomname,createlat,createlng ,secretKey,isprivate).then()
          console.log("Room successfully created ===> ", data.chatroomjoinid);
          await getAvailableChatRooms(usergeolocation.userlatitude, usergeolocation.userlongitude,data.chatroomjoinid)
        }catch(error){
          console.log("Error creating the new room",error)
        }
        
  }

  const handleFindPrivateChats = async(findroomid) => {
    await getAvailableChatRooms(usergeolocation.userlatitude, usergeolocation.userlongitude,findroomid)
  }

  // API to create the chatrooms
  const createChatRoomAPIMethod = async (createchatroomname,createlat,createlng ,secretKey,ifisprivate) => {
    console.log("Executing the create API")
    try { 
        // Fetching the available chatrooms using the user location
        const response = await fetch(ipaddress+'/createchatroom', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                chatroomname : createchatroomname,
                latitude : createlat,
                citycode : "Pune",
                statecode :"Maharashtra",
                longitude :createlng,
                secretKey : secretKey, 
                isprivate : ifisprivate
            })
        })

        const data = await response.json();
        console.log("Room successfully created ",data)
        return data ;

    } catch (error) {
        console.log(error)
    }
}

  const getAvailableChatRooms = async (userlatitude, userlongitude,chatroomjoinid) => {
    try {
      // Fetching the available chatrooms using the user location
      const response = await fetch(ipaddress+'/getavailablerooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          user :{
            latitude: userlatitude,
            longitude: userlongitude
          },
          roomkey:chatroomjoinid
        })
      })

      const data = await response.json();
      console.log("Data Fetched for available rooms")

      setAvailableRooms(data)
      setCurrentPage("AVAILABLE_CHATROOMS")

    } catch (error) {
      console.log(error)
    }
  }

  const handleJoinClick = () => {
    // Fetch the users location and details from the browser navigator 
    if (navigator.geolocation) { 
      console.log("navigator is  working"+document.navigator)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("USER Location : ", position)
          const {latitude, longitude} = position.coords;
          console.log("Latitude : ", latitude, " , Longitude : ", longitude)
          setUsergeolocation({
            userlatitude: latitude,
            userlongitude: longitude
          })
          getAvailableChatRooms(latitude, longitude)
        }
      )
    }else{
      console.log("Navigator is null")
    }
  }


  return (
    <div>
      {currentPage === "HOME_PAGE" &&
        <HomePage
          handleJoinClick={handleJoinClick}
        />}
      {currentPage === "AVAILABLE_CHATROOMS" &&
        <Results
          data={availableRooms}
          userlatitude={usergeolocation.userlatitude}
          userlongitude={usergeolocation.userlongitude}
          setCurrentPage={setCurrentPage}
          setchatsessionroom = {setchatsessionroom}
          handleCreateAPI = {handleCreateAPI}
          handleFindPrivateChats={handleFindPrivateChats}
        />}
      {currentPage === "CHATROOM_JOINED" &&
        <ChatRoom chatsessionroom={chatsessionroom} usergeolocation={usergeolocation}/>}
    </div>
  )
}

export default App;

