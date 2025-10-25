"use client";

import { useState } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';
import { CreateTicketRequest } from '../types/ticket';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<CreateTicketRequest, 'idPlanifikaUser'>) => Promise<void>;
  isLoading?: boolean;
}

export default function CreateTicketModal({ 
  isOpen, 
  onClose, 
  onSubmit,
  isLoading = false 
}: CreateTicketModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!title.trim()) {
      setError('Por favor ingresa un título');
      return;
    }

    if (!description.trim()) {
      setError('Por favor describe tu problema');
      return;
    }

    if (title.length < 5) {
      setError('El título debe tener al menos 5 caracteres');
      return;
    }

    if (description.length < 10) {
      setError('La descripción debe tener al menos 10 caracteres');
      return;
    }

    try {
      await onSubmit({ title, description });
      // Limpiar formulario después de enviar
      setTitle('');
      setDescription('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el ticket');
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setTitle('');
      setDescription('');
      setError(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-[#222831] to-[#393E46] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Send className="w-6 h-6 text-[#FFD369]" />
            <h2 className="text-xl font-bold">Crear Ticket de Soporte</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            disabled={isLoading}
            title="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Título */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
              Título del Ticket <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD369] focus:border-transparent outline-none transition-all bg-white text-gray-900 placeholder:text-gray-400 caret-[#222831]"
              placeholder="Ej: Problema al crear proyecto"
              maxLength={100}
              disabled={isLoading}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {title.length}/100 caracteres
            </p>
          </div>

          {/* Descripción */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              Descripción del Problema <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD369] focus:border-transparent outline-none transition-all resize-none bg-white text-gray-900 placeholder:text-gray-400 caret-[#222831]"
              placeholder="Describe detalladamente el problema que estás experimentando..."
              maxLength={1000}
              disabled={isLoading}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/1000 caracteres
            </p>
          </div>

          {/* Info */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Consejo:</strong> Proporciona la mayor cantidad de detalles posible para que podamos ayudarte mejor.
              Incluye pasos para reproducir el problema si es posible.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#222831] text-white rounded-lg hover:bg-[#393E46] transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Crear Ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
