import React, { useState } from 'react';
import { Bot, Send, Code, Lightbulb, Bug, FileText, X, Minimize2 } from 'lucide-react';

const AIAssistant = ({ isOpen, onClose, onMinimize }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Xin chào! Tôi là AI Assistant của Smart Chat. Tôi có thể giúp bạn:',
      suggestions: [
        'Giải thích code',
        'Tìm lỗi bug',
        'Tối ưu hóa code',
        'Viết documentation',
        'Code review'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: generateAIResponse(input),
        code: extractCode(input)
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('bug') || input.includes('lỗi')) {
      return `Tôi thấy bạn đang gặp vấn đề với bug. Hãy chia sẻ code của bạn, tôi sẽ giúp bạn tìm và sửa lỗi. Một số gợi ý chung:
      
1. Kiểm tra console errors
2. Verify data types
3. Check null/undefined values
4. Review async/await usage`;
    }
    
    if (input.includes('optimize') || input.includes('tối ưu')) {
      return `Để tối ưu hóa code, tôi khuyên bạn:
      
1. Sử dụng React.memo() cho components
2. Implement useMemo() và useCallback()
3. Lazy loading cho routes
4. Code splitting
5. Image optimization`;
    }
    
    if (input.includes('documentation') || input.includes('doc')) {
      return `Tôi có thể giúp bạn viết documentation:
      
1. API documentation với JSDoc
2. README.md chi tiết
3. Code comments
4. User guides
5. Technical specifications`;
    }
    
    return `Tôi hiểu bạn cần hỗ trợ về "${userInput}". Hãy chia sẻ thêm chi tiết hoặc code cụ thể để tôi có thể giúp bạn tốt hơn. Tôi có thể:
    
• Phân tích và debug code
• Đề xuất cải tiến
• Giải thích concepts
• Viết code mẫu
• Code review`;
  };

  const extractCode = (input) => {
    const codeMatch = input.match(/```(\w+)?\n([\s\S]*?)```/);
    if (codeMatch) {
      return {
        language: codeMatch[1] || 'javascript',
        code: codeMatch[2]
      };
    }
    return null;
  };

  const handleSuggestion = (suggestion) => {
    setInput(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">AI Assistant</h3>
            <p className="text-xs text-gray-600">Smart Chat Helper</p>
          </div>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={onMinimize}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
              {message.type === 'ai' && (
                <div className="flex items-center space-x-2 mb-1">
                  <Bot className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-gray-500">AI Assistant</span>
                </div>
              )}
              <div className={`p-3 rounded-lg ${
                message.type === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {message.code && (
                  <div className="mt-2 bg-gray-800 text-green-400 p-2 rounded text-xs font-mono">
                    <div className="text-gray-400 mb-1">{message.code.language}</div>
                    <pre>{message.code.code}</pre>
                  </div>
                )}
              </div>
              {message.suggestions && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestion(suggestion)}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4 text-blue-500" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Hỏi AI về code, bug, hoặc bất kỳ vấn đề gì..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 flex space-x-2">
          <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1">
            <Code className="h-3 w-3" />
            <span>Code</span>
          </button>
          <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1">
            <Lightbulb className="h-3 w-3" />
            <span>Tips</span>
          </button>
          <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1">
            <Bug className="h-3 w-3" />
            <span>Debug</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
