"use client";

import { hasAdminProjectRole } from "@/app/utils/roleUtils"; // usa tu helper global si lo tienes

export default function ProjectDetailsModal({ project, onClose, user }: any) {
  if (!project) return null;

  // ✅ Verificar permisos reales de admin basados en el rol del usuario en ese proyecto
  const isAdmin = hasAdminProjectRole(user?.role, project?.userRoleId);

  // Ejemplo de sprints temporales
  const phases = [
    { id: 1, name: "Sprint 1", progress: 60 },
    { id: 2, name: "Sprint 2", progress: 30 },
    { id: 3, name: "Sprint 3", progress: 0 },
  ];

  // Handler para crear sprint
  const handleCreateSprint = () => {
    console.log("🚀 Crear nuevo sprint para el proyecto:", project.IDProject);
    alert("Funcionalidad de creación de Sprint próximamente.");
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

        {/* Sprints */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            🧱 Sprints del Proyecto
          </h3>

          {/* ✅ Solo admins pueden ver este botón */}
          {isAdmin && (
            <button
              onClick={handleCreateSprint}
              className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm px-3 py-1 rounded-lg transition-colors duration-200"
            >
              ➕ Crear Sprint
            </button>
          )}
        </div>

        {/* Lista de sprints */}
        <div className="flex flex-wrap gap-3">
          {phases.map((phase) => (
            <div
              key={phase.id}
              className="cursor-pointer p-4 bg-gray-50 hover:bg-gray-100 transition-all duration-300 rounded-xl border border-gray-200 shadow-sm flex-1 min-w-[100px] text-center"
            >
              <p className="font-medium text-gray-800">{phase.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                {phase.progress}% completado
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${phase.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}