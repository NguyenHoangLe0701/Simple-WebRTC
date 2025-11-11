// Service để tải file (ảnh, zip, txt...) lên Cloudinary
// 1. Đăng ký tài khoản miễn phí tại Cloudinary.com
// 2. Vào Dashboard -> Settings (biểu tượng bánh răng) -> Tab "Upload"
// 3. Kéo xuống "Upload presets", bấm "Add upload preset"
// 4. Đặt "Preset name" (ví dụ: "chat-preset-raw")
// 5. Sửa "Signing Mode" thành "Unsigned"
// 6. Quay lại Dashboard, bạn sẽ thấy "Cloud Name"

class FileUploadService {
    // ⬇️ THAY ĐỔI 2 GIÁ TRỊ NÀY BẰNG CỦA BẠN
    CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME; 
    UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    // ⬆️
  
    // ⬇️ THAY ĐỔI QUAN TRỌNG: Dùng endpoint "raw" thay vì "image"
    API_URL = `https://api.cloudinary.com/v1_1/${this.CLOUD_NAME}/raw/upload`;
    // ⬆️
  
    /**
     * Tải file bất kỳ lên Cloudinary
     * @param {File} file - File người dùng chọn
     * @param {function} onProgress - Callback để cập nhật UI (vd: 0% -> 100%)
     * @returns {Promise<string>} - Trả về URL của file đã tải lên
     */
    uploadFile = (file, onProgress) => {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", this.UPLOAD_PRESET);
  
        const xhr = new XMLHttpRequest();
        xhr.open("POST", this.API_URL, true);
  
        // Theo dõi tiến độ
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && onProgress) {
            const progressPercent = Math.round((event.loaded / event.total) * 100);
            onProgress(progressPercent);
          }
        };
  
        // Xử lý khi hoàn tất
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            console.log("Cloudinary response:", response);
            resolve(response.secure_url); // Trả về URL an toàn (https)
          } else {
            console.error("Upload failed:", xhr.responseText);
            reject(new Error("Upload failed"));
          }
        };
  
        // Xử lý lỗi
        xhr.onerror = () => {
          console.error("Upload error:", xhr.statusText);
          reject(new Error("Upload error"));
        };
  
        xhr.send(formData);
      });
    };
  }
  
  export default new FileUploadService();
