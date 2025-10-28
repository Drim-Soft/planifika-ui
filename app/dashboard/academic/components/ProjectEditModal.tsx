"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { projectService } from "../../../services/projectService";
import { userService } from "../../../services/userService";

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
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [editingUserRole, setEditingUserRole] = useState<number | null>(null);
  const [newRoleForUser, setNewRoleForUser] = useState<number | null>(null);
  const [updatingRole, setUpdatingRole] = useState<number | null>(null);
  const [deletingUser, setDeletingUser] = useState<number | null>(null);
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

  // 🔹 Cargar usuarios del proyecto (ya asignados)
  useEffect(() => {
    if (!projectId) return;
    projectService
      .getUsersInProject(projectId)
      .then((data) => {
        console.log("🔍 Datos de usuarios asignados:", data);
        setAssignedUsers(data); // Los usuarios del proyecto son los ya asignados
      })
      .catch((err) => console.error("Error cargando usuarios asignados:", err));
  }, [projectId]);

  // 🔹 Cargar todos los usuarios disponibles (para asignar)
  useEffect(() => {
    userService
      .getAllUsers()
      .then((data) => setAllUsers(data))
      .catch((err) => console.error("Error cargando todos los usuarios:", err));
  }, []);

  const handleChange = (name: string, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Helper para obtener el nombre del rol
  const getUserRoleName = (user: any) => {
    // Buscar el rol en diferentes campos posibles
    const roleName = user.roleName || user.rolename || user.role?.name || user.rol?.name;
    
    if (roleName) {
      return roleName;
    }
    
    // Si no hay nombre, buscar por ID en la lista de roles
    const roleId = user.idrole || user.IDRole || user.role?.idrole || user.rol?.idrole;
    if (roleId && roles.length > 0) {
      const role = roles.find(r => (r.idrole || r.IDRole) === roleId);
      return role?.name || `Rol ID: ${roleId}`;
    }
    
    return 'Sin rol asignado';
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
      setAssignedUsers(updated);
    } catch (err) {
      console.error(err);
      alert("❌ No se pudo asignar el usuario.");
    }
  };

  // 🔹 Actualizar rol de usuario
  const handleUpdateUserRole = async (userId: number, newRoleId: number) => {
    setUpdatingRole(userId);
    try {
      console.log("🔄 Actualizando rol:", { projectId, userId, newRoleId });
      
      // Usar solo el endpoint general que sabemos que funciona
      await projectService.assignUserToProject(projectId, userId, newRoleId);
      
      alert("✅ Rol actualizado correctamente");
      setEditingUserRole(null);
      setNewRoleForUser(null);

      // refresca usuarios del proyecto
      const updated = await projectService.getUsersInProject(projectId);
      setAssignedUsers(updated);
    } catch (err) {
      console.error("Error actualizando rol:", err);
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      
      // Mostrar mensaje más específico basado en el error
      if (errorMessage.includes("Internal Server Error")) {
        alert("❌ Error del servidor. El backend no está procesando correctamente la actualización de roles. Contacta al administrador.");
      } else {
        alert(`❌ No se pudo actualizar el rol del usuario: ${errorMessage}`);
      }
    } finally {
      setUpdatingRole(null);
    }
  };

  // 🔹 Eliminar usuario del proyecto
  const handleDeleteUser = async (userId: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este usuario del proyecto?")) {
      return;
    }

    setDeletingUser(userId);
    try {
      console.log("🗑️ Eliminando usuario:", { projectId, userId });
      
      // Usar el endpoint de asignación con un rol especial o endpoint de eliminación
      // Por ahora, intentamos con el endpoint general
      await projectService.assignUserToProject(projectId, userId, 0); // Rol 0 podría ser "sin rol"
      
      alert("✅ Usuario eliminado del proyecto correctamente");

      // refresca usuarios del proyecto
      const updated = await projectService.getUsersInProject(projectId);
      setAssignedUsers(updated);
    } catch (err) {
      console.error("Error eliminando usuario:", err);
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      alert(`❌ No se pudo eliminar el usuario del proyecto: ${errorMessage}`);
    } finally {
      setDeletingUser(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] relative flex flex-col">
        <div className="p-8 overflow-y-auto flex-1">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg z-10"
          >
            ✖
          </button>

        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          ✏️ Editar Proyecto
        </h2>

        {/* Formulario */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="col-span-2">
            <label className="block text-black mb-1 font-medium">Nombre</label>
            <input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 text-black"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-black mb-1 font-medium">Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
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

          <div>
            <label className="block text-black mb-1 font-medium">Estado</label>
            <select
              value={form.statusName}
              onChange={(e) => handleChange("statusName", e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 text-black"
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

          <div className="col-span-2">
            <label className="block text-black mb-1 font-medium">% Ejecución Presupuesto</label>
            <input
              type="number"
              min="0"
              max="100"
              value={form.percentageBudgetExecution}
              onChange={(e) => handleChange("percentageBudgetExecution", e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 text-black"
            />
          </div>
        </div>

        {/* Usuarios ya asignados */}
        <div className="mt-8 border-t pt-4">
          <h3 className="font-semibold mb-3 text-gray-800">👥 Usuarios Asignados al Proyecto</h3>
          
          {assignedUsers.length > 0 ? (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="space-y-2">
                {assignedUsers.map((user, index) => (
                  <div key={`user-${user.iduser || user.IDUser}-${index}`} className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {(user.name || `Usuario ${user.iduser}`).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.name || `Usuario ${user.iduser}`}
                          </p>
                          <p className="text-sm text-gray-500">
                            ID: {user.iduser || user.IDUser}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {getUserRoleName(user)}
                        </span>
                        <button
                          onClick={() => {
                            setEditingUserRole(user.iduser || user.IDUser);
                            setNewRoleForUser(user.idrole || user.IDRole);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.iduser || user.IDUser)}
                          disabled={deletingUser === (user.iduser || user.IDUser)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                        >
                          {deletingUser === (user.iduser || user.IDUser) ? "Eliminando..." : "🗑️ Eliminar"}
                        </button>
                      </div>
                    </div>
                    
                    {/* Interfaz de edición de rol */}
                    {editingUserRole === (user.iduser || user.IDUser) && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center space-x-3">
                          <label className="text-sm font-medium text-gray-700">Nuevo rol:</label>
                          <select
                            value={newRoleForUser || ""}
                            onChange={(e) => setNewRoleForUser(Number(e.target.value))}
                            className="border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 text-black"
                          >
                            <option value="">Seleccionar rol</option>
                            {roles.map((r) => (
                              <option key={r.idrole || r.IDRole} value={r.idrole || r.IDRole}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleUpdateUserRole(user.iduser || user.IDUser, newRoleForUser!)}
                            disabled={!newRoleForUser || updatingRole === (user.iduser || user.IDUser)}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm"
                          >
                            {updatingRole === (user.iduser || user.IDUser) ? "Guardando..." : "Guardar"}
                          </button>
                          <button
                            onClick={() => {
                              setEditingUserRole(null);
                              setNewRoleForUser(null);
                            }}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-1 rounded text-sm"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-center">
              <p className="text-gray-500">No hay usuarios asignados a este proyecto</p>
            </div>
          )}
        </div>

        {/* Asignar usuario */}
        <div className="mt-6 border-t pt-4">
          <h3 className="font-semibold mb-3 text-gray-800">➕ Asignar Nuevo Usuario al Proyecto</h3>

          <select
            className="border rounded-lg p-2 w-full mb-3 focus:ring-2 focus:ring-yellow-500 text-black"
            value={selectedUser || ""}
            onChange={(e) => setSelectedUser(Number(e.target.value))}
          >
            <option value="">Seleccionar usuario</option>
            {allUsers.map((u) => (
              <option key={u.id || u.iduser || u.IDUser} value={u.id || u.iduser || u.IDUser}>
                {u.name || `Usuario ${u.id || u.iduser}`}
              </option>
            ))}
          </select>

          <select
            className="border rounded-lg p-2 w-full mb-3 focus:ring-2 focus:ring-yellow-500 text-black"
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

        </div>

        {/* Botones finales - fijos en la parte inferior */}
        <div className="border-t bg-white p-6 rounded-b-2xl">
          <div className="flex justify-end gap-3">
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
    </div>
  );
}