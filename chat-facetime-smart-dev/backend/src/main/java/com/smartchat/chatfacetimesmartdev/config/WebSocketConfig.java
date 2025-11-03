package com.smartchat.chatfacetimesmartdev.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

  @Value("${stomp.relay.enabled:false}")
  private boolean relayEnabled;

  @Value("${stomp.relay.host:}")
  private String relayHost;

  @Value("${stomp.relay.port:61613}")
  private Integer relayPort;

  @Value("${stomp.relay.login:}")
  private String relayLogin;

  @Value("${stomp.relay.passcode:}")
  private String relayPasscode;

  @Override
  public void configureMessageBroker(MessageBrokerRegistry config) {
    if (relayEnabled && relayHost != null && !relayHost.isBlank()) {
      // Use external broker relay (RabbitMQ/ActiveMQ over STOMP)
      config.enableStompBrokerRelay("/topic", "/queue", "/room")
            .setRelayHost(relayHost)
            .setRelayPort(relayPort != null ? relayPort : 61613)
            .setClientLogin(relayLogin)
            .setClientPasscode(relayPasscode)
            .setSystemLogin(relayLogin)
            .setSystemPasscode(relayPasscode);
    } else {
      // Fallback to in-memory simple broker
      config.enableSimpleBroker("/topic","/room","/queue");
    }
    config.setApplicationDestinationPrefixes("/app");
    config.setUserDestinationPrefix("/user");
  }

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();
  }
}
