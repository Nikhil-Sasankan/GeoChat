package com.geochat.chat.dto;

import lombok.*;

import java.util.Date;

import com.geochat.chat.model.Status;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class MessageDTO {
    private String senderName;
    private String senderid; 
    private String receiverName;
    private String message;
    private String date;
    private Status status;
    private String chatroomid;
    private String messagetype;
    private String selectedProfile;
}
