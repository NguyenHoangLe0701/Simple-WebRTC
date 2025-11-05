package com.smartchat.chatfacetimesmartdev.service.Interface;


import com.smartchat.chatfacetimesmartdev.dto.respond.FileUploadResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface FileStorageService {
    FileUploadResponse storeFile(MultipartFile file, Long roomId, Long userId);
    FileUploadResponse getFile(Long fileId);
    List<FileUploadResponse> getRoomFiles(Long roomId);
    List<FileUploadResponse> getUserFiles(Long userId);
    List<FileUploadResponse> searchFiles(String query);
    void deleteFile(Long fileId, Long userId);
    byte[] loadFileAsBytes(String storedName);
    FileUploadResponse getFileByStoredName(String storedName);
}
