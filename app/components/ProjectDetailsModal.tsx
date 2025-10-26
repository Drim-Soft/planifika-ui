"use client";

export default function ProjectDetailsModal({ project, onClose }: any) {
  if (!project) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg"
        >
          ✖
        </button>

        {/* Título */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">
          {project.name}
        </h2>

        {/* Descripción */}
        <p className="text-gray-700 mb-4 leading-relaxed">
          {project.description || "Sin descripción disponible."}
        </p>

        {/* Info general */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 font-medium">📘 Metodología</p>
            <p className="text-gray-800">{project.methodology?.name || "N/A"}</p>
          </div>

          <div>
            <p className="text-gray-500 font-medium">📊 Estado</p>
            <p className="text-gray-800">
              {project.projectStatus?.name || "Sin estado"}
            </p>
          </div>

          <div>
            <p className="text-gray-500 font-medium">🗓️ Inicio</p>
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
            <div className="col-span-2">
              <p className="text-gray-500 font-medium">💰 Presupuesto</p>
              <p className="text-gray-800">
                ${project.budget.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Barra de progreso */}
        <div className="mt-6 bg-gray-100 rounded-full h-3 w-full">
          <div
            className={`h-3 rounded-full ${
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

        <p className="text-center text-gray-600 mt-3 text-sm">
          Progreso: {project.percentageProgress || 0}%
        </p>
      </div>
    </div>
  );
}