"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UserCircle } from "lucide-react";
import SidebarProfile from "../../components/SidebarProfile";
import { useAuth } from "../../contexts/AuthContext";
import { UserRole } from "../../types/auth";
import { organizationService } from "../../services/organizationService";

export default function PeoplePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [orgUsers, setOrgUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    const isAdminWithOrg = user.role === UserRole.ADMIN && !!user.organizationId;
    if (!isAdminWithOrg) {
      // Redirigir otros roles a su dashboard
      if (user.role === UserRole.EXTERNAL) router.replace("/dashboard/external");
      else if (user.role === UserRole.COLLABORATOR) router.replace("/dashboard/academic");
      else router.replace("/dashboard");
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const list = await organizationService.getUsersByOrganization(user.organizationId!);
        setOrgUsers(list || []);
      } catch (e: any) {
        setError(e?.message || "No se pudo cargar la lista");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  const meId = user.id;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarProfile dashboardHref="/dashboard/admin" roleLabel={user.role === UserRole.ADMIN ? "Administrador" : undefined} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Miembros de la organización</h1>
          <p className="text-gray-600 mt-1">Administra y visualiza a los miembros de tu organización.</p>
        </div>

        {/* Barra de búsqueda */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 border border-red-200">{error}</div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse border-2 border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 mb-4 border-4 border-gray-300 dark:border-gray-600 transition-colors"></div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 transition-colors"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2 transition-colors"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20 transition-colors"></div>
                </div>
              </div>
            ))}
          </div>
        ) : orgUsers.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-3">👥</div>
            <p className="text-gray-600">Aún no hay personas registradas en tu organización.</p>
          </div>
        ) : (() => {
          const filteredUsers = orgUsers.filter((u: any) => {
            const name = u.name || u.fullName || u.email || "";
            return name.toLowerCase().includes(searchQuery.toLowerCase());
          });

          if (filteredUsers.length === 0) {
            return (
              <div className="text-center py-16">
                <div className="text-6xl mb-3">🔍</div>
                <p className="text-gray-600 mb-2">No se encontraron miembros con ese nombre.</p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Limpiar búsqueda
                  </button>
                )}
              </div>
            );
          }

          return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((u: any) => {
              const uid = u.id ?? u.iduser ?? u.userId ?? u.IDUser;
              const isMe = uid === meId;
              const name = u.name || u.fullName || u.email || "Usuario";
              const email = u.email || "";
              const photoUrl = (u.photoUrl || u.photoURL || "").trim();
              const roleId = u.role ?? u.roleId ?? u.roleid;
              const roleName = (() => {
                switch (roleId) {
                  case 1: return "Administrador";
                  case 2: return "Externo";
                  case 3: return "Estudiante";
                  case 4: return "Superusuario";
                  default: return u.roleName || u.rolename || "Usuario";
                }
              })();

              return (
                <div key={uid} className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-2 ${isMe ? "border-blue-400 bg-blue-50" : "border-gray-200"}`}>
                  <div className="flex flex-col items-center text-center">
                    {/* Foto de perfil */}
                    <div className={`w-20 h-20 rounded-full overflow-hidden border-4 mb-4 ${isMe ? "border-blue-500" : "border-gray-300"} flex items-center justify-center bg-gray-100`}>
                      {photoUrl ? (
                        photoUrl.startsWith('http') ? (
                          <img
                            src={photoUrl}
                            alt={name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Image
                            src={photoUrl}
                            alt={name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        )
                      ) : (
                        <UserCircle className="w-full h-full text-gray-400" />
                      )}
                    </div>

                    {/* Nombre */}
                    <h3 className={`text-lg font-semibold mb-1 ${isMe ? "text-blue-900" : "text-gray-900"}`}>
                      {name}
                    </h3>

                    {/* Email */}
                    {email && (
                      <p className="text-xs text-gray-500 mb-2 truncate w-full">
                        {email}
                      </p>
                    )}

                    {/* Badge de rol o "Tú" */}
                    <div className="flex items-center gap-2">
                      {isMe && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white">
                          Tú
                        </span>
                      )}
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        roleId === 1 ? "bg-purple-100 text-purple-800" :
                        roleId === 2 ? "bg-green-100 text-green-800" :
                        roleId === 3 ? "bg-yellow-100 text-yellow-800" :
                        roleId === 4 ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {roleName}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          );
        })()}
      </main>
    </div>
  );
}
