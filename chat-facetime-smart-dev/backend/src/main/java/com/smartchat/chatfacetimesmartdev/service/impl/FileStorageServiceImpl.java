package com.smartchat.chatfacetimesmartdev.service.impl;

import com.smartchat.chatfacetimesmartdev.dto.respond.FileUploadResponse;
import com.smartchat.chatfacetimesmartdev.entity.FileEntity;
import com.smartchat.chatfacetimesmartdev.entity.Room;
import com.smartchat.chatfacetimesmartdev.entity.User;
import com.smartchat.chatfacetimesmartdev.exception.AppException;
import com.smartchat.chatfacetimesmartdev.exception.ErrorCode;
import com.smartchat.chatfacetimesmartdev.repository.FileRepository;
import com.smartchat.chatfacetimesmartdev.repository.RoomRepository;
import com.smartchat.chatfacetimesmartdev.repository.UserRepository;
import com.smartchat.chatfacetimesmartdev.service.Interface.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileStorageServiceImpl implements FileStorageService {

    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Value("${file.max-size:10485760}") // 10MB default
    private long maxFileSize;

    @Value("${file.allowed-image-types:image/jpeg,image/png,image/gif,image/webp}")
    private List<String> allowedImageTypes;

    @Value("${file.allowed-file-types:application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/zip}")
    private List<String> allowedFileTypes;

    @Override
    @Transactional
    public FileUploadResponse storeFile(MultipartFile file, Long roomId, Long userId) {
        try {
            // Validate file
            validateFile(file, false);

            // Get user and room
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

            Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

            // Generate unique file name
            String originalFileName = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFileName);
            String storedFileName = generateStoredFileName(fileExtension);
            String filePath = Paths.get(uploadDir, storedFileName).toString();

            // Create upload directory if not exists
            createUploadDirectory();

            // Save file to filesystem
            Path targetPath = Paths.get(filePath).toAbsolutePath().normalize();
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            // Save file metadata to database
            FileEntity fileEntity = FileEntity.builder()
                    .originalName(originalFileName)
                    .storedName(storedFileName)
                    .filePath(filePath)
                    .mimeType(file.getContentType())
                    .size(file.getSize())
                    .uploadedBy(user)
                    .room(room)
                    .uploadedAt(LocalDateTime.now())
                    .isActive(true)
                    .build();

            FileEntity savedFile = fileRepository.save(fileEntity);
            log.info("File uploaded successfully: {} by user: {}", originalFileName, userId);

            return convertToFileUploadResponse(savedFile);

        } catch (IOException e) {
            log.error("Failed to store file: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public FileUploadResponse getFile(Long fileId) {
        FileEntity fileEntity = fileRepository.findById(fileId)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        if (!fileEntity.getIsActive()) {
            throw new AppException(ErrorCode.FILE_NOT_FOUND);
        }

        return convertToFileUploadResponse(fileEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public FileUploadResponse getFileByStoredName(String storedName) {
        FileEntity fileEntity = fileRepository.findByStoredName(storedName)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        if (!fileEntity.getIsActive()) {
            throw new AppException(ErrorCode.FILE_NOT_FOUND);
        }

        return convertToFileUploadResponse(fileEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FileUploadResponse> getRoomFiles(Long roomId) {
        return fileRepository.findByRoomIdAndIsActiveTrue(roomId)
                .stream()
                .map(this::convertToFileUploadResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FileUploadResponse> getUserFiles(Long userId) {
        return fileRepository.findByUploadedByIdAndIsActiveTrue(userId)
                .stream()
                .map(this::convertToFileUploadResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FileUploadResponse> searchFiles(String query) {
        return fileRepository.searchFiles(query)
                .stream()
                .map(this::convertToFileUploadResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteFile(Long fileId, Long userId) {
        FileEntity fileEntity = fileRepository.findById(fileId)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        // Check if user owns the file or is room admin
        if (!fileEntity.getUploadedBy().getId().equals(userId)) {
            // Check if user is room admin
            boolean isRoomAdmin = fileEntity.getRoom().getMembers().stream()
                    .anyMatch(member -> member.getUser().getId().equals(userId) &&
                                       "ADMIN".equals(member.getRole()));
            if (!isRoomAdmin) {
                throw new AppException(ErrorCode.ACCESS_DENIED);
            }
        }

        try {
            // Delete physical file
            Path filePath = Paths.get(fileEntity.getFilePath());
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }

            // Soft delete in database
            fileEntity.setIsActive(false);
            fileRepository.save(fileEntity);

            log.info("File deleted successfully: {} by user: {}", fileEntity.getOriginalName(), userId);

        } catch (IOException e) {
            log.error("Failed to delete physical file: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.FILE_DELETE_FAILED);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] loadFileAsBytes(String storedName) {
        try {
            FileEntity fileEntity = fileRepository.findByStoredName(storedName)
                    .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

            if (!fileEntity.getIsActive()) {
                throw new AppException(ErrorCode.FILE_NOT_FOUND);
            }

            Path filePath = Paths.get(fileEntity.getFilePath());
            if (!Files.exists(filePath)) {
                throw new AppException(ErrorCode.FILE_NOT_FOUND);
            }

            return Files.readAllBytes(filePath);

        } catch (IOException e) {
            log.error("Failed to load file: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.FILE_NOT_FOUND);
        }
    }

    // Private helper methods
    private void validateFile(MultipartFile file, boolean isImage) {
        // Check file size
        if (file.getSize() > maxFileSize) {
            throw new AppException(ErrorCode.FILE_SIZE_EXCEEDED);
        }

        // Check file type
        String contentType = file.getContentType();
        if (isImage) {
            if (!allowedImageTypes.contains(contentType)) {
                throw new AppException(ErrorCode.INVALID_FILE_TYPE);
            }
        } else {
            if (!allowedFileTypes.contains(contentType)) {
                throw new AppException(ErrorCode.INVALID_FILE_TYPE);
            }
        }

        // Check if file is empty
        if (file.isEmpty()) {
            throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    private String generateStoredFileName(String fileExtension) {
        return UUID.randomUUID().toString() + (fileExtension != null ? fileExtension : "");
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf("."));
    }

    private void createUploadDirectory() throws IOException {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            log.info("Created upload directory: {}", uploadPath);
        }
    }

    private FileUploadResponse convertToFileUploadResponse(FileEntity fileEntity) {
        return FileUploadResponse.builder()
                .id(fileEntity.getId())
                .originalName(fileEntity.getOriginalName())
                .storedName(fileEntity.getStoredName())
                .fileUrl("/api/upload/download/" + fileEntity.getStoredName()) // URL to download file
                .mimeType(fileEntity.getMimeType())
                .size(fileEntity.getSize())
                .uploadedBy(convertToUserResponse(fileEntity.getUploadedBy()))
                .uploadedAt(fileEntity.getUploadedAt())
                .build();
    }

    private com.smartchat.chatfacetimesmartdev.dto.respond.UserResponse convertToUserResponse(User user) {
        return com.smartchat.chatfacetimesmartdev.dto.respond.UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .status(user.getStatus())
                .build();
    }
}