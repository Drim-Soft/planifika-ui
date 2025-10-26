"use client";
import { useEffect, useState } from "react";
import { projectService } from "../../../services/projectService";


export default function ProjectEditModal({ project, onClose, onSave }: any) {
  const [form, setForm] = useState({ ...project });
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);

  // Cargar roles según metodología del proyecto
  useEffect(() => {
    if (project?.idmethodologyref || project?.IDMethodologyRef) {
      projectService.getRolesByMethodology(project.IDMethodologyRef ?? project.idmethodologyref)
        .then(setRoles)
        .catch(console.error);
    }
  }, [project]);

  // Obtener usuarios (simple, luego puedes hacer búsqueda real)
  useEffect(() => {
    fetch("http://localhost:8080/users") // ⚠️ Ajusta endpoint si cambia
      .then(res => res.json())
      .then(setUsers)
      .catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    await projectService.updateProject(project.IDProject ?? project.idproject, form);
    onSave();
    onClose();
  };

  const handleAssignUser = async () => {
    if (!selectedUser || !selectedRole) return;
    await projectService.assignUserToProject(
      project.IDProject ?? project.idproject,
      selectedUser,
      selectedRole
    );
    alert("Usuario asignado correctamente");
    setSelectedUser(null);
    setSelectedRole(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white rounded-xl p-6 shadow-xl w-[600px]">
        <h2 className="text-xl font-bold mb-4">Editar Proyecto</h2>

        {/* Campos editables */}
        <div className="space-y-3">
          <input name="name" value={form.name || ""} onChange={handleChange} className="w-full border rounded p-2" placeholder="Nombre" />
          <input name="description" value={form.description || ""} onChange={handleChange} className="w-full border rounded p-2" placeholder="Descripción" />
          <input name="endDate" value={form.endDate?.slice(0, 10) || ""} onChange={handleChange} className="w-full border rounded p-2" type="date" />
          <input name="percentageProgress" value={form.percentageProgress || 0} onChange={handleChange} className="w-full border rounded p-2" type="number" placeholder="Progreso %" />
          <input name="budget" value={form.budget || 0} onChange={handleChange} className="w-full border rounded p-2" type="number" placeholder="Presupuesto" />
          <input name="cost" value={form.cost || 0} onChange={handleChange} className="w-full border rounded p-2" type="number" placeholder="Costo" />
          <input name="percentageBudgetExecution" value={form.percentageBudgetExecution || 0} onChange={handleChange} className="w-full border rounded p-2" type="number" placeholder="% ejecución presupuesto" />
        </div>

        {/* Asignar usuario */}
        <div className="mt-6 border-t pt-4">
          <h3 className="font-semibold mb-2">Asignar Usuario</h3>
          <select
            className="border rounded p-2 w-full mb-2"
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
            className="border rounded p-2 w-full mb-2"
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

          <button onClick={handleAssignUser} className="bg-blue-600 text-white px-4 py-2 rounded">
            Asignar al Proyecto
          </button>
        </div>

        {/* Botones finales */}
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Cancelar</button>
          <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded">Guardar Cambios</button>
        </div>
      </div>
    </div>
  );
}
