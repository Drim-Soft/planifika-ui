"use client";

import { useEffect, useState } from "react";
import { hasAdminProjectRole } from "@/app/utils/roleUtils";
import { phaseService } from "../services/phaseService";
import { Phase } from "@/app/types/phase";
import PhaseEditModal from "../dashboard/academic/components/PhaseEditModal";
import PhaseTasksModal from "./PhaseTasksModal";

export default function ProjectDetailsModal({ project, onClose, user }: any) {
  if (!project) return null;

  // ✅ Verificar permisos reales de admin basados en el rol del usuario en ese proyecto
  const isAdmin = hasAdminProjectRole(user?.role, project?.userRoleId);

  // Estados para fases
  const [phases, setPhases] = useState<Phase[]>([]);
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null);
  const [loadingPhases, setLoadingPhases] = useState(false);
  
  // Estados para tareas
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);

  // Cargar fases del proyecto
  useEffect(() => {
    const loadPhases = async () => {
      if (!project.IDProject) return;
      
      try {
        setLoadingPhases(true);
        const projectPhases = await phaseService.getPhasesByProject(project.IDProject);
        setPhases(projectPhases);
      } catch (err) {
        console.error("Error cargando fases:", err);
      } finally {
        setLoadingPhases(false);
      }
    };

    loadPhases();
  }, [project.IDProject]);

  // Handler para crear fase
  const handleCreatePhase = () => {
    setEditingPhase(null);
    setShowPhaseModal(true);
  };

  // Handler para hacer click en una fase (ver tareas)
  const handlePhaseClick = (phase: Phase) => {
    setSelectedPhase(phase);
    setShowTasksModal(true);
  };

  // Handler para recargar fases después de guardar
  const handlePhaseSave = async () => {
    try {
      const updatedPhases = await phaseService.getPhasesByProject(project.IDProject);
      setPhases(updatedPhases);
    } catch (err) {
      console.error("Error recargando fases:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg"
        >
          ✖
        </button>

        {/* Título */}
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h2>
        <p className="text-gray-500 mb-4 text-sm">
          Proyecto académico con enfoque en metodologías ágiles.
        </p>

        {/* Descripción */}
        <p className="text-gray-700 mb-6 leading-relaxed">
          {project.description || "Sin descripción disponible."}
        </p>

        {/* Info general */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-6">
          <div>
            <p className="text-gray-500 font-medium">🌱 Metodología</p>
            <p className="text-gray-800">{project.methodology?.name || "N/A"}</p>
          </div>

          <div>
            <p className="text-gray-500 font-medium">📊 Estado</p>
            <p className="text-gray-800">{project.projectStatus?.name || "Sin estado"}</p>
          </div>

          <div>
            <p className="text-gray-500 font-medium">📅 Inicio</p>
            <p className="text-gray-800">
              {new Date(project.startDate).toLocaleDateString("es-ES")}
            </p>
          </div>

          <div>
            <p className="text-gray-500 font-medium">🏁 Fin</p>
            <p className="text-gray-800">
              {new Date(project.endDate).toLocaleDateString("es-ES")}
            </p>
          </div>

          {project.budget && (
            <div>
              <p className="text-gray-500 font-medium">💰 Presupuesto</p>
              <p className="text-gray-800">${project.budget.toLocaleString("es-CO")}</p>
            </div>
          )}
        </div>

        {/* Progreso */}
        <div className="mt-4 mb-6">
          <div className="bg-gray-200 rounded-full h-3 w-full">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                project.percentageProgress >= 80
                  ? "bg-green-500"
                  : project.percentageProgress >= 50
                  ? "bg-blue-500"
                  : project.percentageProgress >= 25
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${project.percentageProgress || 0}%` }}
            ></div>
          </div>
          <p className="text-center text-gray-600 mt-2 text-sm">
            Progreso general: {project.percentageProgress || 0}%
          </p>
        </div>

        {/* Fases */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            📋 Fases del Proyecto
          </h3>

          {/* ✅ Solo admins pueden ver este botón */}
          {isAdmin && (
            <button
              onClick={handleCreatePhase}
              className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm px-3 py-1 rounded-lg transition-colors duration-200"
            >
              ➕ Crear Fase
            </button>
          )}
        </div>

        {/* Lista de fases */}
        <div className="flex flex-wrap gap-3">
          {loadingPhases ? (
            <div className="w-full text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Cargando fases...</p>
            </div>
          ) : phases.length === 0 ? (
            <div className="w-full text-center py-8 text-gray-500">
              <p>No hay fases creadas para este proyecto</p>
              {isAdmin && (
                <p className="text-sm">Haz clic en "Crear Fase" para comenzar</p>
              )}
            </div>
          ) : (
            phases.map((phase) => (
              <div
                key={phase.idPhase}
                onClick={() => handlePhaseClick(phase)}
                className="cursor-pointer p-4 bg-gray-50 hover:bg-gray-100 transition-all duration-300 rounded-xl border border-gray-200 shadow-sm flex-1 min-w-[120px] text-center"
              >
                <p className="font-medium text-gray-800">{phase.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {phase.percentageProgress || 0}% completado
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full ${
                      (phase.percentageProgress || 0) >= 80 ? "bg-green-500" :
                      (phase.percentageProgress || 0) >= 50 ? "bg-blue-500" :
                      (phase.percentageProgress || 0) >= 25 ? "bg-yellow-500" :
                      "bg-red-500"
                    }`}
                    style={{ width: `${phase.percentageProgress || 0}%` }}
                  ></div>
                </div>
                {phase.phaseStatus?.name && (
                  <span className={`inline-block px-2 py-1 rounded text-xs mt-2 ${
                    phase.phaseStatus.name === 'Activa' ? 'bg-green-100 text-green-800' :
                    phase.phaseStatus.name === 'Completada' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {phase.phaseStatus.name}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Fases */}
      {showPhaseModal && (
        <PhaseEditModal
          projectId={project.IDProject}
          phase={editingPhase}
          onClose={() => setShowPhaseModal(false)}
          onSave={handlePhaseSave}
        />
      )}

      {/* Modal de Tareas */}
      {showTasksModal && selectedPhase && (
        <PhaseTasksModal
          phase={selectedPhase}
          onClose={() => {
            setShowTasksModal(false);
            setSelectedPhase(null);
          }}
        />
      )}
    </div>
  );
}