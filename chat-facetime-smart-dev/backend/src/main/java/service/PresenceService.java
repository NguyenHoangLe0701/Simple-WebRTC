package service;

import dto.UserPresence;
import java.util.List;

public interface PresenceService {
    void addOrUpdate(String roomId, UserPresence user);
    void remove(String roomId, String userId);
    List<UserPresence> list(String roomId);
}


