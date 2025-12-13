import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Play, 
  Download, 
  Copy, 
  Maximize2, 
  Minimize2,
  FileText,
  Save,
  FolderOpen
} from 'lucide-react';
import codeExecutionService from '../services/codeExecutionService';

const CodeEditor = ({ isOpen, onClose, onSendCode, initialCode = '', initialLanguage = 'javascript' }) => {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [fileName, setFileName] = useState('code.js');
  const textareaRef = useRef(null);

  const languages = useMemo(() => [
    { value: 'javascript', label: 'JavaScript', extension: '.js' },
    { value: 'python', label: 'Python', extension: '.py' },
    { value: 'java', label: 'Java', extension: '.java' },
    { value: 'cpp', label: 'C++', extension: '.cpp' },
  ], []);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const currentLang = languages.find(lang => lang.value === language);
    if (currentLang) {
      setFileName(`code${currentLang.extension}`);
    }
  }, [language, languages]);

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('🔄 Đang chạy code...\n');

    try {
      let result;

      // Sử dụng service mới để thực thi code
      if (language === 'html' || language === 'css' || language === 'json') {
        // HTML, CSS, JSON chỉ cần trả về code
        result = {
          output: code,
          error: '',
          success: true
        };
      } else {
        // Các ngôn ngữ thực thi được
        result = await codeExecutionService.executeCode(code, language, fileName);
      }

      if (result.data.success) {
        setOutput(prev => prev + `✅ Thực thi thành công!\n\n📤 Kết quả:\n${result.data.output}\n`);
      } else {
        setOutput(prev => prev + `❌ Lỗi thực thi:\n${result.data.error}\n`);
      }
    } catch (error) {
      setOutput(prev => prev + `❌ Lỗi kết nối: ${error.message}\n`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveFile = async () => {
    try {
      const result = await codeExecutionService.saveFile(fileName, code);
      if (result.data.success) {
        setOutput(prev => prev + `💾 File đã được lưu thành công: ${result.data.message}\n`);
      } else {
        setOutput(prev => prev + `❌ Lỗi khi lưu file: ${result.data.message}\n`);
      }
    } catch (err) {
      setOutput(prev => prev + `❌ Lỗi kết nối khi lưu file: ${err.message}\n`);
    }
  };

  const handleLoadFile = async () => {
    const filePath = prompt('Nhập đường dẫn file (ví dụ: uploads/code/code.py):');
    if (filePath) {
      try {
        const result = await codeExecutionService.loadFile(filePath);
        if (result.data.success) {
          setCode(result.data.content);
          setOutput(prev => prev + `📂 File đã được tải thành công!\n`);
        } else {
          setOutput(prev => prev + `❌ Lỗi tải file: ${result.data.message}\n`);
        }
      } catch (err) {
        setOutput(prev => prev + `❌ Lỗi kết nối khi tải file: ${err.message}\n`);
      }
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setOutput(prev => prev + '📋 Code đã được copy vào clipboard!\n');
  };

  const handleDownloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setOutput(prev => prev + `📥 File ${fileName} đã được tải về!\n`);
  };

  const handleSendCode = () => {
    if (onSendCode) {
      onSendCode({
        content: code,
        language,
        fileName
      });
    }
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);

      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const clearOutput = () => {
    setOutput('');
  };

  // Hàm kiểm tra trạng thái thực thi
  const getExecutionStatus = () => {
    if (language === 'html' || language === 'css' || language === 'json') {
      return { text: 'Preview Only', color: 'text-blue-600' };
    }
    return { text: 'Real Execution', color: 'text-green-600' };
  };

  const executionStatus = getExecutionStatus();

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isFullscreen ? 'p-0' : 'p-4'}`}>
      <div className={`bg-white rounded-lg shadow-2xl flex flex-col ${isFullscreen ? 'w-full h-full' : 'w-4/5 h-4/5 max-w-6xl'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="text-sm font-medium bg-transparent border-none outline-none"
              />
            </div>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
              <span>{isRunning ? 'Running...' : 'Run'}</span>
            </button>
            <button onClick={handleSaveFile} className="p-2 text-gray-500 hover:text-gray-700" title="Save to Server">
              <Save className="h-4 w-4" />
            </button>
            <button onClick={handleLoadFile} className="p-2 text-gray-500 hover:text-gray-700" title="Load from Server">
              <FolderOpen className="h-4 w-4" />
            </button>
            <button onClick={handleCopyCode} className="p-2 text-gray-500 hover:text-gray-700">
              <Copy className="h-4 w-4" />
            </button>
            <button onClick={handleDownloadCode} className="p-2 text-gray-500 hover:text-gray-700">
              <Download className="h-4 w-4" />
            </button>
            <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 text-gray-500 hover:text-gray-700">
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700">✕</button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex">
          <div className="flex-1 flex flex-col">
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Nhập code ${language} của bạn...`}
              className="w-full h-full p-4 font-mono text-sm border-none outline-none resize-none"
              style={{ lineHeight: '1.5' }}
            />
          </div>

          <div className="w-1/3 border-l border-gray-200 flex flex-col">
            <div className="flex justify-between items-center p-3 border-b border-gray-200 bg-gray-50">
              <h4 className="text-sm font-semibold text-gray-700">Output</h4>
              <button onClick={clearOutput} className="text-xs text-gray-500 hover:text-gray-700">Clear</button>
            </div>
            <div className="flex-1 p-3 overflow-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                {output || `Output sẽ hiển thị ở đây...\n\n📝 Ngôn ngữ: ${language.toUpperCase()}\n🚀 Trạng thái: ${executionStatus.text}\n\nChọn "Run" để thực thi code.`}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Lines: {code.split('\n').length}</span>
            <span>•</span>
            <span>Characters: {code.length}</span>
            <span>•</span>
            <span>{language.toUpperCase()}</span>
            <span>•</span>
            <span className={`${executionStatus.color} font-semibold`}>
              {executionStatus.text}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">Hủy</button>
            <button onClick={handleSendCode} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Gửi Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;