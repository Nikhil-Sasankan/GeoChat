package com.geochat.chat.dto;

import com.geochat.chat.model.User;

import lombok.Data;
@Data
public class GetRoomsDTO {
	User user;
	String roomkey;

}
