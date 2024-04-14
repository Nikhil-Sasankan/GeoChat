package com.geochat.chat.repo;

import java.util.List;

import javax.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.geochat.chat.model.Message;

@Repository
public interface MessageRepo extends JpaRepository<Message, Integer> {

	@Query(value="select * from message ms where ms.chatroomid = :cid",nativeQuery = true)
	List<Message> findAllbyChatrooomid(@Param("cid")int chatroomid);

	@Transactional
	@Modifying
	@Query(value="DELETE from message ms WHERE ms.chatroomid in :cid ",nativeQuery = true)
	void deleteAllforChatroom(@Param("cid")List<String> croomIDS);

}
