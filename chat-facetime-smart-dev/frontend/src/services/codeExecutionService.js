import api from './api';

export const codeExecutionService = {
  executeCode: (code, language, fileName) => {
    return api.post('/api/code/execute', {
      code: code,
      language: language,
      fileName: fileName
    });
  },

  executePython: (code) => {
    return api.post('/api/code/execute/python', {
      code: code,
      language: 'python',
      fileName: 'code.py'
    });
  },

  executeJavaScript: (code) => {
    return api.post('/api/code/execute/javascript', {
      code: code,
      language: 'javascript',
      fileName: 'code.js'
    });
  },

  executeJava: (code) => {
    return api.post('/api/code/execute/java', {
      code: code,
      language: 'java',
      fileName: 'Main.java'
    });
  },

  executeCpp: (code) => {
    return api.post('/api/code/execute/cpp', {
      code: code,
      language: 'cpp',
      fileName: 'main.cpp'
    });
  },

  saveFile: (fileName, content) => {
    return api.post('/api/code/save', {
      fileName: fileName,
      content: content
    });
  },

  loadFile: (filePath) => {
    return api.get('/api/code/load', { 
      params: { filePath }
    });
  },

  healthCheck: () => {
    return api.get('/test/health');
  }
};

export default codeExecutionService;