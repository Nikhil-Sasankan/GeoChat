package com.geochat.chat.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import com.geochat.chat.dto.ChatRoomDTO;
import com.geochat.chat.dto.ChatRoomPreferenceDTO;
import com.geochat.chat.dto.GetRoomsDTO;
import com.geochat.chat.dto.MessageDTO;
import com.geochat.chat.dto.SessionDTO;
import com.geochat.chat.model.Chatroom; 
import com.geochat.chat.model.User;
import com.geochat.chat.repo.ChatroomRepo;
import com.geochat.chat.repo.UserRepo;

@Component
public class ChatAppService {
	
	@Autowired
	UserRepo userrepo ;
	
	@Autowired
	ChatroomRepo chatroomrepo ;
	 

	public List<ChatRoomDTO> fetchChatRoomsAvailable(GetRoomsDTO getroomdto) {
		// Fetch the users geolocation
		
		User user = getroomdto.getUser();
		double userlatitude = user.getLatitude();
		double userlongitude = user.getLongitude();
		System.out.println("User latitude : " + userlatitude);
		System.out.println("User longitude : " + userlongitude);
		// Fetch the city code corresponding to the user geolocation
		
		// For the city fetched , we collect the list of chatrooms in the requred radius to show to the user
		List<Chatroom> cityChatRooms = chatroomrepo.findAll();	
		
		// Make a list of the chatrooms that are inactive since they they need to be deleted
		 Date currentDatetime = new Date(System.currentTimeMillis() - (24 * 60 * 60 * 1000)); // 1 day ago from current time
	     LocalDate currdatetime = currentDatetime.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
	     LocalDate localDate1PlusOneDay = currdatetime.minusDays(1);

	     // To store the id of the dates to be deleted
	     List<String> croomIDS = new ArrayList<>();
	     for (Chatroom chatroom : cityChatRooms) {
			LocalDate lastactive = chatroom.getLasttimeactive().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
			if(chatroom.getActiveusers()<=0 && lastactive.isBefore(localDate1PlusOneDay)) {
				// adding to the list to delet 
				croomIDS.add(chatroom.getChatroomjoinid());
				//removing from the process list
				cityChatRooms.remove(chatroom);
			}
	     }
	     chatroomrepo.deleteAllByjoinid(croomIDS);
		
		System.out.println("Chatrooms in city : "+ cityChatRooms.size());
		// Fetched the chatrooms in radius
		List<Chatroom> availablecityChatRooms = CalculationUtils.findNearbyChatRooms(userlatitude, userlongitude, cityChatRooms);
		List<ChatRoomDTO> res = new ArrayList<ChatRoomDTO>();
		ChatRoomDTO croom = null ;
		System.out.println(availablecityChatRooms.size());
		for (Chatroom chatroom : availablecityChatRooms) {
			if(chatroom.getIsprivate().equalsIgnoreCase("YES")) {
				continue;
			}
			croom = new ChatRoomDTO();
			croom.setActiveusers(chatroom.getActiveusers());
			croom.setChatroomid(chatroom.getChatroomid());
			croom.setChatroomname(chatroom.getChatroomname());
			croom.setChatroomowner(chatroom.getChatroomowner());
			croom.setLatitude(chatroom.getLatitude());
			croom.setLongitude(chatroom.getLongitude());
			croom.setChatroomjoinid(chatroom.getChatroomjoinid());
			croom.setIsprivate(chatroom.getIsprivate());
			res.add(croom);
		}		
		System.out.println("Chatrooms available in city : "+res.size());
		System.out.println(getroomdto.getRoomkey());
		// Adding the user requested private chatroom to the list 
		for (Chatroom rooms : cityChatRooms) {
			if(rooms.getChatroomjoinid().equals(getroomdto.getRoomkey())) {
				croom = new ChatRoomDTO();
				croom.setActiveusers(rooms.getActiveusers());
				croom.setChatroomid(rooms.getChatroomid());
				croom.setChatroomname(rooms.getChatroomname());
				croom.setChatroomowner(rooms.getChatroomowner());
				croom.setLatitude(rooms.getLatitude());
				croom.setLongitude(rooms.getLongitude());
				croom.setIsprivate(rooms.getIsprivate());
				croom.setChatroomjoinid(rooms.getChatroomjoinid());
				res.add(croom);
			}
		}
		return res ;
	}
	
	// Service to generate the data and other for creating the user session
	public SessionDTO setuserSession(ChatRoomPreferenceDTO chatroompreference) {
		ChatRoomDTO preferredchatroom = chatroompreference.getChatroomdetails();
		int prefChatroomid = preferredchatroom.getChatroomid();
		 
		User user = chatroompreference.getUserdetails();
		user.setChatroomid(prefChatroomid);
		// set the time the user was created
		Date createtime = new Date();
		user.setCreatetime(createtime);
		user.setIsactive("true");
		user.setLastactivetime(createtime);
		
		// Saving the user data to the user tables 
		User saveduser = userrepo.save(user);
		System.out.println("User data saved ");
		
		// also will increment the active user count in the chatroom table 
		chatroomrepo.incrementactiveusers(prefChatroomid);
		System.out.println("Chat room user incremented");
		
		SessionDTO createdsessiondata = new SessionDTO();
		UUID uuid = UUID.randomUUID();
        String uniqueId = uuid.toString();
		createdsessiondata.setSessionKey(uniqueId);
		
		// Return back the saved deatils to the UI
		createdsessiondata.setUserdata(saveduser);
		System.out.println(createdsessiondata.toString());
		return createdsessiondata ;
	}

	public void usermessageValidation(MessageDTO message) throws Exception {
		String chatroomid = message.getChatroomid();
		String username = message.getSenderName();
		// Verify if the user has created a session for the chatroom he is sending message to 
		System.out.println("User : "+username+"-----> Roomid : "+chatroomid + " ;-> "+message.getMessage());
		List<User> users =  userrepo.ifUserValidforChatRoom(chatroomid,username);
		if(users.isEmpty()) { 
			throw new Exception("The users is of invalid session");
		}
		System.out.println("User is valid");
	}

	// API to create a chatroom for user 
	public Chatroom createchatroom(Chatroom chatroom) {
		chatroom.setCreatetime(new Date());
		chatroom.setLasttimeactive(new Date());
		chatroom.setActiveusers(0);
		
		UUID uuid = UUID.randomUUID();
        String uniqueId = uuid.toString();
		chatroom.setChatroomjoinid(uniqueId);
		
		Chatroom createdChatroom = chatroomrepo.save(chatroom);
		System.out.println("Saved successfully");
		return createdChatroom;
	}

	public String deletechatrooms(Chatroom chatroom) throws Exception {
		String deteroomid = chatroom.getChatroomjoinid();
		Chatroom crm = chatroomrepo.findbyjoin(deteroomid);
		System.out.println("USer key : "+chatroom.getSecretKey());
		System.out.println("Origianl : "+crm.getSecretKey());
		
		if(!crm.getSecretKey().equals(chatroom.getSecretKey())) {
			System.out.println("Invalid key");
			throw new Exception("Invalid secret key");
		}
		List<String> deletionrooomids = new ArrayList<>();
		deletionrooomids.add(deteroomid);
		chatroomrepo.deleteAllByjoinid(deletionrooomids);
		return "Deletion successfull";
	}
}
