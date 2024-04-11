package com.geochat.chat.repo;

import java.util.List;

import javax.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.geochat.chat.model.User;

@Repository
public interface UserRepo extends JpaRepository<User, Integer> {

	@Query(value="select * from user u where u.chatroomid = :croomid and u.username = :uid",nativeQuery = true)
	User ifUserValidforChatRoom(@Param("croomid")String chatroomid,@Param("uid")String uid);

	@Query(value="select * from user u where u.chatroomid = :croomid ",nativeQuery = true)
	List<User> findAllByChatroomJoinId(@Param("croomid")int ids);

	@Transactional
	@Modifying
	@Query(value="DELETE from user u WHERE u.userid in :ids ",nativeQuery = true)
	void deleteAllByUserid(@Param("ids")List<String> userids);
 

}
