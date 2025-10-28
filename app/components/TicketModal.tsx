"use client";

import { useState, useEffect } from 'react';
import { X, Send, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { TicketResponse, TicketStatusLabels, TicketStatus } from '../types/ticket';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: TicketResponse | null;
}

export default function TicketModal({ isOpen, onClose, ticket }: TicketModalProps) {
  if (!isOpen || !ticket) return null;

  const getStatusIcon = (statusId: number) => {
    switch (statusId) {
      case TicketStatus.PENDING:
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case TicketStatus.IN_PROGRESS:
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case TicketStatus.ANSWERED:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case TicketStatus.CLOSED:
        return <CheckCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (statusId: number) => {
    switch (statusId) {
      case TicketStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case TicketStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case TicketStatus.ANSWERED:
        return 'bg-green-100 text-green-800';
      case TicketStatus.CLOSED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-[#222831] to-[#393E46] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon(ticket.idTicketStatus)}
            <div>
              <h2 className="text-xl font-bold">Ticket #{ticket.idTickets}</h2>
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${getStatusColor(ticket.idTicketStatus)}`}>
                {ticket.ticketStatusName || TicketStatusLabels[ticket.idTicketStatus as TicketStatus] || 'Desconocido'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Título del ticket */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Asunto</h3>
            <p className="text-lg font-semibold text-gray-900">{ticket.title}</p>
          </div>

          {/* Descripción */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Descripción</h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
            </div>
          </div>

          {/* Respuesta del soporte */}
          {ticket.answer && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                <Send className="w-4 h-4" />
                Respuesta del Soporte
              </h3>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-gray-700 whitespace-pre-wrap">{ticket.answer}</p>
              </div>
            </div>
          )}

          {/* Estado sin respuesta */}
          {!ticket.answer && ticket.idTicketStatus === TicketStatus.PENDING && (
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 flex items-start gap-3">
              <Clock className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-yellow-800">
                  Ticket en espera de respuesta
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Nuestro equipo de soporte revisará tu solicitud pronto.
                </p>
              </div>
            </div>
          )}

          {!ticket.answer && ticket.idTicketStatus === TicketStatus.IN_PROGRESS && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-800">
                  Ticket en progreso
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Estamos trabajando en tu solicitud.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#222831] text-white rounded-lg hover:bg-[#393E46] transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
