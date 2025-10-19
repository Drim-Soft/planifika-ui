import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, LogOut, UserCircle, Edit2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

type SidebarProfileProps = {
  hideEdit?: boolean;
  roleLabel?: string;
  dashboardHref?: string;
};

export default function SidebarProfile({ hideEdit = false, roleLabel = "Usuario Externo", dashboardHref = "/dashboard/external" }: SidebarProfileProps) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`bg-gradient-to-b from-[#222831] to-[#1a1f26] text-white transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} h-screen sticky top-0 flex-shrink-0 flex flex-col shadow-2xl z-30`}>
      {/* Header con foto y nombre */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative group">
            {hideEdit ? (
              <div>
                {/* Wrapper cuadrado para asegurar círculo perfecto */}
                <div className={`${collapsed ? 'w-10 h-10' : 'w-16 h-16'} rounded-full overflow-hidden border-2 border-[#FFD369] ${collapsed ? 'bg-white' : 'bg-transparent'} flex items-center justify-center shrink-0`}>
                  {collapsed ? (
                    <Image
                      src="/assets/images/planifika_logo.png"
                      alt="Logo Planifika"
                      width={collapsed ? 40 : 64}
                      height={collapsed ? 40 : 64}
                      className="object-contain p-1"
                    />
                  ) : user?.photoUrl ? (
                    user.photoUrl.startsWith('http') ? (
                      <img
                        src={user.photoUrl}
                        alt="Foto de perfil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src={user.photoUrl}
                        alt="Foto de perfil"
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    <UserCircle className="w-full h-full text-[#FFD369]" />
                  )}
                </div>
              </div>
            ) : (
              <Link href="/dashboard/profile">
              {/* Wrapper cuadrado para asegurar círculo perfecto */}
              <div className={`${collapsed ? 'w-10 h-10' : 'w-16 h-16'} rounded-full overflow-hidden border-2 border-[#FFD369] ${collapsed ? 'bg-white' : 'bg-transparent'} flex items-center justify-center shrink-0`}>
                {collapsed ? (
                  // En modo colapsado mostrar logo Planifika sobre fondo blanco
                  <Image
                    src="/assets/images/planifika_logo.png"
                    alt="Logo Planifika"
                    width={collapsed ? 40 : 64}
                    height={collapsed ? 40 : 64}
                    className="object-contain p-1"
                  />
                ) : user?.photoUrl ? (
                  user.photoUrl.startsWith('http') ? (
                    // Remoto: usar <img>
                    <img
                      src={user.photoUrl}
                      alt="Foto de perfil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    // Local: usar <Image> de Next
                    <Image
                      src={user.photoUrl}
                      alt="Foto de perfil"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <UserCircle className="w-full h-full text-[#FFD369]" />
                )}
              </div>
              {/* Icono editar al pasar mouse */}
              {!collapsed && !hideEdit && (
                <span className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Edit2 className="w-5 h-5 text-[#FFD369] bg-black bg-opacity-60 rounded-full p-1" />
                </span>
              )}
            </Link>
            )}
          </div>
          {!collapsed && (
            <div className="ml-2">
              <p className="text-base font-semibold text-[#FFD369]">{user?.name}</p>
              <p className="text-xs text-gray-400">{roleLabel}</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200"
          title={collapsed ? "Expandir" : "Comprimir"}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Opciones */}
      <nav className="flex-1 flex flex-col gap-2 px-2 mt-6">
        <Link href={dashboardHref} className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-[#FFD369]/10 text-gray-200 text-sm font-medium">
          <UserCircle className="w-5 h-5 text-[#FFD369]" />
          {!collapsed && <span>Dashboard</span>}
        </Link>
        {!hideEdit && (
          <Link href="/dashboard/profile" className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-[#FFD369]/10 text-gray-200 text-sm font-medium">
            <Edit2 className="w-5 h-5 text-[#FFD369]" />
            {!collapsed && <span>Editar Perfil</span>}
          </Link>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 p-2 w-full text-gray-300 hover:bg-gray-700 hover:text-white rounded-xl transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
          {!collapsed && <span className="font-medium">Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
}
