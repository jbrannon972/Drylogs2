import React from 'react';
import { Home } from 'lucide-react';

interface RoomFilterBarProps {
  rooms: string[];
  selectedRoom: string | null;
  onRoomSelect: (room: string | null) => void;
  photoCountByRoom: { [roomName: string]: number };
}

export const RoomFilterBar: React.FC<RoomFilterBarProps> = ({
  rooms,
  selectedRoom,
  onRoomSelect,
  photoCountByRoom,
}) => {
  const allPhotosCount = Object.values(photoCountByRoom).reduce((sum, count) => sum + count, 0);

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {/* All Rooms */}
          <button
            onClick={() => onRoomSelect(null)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all flex-shrink-0
              ${
                !selectedRoom
                  ? 'bg-entrusted-orange text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <Home className="w-4 h-4" />
            <span className="font-medium">All Rooms</span>
            <span
              className={`
                px-2 py-0.5 rounded-full text-xs font-bold
                ${!selectedRoom ? 'bg-white text-entrusted-orange' : 'bg-gray-200 text-gray-600'}
              `}
            >
              {allPhotosCount}
            </span>
          </button>

          {/* Individual Rooms */}
          {rooms.map(room => {
            const count = photoCountByRoom[room] || 0;
            const isSelected = selectedRoom === room;

            return (
              <button
                key={room}
                onClick={() => onRoomSelect(room)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all flex-shrink-0
                  ${
                    isSelected
                      ? 'bg-entrusted-orange text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <span className="font-medium">{room}</span>
                <span
                  className={`
                    px-2 py-0.5 rounded-full text-xs font-bold
                    ${isSelected ? 'bg-white text-entrusted-orange' : 'bg-gray-200 text-gray-600'}
                  `}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
