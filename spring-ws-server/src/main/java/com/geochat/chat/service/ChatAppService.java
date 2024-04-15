package com.geochat.chat.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit; 
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
import com.geochat.chat.model.Message;
import com.geochat.chat.model.Status;
import com.geochat.chat.model.User;
import com.geochat.chat.repo.ChatroomRepo;
import com.geochat.chat.repo.MessageRepo;
import com.geochat.chat.repo.UserRepo;

@Component
public class ChatAppService {
	@Autowired
	UserRepo userrepo;
	@Autowired
	MessageRepo messagerepo;
	@Autowired
	ChatroomRepo chatroomrepo;

	public List<ChatRoomDTO> fetchChatRoomsAvailable(GetRoomsDTO getroomdto) {
		// Fetch the users geolocation
		User user = getroomdto.getUser();
		double userlatitude = user.getLatitude();
		double userlongitude = user.getLongitude();
		System.out.println("User latitude : " + userlatitude);
		System.out.println("User longitude : " + userlongitude);
		// Fetch the city code corresponding to the user geolocation

		// For the city fetched , we collect the list of chatrooms in the requred radius
		// to show to the user
		List<Chatroom> cityChatRooms = chatroomrepo.findAll();
		// Before making the List we preprocess data to remove the inactive session data
		cityChatRooms = cleanInactiveSessions(cityChatRooms);

		System.out.println("Chatrooms total in datastore : " + cityChatRooms.size());
		// Fetched the chatrooms in radius according to the provided geoloaction
		List<Chatroom> availablecityChatRooms = CalculationUtils.findNearbyChatRooms(userlatitude, userlongitude,
				cityChatRooms);
		List<ChatRoomDTO> res = new ArrayList<ChatRoomDTO>();
		ChatRoomDTO croom = null;
		System.out.println("Chatrooms total in user vicinity : "+availablecityChatRooms.size());
		List<User> userspresent = null;
		List<String> usernamesList = null;
		for (Chatroom chatroom : availablecityChatRooms) {
			if (chatroom.getIsprivate()!= null && chatroom.getIsprivate().equalsIgnoreCase("YES")) {
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

			// Fetching the usernames in the chatroom already and making a username list
			userspresent = userrepo.findAllByChatroomJoinId(chatroom.getChatroomid());
			usernamesList = new ArrayList<>();
			for (User userNames : userspresent) {
				usernamesList.add(userNames.getUsername());
			}
			croom.setUserspresent(usernamesList);
			res.add(croom);
		}
		System.out.println("Chatrooms available in vicinity : " + res.size());
		System.out.println("Additional chatrooms to fetch : "+getroomdto.getRoomkey());
		// Adding the user requested private chatroom to the list and this is
		// irrespective of the location
		for (Chatroom rooms : cityChatRooms) {
			if (rooms.getChatroomjoinid().equals(getroomdto.getRoomkey())) {
				croom = new ChatRoomDTO();
				croom.setActiveusers(rooms.getActiveusers());
				croom.setChatroomid(rooms.getChatroomid());
				croom.setChatroomname(rooms.getChatroomname());
				croom.setChatroomowner(rooms.getChatroomowner());
				croom.setLatitude(rooms.getLatitude());
				croom.setLongitude(rooms.getLongitude());
				croom.setIsprivate(rooms.getIsprivate());
				croom.setChatroomjoinid(rooms.getChatroomjoinid());

				// Fetching the usernames in the chatroom already and making a username list
				userspresent = userrepo.findAllByChatroomJoinId(rooms.getChatroomid());
				usernamesList = new ArrayList<>();
				for (User userNames : userspresent) {
					usernamesList.add(userNames.getUsername());
				} 
				croom.setUserspresent(usernamesList);
				res.add(croom);
			}
		}
		System.out.println("Final Result size "+ res.size());
		return res;
	}

	// API to clean the inactive sessions for both the user and the chatrooms
	public List<Chatroom> cleanInactiveSessions(List<Chatroom> cityChatRooms) {
		Date currentDatetime = new Date(); // 1 day ago from current
																								// time
		LocalDate currdate = currentDatetime.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
		LocalDate localDate1minusOneDay = currdate.minusDays(1);
		
		LocalDateTime currdatetime = currentDatetime.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime();
		LocalDateTime localDateminusFiveMisutes = currdatetime.minus(5, ChronoUnit.MINUTES);

		List<String> userids = new ArrayList<>();
		// Fetches the complete list of data from the users tables
		List<User> userList = userrepo.findAll(); 
//		System.out.println(userList.toString());
		for (User user : userList) {
			LocalDateTime userlastactivetime = user.getLastactivetime().toInstant().atZone(java.time.ZoneId.systemDefault())
					.toLocalDateTime();
//			System.out.println("User last active time : "+userlastactivetime);
//			System.out.println("Current time : "+localDateminusFiveMisutes);
			if (userlastactivetime.isBefore(localDateminusFiveMisutes)) {
				userids.add(user.getUserid() + "");
				chatroomrepo.decrementActiveUsercount(user.getChatroomid());
			}
		}
		// once all the users fetches , remove the data
		userrepo.deleteAllByUserid(userids);

		// To store the id of the dates to be deleted
		List<String> croomIDS = new ArrayList<>();
		List<String> chatroomUID = new ArrayList<>();
		for (Chatroom chatroom : cityChatRooms) {
			LocalDate lastactive = chatroom.getLasttimeactive().toInstant().atZone(java.time.ZoneId.systemDefault())
					.toLocalDate();
			if (chatroom.getActiveusers() <= 0 && lastactive.isBefore(localDate1minusOneDay)) {
				// adding to the list to delete
				croomIDS.add(chatroom.getChatroomjoinid());
				chatroomUID.add(chatroom.getChatroomid()+"");
				// removing from the process list
				cityChatRooms.remove(chatroom);
			}
		}
		
		// Deleteing all the messages for that room
		messagerepo.deleteAllforChatroom(chatroomUID);
		// deleteing all the inactive chatroom
		chatroomrepo.deleteAllByjoinid(croomIDS);

		// returning the new list after deleting all the unwanted data
		return cityChatRooms;
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
		System.out.println("Chat room user count incremented");
		
		// Fetching all the older messages for this chatroom
		List<Message> msgs = messagerepo.findAllbyChatrooomid(prefChatroomid); 
		List<MessageDTO> oldermess = new ArrayList<>();
		
		// fromat
		DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("E h:mm a");
		
		
		for (Message messages : msgs) {
			MessageDTO msdto = new MessageDTO();
			msdto.setChatroomid(prefChatroomid+"");
			
			LocalDateTime msgtime = messages.getTimesent().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime();
			
			msdto.setDate(msgtime.format(timeFormatter));
			msdto.setMessage(messages.getMessagecontent());
			msdto.setMessagetype(messages.getMessagetype());
			msdto.setReceiverName(messages.getReceiverName());
			msdto.setSelectedProfile(messages.getSelectedprofile());
			msdto.setSenderid("");
			msdto.setSenderName(messages.getUsername());
			oldermess.add(msdto);
		}

		SessionDTO createdsessiondata = new SessionDTO();
		UUID uuid = UUID.randomUUID();
		String uniqueId = uuid.toString();
		createdsessiondata.setSessionKey(uniqueId);

		// Return back the saved deatils to the UI
		createdsessiondata.setUserdata(saveduser);
		createdsessiondata.setOldermessages(oldermess);
		System.out.println(createdsessiondata.toString());
		return createdsessiondata;
	}

	public void usermessageValidation(MessageDTO message) throws Exception {
		String chatroomid = message.getChatroomid();
		String username = message.getSenderName();
		// Verify if the user has created a session for the chatroom he is sending
		// message to
		//System.out.println("User : " + username + "-----> Roomid : " + chatroomid + " ;-> " + message.getMessage());
		User users = userrepo.ifUserValidforChatRoom(chatroomid, username);
		if (users == null) {
			throw new Exception("The users is of invalid session");
		}
		// incase user is valid, then update is lastactive time 
		users.setLastactivetime(new Date());
		// Also create a message save in the DB
		Message savemessage = new Message();
		savemessage.setChatroomid(message.getChatroomid());
		if(message.getStatus().equals(Status.JOIN)||message.getMessage()==null) {
			return;
		}
		savemessage.setMessagecontent(message.getMessage()); 
		savemessage.setMessagerefer("");
		savemessage.setMessagetype(message.getMessagetype());
		savemessage.setSelectedprofile(message.getSelectedProfile());
		savemessage.setTimesent(new Date()); 
		savemessage.setUsername(message.getSenderName());
		messagerepo.save(savemessage);
		
		
		DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("E h:mm a");
		LocalDateTime msgtime = (new Date()).toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime();
		message.setDate(msgtime.format(timeFormatter));
		
		userrepo.save(users);
		System.out.println("User is valid");
	}

	// API to create a chatroom for user
	public Chatroom createchatroom(Chatroom chatroom) {
		chatroom.setCreatetime(new Date());
		chatroom.setLasttimeactive(new Date());
		chatroom.setActiveusers(0);
		if(chatroom.getIsprivate()==null) {
			chatroom.setIsprivate("NO");
		}

		UUID uuid = UUID.randomUUID();
		String uniqueId = uuid.toString();
		chatroom.setChatroomjoinid(uniqueId);

		Chatroom createdChatroom = chatroomrepo.save(chatroom);
		System.out.println("Saved chatroom data successfully");
		return createdChatroom;
	}

	public String deletechatrooms(Chatroom chatroom) throws Exception {
		String deteroomid = chatroom.getChatroomjoinid();
		Chatroom crm = chatroomrepo.findbyjoin(deteroomid);
//		System.out.println("User Key : " + chatroom.getSecretKey());
//		System.out.println("Original Key : " + crm.getSecretKey());

		if (!crm.getSecretKey().equals(chatroom.getSecretKey())) {
//			System.out.println("Invalid key");
			throw new Exception("Invalid secret key: Failed to delete chatroom");
		}
		List<String> deletionrooomids = new ArrayList<>();
		deletionrooomids.add(deteroomid);
		chatroomrepo.deleteAllByjoinid(deletionrooomids);
		return "Deletion successfull";
	}
}
