package com.geochat.chat.service;

import java.util.ArrayList;
import java.util.List;

import com.geochat.chat.model.Chatroom;

public class CalculationUtils {
	// Earth radius in meters
    private static final double EARTH_RADIUS = 6371000; // in meters
    
    // Function to calculate distance between two points using Haversine formula
    public static double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        // Convert latitude and longitude from degrees to radians
        double lat1Rad = Math.toRadians(lat1);
        double lon1Rad = Math.toRadians(lon1);
        double lat2Rad = Math.toRadians(lat2);
        double lon2Rad = Math.toRadians(lon2);

        // Calculate differences in latitude and longitude
        double deltaLat = lat2Rad - lat1Rad;
        double deltaLon = lon2Rad - lon1Rad;

        // Calculate Haversine formula
        double a = Math.pow(Math.sin(deltaLat / 2), 2) +
                   Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                   Math.pow(Math.sin(deltaLon / 2), 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = EARTH_RADIUS * c;

        return distance; // Distance in meters
    }

    // Function to calculate the range for searching nearby chat rooms
    public static double calculateSearchRange(double lat, double lon) {
        return 1000000; // Range in meters
    }
    
    // Function to find nearby chat rooms within the specified range
    public static List<Chatroom> findNearbyChatRooms(double lat, double lon, List<Chatroom> chatRooms) {
        double searchRange = calculateSearchRange(lat, lon);
    
        // Fetch all for city wise ...
        List<Chatroom> nearbyChatRooms = new ArrayList<>();
        for (Chatroom chatRoom : chatRooms) {
        	System.out.println("geolocation of "+chatRoom.getChatroomname()+" -- "+chatRoom.getLatitude()+":"+ chatRoom.getLongitude());
            double distance = calculateDistance(lat, lon, chatRoom.getLatitude(), chatRoom.getLongitude());
            if (distance <= searchRange) {
                nearbyChatRooms.add(chatRoom);
            }
        }
        return nearbyChatRooms;
    }
}
