"use client";

import { useState } from "react";
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
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        backgroundColor: '#f3f4f6'
      }}
    >

      {/* Contenido principal */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Recuadro blanco para el contenido */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 animate-fade-in">
            <div className="text-center text-gray-800">
            <h1 className="text-3xl lg:text-5xl font-bold mb-6 leading-tight">
              ¡Bienvenido a <span className="text-yellow-500">Planifika</span>!
            </h1>
            <p className="text-lg lg:text-xl mb-8 leading-relaxed max-w-3xl mx-auto text-gray-700">
              Gracias <span className="font-semibold text-yellow-600">{userName}</span> por confiar en Planifika. 
              Tus proyectos quedarán en las mejores manos. Ahora crea tu organización y registra el tipo de servicio, 
              e iniciemos la mejor aventura académica.
            </p>
            
            <div className="flex justify-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="planifika-button-primary text-base px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                🏢 Crear Organización
              </button>
            </div>

              {/* Características destacadas */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-gray-50 rounded-lg p-4 border border-yellow-300 hover:bg-yellow-50 transition-all duration-300 shadow-sm">
                  <div className="text-3xl mb-3">📊</div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">Gestión Inteligente</h3>
                  <p className="text-xs text-gray-600">Organiza y planifica tus proyectos académicos de manera eficiente</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-yellow-300 hover:bg-yellow-50 transition-all duration-300 shadow-sm">
                  <div className="text-3xl mb-3">👥</div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">Colaboración</h3>
                  <p className="text-xs text-gray-600">Trabaja en equipo y coordina esfuerzos con tus compañeros</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-yellow-300 hover:bg-yellow-50 transition-all duration-300 shadow-sm">
                  <div className="text-3xl mb-3">🎯</div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">Resultados</h3>
                  <p className="text-xs text-gray-600">Alcanza tus objetivos académicos con herramientas profesionales</p>
                </div>
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
