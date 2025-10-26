"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { projectService } from "../../../services/projectService";

export default function ProjectEditModal({ project, onClose }: any) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: project.name || "",
    description: project.description || "",
    endDate: project.endDate?.slice(0, 10) || "",
    budget: project.budget || 0,
    cost: project.cost || 0,
    percentageProgress: project.percentageProgress || 0,
    percentageBudgetExecution: project.percentageBudgetExecution || 0,
    statusName: project.projectStatus?.name || "",
  });

  const [statuses, setStatuses] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const projectId = project.IDProject ?? project.idproject;
  const methodologyId =
    project.IDMethodologyRef ||
    project.idmethodologyRef ||
    project.IDMethodology ||
    project.idmethodology;

  // 🔹 Cargar estados
  useEffect(() => {
    projectService
      .getProjectStatuses()
      .then((data) => setStatuses(data))
      .catch((err) => console.error("Error cargando estados:", err));
  }, []);

  // 🔹 Cargar roles según metodología
  useEffect(() => {
    const methodologyId =
      project.IDMethodologyRef ||
      project.idmethodologyRef ||
      project.IDMethodology ||
      project.idmethodology ||
      project.methodology?.idmethodology ||
      project.methodology?.IDMethodology;

    console.log("🧭 Methodology ID detectado:", methodologyId);

    if (!methodologyId) {
      console.warn("⚠️ No se encontró ID de metodología en el proyecto:", project);
      return;
    }

    projectService
      .getRolesByMethodology(methodologyId)
      .then((data) => {
        console.log("✅ Roles cargados:", data);
        setRoles(data);
      })
      .catch((err) => {
        console.error("❌ Error al obtener roles:", err);
      });
  }, [project]);

  // 🔹 Cargar usuarios del proyecto
  useEffect(() => {
    if (!projectId) return;
    projectService
      .getUsersInProject(projectId)
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error cargando usuarios:", err));
  }, [projectId]);

  const handleChange = (name: string, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Guardar cambios del proyecto
  const handleSave = async () => {
    try {
      setLoading(true);

      const payload = {
        name: form.name,
        description: form.description,
        endDate: form.endDate,
        budget: Number(form.budget),
        cost: Number(form.cost),
        percentageProgress: Number(form.percentageProgress),
        percentageBudgetExecution: Number(form.percentageBudgetExecution),
        statusName: form.statusName || project.projectStatus?.name,
      };

      await projectService.updateProject(projectId, payload);

      alert("✅ Proyecto actualizado correctamente");

      // 🔹 Recargar exactamente igual que el de creación
      onClose();
      router.push("/dashboard/academic");
      window.location.reload(); // fuerza actualización total (igual que crear)
    } catch (err) {
      console.error(err);
      alert("❌ Error al actualizar el proyecto");
    } finally {
      setLoading(false);
    }
  };





  // 🔹 Asignar usuario
  const handleAssignUser = async () => {
    if (!selectedUser || !selectedRole) {
      alert("Selecciona un usuario y un rol.");
      return;
    }

    try {
      await projectService.assignUserToProject(projectId, selectedUser, selectedRole);
      alert("✅ Usuario asignado correctamente");
      setSelectedUser(null);
      setSelectedRole(null);

      // refresca usuarios del proyecto
      const updated = await projectService.getUsersInProject(projectId);
      setUsers(updated);
    } catch (err) {
      console.error(err);
      alert("❌ No se pudo asignar el usuario.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg"
        >
          ✖
        </button>

        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          ✏️ Editar Proyecto
        </h2>

        {/* Formulario */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="col-span-2">
            <label className="block text-gray-500 mb-1 font-medium">Nombre</label>
            <input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-gray-500 mb-1 font-medium">Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div>
            <label className="block text-gray-500 mb-1 font-medium">Fecha Fin</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => handleChange("endDate", e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div>
            <label className="block text-gray-500 mb-1 font-medium">Estado</label>
            <select
              value={form.statusName}
              onChange={(e) => handleChange("statusName", e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">Seleccionar estado</option>
              {statuses.map((s) => (
                <option
                  key={s.IDProjectStatus ?? s.idProjectStatus ?? s.name}
                  value={s.name}
                >
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-500 mb-1 font-medium">Progreso (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={form.percentageProgress}
              onChange={(e) => handleChange("percentageProgress", e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div>
            <label className="block text-gray-500 mb-1 font-medium">Presupuesto</label>
            <input
              type="number"
              value={form.budget}
              onChange={(e) => handleChange("budget", e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div>
            <label className="block text-gray-500 mb-1 font-medium">Costo</label>
            <input
              type="number"
              value={form.cost}
              onChange={(e) => handleChange("cost", e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-gray-500 mb-1 font-medium">% Ejecución Presupuesto</label>
            <input
              type="number"
              min="0"
              max="100"
              value={form.percentageBudgetExecution}
              onChange={(e) => handleChange("percentageBudgetExecution", e.target.value)}
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
            Asignar Usuario
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
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}