package com.geochat.chat.dto;

import com.geochat.chat.model.User;

import lombok.Data;

@Data
public class SessionDTO {
	private User userdata ;
	private String sessionKey ;
}
