"use client";

import { useEffect, useState } from "react";
import { projectService } from "../../../services/projectService";

export default function ProjectEditModal({ project, onClose, onSave }: any) {
  const [form, setForm] = useState({ ...project });
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);

  // Cargar roles de la metodología del proyecto
  useEffect(() => {
    const methodologyId = project.IDMethodologyRef ?? project.idmethodologyref;
    if (methodologyId) {
      projectService
        .getRolesByMethodology(methodologyId)
        .then((data) => {
          console.log("Roles de metodología:", data);
          setRoles(data);
        })
        .catch(console.error);
    }
  }, [project]);

  // Obtener usuarios del sistema (ajusta si tienes endpoint diferente)
  useEffect(() => {
    projectService
      .request<any[]>("/users", { method: "GET" })
      .then(setUsers)
      .catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const projectId = project.IDProject ?? project.idproject;
    console.log("📝 Guardando proyecto:", projectId, form);

    // Evitamos que cambie el estado accidentalmente
    const cleanData = { ...form };
    delete (cleanData as any).projectStatus;

    await projectService.updateProject(projectId, cleanData);
    onSave();
    onClose();
  };

  const handleAssignUser = async () => {
    if (!selectedUser || !selectedRole) return alert("Selecciona usuario y rol.");
    const projectId = project.IDProject ?? project.idproject;
    await projectService.assignUserToProject(projectId, selectedUser, selectedRole);
    alert("✅ Usuario asignado correctamente");
    setSelectedUser(null);
    setSelectedRole(null);
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

        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          ✏️ Editar Proyecto
        </h2>

        {/* Campos del formulario */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="col-span-2">
            <label className="block text-gray-500 mb-1 font-medium">Nombre</label>
            <input
              name="name"
              value={form.name || ""}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-yellow-500"
              placeholder="Nombre del proyecto"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-gray-500 mb-1 font-medium">Descripción</label>
            <textarea
              name="description"
              value={form.description || ""}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-yellow-500"
              placeholder="Descripción del proyecto"
            />
          </div>

          <div>
            <label className="block text-gray-500 mb-1 font-medium">Fecha de Fin</label>
            <input
              name="endDate"
              value={form.endDate?.slice(0, 10) || ""}
              onChange={handleChange}
              type="date"
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div>
            <label className="block text-gray-500 mb-1 font-medium">Progreso (%)</label>
            <input
              name="percentageProgress"
              value={form.percentageProgress || 0}
              onChange={handleChange}
              type="number"
              min="0"
              max="100"
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div>
            <label className="block text-gray-500 mb-1 font-medium">Presupuesto</label>
            <input
              name="budget"
              value={form.budget || 0}
              onChange={handleChange}
              type="number"
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div>
            <label className="block text-gray-500 mb-1 font-medium">Costo</label>
            <input
              name="cost"
              value={form.cost || 0}
              onChange={handleChange}
              type="number"
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-gray-500 mb-1 font-medium">% Ejecución Presupuesto</label>
            <input
              name="percentageBudgetExecution"
              value={form.percentageBudgetExecution || 0}
              onChange={handleChange}
              type="number"
              min="0"
              max="100"
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        </div>

        {/* Asignar usuario */}
        <div className="mt-8 border-t pt-4">
          <h3 className="font-semibold mb-3 text-gray-800">Asignar Usuario al Proyecto</h3>

          <select
            className="border rounded-lg p-2 w-full mb-3 focus:ring-2 focus:ring-yellow-500"
            value={selectedUser || ""}
            onChange={(e) => setSelectedUser(Number(e.target.value))}
          >
            <option value="">Seleccionar usuario</option>
            {users.map((u) => (
              <option key={u.iduser || u.IDUser} value={u.iduser || u.IDUser}>
                {u.name || `Usuario ${u.iduser}`}
              </option>
            ))}
          </select>

          <select
            className="border rounded-lg p-2 w-full mb-3 focus:ring-2 focus:ring-yellow-500"
            value={selectedRole || ""}
            onChange={(e) => setSelectedRole(Number(e.target.value))}
          >
            <option value="">Seleccionar rol</option>
            {roles.map((r) => (
              <option key={r.idrole || r.IDRole} value={r.idrole || r.IDRole}>
                {r.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleAssignUser}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
          >
            Asignar al Proyecto
          </button>
        </div>

        {/* Botones finales */}
        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}