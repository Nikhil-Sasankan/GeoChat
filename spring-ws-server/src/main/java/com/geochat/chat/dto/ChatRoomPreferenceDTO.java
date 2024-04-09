package com.geochat.chat.dto;


import com.geochat.chat.model.User;

@lombok.Data
public class ChatRoomPreferenceDTO {
	private User userdetails ;
	private ChatRoomDTO chatroomdetails ;
}
