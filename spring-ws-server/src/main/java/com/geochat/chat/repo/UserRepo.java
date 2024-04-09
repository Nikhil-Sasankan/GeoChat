package com.geochat.chat.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.geochat.chat.model.User;

@Repository
public interface UserRepo extends JpaRepository<User, Integer> {

	@Query(value="select * from user u where u.chatroomid = :croomid and u.username = :uid",nativeQuery = true)
	List<User> ifUserValidforChatRoom(@Param("croomid")String chatroomid,@Param("uid")String uid);

}
