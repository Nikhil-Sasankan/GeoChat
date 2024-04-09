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
@Table(name="message")
public class Message {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int messageid;
	
	private String userid ;
	private String chatroomid ;
	private String messagetype ;
	private Date timesent;
	private String messagerefer;
	private String messagecontent;
	
}
