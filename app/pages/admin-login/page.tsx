"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { EXTERNAL_URLS } from "../../config/urls";
import { getRoleLabel } from "../../utils/roleUtils";
import LoadingSpinner from "../../components/LoadingSpinner";
import { getFriendlyErrorMessage } from "../../utils/errorMessages";

export default function AdminLogin() {
  const { login, isLoading, error, logout, user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Limpiar errores cuando el usuario empiece a escribir
    if (localError) setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    try {
      await login({
        email: formData.email,
        password: formData.password
      });
    } catch (error) {
      setLocalError(getFriendlyErrorMessage(error));
    }
  };


  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo borroso */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#f3f4f6',
          filter: 'blur(2px)'
        }}
      ></div>
      
      {/* Contenido principal nítido */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 animate-fade-in">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">👨‍💼</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Iniciar Sesión
            </h1>
            <h2 className="text-lg text-yellow-600 font-semibold">
              Administrador / Usuario Externo
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Accede a tu cuenta
            </p>
          </div>

          {/* Mostrar errores */}
          {(error || localError) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                {getFriendlyErrorMessage(error) || localError}
              </p>
            </div>
          )}


          {/* Información del usuario si está autenticado */}
          {isAuthenticated && user && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-green-800">
                    <strong>Usuario autenticado:</strong> {user.name}
                  </p>
                  <p className="text-xs text-green-600">
                    Email: {user.email} | Rol: {getRoleLabel(user.role)}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="text-sm text-red-600 hover:text-red-800 font-medium underline"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="planifika-input"
                placeholder="admin@planifika.com"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="planifika-input"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                  Recordarme
                </label>
              </div>
              <Link 
                href="#" 
                className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full planifika-button-primary text-base py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Iniciando sesión...</span>
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start">
              <div className="text-yellow-600 mr-2">ℹ️</div>
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Tipos de Usuario</p>
                <p className="text-xs">
                  <strong>Administradores:</strong> Acceso completo al sistema<br/>
                  <strong>Usuarios Externos:</strong> Solo pueden crear y gestionar proyectos
                </p>
              </div>
            </div>
          </div>

          {/* Enlaces adicionales */}
          <div className="mt-8 space-y-3 text-center">
            <div>
              <p className="text-sm text-gray-600">
                ¿No tienes cuenta?{" "}
                <Link 
                  href="/pages/signup?role=1" 
                  className="text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  Regístrate como administrador
                </Link>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                ¿Necesitas acceso externo?{" "}
                <Link 
                  href="/pages/signup?role=2" 
                  className="text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  Regístrate como usuario externo
                </Link>
              </p>
            </div>
          </div>

          </div>
        </div>
      </div>
    </div>
  );
}
