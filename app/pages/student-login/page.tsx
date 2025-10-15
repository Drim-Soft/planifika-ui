"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function StudentLogin() {
  const { login, isLoading, error } = useAuth();
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
      setLocalError(error instanceof Error ? error.message : 'Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo borroso */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(https://plus.unsplash.com/premium_photo-1683887034552-4635692bb57c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1169)',
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
            <div className="text-4xl mb-4">🎓</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Iniciar Sesión
            </h1>
            <h2 className="text-lg text-yellow-600 font-semibold">
              Estudiante
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Accede a tu cuenta de estudiante
            </p>
          </div>

          {/* Mostrar errores */}
          {(error || localError) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                {error?.message || localError}
              </p>
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
                placeholder="tu.email@universidad.edu"
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


          {/* Enlace a login de administrador */}
          <div className="mt-6 text-center">
            <Link 
              href="/pages/admin-login" 
              className="text-sm text-gray-600 hover:text-gray-800 font-medium"
            >
              ¿Eres administrador o usuario externo?{" "}
              <span className="text-yellow-600">Inicia sesión aquí</span>
            </Link>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
