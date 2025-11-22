# Dockerfile cho Coturn TURN Server
# Chỉ dùng nếu bạn muốn self-host TURN server
# Khuyến nghị: Dùng Metered.ca (miễn phí, dễ setup hơn)

FROM coturn/coturn:latest

# Copy configuration file
COPY turnserver.conf /etc/turnserver.conf

# Expose TURN server ports
EXPOSE 3478/tcp 3478/udp
EXPOSE 49152-65535/udp

# Run coturn
CMD ["turnserver", "-c", "/etc/turnserver.conf"]

