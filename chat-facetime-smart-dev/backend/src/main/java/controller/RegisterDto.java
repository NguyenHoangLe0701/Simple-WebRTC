package controller;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterDto {
    
    @NotBlank(message = "Username không được để trống")
    @Size(min = 3, max = 50, message = "Username phải có từ 3-50 ký tự")
    private String username;
    
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;
    
    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    @Pattern(regexp = "^(?=.*[A-Z])(?=.*\\d).*$", 
             message = "Mật khẩu phải chứa ít nhất 1 chữ hoa và 1 số")
    private String password;
    
    @NotBlank(message = "Họ tên không được để trống")
    @Size(min = 2, max = 100, message = "Họ tên phải có từ 2-100 ký tự")
    private String fullName;
}
