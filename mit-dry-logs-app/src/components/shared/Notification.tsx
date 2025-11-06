import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, WifiOff } from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

interface NotificationItemProps {
  notification: any;
  onClose: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClose }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    'offline-mode': <WifiOff className="w-5 h-5 text-gray-500" />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
    'offline-mode': 'bg-gray-50 border-gray-200',
  };

  return (
    <div
      className={`${bgColors[notification.type]} border rounded-lg p-4 shadow-lg flex items-start gap-3 animate-slide-in`}
    >
      {icons[notification.type]}
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">{notification.title}</h4>
        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
