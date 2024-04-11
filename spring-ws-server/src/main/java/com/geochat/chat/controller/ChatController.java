package com.geochat.chat.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
import com.geochat.chat.dto.ResponseBody;
import com.geochat.chat.dto.SessionDTO;
import com.geochat.chat.model.Chatroom; 
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
    public ResponseEntity<ResponseBody> getavailableroom(@RequestBody GetRoomsDTO getroomsdto) {
    	List<ChatRoomDTO> result = null;
    	ResponseBody body = null;
    	ResponseEntity<ResponseBody> resp = null;
    	System.out.println("Fetching available chatrooms for the user...");
    	try {
    		result = service.fetchChatRoomsAvailable(getroomsdto);
    		body = new ResponseBody("Success", HttpStatus.OK.toString(), "Successfully fetched nearby chatrooms", result);
    		resp = new ResponseEntity<ResponseBody>(body, HttpStatus.OK);
		} catch (Exception e) {
			System.out.println(e.getMessage());
			body = new ResponseBody("Failed", HttpStatus.BAD_REQUEST.toString(), "Failed to fetch available chatrooms.",null);
    		resp = new ResponseEntity<ResponseBody>(body, HttpStatus.BAD_REQUEST);
		}
		return resp;
    }
    
    /***
     * Once the user sets a prefereend chatroom , the chatroom details and the user details are sent back
     * then the API creates the user profile in the DB with this and provides the session key for further
     * 
     */
    @PostMapping(value = "/createusersession")
    public ResponseEntity<ResponseBody> createUserSession(@RequestBody ChatRoomPreferenceDTO chatroompreference) {
    	SessionDTO result = null;
    	ResponseBody body = null;
    	ResponseEntity<ResponseBody> resp = null;
    	System.out.println("Fetching available chatrooms for the user...");
    	try {
    		result = service.setuserSession(chatroompreference);
    		body = new ResponseBody("Success", HttpStatus.OK.toString(), "Successfully created user session", result);
    		resp = new ResponseEntity<ResponseBody>(body, HttpStatus.OK);
    	}catch (Exception e) {
    		System.out.println(e.getMessage());
			body = new ResponseBody("Failed", HttpStatus.BAD_REQUEST.toString(), "Failed to create a user session.",null);
			resp = new ResponseEntity<ResponseBody>(body, HttpStatus.BAD_REQUEST);
 		}
		return resp;
    }
    
    
    
    /***
     * To create a chatroom of preference with the given name and other data
     * 
     */
    @PostMapping(value = "/createchatroom")
    public ResponseEntity<ResponseBody> createChatRooms(@RequestBody Chatroom chatroom) {
    	Chatroom result = null;
    	ResponseBody body = null;
    	ResponseEntity<ResponseBody> resp = null;
    	System.out.println("Creating the required chatroom...");
    	try {
    		result = service.createchatroom(chatroom);
    		body = new ResponseBody("Success", HttpStatus.OK.toString(), "Successfully created chatroom", result);
    		resp = new ResponseEntity<ResponseBody>(body, HttpStatus.OK);
    	}catch (Exception e) {
    		System.out.println(e.getMessage());
			body = new ResponseBody("Failed", HttpStatus.BAD_REQUEST.toString(), "Failed to create a chatroom.",null);
			resp = new ResponseEntity<ResponseBody>(body, HttpStatus.BAD_REQUEST);
 		}
		return resp;
    }
    
    /***
     * To delete a chatroom of preference 
     */
    @PostMapping(value = "/deletechatroom")
    public ResponseEntity<ResponseBody> deleteChatRooms(@RequestBody Chatroom chatroom){
    	System.out.println("delete Chatroom API called");
    	String result = null;
    	ResponseBody body = null;
    	ResponseEntity<ResponseBody> resp = null;
    	System.out.println("Creating the required chatroom...");
    	try {
    		result = service.deletechatrooms(chatroom);
    		body = new ResponseBody("Success", HttpStatus.OK.toString(), "Successfully delete chatroom", result);
    		resp = new ResponseEntity<ResponseBody>(body, HttpStatus.OK);
    	}catch (Exception e) {
    		System.out.println(e.getMessage());
			body = new ResponseBody("Failed", HttpStatus.BAD_REQUEST.toString(), "Failed to delete chatroom.",null);
			resp = new ResponseEntity<ResponseBody>(body, HttpStatus.BAD_REQUEST);
 		}
    	return resp;
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
    	System.out.println("Validating user message");
    	try {
    		service.usermessageValidation(message);
    		System.out.println("Validated user message");
    	}catch (Exception e) {
    		System.out.println("Invalid message");
			return null;
		}
    	String chatroomName = message.getChatroomid();
    	simpMessagingTemplate.convertAndSend("/chatroom/public/"+chatroomName, message);
    	System.out.println("Message : "+message.getMessage()+" sent to "+message.getChatroomid());
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
