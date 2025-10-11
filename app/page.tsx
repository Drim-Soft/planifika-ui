"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import OrganizationModal from "./components/OrganizationModal";
import { organizationService, Organization } from "./services/organizationService";

export default function Home() {
  const [userName, setUserName] = useState("@usuario");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

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

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Imagen de fondo con fallback */}
      <div className="absolute inset-0 z-0 bg-white">
        <Image
          src="/assets/images/planifika_logo.png"
          alt="Fondo de Planifika"
          fill
          className="object-cover"
          priority
          onError={(e) => {
            // Si la imagen falla al cargar, ocultar el overlay
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center text-white animate-fade-in">
            <h1 className="text-5xl lg:text-7xl font-bold mb-8 leading-tight">
              ¡Bienvenido a <span className="text-yellow-400">Planifika</span>!
            </h1>
            <p className="text-xl lg:text-3xl mb-12 leading-relaxed max-w-3xl mx-auto">
              Gracias <span className="font-semibold text-yellow-300">{userName}</span> por confiar en Planifika. 
              Tus proyectos quedarán en las mejores manos. Ahora crea tu organización y registra el tipo de servicio, 
              e iniciemos la mejor aventura académica.
            </p>
            
            <div className="flex justify-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="planifika-button-primary text-lg px-10 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                🏢 Crear Organización
              </button>
            </div>

            {/* Características destacadas */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-lg p-6 border border-yellow-300 border-opacity-30 hover:bg-yellow-400 hover:bg-opacity-20 transition-all duration-300">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold mb-2 text-black">Gestión Inteligente</h3>
                <p className="text-sm text-gray-800">Organiza y planifica tus proyectos académicos de manera eficiente</p>
              </div>
              <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-lg p-6 border border-yellow-300 border-opacity-30 hover:bg-yellow-400 hover:bg-opacity-20 transition-all duration-300">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-xl font-semibold mb-2 text-black">Colaboración</h3>
                <p className="text-sm text-gray-800">Trabaja en equipo y coordina esfuerzos con tus compañeros</p>
              </div>
              <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-lg p-6 border border-yellow-300 border-opacity-30 hover:bg-yellow-400 hover:bg-opacity-20 transition-all duration-300">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-2 text-black">Resultados</h3>
                <p className="text-sm text-gray-800">Alcanza tus objetivos académicos con herramientas profesionales</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Organización */}
      <OrganizationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateOrganization}
      />
    </div>
  );
}
