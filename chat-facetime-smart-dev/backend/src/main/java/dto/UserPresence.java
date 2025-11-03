package dto;

public class UserPresence {
    private String userId;
    private String username;
    private String fullName;
    private String status;
    private long lastSeen;

    public UserPresence() {}

    public UserPresence(String userId, String username, String fullName, String status, long lastSeen) {
        this.userId = userId;
        this.username = username;
        this.fullName = fullName;
        this.status = status;
        this.lastSeen = lastSeen;
    }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public long getLastSeen() { return lastSeen; }
    public void setLastSeen(long lastSeen) { this.lastSeen = lastSeen; }
}


