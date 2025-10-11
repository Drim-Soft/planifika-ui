"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import OrganizationModal from "../components/OrganizationModal";
import { organizationService, Organization } from "../services/organizationService";

export default function CreateOrganization() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [backendError, setBackendError] = useState<string | null>(null);

  // Cargar organizaciones al montar el componente
  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setIsLoading(true);
      setBackendError(null);
      const orgs = await organizationService.getAllOrganizations();
      setOrganizations(orgs);
    } catch (error) {
      console.error("Error al cargar organizaciones:", error);
      // En caso de error, mostrar organizaciones vacías
      setOrganizations([]);
      
      // Guardar el error para mostrarlo en la UI
      const errorMessage = error instanceof Error ? error.message : "Error desconocido al cargar organizaciones";
      setBackendError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrganization = async (organizationData: Omit<Organization, 'id'>) => {
    try {
      const newOrganization = await organizationService.createOrganization(organizationData);
      setOrganizations([...organizations, newOrganization]);
      console.log("Organización creada:", newOrganization);
    } catch (error) {
      console.error("Error al crear organización:", error);
      throw error;
    }
  };

  const handleEditOrganization = (org: Organization) => {
    setEditingOrg(org);
    setIsModalOpen(true);
  };

  const handleUpdateOrganization = async (organizationData: Omit<Organization, 'id'>) => {
    if (!editingOrg?.id) return;
    
    try {
      const updatedOrganization = await organizationService.updateOrganization(editingOrg.id, organizationData);
      setOrganizations(organizations.map(org => 
        org.id === editingOrg.id ? updatedOrganization : org
      ));
      setEditingOrg(null);
      console.log("Organización actualizada:", updatedOrganization);
    } catch (error) {
      console.error("Error al actualizar organización:", error);
      throw error;
    }
  };

  const handleDeleteOrganization = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta organización?")) {
      return;
    }

    try {
      await organizationService.deleteOrganization(id);
      setOrganizations(organizations.filter(org => org.id !== id));
      console.log("Organización eliminada:", id);
    } catch (error) {
      console.error("Error al eliminar organización:", error);
      alert("Error al eliminar la organización");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Capa de fondo */}
      <div className="absolute inset-0 -z-10">
        {/* El padre DIRECTO de <Image fill> debe ser relative y tener tamaño */}
        <div className="relative w-full h-full">
          <Image
            src="/assets/images/fondoCrearOrg.jpg"
            alt="Fondo de crear organización"
            fill
            className="object-cover"
            priority
            sizes="100vw"
            onError={(e) => {
              // si falla, puedes dejar un color de fondo de respaldo
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          {/* Oscurecedor */}
          <div className="absolute inset-0 bg-black/30" />
        </div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/90 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                <span className="text-yellow-500">Planifika</span>
              </h1>
              <p className="text-gray-600 mt-1">Gestión de Organizaciones</p>
            </div>
            <Link
              href="/"
              className="planifika-button-secondary flex items-center gap-2"
            >
              ← Volver al Inicio
            </Link>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Botón para crear nueva organización */}
          <div className="mb-8 text-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="planifika-button-primary text-lg px-8 py-3"
            >
              + Crear Nueva Organización
            </button>
          </div>

          {/* Lista de organizaciones */}
          <div>
            <div className="planifika-card bg-white/90 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-black">
                  Mis Organizaciones
                </h3>
                <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
                  {organizations.length} {organizations.length === 1 ? 'organización' : 'organizaciones'}
                </span>
              </div>

              {/* Indicador de error del backend */}
              {backendError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-red-500 text-xl">⚠️</div>
                    <div className="flex-1">
                      <h4 className="text-red-800 font-semibold mb-1">
                        Error de Conexión
                      </h4>
                      <p className="text-red-700 text-sm mb-3">
                        {backendError}
                      </p>
                      <div className="text-xs text-red-600">
                        <p className="font-medium mb-1">Posibles soluciones:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Verifica que el backend esté ejecutándose en http://localhost:8080</li>
                          <li>Revisa que el puerto 8080 no esté siendo usado por otra aplicación</li>
                          <li>Comprueba la configuración de CORS en el backend</li>
                        </ul>
                      </div>
                      <button
                        onClick={loadOrganizations}
                        className="mt-3 text-red-600 hover:text-red-800 text-sm font-medium underline"
                      >
                        🔄 Reintentar conexión
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {organizations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🏢</div>
                  <h4 className="text-lg font-medium text-black mb-2">
                    No hay organizaciones creadas
                  </h4>
                  <p className="text-gray-700 mb-6">
                    Comienza creando tu primera organización para gestionar tus proyectos académicos.
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="planifika-button-primary"
                  >
                    Crear Primera Organización
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {organizations.map((org) => (
                    <div key={org.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200 bg-white/80 backdrop-blur-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-xl font-semibold text-black">{org.name}</h4>
                            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                              {org.serviceType || 'Sin tipo'}
                            </span>
                          </div>
                          <p className="text-gray-800 mb-3">{org.description || 'Sin descripción'}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-700">
                            <span>📅 Creado: {org.createdAt || 'Fecha no disponible'}</span>
                            <span>🆔 ID: {org.id ? org.id.toString().slice(-8) : 'N/A'}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-6">
                          <button
                            onClick={() => handleEditOrganization(org)}
                            className="text-yellow-600 hover:text-yellow-800 text-sm font-medium px-3 py-1 rounded hover:bg-yellow-50 transition-colors"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => org.id && handleDeleteOrganization(org.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 transition-colors"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <OrganizationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingOrg(null);
        }}
        onSave={editingOrg ? handleUpdateOrganization : handleCreateOrganization}
        editingOrganization={editingOrg}
      />
    </div>
  );
}
