package com.geochat.chat.model;

import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import org.springframework.stereotype.Component;

import lombok.Data;

@Data
@Component
@Entity
@Table(name = "chatroom")
public class Chatroom {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int chatroomid;
	private String chatroomname;
	private Date createtime;
	private Date lasttimeactive;
	private Date deletetime;
	private double latitude;
	private double longitude;
	private String secretKey;
	private String citycode;
	private String statecode;
	private int activeusers;
	private String chatroomowner;
	private String chatroomjoinid;
	private String isprivate;
}
