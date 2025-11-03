package com.smartchat.chatfacetimesmartdev.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.StringRedisTemplate;
import service.InMemoryPresenceService;
import service.PresenceService;
import service.RedisPresenceService;

@Configuration
public class PresenceConfig {

  @Bean
  public PresenceService presenceService(StringRedisTemplate redisTemplate,
                                         @Value("${presence.redis.enabled:false}") boolean redisEnabled) {
    if (redisEnabled && redisTemplate != null) {
      return new RedisPresenceService(redisTemplate, true);
    }
    return new InMemoryPresenceService();
  }
}


