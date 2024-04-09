package com.geochat.chat.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.geochat.chat.dto.ChatRoomDTO;
import com.geochat.chat.dto.ChatRoomPreferenceDTO;
import com.geochat.chat.dto.GetRoomsDTO;
import com.geochat.chat.dto.MessageDTO;
import com.geochat.chat.dto.SessionDTO;
import com.geochat.chat.model.Chatroom;
import com.geochat.chat.model.Message;
import com.geochat.chat.model.User;
import com.geochat.chat.service.ChatAppService;

@RestController
public class ChatController {

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;
    
    @Autowired
    ChatAppService service;

    
	/***
	 * UI --> sends the object containing required userdetails , as of now simply location services required
	 * uses the location to find all the nearby available chatrooms and send the list of chatroom data to UI
	 * data contains , chatroomname , chatroomid , geolocation of chatroom
	 * UI will let user to select the required chatroom and send back the preference from user
	 */
    @PostMapping(value = "/getavailablerooms")
    public List<ChatRoomDTO> getUserData(@RequestBody GetRoomsDTO getroomsdto) {
    	try {
    		System.out.println("Fetching the chatrooms");
    		return service.fetchChatRoomsAvailable(getroomsdto);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null; 
    }
    
    /***
     * Once the user sets a prefereend chatroom , the chatroom details and the user details are sent back
     * then the API creates the user profile in the DB with this and provides the session key for further
     * 
     */
    @PostMapping(value = "/createusersession")
    public SessionDTO createUserSession(@RequestBody ChatRoomPreferenceDTO chatroompreference) {
    	SessionDTO createdsession = service.setuserSession(chatroompreference);
		return createdsession;
    }
    
    
    
    /***
     * Once the user sets a prefereend chatroom , the chatroom details and the user details are sent back
     * then the API creates the user profile in the DB with this and provides the session key for further
     * @return 
     * 
     */
    @PostMapping(value = "/createchatroom")
    public Chatroom createChatRooms(@RequestBody Chatroom chatroom) {
    	System.out.println("Create Chatroom API called");
    	return service.createchatroom(chatroom);
    }
    
    
    /***
     * Here once get the user message from the UI , we send to the registerer chatroom , 
     * after we verify that he indeed belongs to that chatroom
     * @throws Exception 
     * 
     */
    // API websocket that handles messages
    @MessageMapping("/message")
    public MessageDTO receiveMessage(@Payload MessageDTO message) throws Exception{
    	String chatroomName = message.getChatroomid();
    	// to this API , simple message is transferred as object , will need validate the user
    	// and other process  finall then decide that his message will go to which chatroom 
    	Message usermessage = new Message();
    	usermessage.setChatroomid(chatroomName);
    	usermessage.setMessagecontent(message.getMessage());
    	usermessage.setUserid(message.getSenderName());
    	service.usermessageValidation(usermessage);
    	
    	// fetches the Message that is added , checks the user who sent it , 
    	// if the user is in active session and if the user is allowed to send in the chatroom mentioned in the message 
    
    	// saving of the message is also done 	
    	simpMessagingTemplate.convertAndSend("/chatroom/public/"+chatroomName, message);
        return message;
    }

    
    
    
    
    
    
    
    
    // API websocket that handles messages
    @MessageMapping("/private-message")
    public MessageDTO recMessage(@Payload MessageDTO message){
    	String chatroomName = message.getChatroomid();
    	System.out.println("Private mesasage to "+ message.getReceiverName()+" on chat group "+message.getChatroomid());
    	// to this API , simple message is transferred as object , will need validate the user
    	// and other process  finall then decide that his message will go to which chatroom 
    	// fetches the Message that is added , checks the user who sent it , 
    	// if the user is in active session and if the user is allowed to send in the chatroom mentioned in the message  	
    	// saving of the message is also done 
    	// once all the verify is done , the message is transferred to the chatroom which was said 
        simpMessagingTemplate.convertAndSendToUser(message.getReceiverName(),"/private"+chatroomName,message);
        return message;
    }
}
