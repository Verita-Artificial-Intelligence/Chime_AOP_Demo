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
      <div className={`bg-brand-card rounded-xl shadow-lg p-6 w-full max-w-md relative ${className}`}>
        <button onClick={onClose} className="absolute top-3 right-3 text-brand-muted hover:text-brand-heading text-2xl">×</button>
        {title && <h2 className="text-2xl font-bold mb-2 text-brand-heading">{title}</h2>}
        {children}
      </div>
    </div>
  );
};

export default Modal; 