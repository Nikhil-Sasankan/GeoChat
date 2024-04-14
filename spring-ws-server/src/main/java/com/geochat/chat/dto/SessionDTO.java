package com.geochat.chat.dto;

import java.util.List;

import com.geochat.chat.model.User;

import lombok.Data;

@Data
public class SessionDTO {
	private User userdata ;
	private String sessionKey ;
	private List<MessageDTO> oldermessages;
}
