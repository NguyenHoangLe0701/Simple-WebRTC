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

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Autowired
    private RestTemplate restTemplate;

    private final String KNOWLEDGE_BASE =
            "--- KIẾN THỨC CHUYÊN SÂU VỀ WEBRTC, SOCKET, VÀ TCP ---" +

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

                    "--- KẾT THÚC KIẾN THỨC ---";

    private boolean isRelatedToKnowledgeBase(String userInput) {
        String lowerInput = userInput.toLowerCase();
        String[] keywords = {"webrtc", "socket", "websocket", "tcp", "udp", "p2p", "peer-to-peer", 
                            "real-time", "realtime", "streaming", "video call", "handshake"};
        for (String keyword : keywords) {
            if (lowerInput.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    public String getAIResponse(String userInput) {
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            return "Xin lỗi, dịch vụ AI hiện không khả dụng. Vui lòng thử lại sau.";
        }

        String geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

        String fullPrompt;
        boolean isRelated = isRelatedToKnowledgeBase(userInput);
        
        if (isRelated) {
            fullPrompt = "Bạn là một trợ lý AI chuyên gia. " +
                    "Khi trả lời câu hỏi về WebRTC, Socket, hoặc TCP, hãy ưu tiên sử dụng kiến thức chuyên sâu sau đây: " +
                    "\n\n" + KNOWLEDGE_BASE + "\n\n" +
                    "Quy tắc trả lời:" +
                    "1. Nếu câu hỏi liên quan đến WebRTC, Socket, hoặc TCP, hãy ưu tiên sử dụng kiến thức trên." +
                    "2. Bạn có thể bổ sung thêm kiến thức chung nếu cần thiết." +
                    "3. Trả lời chi tiết, dễ hiểu, và bằng tiếng Việt." +
                    "4. Nếu câu hỏi không liên quan đến 3 chủ đề trên, vẫn trả lời bình thường bằng kiến thức của bạn." +
                    "\n\nCâu hỏi của người dùng: " + userInput;
        } else {
            fullPrompt = "Bạn là một trợ lý AI thông minh và hữu ích. " +
                    "Trả lời câu hỏi của người dùng một cách chi tiết, chính xác và dễ hiểu. " +
                    "Luôn trả lời bằng tiếng Việt. " +
                    "\n\nNếu câu hỏi có liên quan đến WebRTC, Socket, hoặc TCP, bạn có thể tham khảo kiến thức sau: " +
                    "\n\n" + KNOWLEDGE_BASE + "\n\n" +
                    "Câu hỏi của người dùng: " + userInput;
        }

        GeminiDto.GeminiRequest requestBody = new GeminiDto.GeminiRequest(fullPrompt);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-goog-api-key", geminiApiKey);

        HttpEntity<GeminiDto.GeminiRequest> entity = new HttpEntity<>(requestBody, headers);

        try {
            GeminiDto.GeminiResponse response = restTemplate.postForObject(geminiUrl, entity, GeminiDto.GeminiResponse.class);

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