package com.geochat.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ResponseBody {
	private String status;
	private String statusCode ;
	private String message ;
	private Object data;
}
