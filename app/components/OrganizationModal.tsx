"use client";

import { useState, useRef, useEffect } from "react";

interface Organization {
  IDOrganization?: number;
  nit: string;
  name: string;
  address?: string;
  phone?: string;
  photoURL?: string;
  domain?: string;
}

interface OrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (organization: Omit<Organization, 'IDOrganization'>) => void;
  editingOrganization?: Organization | null;
}

const authProviders = [
  {
    id: "microsoft",
    name: "Microsoft",
    icon: "🔷",
    description: "Autenticación con Microsoft Azure AD"
  },
  {
    id: "google",
    name: "Google",
    icon: "🔍",
    description: "Autenticación con Google OAuth"
  },
  {
    id: "github",
    name: "GitHub",
    icon: "🐙",
    description: "Autenticación con GitHub"
  },
  {
    id: "oauth2",
    name: "OAuth 2.0",
    icon: "🔐",
    description: "Autenticación OAuth 2.0 genérica"
  },
  {
    id: "saml",
    name: "SAML",
    icon: "🏛️",
    description: "Autenticación SAML empresarial"
  },
  {
    id: "ldap",
    name: "LDAP",
    icon: "📁",
    description: "Autenticación LDAP universitaria"
  }
];

export default function OrganizationModal({ 
  isOpen, 
  onClose, 
  onSave, 
  editingOrganization 
}: OrganizationModalProps) {
  const [formData, setFormData] = useState({
    nit: editingOrganization?.nit || "",
    name: editingOrganization?.name || "",
    address: editingOrganization?.address || "",
    phone: editingOrganization?.phone || "",
    photoURL: editingOrganization?.photoURL || "",
    domain: editingOrganization?.domain || ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [selectedAuthProvider, setSelectedAuthProvider] = useState<string | null>(null);
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const authDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (authDropdownRef.current && !authDropdownRef.current.contains(event.target as Node)) {
        setShowAuthDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Actualizar formData cuando cambie la organización que se está editando
  useEffect(() => {
    if (editingOrganization) {
      setFormData({
        nit: editingOrganization.nit || "",
        name: editingOrganization.name || "",
        address: editingOrganization.address || "",
        phone: editingOrganization.phone || "",
        photoURL: editingOrganization.photoURL || "",
        domain: editingOrganization.domain || ""
      });
    } else {
      setFormData({
        nit: "",
        name: "",
        address: "",
        phone: "",
        photoURL: "",
        domain: ""
      });
    }
  }, [editingOrganization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nit.trim()) {
      alert("El NIT de la organización es obligatorio");
      return;
    }
    
    if (!formData.name.trim()) {
      alert("El nombre de la organización es obligatorio");
      return;
    }

    setIsLoading(true);
    
    try {
      await onSave(formData);
      setFormData({ nit: "", name: "", address: "", phone: "", photoURL: "", domain: "" });
      onClose();
    } catch (error) {
      console.error("Error al guardar organización:", error);
      
      // Mostrar mensaje de error más específico
      const errorMessage = error instanceof Error ? error.message : "Error desconocido al guardar la organización";
      alert(`Error al guardar la organización:\n\n${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ nit: "", name: "", address: "", phone: "", photoURL: "", domain: "" });
    setSelectedAuthProvider(null);
    setShowAuthDropdown(false);
    onClose();
  };

  const handleAuthProviderSelect = (providerId: string) => {
    setSelectedAuthProvider(providerId);
    setShowAuthDropdown(false);
    
    // Simular selección de proveedor
    const provider = authProviders.find(p => p.id === providerId);
    alert(`Proveedor de autenticación seleccionado: ${provider?.name}\n\nNota: Esta funcionalidad será implementada por el sistema de autenticación universitario.`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-black">
            {editingOrganization ? "Editar Organización" : "Nueva Organización"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                NIT de la Organización *
              </label>
              <input
                type="text"
                value={formData.nit}
                onChange={(e) => setFormData({...formData, nit: e.target.value})}
                className={`planifika-input ${editingOrganization ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="Ej: 860.123.456-7"
                required
                disabled={!!editingOrganization}
                title={editingOrganization ? 'El NIT no se puede editar. Para cambiarlo, abre un ticket de soporte.' : undefined}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Nombre de la Organización *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="planifika-input"
                placeholder="Ej: Universidad Javeriana"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Dirección
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="planifika-input"
                placeholder="Dirección de la organización"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="planifika-input"
                placeholder="Número de teléfono"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                URL de Foto
              </label>
              <input
                type="url"
                value={formData.photoURL}
                onChange={(e) => setFormData({...formData, photoURL: e.target.value})}
                className="planifika-input"
                placeholder="https://ejemplo.com/foto.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Dominio
              </label>
              <input
                type="text"
                value={formData.domain}
                onChange={(e) => setFormData({...formData, domain: e.target.value})}
                className="planifika-input"
                placeholder="ejemplo.com"
              />
            </div>

            {/* Sección de Autenticación */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-black mb-3">
                🔐 Configuración de Autenticación
              </h3>
              <p className="text-sm text-black mb-4">
                Selecciona el proveedor de autenticación que utilizará tu organización.
                Los usuarios accederán a través de su sistema universitario.
              </p>
              
              <div className="relative" ref={authDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowAuthDropdown(!showAuthDropdown)}
                  className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-md bg-white hover:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                >
                  <span className="text-black">
                    {selectedAuthProvider 
                      ? authProviders.find(p => p.id === selectedAuthProvider)?.name
                      : "Seleccionar proveedor de autenticación"
                    }
                  </span>
                  <span className={`transform transition-transform duration-200 ${showAuthDropdown ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                {showAuthDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                    {authProviders.map((provider) => (
                      <button
                        key={provider.id}
                        type="button"
                        onClick={() => handleAuthProviderSelect(provider.id)}
                        className={`w-full text-left p-3 hover:bg-yellow-50 transition-colors ${
                          selectedAuthProvider === provider.id ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{provider.icon}</span>
                          <div>
                            <div className="font-medium text-black">
                              {provider.name}
                            </div>
                            <div className="text-sm text-black">
                              {provider.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedAuthProvider && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-600">✓</span>
                    <span className="text-sm text-black">
                      Proveedor seleccionado: {authProviders.find(p => p.id === selectedAuthProvider)?.name}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 planifika-button-secondary"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 planifika-button-primary"
              disabled={isLoading}
            >
              {isLoading ? "Guardando..." : editingOrganization ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
