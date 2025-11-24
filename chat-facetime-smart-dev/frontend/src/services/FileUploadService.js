class FileUploadService {
    CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME; 
    UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  
    API_URL = `https://api.cloudinary.com/v1_1/${this.CLOUD_NAME}/raw/upload`;
  
    uploadFile = (file, onProgress) => {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", this.UPLOAD_PRESET);
  
        const xhr = new XMLHttpRequest();
        xhr.open("POST", this.API_URL, true);
  
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && onProgress) {
            const progressPercent = Math.round((event.loaded / event.total) * 100);
            onProgress(progressPercent);
          }
        };
  
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            console.log("Cloudinary response:", response);
            resolve(response.secure_url);
          } else {
            console.error("Upload failed:", xhr.responseText);
            reject(new Error("Upload failed"));
          }
        };
  
        xhr.onerror = () => {
          console.error("Upload error:", xhr.statusText);
          reject(new Error("Upload error"));
        };
  
        xhr.send(formData);
      });
    };
  }
  
  export default new FileUploadService();
