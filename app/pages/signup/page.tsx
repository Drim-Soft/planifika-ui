"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { EXTERNAL_URLS } from "../../config/urls";

export default function SignUp() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Solo visual - sin implementación lógica
    console.log("Sign up:", formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#A19186' }}>
      {/* Card principal */}
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[600px]">
          {/* Sección Visual - 70% */}
          <div 
            className="lg:w-[70%] relative overflow-hidden"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              minHeight: '400px'
            }}
          >
            {/* Overlay con color #A19186 */}
            <div className="absolute inset-0" style={{ backgroundColor: '#A19186', opacity: 0.3 }}></div>
            
            {/* Contenido de la sección visual */}
            <div className="relative z-10 flex flex-col justify-between h-full p-8 lg:p-12 text-white">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <Image
                  src="/assets/images/planifika_logo.png"
                  alt="Planifika Logo"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
                <div>
                  <h1 className="text-2xl font-bold">Planifika</h1>
                  <p className="text-sm opacity-90">VENTURES</p>
                </div>
              </div>

              {/* Mensaje principal */}
              <div className="max-w-md">
                <h2 className="text-3xl lg:text-4xl font-bold mb-6 leading-tight">
                  IF YOU BELIEVE IN AN IDEA AND WE BELIEVE IN YOU, IT'S A PARTNERSHIP THAT WILL FLY
                </h2>
                <p className="text-lg opacity-90">
                  Únete a la comunidad de estudiantes y profesionales que están transformando la educación.
                </p>
              </div>
            </div>
          </div>

          {/* Sección del Formulario - 30% */}
          <div className="lg:w-[30%] flex items-center justify-center p-8">
            <div className="w-full max-w-sm">
              {/* Formulario */}
              <div className="w-full">
                {/* Icono y título */}
                <div className="text-center mb-6">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Image
                      src="/assets/images/planifika_logo.png"
                      alt="Planifika Logo"
                      width={24}
                      height={24}
                      className="w-6 h-6"
                    />
                  </div>
                  <h1 className="text-xl font-bold text-gray-800 mb-2">
                    Crear cuenta
                  </h1>
                  <p className="text-sm text-gray-600">
                    Únete a Planifika
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none bg-transparent text-sm"
                        placeholder="tu.email@universidad.edu"
                        required
                      />
                      <div className="absolute right-2 top-2 text-gray-400 text-sm">
                        ✉️
                      </div>
                    </div>
                  </div>

                  {/* Contraseña */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none bg-transparent text-sm"
                        placeholder="••••••••"
                        required
                      />
                      <div className="absolute right-2 top-2 text-gray-400 text-sm">
                        🔒
                      </div>
                    </div>
                  </div>

                  {/* Confirmar Contraseña */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none bg-transparent text-sm"
                        placeholder="••••••••"
                        required
                      />
                      <div className="absolute right-2 top-2 text-gray-400 text-sm">
                        🔒
                      </div>
                    </div>
                  </div>

                  {/* Botón de registro */}
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                  >
                    CREAR CUENTA
                  </button>
                </form>

                {/* Enlaces adicionales */}
                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-600">
                    ¿Ya tienes una cuenta?{" "}
                    <Link 
                      href={EXTERNAL_URLS.MAIN_SYSTEM} 
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Inicia sesión
                    </Link>
                  </p>
                </div>

                {/* Separador */}
                <div className="mt-4 flex items-center">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="px-2 text-xs text-gray-500">o</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* Enlace a login de administrador */}
                <div className="mt-4 text-center">
                  <Link 
                    href="/pages/admin-login" 
                    className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                  >
                    ¿Eres administrador?{" "}
                    <span className="text-blue-600">Inicia sesión aquí</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
