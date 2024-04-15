import React from 'react'
import ChatRoom from './components/ChatRoom'
import { useState } from "react";
import Results from './components/Results';
import HomePage from './components/HomePage'
import AboutPage from './components/About';
import { getAvailableChatRooms, createChatRoomAPIMethod, deleteChatRoomAPIMethod } from './components/APIService';
import ContactPage from './components/Contact';

const App = () => {
  const [currentPage, setCurrentPage] = useState("HOME_PAGE");
  const [availableRooms, setAvailableRooms] = useState([]);
  const [usergeolocation, setUsergeolocation] = useState();
  const [chatsessionroom, setchatsessionroom] = useState();

  // To create the new chatroom and re-fetch the latest results from the API backend
  const handleCreateAPI = async (createchatroomname, createlat, createlng, secretKey, isprivate) => {
    try {
      let data = await createChatRoomAPIMethod(createchatroomname, createlat, createlng, secretKey, isprivate).then()
      console.log("Room successfully created ===> ", data.data.chatroomjoinid);
      let chatroomdata = await getAvailableChatRooms(usergeolocation.userlatitude, usergeolocation.userlongitude, data.data.chatroomjoinid)
      setAvailableRooms(chatroomdata)
      setCurrentPage("AVAILABLE_CHATROOMS")
    } catch (error) {
      console.log("Error creating new chatroom", error)
    }

  }

  // Function to find the private chats from the getalvailableroom by passing in additional roomkey
  const handleFindPrivateChats = async (findroomid) => {
    let data = await getAvailableChatRooms(usergeolocation.userlatitude, usergeolocation.userlongitude, findroomid)
    setAvailableRooms(data)
    setCurrentPage("AVAILABLE_CHATROOMS")
  }

  // To run the delete API and then rerun the getallavailable chatrooom
  const handleDeleteAPI = async (chatroomname,secretKey,chatroomjoinid)=>{
      let data = await deleteChatRoomAPIMethod(chatroomname,secretKey,chatroomjoinid);
      console.log(data.message)
      // once deleted , we can now show the other chats
      let availdata = await getAvailableChatRooms(usergeolocation.userlatitude,usergeolocation.userlongitude)
      setAvailableRooms(availdata)
  }

  // Fetch the users location and details from the browser navigator once the user clicks the join key
  const handleJoinClick = () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            console.log("User Location : ", position) 
            setUsergeolocation({
              userlatitude: latitude,
              userlongitude: longitude
            })
            const data = await getAvailableChatRooms(latitude, longitude)
            setAvailableRooms(data)
            setCurrentPage("AVAILABLE_CHATROOMS")
          }
        )
      } else {
        console.log("Navigator Error! Try again")
      }
    } catch (error) {
      console.log(error)
    }

  }

  return (
    <div>
      {currentPage === "HOME_PAGE" &&
        <HomePage
          handleJoinClick={handleJoinClick}
          setCurrentPage={setCurrentPage}
        />}
      {currentPage === "ABOUT" &&
        <AboutPage
          setCurrentPage={setCurrentPage}
        />}
        {currentPage === "CONTACT" &&
        <ContactPage
          setCurrentPage={setCurrentPage}
        />}
      {currentPage === "AVAILABLE_CHATROOMS" &&
        <Results
          data={availableRooms}
          userlatitude={usergeolocation.userlatitude}
          userlongitude={usergeolocation.userlongitude}
          setCurrentPage={setCurrentPage}
          setchatsessionroom={setchatsessionroom}
          handleCreateAPI={handleCreateAPI}
          handleFindPrivateChats={handleFindPrivateChats}
          handleDeleteAPI={handleDeleteAPI}
        />}
      {currentPage === "CHATROOM_JOINED" &&
        <ChatRoom chatsessionroom={chatsessionroom} usergeolocation={usergeolocation} />}
    </div>
  )
}

export default App;

