package service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import dto.UserPresence;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class RedisPresenceService implements PresenceService {

    private final StringRedisTemplate redis;
    private final ObjectMapper mapper = new ObjectMapper();

    private final boolean enabled;

    public RedisPresenceService(StringRedisTemplate redis,
                                @Value("${presence.redis.enabled:false}") boolean enabled) {
        this.redis = redis;
        this.enabled = enabled;
    }

    private String key(String roomId) {
        return "presence:" + roomId;
    }

    @Override
    public void addOrUpdate(String roomId, UserPresence user) {
        if (!enabled || redis == null) return;
        try {
            String json = mapper.writeValueAsString(user);
            redis.opsForHash().put(key(roomId), user.getUserId(), json);
        } catch (JsonProcessingException e) {
            // ignore serialization error
        }
    }

    @Override
    public void remove(String roomId, String userId) {
        if (!enabled || redis == null) return;
        redis.opsForHash().delete(key(roomId), userId);
    }

    @Override
    public List<UserPresence> list(String roomId) {
        if (!enabled || redis == null) return List.of();
        HashOperations<String, Object, Object> ops = redis.opsForHash();
        Map<Object, Object> all = ops.entries(key(roomId));
        List<UserPresence> result = new ArrayList<>();
        for (Object v : all.values()) {
            if (v instanceof String s) {
                try {
                    result.add(mapper.readValue(s, UserPresence.class));
                } catch (Exception ignore) {}
            }
        }
        return result;
    }
}


