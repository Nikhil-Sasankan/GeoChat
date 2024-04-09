package com.geochat.chat.dto;

import lombok.Data;

@Data
public class ChatRoomDTO {
	private int chatroomid;
	private String chatroomname;
	private double latitude;
	private double longitude;
	private int activeusers;
	private String chatroomowner;
	private String chatroomjoinid;
	private String isprivate;
}

