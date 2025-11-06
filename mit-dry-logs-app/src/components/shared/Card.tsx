import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  children,
  className = '',
  headerClassName = '',
}) => {
  return (
    <div className={`card ${className}`}>
      {title && (
        <div className={`section-header -m-6 mb-6 ${headerClassName}`}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
};
