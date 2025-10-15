"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { UserRole } from "../../types/auth";
import { getRoleLabel } from "../../utils/roleUtils";
import LoadingSpinner from "../../components/LoadingSpinner";
import { projectService } from "../../services/projectService";
import { Methodology, ProjectStatus, ProjectFormData } from "../../types/project";

export default function CreateNewProject() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [methodologies, setMethodologies] = useState<Methodology[]>([]);
  const [projectStatuses, setProjectStatuses] = useState<ProjectStatus[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Estado del formulario
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: '',
    methodology: '',
    status: ''
  });
  
  const [formErrors, setFormErrors] = useState<Partial<ProjectFormData>>({});

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoadingData(true);
        const [methodologiesData, statusesData] = await Promise.all([
          projectService.getMethodologies(),
          projectService.getProjectStatuses()
        ]);
        setMethodologies(methodologiesData);
        setProjectStatuses(statusesData);
      } catch (err) {
        setError('Error al cargar los datos iniciales');
        console.error('Error loading initial data:', err);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (isAuthenticated && user) {
      loadInitialData();
    }
  }, [isAuthenticated, user]);

  // Verificar autenticación y rol
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/pages/admin-login');
      return;
    }

    if (user && user.role !== UserRole.EXTERNAL) {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, authLoading, user, router]);

  // Validar formulario
  const validateForm = (): boolean => {
    const errors: Partial<ProjectFormData> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'El nombre del proyecto es requerido';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'La descripción es requerida';
    }
    
    if (!formData.startDate) {
      errors.startDate = 'La fecha de inicio es requerida';
    }
    
    if (!formData.endDate) {
      errors.endDate = 'La fecha de fin es requerida';
    }
    
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate <= startDate) {
        errors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }
    
    if (formData.budget && (isNaN(Number(formData.budget)) || Number(formData.budget) < 0)) {
      errors.budget = 'El presupuesto debe ser un número válido mayor o igual a 0';
    }
    
    if (!formData.methodology) {
      errors.methodology = 'Debe seleccionar una metodología';
    }
    
    if (!formData.status) {
      errors.status = 'Debe seleccionar un estado';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof ProjectFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Crear proyecto
  const handleCreateProject = async () => {
    if (!validateForm() || !user) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: formData.budget ? Number(formData.budget) : undefined,
        IDMethodologyRef: Number(formData.methodology),
        IDProjectStatusRef: Number(formData.status)
      };

      const newProject = await projectService.createProject(projectData, user.id);
      
      setSuccess(`¡Proyecto "${newProject.name}" creado exitosamente!`);
      
      // Limpiar formulario
      setFormData({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        budget: '',
        methodology: '',
        status: ''
      });
      
      // Redirigir a la página de proyectos después de 2 segundos
      setTimeout(() => {
        router.push('/create-project');
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el proyecto');
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar loading mientras se verifica la autenticación o se cargan los datos
  if (authLoading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text={authLoading ? "Verificando acceso..." : "Cargando datos..."} />
      </div>
    );
  }

  // Si no está autenticado o no es usuario externo, no mostrar nada (se redirigirá)
  if (!isAuthenticated || !user || user.role !== UserRole.EXTERNAL) {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo borroso */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#f3f4f6',
          filter: 'blur(2px)'
        }}
      ></div>
      
      {/* Contenido principal nítido */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-2xl p-8 animate-fade-in">
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🚀</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Crear Nuevo Proyecto
              </h1>
              <p className="text-lg text-gray-600">
                Completa la información para crear tu proyecto
              </p>
            </div>

            {/* Información del usuario */}
            <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-blue-800">
                    <strong>Usuario:</strong> {user.name}
                  </p>
                  <p className="text-xs text-blue-600">
                    Email: {user.email} | Rol: {getRoleLabel(user.role)}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="text-sm text-red-600 hover:text-red-800 font-medium underline"
                >
                  🚪 Cerrar Sesión
                </button>
              </div>
            </div>

            {/* Mensajes de estado */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <div className="text-red-600 mr-2">❌</div>
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <div className="text-green-600 mr-2">✅</div>
                  <p className="text-green-800 text-sm">{success}</p>
                </div>
              </div>
            )}

            {/* Formulario de creación de proyecto */}
            <form onSubmit={(e) => { e.preventDefault(); handleCreateProject(); }} className="space-y-6">
              
              {/* Nombre del proyecto */}
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Proyecto *
                </label>
                <input
                  type="text"
                  id="projectName"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ingresa el nombre de tu proyecto"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  id="projectDescription"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none text-black ${
                    formErrors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe los objetivos y alcance de tu proyecto"
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                )}
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Inicio *
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black ${
                      formErrors.startDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.startDate}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Fin *
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black ${
                      formErrors.endDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.endDate}</p>
                  )}
                </div>
              </div>

              {/* Presupuesto */}
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                  Presupuesto (opcional)
                </label>
                <input
                  type="number"
                  id="budget"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black ${
                    formErrors.budget ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {formErrors.budget && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.budget}</p>
                )}
              </div>

              {/* Metodología */}
              <div>
                <label htmlFor="methodology" className="block text-sm font-medium text-gray-700 mb-2">
                  Metodología *
                </label>
                <select
                  id="methodology"
                  value={formData.methodology}
                  onChange={(e) => handleInputChange('methodology', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black ${
                    formErrors.methodology ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecciona una metodología</option>
                  {methodologies.map((methodology) => (
                    <option key={methodology.IDMethodology} value={methodology.IDMethodology}>
                      {methodology.name}
                    </option>
                  ))}
                </select>
                {formErrors.methodology && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.methodology}</p>
                )}
              </div>

              {/* Estado del proyecto */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Estado Inicial *
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black ${
                    formErrors.status ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecciona un estado</option>
                  {projectStatuses.map((status) => (
                    <option key={status.IDProjectStatus} value={status.IDProjectStatus}>
                      {status.name}
                    </option>
                  ))}
                </select>
                {formErrors.status && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.status}</p>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex gap-4 pt-4">
                <Link
                  href="/create-project"
                  className="flex-1 text-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ← Volver
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 planifika-button-primary text-lg py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Creando...</span>
                    </div>
                  ) : (
                    '🚀 Crear Proyecto'
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
