package com.geochat.chat.repo;

import java.util.List; 

import javax.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.geochat.chat.model.Chatroom;

@Repository
public interface ChatroomRepo extends JpaRepository<Chatroom, Integer> {
 

	@Transactional
	@Modifying
	@Query(value="UPDATE chatroom cr SET cr.activeusers = cr.activeusers + 1 WHERE cr.chatroomid = :chatrmid ",nativeQuery = true)
	void incrementactiveusers(@Param("chatrmid") int prefChatroomid);

	@Query(value="select * from chatroom cr where citycode = :usercitycode",nativeQuery = true)
	List<Chatroom> findAllbyCityCode(@Param("usercitycode") String citycode);

	@Query(value="select * from chatroom cr where chatroomid = :cid",nativeQuery = true)
	Chatroom findBychatroomId(@Param("cid")int chatroomid);

	@Transactional
	@Modifying
	@Query(value="DELETE from chatroom cr WHERE cr.chatroomjoinid in :joinids ",nativeQuery = true)
	void deleteAllByjoinid(@Param("joinids")List<String> croomIDS);

	@Query(value="select * from chatroom cr where cr.chatroomjoinid = :cid",nativeQuery = true)
	Chatroom findbyjoin(@Param("cid")String deteroomid);

	@Transactional
	@Modifying
	@Query(value="UPDATE chatroom cr SET cr.activeusers = cr.activeusers - 1 WHERE cr.chatroomid = :chatrmid ",nativeQuery = true)
	void decrementActiveUsercount(@Param("chatrmid")int chatroomid);

}
