import api from './api';

// Bắt đầu cuộc gọi - server sẽ lưu thời gian bắt đầu
export const startCall = async (roomId, callType) => {
  const response = await api.post('/api/calls/start', null, {
    params: { roomId, callType },
  });
  return response.data;
};

// Kết thúc cuộc gọi - server tính duration và trả về
export const endCall = async (roomId) => {
  const response = await api.post('/api/calls/end', null, {
    params: { roomId },
  });
  return response.data;
};

export default {
  startCall,
  endCall,
};

