package com.smartchat.chatfacetimesmartdev.controller;

import com.smartchat.chatfacetimesmartdev.dto.ApiResponse;
import com.smartchat.chatfacetimesmartdev.dto.respond.FileUploadResponse;
import com.smartchat.chatfacetimesmartdev.service.Interface.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;

    @PostMapping("/image")
    public ApiResponse<FileUploadResponse> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam Long roomId,
            @AuthenticationPrincipal Long userId) {

        // Kiểm tra loại file
        if (file.getContentType() == null || !file.getContentType().startsWith("image/")) {
            return ApiResponse.error("400", "Only image files are allowed", null);
        }

        FileUploadResponse response = fileStorageService.storeFile(file, roomId, userId);
        return ApiResponse.success("Image uploaded successfully", response);
    }

    @PostMapping("/file")
    public ApiResponse<FileUploadResponse> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam Long roomId,
            @AuthenticationPrincipal Long userId) {

        FileUploadResponse response = fileStorageService.storeFile(file, roomId, userId);
        return ApiResponse.success("File uploaded successfully", response);
    }

    @GetMapping("/files/{fileId}")
    public ApiResponse<FileUploadResponse> getFile(@PathVariable Long fileId) {
        FileUploadResponse response = fileStorageService.getFile(fileId);
        return ApiResponse.success("File retrieved successfully", response);
    }

    @GetMapping("/files/room/{roomId}")
    public ApiResponse<List<FileUploadResponse>> getRoomFiles(@PathVariable Long roomId) {
        List<FileUploadResponse> responses = fileStorageService.getRoomFiles(roomId);
        return ApiResponse.success("Room files retrieved successfully", responses);
    }

    @GetMapping("/files/my")
    public ApiResponse<List<FileUploadResponse>> getUserFiles(@AuthenticationPrincipal Long userId) {
        List<FileUploadResponse> responses = fileStorageService.getUserFiles(userId);
        return ApiResponse.success("User files retrieved successfully", responses);
    }

    @GetMapping("/files/search")
    public ApiResponse<List<FileUploadResponse>> searchFiles(@RequestParam String q) {
        List<FileUploadResponse> responses = fileStorageService.searchFiles(q);
        return ApiResponse.success("Search results retrieved successfully", responses);
    }

    @DeleteMapping("/files/{fileId}")
    public ApiResponse<Void> deleteFile(
            @PathVariable Long fileId,
            @AuthenticationPrincipal Long userId) {
        fileStorageService.deleteFile(fileId, userId);
        return ApiResponse.success("File deleted successfully", null);
    }

    @GetMapping("/download/{storedName}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String storedName) {
        byte[] fileContent = fileStorageService.loadFileAsBytes(storedName);
        FileUploadResponse fileInfo = fileStorageService.getFileByStoredName(storedName);

        ByteArrayResource resource = new ByteArrayResource(fileContent);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + fileInfo.getOriginalName() + "\"")
                .body(resource);
    }
}
