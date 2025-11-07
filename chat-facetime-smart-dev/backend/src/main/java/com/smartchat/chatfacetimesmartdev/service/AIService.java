package com.smartchat.chatfacetimesmartdev.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.smartchat.chatfacetimesmartdev.dto.GeminiDto;

@Service
public class AIService {

    @Value("${gemini.api.key:}") // 🆕 THÊM DEFAULT VALUE
    private String geminiApiKey;

    @Autowired
    private RestTemplate restTemplate;

    // Đây là "Kho học liệu nhỏ" của bạn, được set sẵn
    private final String KNOWLEDGE_BASE_PROMPT =
            "Bạn là một trợ lý AI chuyên gia, chỉ trả lời các câu hỏi liên quan đến 3 chủ đề: WebRTC, Socket, và TCP." +
                    "Sử dụng kiến thức sau để trả lời:" +

                    "--- BẮT ĐẦU KIẾN THỨC ---" +

                    "1. WebRTC (Web Real-Time Communication):" +
                    "- Là một công nghệ mã nguồn mở cho phép giao tiếp âm thanh, video, và chia sẻ dữ liệu P2P (peer-to-peer) trực tiếp giữa các trình duyệt web." +
                    "- Không cần plugin hay phần mềm trung gian." +
                    "- Rất quan trọng cho các ứng dụng họp trực tuyến, video call, và streaming." +

                    "2. Socket (Cụ thể là WebSocket):" +
                    "- Là một công nghệ cho phép giao tiếp hai chiều (bi-directional) và real-time giữa client và server qua một kết nối TCP duy nhất." +
                    "- Khác với HTTP truyền thống (chỉ client hỏi, server trả lời), WebSocket cho phép server chủ động đẩy dữ liệu xuống client." +
                    "- Thường dùng cho ứng dụng chat, thông báo real-time, và game online." +

                    "3. TCP (Transmission Control Protocol):" +
                    "- Là một trong các giao thức cốt lõi của bộ giao thức Internet (TCP/IP)." +
                    "- Cung cấp kết nối tin cậy, có thứ tự, và kiểm soát lỗi (error-checked) giữa các ứng dụng." +
                    "- Trước khi gửi dữ liệu, TCP thực hiện 'bắt tay ba bước' (three-way handshake) để thiết lập kết nối." +

                    "--- KẾT THÚC KIẾN THỨC ---" +

                    "Quy tắc trả lời:" +
                    "1. Chỉ trả lời dựa trên kiến thức được cung cấp ở trên." +
                    "2. Nếu người dùng hỏi về bất cứ chủ đề nào khác (ví dụ: nấu ăn, lịch sử, ...), hãy từ chối một cách lịch sự và nói rằng 'Tôi chỉ có thể cung cấp thông tin về WebRTC, Socket, và TCP.'" +
                    "3. Trả lời ngắn gọn, tập trung vào các từ khóa (keyword) mà người dùng hỏi liên quan đến 3 chủ đề trên." +
                    "4. Luôn trả lời bằng tiếng Việt." +

                    "Câu hỏi của người dùng: ";

    public String getAIResponse(String userInput) {
        // 🆕 KIỂM TRA API KEY
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            return "Xin lỗi, dịch vụ AI hiện không khả dụng. Vui lòng thử lại sau.";
        }

        String geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + geminiApiKey;

        // 1. Xây dựng prompt cuối cùng
        String fullPrompt = KNOWLEDGE_BASE_PROMPT + userInput;

        // 2. Tạo Request Body
        GeminiDto.GeminiRequest requestBody = new GeminiDto.GeminiRequest(fullPrompt);

        // 3. Thiết lập Headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // 4. Gói Request
        HttpEntity<GeminiDto.GeminiRequest> entity = new HttpEntity<>(requestBody, headers);

        try {
            // 5. Gọi API
            GeminiDto.GeminiResponse response = restTemplate.postForObject(geminiUrl, entity, GeminiDto.GeminiResponse.class);

            // 6. Xử lý và trả về kết quả
            if (response != null && 
                response.candidates != null && 
                !response.candidates.isEmpty() &&
                response.candidates.get(0).content != null &&
                response.candidates.get(0).content.parts != null &&
                !response.candidates.get(0).content.parts.isEmpty()) {
                
                return response.candidates.get(0).content.parts.get(0).text;
            } else {
                return "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.";
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Đã xảy ra lỗi khi kết nối đến AI. Vui lòng thử lại sau.";
        }
    }
}