import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ children, closeModal }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl shadow-lg w-full max-w-lg relative p-6">
        <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}