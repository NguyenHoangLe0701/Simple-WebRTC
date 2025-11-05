package com.smartchat.chatfacetimesmartdev.dto.respond;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginDto {
    
    @NotBlank(message = "Username hoặc email không được để trống")
    private String usernameOrEmail;
    
    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;
}
