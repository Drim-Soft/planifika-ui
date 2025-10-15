"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../contexts/AuthContext";
import { UserRole } from "../../../types/auth";
import { getRoleLabel } from "../../../utils/roleUtils";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { projectService } from "../../../services/projectService";
import { Methodology, ProjectStatus, ProjectFormData } from "../../../types/project";

export default function CreateAcademicProject() {
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
      router.push('/');
      return;
    }

    if (user && user.role !== UserRole.COLLABORATOR) {
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
      
      setSuccess(`¡Proyecto académico "${newProject.name}" creado exitosamente!`);
      
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
      
      // Redirigir al dashboard académico después de 2 segundos
      setTimeout(() => {
        router.push('/dashboard/academic');
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

  // Si no está autenticado o no es colaborador, no mostrar nada (se redirigirá)
  if (!isAuthenticated || !user || user.role !== UserRole.COLLABORATOR) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-xl">🎓</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  <span className="text-yellow-500">Planifika</span>
                </h1>
                <p className="text-sm text-gray-600">Crear Proyecto Académico</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">Estudiante</p>
              </div>
              <button
                onClick={logout}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header del formulario */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Crear Nuevo Proyecto Académico 🚀
          </h2>
          <p className="text-gray-600">
            Completa la información para crear tu proyecto académico y comenzar a trabajar en él.
          </p>
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
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={(e) => { e.preventDefault(); handleCreateProject(); }} className="space-y-6">
            
            {/* Nombre del proyecto */}
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Proyecto Académico *
              </label>
              <input
                type="text"
                id="projectName"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors text-black ${
                  formErrors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Sistema de Gestión Académica, Aplicación Móvil de Tareas..."
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción del Proyecto *
              </label>
              <textarea
                id="projectDescription"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors resize-none text-black ${
                  formErrors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe los objetivos, alcance y características principales de tu proyecto académico..."
              />
              {formErrors.description && (
                <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
              )}
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio *
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors text-black ${
                    formErrors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.startDate}</p>
                )}
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Entrega *
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors text-black ${
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
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors text-black ${
                  formErrors.budget ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {formErrors.budget && (
                <p className="mt-1 text-sm text-red-600">{formErrors.budget}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Si tu proyecto tiene un presupuesto asignado, puedes registrarlo aquí
              </p>
            </div>

            {/* Metodología */}
            <div>
              <label htmlFor="methodology" className="block text-sm font-medium text-gray-700 mb-2">
                Metodología de Desarrollo *
              </label>
              <select
                id="methodology"
                value={formData.methodology}
                onChange={(e) => handleInputChange('methodology', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors text-black ${
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
              <p className="mt-1 text-xs text-gray-500">
                Selecciona la metodología que utilizarás para desarrollar tu proyecto
              </p>
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
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors text-black ${
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
              <p className="mt-1 text-xs text-gray-500">
                Define el estado inicial de tu proyecto
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-4 pt-6">
              <Link
                href="/dashboard/academic"
                className="flex-1 text-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Volver al Dashboard
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white text-lg py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Creando...</span>
                  </div>
                ) : (
                  '🚀 Crear Proyecto Académico'
                )}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
