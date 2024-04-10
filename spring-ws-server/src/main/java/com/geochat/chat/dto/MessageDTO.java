package com.geochat.chat.dto;

import lombok.*;
import com.geochat.chat.model.Status;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class MessageDTO {
    private String senderName;
    private String receiverName;
    private String message;
    private String date;
    private Status status;
    private String chatroomid;
}
