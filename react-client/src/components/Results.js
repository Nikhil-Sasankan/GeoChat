import React from "react";
import './Results.css'
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'
import { useState, useRef } from "react";
import L from 'leaflet';

const Results = ({ data, userlatitude, userlongitude, setCurrentPage, setchatsessionroom, handleCreateAPI, handleFindPrivateChats,handleDeleteAPI }) => {
    const [createChatRoomObj, setcreateChatRoomObj] = useState({
        name: '',
        lat: 0,
        lng: 0
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreatingRoom, SetIsCreatingRoom] = useState(false);
    const inputValueRef = useRef('');
    const secretKeyRef = useRef('');
    const isPrivateRef = useRef(null); 
    const findChatroomid = useRef('')
    const mapRef = useRef(null);
    const [zoomLevel, setZoomLevel] = useState(15); // Initial zoom level state
    const [mapPosition, setMapPosition] = useState([userlatitude, userlongitude]); // Initial map position state

    const setChatroomJoined = (selectedchatroom) => {
        setCurrentPage("CHATROOM_JOINED")
        setchatsessionroom(selectedchatroom)
    }
    const handleMapClick = (e) => {
        const map = e.target; // Get the map object from the event
        const zoomLevel = map.getZoom(); // Get the zoom level
        const mapCenter = map.getCenter(); // Get the center coordinates
        setZoomLevel(zoomLevel)
        setMapPosition(mapCenter)
        console.log("Zoom", zoomLevel)
        console.log("Center", mapCenter)
        setcreateChatRoomObj({ ...createChatRoomObj, name: '', lat: e.latlng.lat, lng: e.latlng.lng });
    };

    // Function to handle checkbox change
    const handleIsPrivateChange = (e) => {
        if(e.target.checked){
            isPrivateRef.current="YES"
        }else{
            isPrivateRef.current="NO"
        }
        
    };

    const handlefindchatroomid = (e) => {
        findChatroomid.current = e.target.value
    }

    const handleCreatechatNameChange = (e) => {
        inputValueRef.current = e.target.value;
    };

    const handlesecretKeyChange = (e) => {
        secretKeyRef.current = e.target.value;
    }

    // Final API that crates the chatroom
    const handleCreateChatroom = () => {
        const chatroomname = inputValueRef.current
        const secretKey = secretKeyRef.current
        setcreateChatRoomObj({ ...createChatRoomObj, name: inputValueRef.current })
        console.log("Chat Room Name : ", chatroomname)
        console.log("Secret KEY :", secretKey)

        handleCreateAPI(chatroomname, createChatRoomObj.lat, createChatRoomObj.lng, secretKey, isPrivateRef.current)
        setcreateChatRoomObj(null)
        SetIsCreatingRoom(false)
        console.log(isCreatingRoom)
    }

    const setChatroomdelete = (rooms) =>{ 
        handleDeleteAPI(rooms.chatroomname,secretKeyRef.current,rooms.chatroomjoinid)
        secretKeyRef.current=null
    }
 
    const ClickHandler = () => {
        useMapEvents({
            click: handleMapClick,
        });
        return null;
    };

    const handleFindChatroms = () => {
        console.log("The find chatroom id is : " + findChatroomid.current)
        handleFindPrivateChats(findChatroomid.current)
    }

    const createRoomIcon = L.icon({
        iconUrl: process.env.PUBLIC_URL + 'create-marker-icon.png', // Provide the path to your custom icon image
        iconSize: [32, 32], // Size of the icon
        iconAnchor: [16, 32], // Anchor point of the icon
    });

    // Define marker icons for private and non-private chatrooms
    const privateRoomIcon = L.icon({
        iconUrl: process.env.PUBLIC_URL + 'marker-shadow-private.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
    });

    const publicRoomIcon = L.icon({
        iconUrl: process.env.PUBLIC_URL + 'marker-shadow.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
    });


    const MapComponent = ({ points }) => {
        console.log(points)
        const [isdelete, setisdelete] = useState(false)
        return (
            <MapContainer className="map-container" ref={mapRef} center={mapPosition} zoom={zoomLevel} onClick={handleMapClick}>
                {isCreatingRoom && <ClickHandler />}
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy;<a href="https://www.openstreetmap.org/copyright">Open Street Map</a> contributers'
                />

                {createChatRoomObj != null &&
                    <Marker icon={createRoomIcon} position={[createChatRoomObj.lat, createChatRoomObj.lng]}>
                        <Popup>
                            <input
                                type="text"
                                className="inputbasic"
                                onChange={handleCreatechatNameChange}
                                placeholder="Enter ChatRoom Name"
                            />
                            <input
                                type="text"
                                className="inputbasic"
                                onChange={handlesecretKeyChange}
                                placeholder="Enter secret key"
                            /><br></br>
                            <label className="chatroom-name-dialog" htmlFor="isPrivateCheckbox">Private Room : </label>
                            <input
                                type="checkbox"
                                id="isPrivateCheckbox" 
                                onChange={handleIsPrivateChange}
                            /><br></br>
                            <button className="button-18" id="create-chatroom" onClick={handleCreateChatroom}>Create Chatroom</button>
                        </Popup>
                    </Marker>
                }

                {points.map((pnts, index) => {
                    console.log(pnts)
                    return (
                        <Marker key={index} position={[pnts.latitude, pnts.longitude]} icon={pnts.isprivate === "YES" ? privateRoomIcon : publicRoomIcon}  >

                            <Popup>{
                                isdelete ?
                                    <div>
                                        <input
                                            type="text"
                                            className="inputbasic"
                                            onChange={handlesecretKeyChange}
                                            placeholder="Enter secret key"
                                        />
                                        <button id="delete-chatroombtn" className="button-18 del" onClick={() => {setChatroomdelete(pnts);setisdelete(false)}}>Delete Chatroom</button>
                                        <button id="delete-chatroombtn" className="button-18" onClick={() => {setisdelete(false)}}>Cancel</button>
                                    </div> :
                                    <div>
                                        <div className="chatroom-name-dialog">
                                            ChatRoom : {pnts.chatroomname}
                                        </div>
                                        <div className="chatroom-id-dialog">
                                            ID : #{pnts.chatroomjoinid}
                                        </div>
                                        <button id="join-chatroom" className="button-18" onClick={() => { setChatroomJoined(pnts) }}>Join Chatroom</button>
                                        <button id="delete-chatroom" className="button-18 del"onClick={() => setisdelete(true)}>Delete Chatroom</button>

                                        <div className="chatroom-name-dialog">
                                            Active users: {pnts.activeusers}
                                        </div>
                                    </div>
                            }
                            </Popup>
                        </Marker>
                    )
                })}
            </MapContainer>
        )
    }

    return (
        console.log("Data : ", data),
        <div className="results-container">
            <div className="result-heading">Available Chatrooms</div>
            {
                data != null ?
                    <MapComponent points={data} />
                    :
                    <div>
                        <h4>No Active chatrooms currently near you</h4>
                    </div>
            }
            <div className="actionitems" >
                {isModalOpen ?
                    <div>
                        <input className="button-findchatrooms" onChange={handlefindchatroomid} ></input>
                        <button className="button-findchatrooms" onClick={handleFindChatroms}>Find</button>
                        <button className="button-findchatrooms" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    </div>
                    :
                    <button className="button-findchatrooms" onClick={() => setIsModalOpen(true)} >
                        Find Private Chatrooms
                    </button>
                }
                {!isCreatingRoom ?
                    <button className="button-create" onClick={() => SetIsCreatingRoom(true)}>
                        Create Chatroom
                    </button> :
                    <button className="button-create" onClick={() => { SetIsCreatingRoom(false); setcreateChatRoomObj(null) }}>
                        Cancel
                    </button>
                }
            </div>
        </div>
    )
}


export default Results;