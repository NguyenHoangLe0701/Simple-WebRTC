package com.smartchat.chatfacetimesmartdev.exception;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    // ===== 1xxx - Success =====
    SUCCESS("1000", "Success", HttpStatus.OK),

    // ===== 2xxx - Client errors =====
    VALIDATION_ERROR("2001", "Validation failed", HttpStatus.BAD_REQUEST),
    BAD_REQUEST("2002", "Bad request", HttpStatus.BAD_REQUEST),
    METHOD_NOT_ALLOWED("2003", "HTTP method not allowed", HttpStatus.METHOD_NOT_ALLOWED),
    UNSUPPORTED_MEDIA_TYPE("2004", "Unsupported media type", HttpStatus.UNSUPPORTED_MEDIA_TYPE),
    MISSING_REQUIRED_FIELD("2005", "Missing required field", HttpStatus.BAD_REQUEST),
    INVALID_EMAIL_FORMAT("2006", "Email format is invalid", HttpStatus.BAD_REQUEST),
    PASSWORD_TOO_SHORT("2007", "Password must be at least 8 characters", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID_FORMAT("2008", "Password must include uppercase, lowercase, number, and special character", HttpStatus.BAD_REQUEST),
    AGE_TOO_YOUNG("2009", "User must be at least 18 years old", HttpStatus.BAD_REQUEST),
    PHONE_INVALID_FORMAT("2010", "Phone number must be 10-12 digits", HttpStatus.BAD_REQUEST),
    TOO_MANY_REQUESTS("2011", "Too many requests", HttpStatus.TOO_MANY_REQUESTS),

    // ===== 3xxx - Auth & User related =====
    USER_NOT_FOUND("3001", "User not found", HttpStatus.NOT_FOUND),
    USER_ALREADY_EXISTS("3002", "User already exists", HttpStatus.BAD_REQUEST),
    INVALID_CREDENTIALS("3003", "Invalid username or password", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED("3004", "Unauthorized access", HttpStatus.UNAUTHORIZED),
    ACCESS_DENIED("3005", "Access denied", HttpStatus.FORBIDDEN),
    TOKEN_EXPIRED("3006", "Token has expired", HttpStatus.UNAUTHORIZED),
    TOKEN_INVALID("3007", "Invalid token", HttpStatus.UNAUTHORIZED),
    ACCOUNT_LOCKED("3008", "Account is locked", HttpStatus.FORBIDDEN),
    ACCOUNT_DISABLED("3009", "Account is disabled", HttpStatus.FORBIDDEN),

    // ===== 4xxx - Room related =====
    ROOM_NOT_FOUND("4001", "Room not found", HttpStatus.NOT_FOUND),
    ROOM_ALREADY_EXISTS("4002", "Room already exists", HttpStatus.BAD_REQUEST),
    ROOM_ACCESS_DENIED("4003", "Access to room denied", HttpStatus.FORBIDDEN),
    ROOM_MEMBER_EXISTS("4004", "User already in room", HttpStatus.BAD_REQUEST),
    ROOM_MEMBER_NOT_FOUND("4005", "User not in room", HttpStatus.NOT_FOUND),

    // ===== 5xxx - Message related =====
    MESSAGE_NOT_FOUND("5001", "Message not found", HttpStatus.NOT_FOUND),
    MESSAGE_ACCESS_DENIED("5002", "Cannot modify this message", HttpStatus.FORBIDDEN),

    // ===== 6xxx - File related =====
    FILE_NOT_FOUND("6001", "File not found", HttpStatus.NOT_FOUND),
    FILE_UPLOAD_FAILED("6002", "File upload failed", HttpStatus.INTERNAL_SERVER_ERROR),
    FILE_DELETE_FAILED("6003", "File delete failed", HttpStatus.INTERNAL_SERVER_ERROR),
    FILE_SIZE_EXCEEDED("6004", "File size exceeded", HttpStatus.BAD_REQUEST),
    INVALID_FILE_TYPE("6005", "Invalid file type", HttpStatus.BAD_REQUEST),

    // ===== 7xxx - System errors =====
    INTERNAL_SERVER_ERROR("7001", "Internal server error", HttpStatus.INTERNAL_SERVER_ERROR),
    DATABASE_ERROR("7002", "Database operation failed", HttpStatus.INTERNAL_SERVER_ERROR),
    SERVICE_UNAVAILABLE("7003", "Service temporarily unavailable", HttpStatus.SERVICE_UNAVAILABLE);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;
}
