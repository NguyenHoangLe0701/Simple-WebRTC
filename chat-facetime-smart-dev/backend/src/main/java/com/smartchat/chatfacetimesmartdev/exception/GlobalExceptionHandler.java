package com.smartchat.chatfacetimesmartdev.exception;


import com.smartchat.chatfacetimesmartdev.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Optional;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex){
        ApiResponse<?> apiRespond = new ApiResponse<>();
        String defaultMsg = Optional.ofNullable(ex.getBindingResult().getFieldError())
            .map(FieldError::getDefaultMessage)
            .orElse("VALIDATION_ERROR");
        ErrorCode errorCode;
        try {
            errorCode = ErrorCode.valueOf(defaultMsg);
        } catch (IllegalArgumentException e) {
            errorCode = ErrorCode.VALIDATION_ERROR;
        }
        apiRespond.setCode(errorCode.getCode());
        apiRespond.setMessage(errorCode.getMessage());
        return ResponseEntity
                .status(errorCode.getHttpStatus())
                .body(apiRespond);
    }
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<?>> handleAppException(AppException ex){
        ApiResponse<?> apiRespond = new ApiResponse<>();
        apiRespond.setCode(ex.getErrorCode().getCode());
        apiRespond.setMessage(ex.getErrorCode().getMessage());
        return ResponseEntity
                .status(ex.getErrorCode().getHttpStatus())
                .body(apiRespond);
    }
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<?>> handleHttpRequestMethodNotSupportedException(HttpRequestMethodNotSupportedException ex){
        ApiResponse<?> apiRespond = new ApiResponse<>();
        apiRespond.setCode(ErrorCode.METHOD_NOT_ALLOWED.getCode());
        apiRespond.setMessage(ErrorCode.METHOD_NOT_ALLOWED.getMessage());
        return ResponseEntity
            .status(ErrorCode.METHOD_NOT_ALLOWED.getHttpStatus())
            .body(apiRespond);
    }

}