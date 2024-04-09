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
@Table(name = "user")
public class User {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int userid ;
	private Date createtime;
	private Date lastactivetime;
	private String username;
	private String useruniqueid;
	private int chatroomid;
	private String isactive;
	private double latitude;
	private double longitude;
}