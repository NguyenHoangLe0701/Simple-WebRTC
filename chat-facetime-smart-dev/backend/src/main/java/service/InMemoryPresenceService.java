package service;

import dto.UserPresence;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class InMemoryPresenceService implements PresenceService {
    // roomId -> (userId -> presence)
    private final Map<String, Map<String, UserPresence>> store = new ConcurrentHashMap<>();

    @Override
    public void addOrUpdate(String roomId, UserPresence user) {
        store.computeIfAbsent(roomId, k -> new ConcurrentHashMap<>()).put(user.getUserId(), user);
    }

    @Override
    public void remove(String roomId, String userId) {
        Map<String, UserPresence> map = store.getOrDefault(roomId, Collections.emptyMap());
        map.remove(userId);
    }

    @Override
    public List<UserPresence> list(String roomId) {
        return new ArrayList<>(store.getOrDefault(roomId, Collections.emptyMap()).values());
    }
}


