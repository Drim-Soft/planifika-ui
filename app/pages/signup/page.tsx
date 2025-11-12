"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { EXTERNAL_URLS } from "../../config/urls";
import { useAuth } from "../../contexts/AuthContext";
import { UserRole, SignupRequest } from "../../types/auth";
import { getRoleFromUrlParam, getRoleLabel, getRoleDescription, validateRole } from "../../utils/roleUtils";
import { useFormValidation } from "../../hooks/useFormValidation";
import LoadingSpinner from "../../components/LoadingSpinner";
import { getFriendlySignupErrorMessage } from "../../utils/errorMessages";
import ImageReCaptcha from "../../components/ImageReCaptcha";
import PasswordMeter from "../../components/PasswordMeter";

function SignUpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { signup, isLoading, error } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    photoUrl: ""
  });

  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  
  // Configurar reglas de validación
  const validationRules = {
    name: { required: true, minLength: 2, maxLength: 100 },
    email: { 
      required: true, 
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      custom: (value: string) => {
        if (!value.includes('@')) return 'El email debe contener @';
        if (!value.includes('.')) return 'El email debe contener un dominio válido';
        return null;
      }
    },
    password: { required: true, minLength: 6, maxLength: 50 },
    confirmPassword: { 
      required: true,
      custom: (value: string) => {
        if (value !== formData.password) return 'Las contraseñas no coinciden';
        return null;
      }
    },
    phone: { 
      required: userRole === UserRole.ADMIN,
      pattern: /^[\+]?[1-9][\d]{0,15}$/,
      custom: (value: string) => {
        if (userRole === UserRole.ADMIN && !value) return 'El teléfono es requerido para administradores';
        return null;
      }
    },
    photoUrl: {
      pattern: /^https?:\/\/.+/,
      custom: (value: string) => {
        if (value && !value.match(/^https?:\/\/.+/)) {
          return 'La URL debe comenzar con http:// o https://';
        }
        return null;
      }
    }
  };

  const { errors, validateForm, validateSingleField, clearError } = useFormValidation(validationRules);

  // Obtener el rol desde la URL
  useEffect(() => {
    const roleParam = searchParams.get('role');
    const role = getRoleFromUrlParam(roleParam);
    
    if (!role || !validateRole(role)) {
      // Si no hay rol válido, redirigir a la página principal
      router.push('/');
      return;
    }
    
    setUserRole(role);
  }, [searchParams, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validar campo en tiempo real
    validateSingleField(name, value);
  };

  // La validación ahora se maneja con el hook useFormValidation

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isCaptchaVerified) {
      return;
    }
    
    if (!validateForm(formData) || !userRole) {
      return;
    }

    try {
      const signupData: SignupRequest = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: userRole,
        photoUrl: formData.photoUrl || undefined
      };

      await signup(signupData);
      // La redirección se maneja en el contexto de autenticación
    } catch (error) {
      console.error("Error en signup:", error);
      // El error se maneja en el contexto
    }
  };

  // Mostrar loading mientras se verifica el rol
  if (!userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#A19186' }}>
        <LoadingSpinner size="lg" text="Verificando acceso..." />
      </div>
    );
  }

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
                {userRole && (
                  <div className="mt-6 p-4 bg-white/20 rounded-lg backdrop-blur-sm">
                    <h3 className="text-xl font-semibold mb-2">
                      Registro como {getRoleLabel(userRole)}
                    </h3>
                    <p className="text-sm opacity-90">
                      {getRoleDescription(userRole)}
                    </p>
                  </div>
                )}
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

                {/* Mostrar error general si existe */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{getFriendlySignupErrorMessage(error)}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Nombre */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Completo
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border-b-2 focus:outline-none bg-transparent text-sm text-black ${
                          errors.name ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                        }`}
                        placeholder="Tu nombre completo"
                        required
                      />
                      <div className="absolute right-2 top-2 text-gray-400 text-sm">
                        👤
                      </div>
                    </div>
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

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
                        className={`w-full px-3 py-2 border-b-2 focus:outline-none bg-transparent text-sm text-black ${
                          errors.email ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                        }`}
                        placeholder="tu.email@universidad.edu"
                        required
                      />
                      <div className="absolute right-2 top-2 text-gray-400 text-sm">
                        ✉️
                      </div>
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
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
                        className={`w-full px-3 py-2 border-b-2 focus:outline-none bg-transparent text-sm text-black ${
                          errors.password ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                        }`}
                        placeholder="••••••••"
                        required
                      />
                      <div className="absolute right-2 top-2 text-gray-400 text-sm">
                        🔒
                      </div>
                    </div>
                    <PasswordMeter password={formData.password} />
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                    )}
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
                        className={`w-full px-3 py-2 border-b-2 focus:outline-none bg-transparent text-sm text-black ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                        }`}
                        placeholder="••••••••"
                        required
                      />
                      <div className="absolute right-2 top-2 text-gray-400 text-sm">
                        🔒
                      </div>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Foto de perfil (opcional) */}
                  <div>
                    <label htmlFor="photoUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      Foto de Perfil (opcional)
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        id="photoUrl"
                        name="photoUrl"
                        value={formData.photoUrl}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border-b-2 focus:outline-none bg-transparent text-sm text-black ${
                          errors.photoUrl ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                        }`}
                        placeholder="https://ejemplo.com/mi-foto.jpg"
                      />
                      <div className="absolute right-2 top-2 text-gray-400 text-sm">
                        📷
                      </div>
                    </div>
                    {errors.photoUrl && (
                      <p className="text-red-500 text-xs mt-1">{errors.photoUrl}</p>
                    )}
                  </div>

                  {/* Campos adicionales para administradores */}
                  {userRole === UserRole.ADMIN && (
                    <>
                      {/* Teléfono */}
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Teléfono
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border-b-2 focus:outline-none bg-transparent text-sm text-black ${
                              errors.phone ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                            }`}
                            placeholder="+57 300 123 4567"
                            required
                          />
                          <div className="absolute right-2 top-2 text-gray-400 text-sm">
                            📞
                          </div>
                        </div>
                        {errors.phone && (
                          <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                        )}
                      </div>

                    </>
                  )}

                  <ImageReCaptcha onVerify={setIsCaptchaVerified} className="mt-4" />

                  {/* Botón de registro */}
                  <button
                    type="submit"
                    disabled={isLoading || !isCaptchaVerified}
                    className={`w-full font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm ${
                      isLoading || !isCaptchaVerified
                        ? 'bg-gray-400 cursor-not-allowed text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isLoading ? 'CREANDO CUENTA...' : 'CREAR CUENTA'}
                  </button>
                </form>

                {/* Enlaces adicionales */}
                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-600">
                    ¿Ya tienes una cuenta?{" "}
                    <Link 
                      href={EXTERNAL_URLS.MAIN_SYSTEM ?? '/'} 
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

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';

export default function SignUp() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" text="Cargando formulario..." />}>
      <SignUpContent />
    </Suspense>
  );
}
