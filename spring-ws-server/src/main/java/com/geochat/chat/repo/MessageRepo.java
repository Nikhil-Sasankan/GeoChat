package com.geochat.chat.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.geochat.chat.model.Message;

@Repository
public interface MessageRepo extends JpaRepository<Message, Integer> {

}
