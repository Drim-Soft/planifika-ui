"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import OrganizationModal from "../components/OrganizationModal";
import { organizationService, Organization } from "../services/organizationService";
import { useAuth } from "../contexts/AuthContext";
import { UserRole } from "../types/auth";
import { userService } from "../services/userService";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


export default function CreateOrganization() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(true);

  // Verificar autenticación y rol
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
      return;
    }

    if (user && user.role !== UserRole.ADMIN) {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, authLoading, user, router]);

  const handleCreateOrganization = async (organizationData: Omit<Organization, 'IDOrganization'>) => {
    try {
      const newOrganization = await organizationService.createOrganization(organizationData);
      console.log("Organización creada:", newOrganization);
      await userService.updateUserOrganization(user!.id, newOrganization?.id!);
      // Redirigir al dashboard del administrador tras crear y asociar
      router.push('/dashboard');
    } catch (error) {
      console.error("Error al crear organización:", error);
      throw error;
    }
  };

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado o no es admin, no mostrar nada (se redirigirá)
  if (!isAuthenticated || !user || user.role !== UserRole.ADMIN) {
    return null;
  }

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
          <div className="planifika-card bg-white/90 backdrop-blur-sm p-8 text-center">
            <h3 className="text-2xl font-bold text-black mb-2">Crear organización</h3>
            <p className="text-gray-700 mb-6">Registra los datos de tu organización para continuar.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="planifika-button-primary text-lg px-8 py-3"
            >
              + Crear Nueva Organización
            </button>
          </div>
        </div>
      </div>

      <OrganizationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        onSave={handleCreateOrganization}
        editingOrganization={null}
      />
    </div>
  );
}
