import React from 'react';
import { useRooms } from '../../hooks/useRooms';

const RoomSidebar = ({ currentRoom, onRoomSelect, searchQuery }) => {
  const { rooms, loading, error } = useRooms();

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-72 bg-white border-r flex flex-col">
      {/* User card, search, room list */}
      {filteredRooms.map(room => (
        <div
          key={room.id}
          onClick={() => onRoomSelect(room.id)}
          className={`px-3 py-2 rounded-lg cursor-pointer ${
            room.id === currentRoom ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
          }`}
        >
          #{room.name}
        </div>
      ))}
    </div>
  );
};

export default RoomSidebar;