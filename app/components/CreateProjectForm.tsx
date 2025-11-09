"use client";

import React, { useEffect, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { projectService } from "../services/projectService";
import { Methodology, ProjectStatus, ProjectFormData } from "../types/project";

type Props = {
  user: any;
  onCreated?: (project: any) => void;
  onClose?: () => void;
};

export default function CreateProjectForm({ user, onCreated, onClose }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [methodologies, setMethodologies] = useState<Methodology[]>([]);
  const [projectStatuses, setProjectStatuses] = useState<ProjectStatus[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    budget: "",
    methodology: "",
    status: "",
  });

  const [formErrors, setFormErrors] = useState<Partial<ProjectFormData>>({});

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoadingData(true);
        const [methodologiesData, statusesData] = await Promise.all([
          projectService.getMethodologies(),
          projectService.getProjectStatuses(),
        ]);
        
        console.log('Raw project statuses response:', statusesData);
        
        // Always use our default states to ensure consistency
        const defaultStates: ProjectStatus[] = [
          { IDProjectStatus: 1, name: "En Progreso" },
          { IDProjectStatus: 2, name: "Completado" },
          { IDProjectStatus: 3, name: "Pendiente" }
        ];
        
        // Use default states for now to ensure consistent behavior
        const combinedStatuses = defaultStates;
        
        console.log('Combined statuses:', combinedStatuses);
        
        setMethodologies(methodologiesData);
        setProjectStatuses(combinedStatuses);
      } catch (err) {
        setError("Error al cargar los datos iniciales");
        console.error("Error loading initial data:", err);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadInitialData();
  }, []);

  const validateForm = (): boolean => {
    const errors: Partial<ProjectFormData> = {};

    if (!formData.name.trim()) {
      errors.name = "El nombre del proyecto es requerido";
    }

    if (!formData.description.trim()) {
      errors.description = "La descripción es requerida";
    }

    if (!formData.startDate) {
      errors.startDate = "La fecha de inicio es requerida";
    }

    if (!formData.endDate) {
      errors.endDate = "La fecha de fin es requerida";
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate <= startDate) {
        errors.endDate = "La fecha de fin debe ser posterior a la fecha de inicio";
      }
    }

    if (formData.budget && (isNaN(Number(formData.budget)) || Number(formData.budget) < 0)) {
      errors.budget = "El presupuesto debe ser un número válido mayor o igual a 0";
    }

    if (!formData.methodology) {
      errors.methodology = "Debe seleccionar una metodología";
    }

    if (!formData.status) {
      errors.status = "Debe seleccionar un estado";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof ProjectFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCreateProject = async () => {
    if (!validateForm() || !user) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Form data status:', formData.status);
      console.log('Available statuses:', projectStatuses);

      // Get selected status from our list or create a default one
      const statusId = Number(formData.status);
      let selectedStatus: ProjectStatus;

      const existingStatus = projectStatuses.find(
        (s) => s.IDProjectStatus === statusId
      );

      if (existingStatus) {
        selectedStatus = existingStatus;
      } else {
        // Create default status based on ID
        switch (statusId) {
          case 1:
            selectedStatus = { IDProjectStatus: 1, name: "En Progreso" };
            break;
          case 2:
            selectedStatus = { IDProjectStatus: 2, name: "Completado" };
            break;
          case 3:
            selectedStatus = { IDProjectStatus: 3, name: "Pendiente" };
            break;
          default:
            throw new Error('Por favor selecciona un estado válido para el proyecto');
        }
      }

      console.log('Selected status:', selectedStatus);

      if (!selectedStatus) {
        throw new Error('Por favor selecciona un estado válido para el proyecto');
      }

      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: formData.budget ? Number(formData.budget) : undefined,
        methodologyName: formData.methodology,
        statusName: selectedStatus.name,
        IDProjectStatus: selectedStatus.IDProjectStatus
      };

      const newProject = await projectService.createProject(projectData, user.id);

      setSuccess(`¡Proyecto "${newProject.name}" creado exitosamente!`);

      setFormData({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        budget: "",
        methodology: "",
        status: "",
      });

      if (onCreated) onCreated(newProject);
    } catch (err) {
      console.error("Error al crear el proyecto:", err);
      setError(err instanceof Error ? err.message : "Error al crear el proyecto");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="text-center py-8">
        <LoadingSpinner size="md" text="Cargando datos..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreateProject();
        }}
        className="space-y-6"
      >
        <div>
          <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Proyecto *
          </label>
          <input
            type="text"
            id="projectName"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black ${
              formErrors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Ingresa el nombre de tu proyecto"
          />
          {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
        </div>

        <div>
          <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-2">
            Descripción *
          </label>
          <textarea
            id="projectDescription"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none text-black ${
              formErrors.description ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Describe los objetivos y alcance de tu proyecto"
          />
          {formErrors.description && <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Inicio *
            </label>
            <input
              type="date"
              id="startDate"
              value={formData.startDate}
              onChange={(e) => handleInputChange("startDate", e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black ${
                formErrors.startDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formErrors.startDate && <p className="mt-1 text-sm text-red-600">{formErrors.startDate}</p>}
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Fin *
            </label>
            <input
              type="date"
              id="endDate"
              value={formData.endDate}
              onChange={(e) => handleInputChange("endDate", e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black ${
                formErrors.endDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formErrors.endDate && <p className="mt-1 text-sm text-red-600">{formErrors.endDate}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
            Presupuesto (opcional)
          </label>
          <input
            type="number"
            id="budget"
            value={formData.budget}
            onChange={(e) => handleInputChange("budget", e.target.value)}
            min="0"
            step="0.01"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black ${
              formErrors.budget ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="0.00"
          />
          {formErrors.budget && <p className="mt-1 text-sm text-red-600">{formErrors.budget}</p>}
        </div>

        <div>
          <label htmlFor="methodology" className="block text-sm font-medium text-gray-700 mb-2">
            Metodología *
          </label>

          <select
            id="methodology"
            value={formData.methodology}
            onChange={(e) => handleInputChange("methodology", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black ${
              formErrors.methodology ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Selecciona una metodología</option>
            {methodologies.map((methodology: any) => (
              <option key={methodology.IDMethodology} value={methodology.name}>
                {methodology.name}
              </option>
            ))}
          </select>

          {formErrors.methodology && <p className="mt-1 text-sm text-red-600">{formErrors.methodology}</p>}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Estado Inicial *
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => {
              console.log('Status selected:', e.target.value);
              handleInputChange("status", e.target.value);
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black ${
              formErrors.status ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Selecciona un estado</option>
            {projectStatuses.length > 0 ? (
              projectStatuses.map((status) => (
                <option 
                  key={String(status.IDProjectStatus)} 
                  value={String(status.IDProjectStatus)}
                >
                  {status.name}
                </option>
              ))
            ) : (
              <>
                <option value="1">En Progreso</option>
                <option value="2">Completado</option>
                <option value="3">Pendiente</option>
              </>
            )}
          </select>
          {formErrors.status && <p className="mt-1 text-sm text-red-600">{formErrors.status}</p>}
        </div>

        <div className="flex gap-4 pt-4">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Volver
            </button>
          )}

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
              "🚀 Crear Proyecto"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
