import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, className = '' }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className={`bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative ${className}`}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl">×</button>
        {title && <h2 className="text-2xl font-bold mb-2 text-gray-900">{title}</h2>}
        {children}
      </div>
    </div>
  );
};

export default Modal; 