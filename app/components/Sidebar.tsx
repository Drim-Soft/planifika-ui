import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../contexts/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`bg-white shadow h-screen flex flex-col transition-all duration-200 ${collapsed ? 'w-20' : 'w-64'} fixed left-0 top-0 z-30`}>
      {/* Toggle button */}
      <button
        className="p-2 focus:outline-none hover:bg-gray-100"
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? "Expandir" : "Comprimir"}
      >
        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {collapsed ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 12L6 6" />
          )}
        </svg>
      </button>

      {/* User info */}
      <div className={`flex flex-col items-center py-6 ${collapsed ? 'px-0' : 'px-4'}`}>
        <Link href="/dashboard/profile" className="relative group">
          {user?.photoUrl ? (
            user.photoUrl.startsWith('http') ? (
              <img
                src={user.photoUrl}
                alt="Foto de perfil"
                width={collapsed ? 40 : 80}
                height={collapsed ? 40 : 80}
                className={`rounded-full object-cover border ${collapsed ? 'w-10 h-10' : 'w-20 h-20'} cursor-pointer`}
              />
            ) : (
              <Image
                src={user.photoUrl}
                alt="Foto de perfil"
                width={collapsed ? 40 : 80}
                height={collapsed ? 40 : 80}
                className={`rounded-full object-cover border ${collapsed ? 'w-10 h-10' : 'w-20 h-20'} cursor-pointer`}
              />
            )
          ) : (
            <div className={`rounded-full bg-gray-200 flex items-center justify-center text-gray-400 ${collapsed ? 'w-10 h-10' : 'w-20 h-20'} cursor-pointer text-2xl`}>?</div>
          )}
        </Link>
        {!collapsed && (
          <div className="mt-3 text-center">
            <p className="text-base font-semibold text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">Usuario Externo</p>
          </div>
        )}
      </div>

      {/* Opciones (puedes agregar más) */}
      <nav className="flex-1 flex flex-col gap-2 px-2 mt-4">
        <Link href="/dashboard/external" className="block py-2 px-3 rounded hover:bg-blue-50 text-gray-700 text-sm font-medium">Dashboard</Link>
        <Link href="/dashboard/profile" className="block py-2 px-3 rounded hover:bg-blue-50 text-gray-700 text-sm font-medium">Editar Perfil</Link>
        <button
          onClick={logout}
          className="block py-2 px-3 rounded hover:bg-red-50 text-gray-700 text-sm font-medium text-left"
        >
          Cerrar Sesión
        </button>
      </nav>
    </aside>
  );
}
