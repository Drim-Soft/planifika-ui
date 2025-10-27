"use client";

import { useEffect, useState } from "react";
import { phaseService } from "../../../services/phaseService";
import { phaseStatusService } from "../../../services/phaseStatusService";
import { Phase } from "@/app/types/phase";
import { PhaseStatus } from "@/app/types/phaseStatus";

interface PhaseEditModalProps {
  projectId: number;
  phase?: Phase | null;
  onClose: () => void;
  onSave: () => void;
}

export default function PhaseEditModal({ projectId, phase, onClose, onSave }: PhaseEditModalProps) {
  const [form, setForm] = useState({
    name: phase?.name || "",
    description: phase?.description || "",
    startDate: phase?.startDate?.slice(0, 10) || "",
    endDate: phase?.endDate?.slice(0, 10) || "",
    percentageProgress: phase?.percentageProgress || 0,
    budget: phase?.budget || 0,
    cost: phase?.cost || 0,
    phaseStatusId: phase?.phaseStatus?.idPhaseStatus || 1, // Por defecto estado activo
  });

  const [phaseStatuses, setPhaseStatuses] = useState<PhaseStatus[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar estados de fase
  useEffect(() => {
    phaseStatusService
      .getAllPhaseStatuses()
      .then((data) => setPhaseStatuses(data))
      .catch((err) => console.error("Error cargando estados de fase:", err));
  }, []);

  const handleChange = (name: string, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const phaseData = {
        name: form.name,
        description: form.description,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        percentageProgress: Number(form.percentageProgress),
        budget: Number(form.budget),
        cost: Number(form.cost),
        IDProjectRef: projectId,
        IDPhaseStatusRef: Number(form.phaseStatusId),
      };

      if (phase) {
        // Actualizar fase existente
        await phaseService.updatePhase(phase.idPhase!, phaseData);
        alert("✅ Fase actualizada correctamente");
      } else {
        // Crear nueva fase
        await phaseService.createPhase(phaseData);
        alert("✅ Fase creada correctamente");
      }

      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      alert("❌ Error al guardar la fase");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg"
        >
          ✖
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {phase ? "✏️ Editar Fase" : "➕ Nueva Fase"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-black mb-1 font-medium">Nombre</label>
            <input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 text-black"
              placeholder="Nombre de la fase"
            />
          </div>

          <div>
            <label className="block text-black mb-1 font-medium">Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 text-black"
              placeholder="Descripción de la fase"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-black mb-1 font-medium">Fecha Inicio</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 text-black"
              />
            </div>

            <div>
              <label className="block text-black mb-1 font-medium">Fecha Fin</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 text-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-black mb-1 font-medium">Estado</label>
            <select
              value={form.phaseStatusId}
              onChange={(e) => handleChange("phaseStatusId", e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 text-black"
            >
              {phaseStatuses.map((status) => (
                <option key={status.idPhaseStatus} value={status.idPhaseStatus}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-black mb-1 font-medium">Progreso (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.percentageProgress}
                onChange={(e) => handleChange("percentageProgress", e.target.value)}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 text-black"
              />
            </div>

            <div>
              <label className="block text-black mb-1 font-medium">Presupuesto</label>
              <input
                type="number"
                value={form.budget}
                onChange={(e) => handleChange("budget", e.target.value)}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 text-black"
              />
            </div>

            <div>
              <label className="block text-black mb-1 font-medium">Costo</label>
              <input
                type="number"
                value={form.cost}
                onChange={(e) => handleChange("cost", e.target.value)}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 text-black"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
