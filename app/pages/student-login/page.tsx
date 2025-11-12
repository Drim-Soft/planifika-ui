"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import { getFriendlyErrorMessage } from "../../utils/errorMessages";
import ImageReCaptcha from "../../components/ImageReCaptcha";
import Toggle from "../../components/Toggle";

export const dynamic = 'force-dynamic';

export default function StudentLogin() {
  const { externalLogin, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

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

    if (!isCaptchaVerified) {
      setLocalError("Por favor completa la verificación de seguridad");
      return;
    }

    try {
      await externalLogin({
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
                {getFriendlyErrorMessage(error) || localError}
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
                autoComplete="email"
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
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between">
              <Toggle
                checked={formData.rememberMe}
                onChange={(checked) => setFormData(prev => ({ ...prev, rememberMe: checked }))}
                label="Recordarme"
              />
              <Link 
                href="#" 
                className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <ImageReCaptcha onVerify={setIsCaptchaVerified} className="mt-4" />

            <button
              type="submit"
              disabled={isLoading || !isCaptchaVerified}
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
