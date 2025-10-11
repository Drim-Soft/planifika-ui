"use client";

import { useState, useRef, useEffect } from "react";

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

export default function AuthDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    setIsOpen(false);
    
    // Simular selección de proveedor
    const provider = authProviders.find(p => p.id === providerId);
    alert(`Proveedor de autenticación seleccionado: ${provider?.name}\n\nNota: Esta funcionalidad será implementada por el sistema de autenticación universitario.`);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-lg px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 text-white hover:bg-opacity-30 hover:bg-yellow-400 hover:text-gray-900"
      >
        <span>🔐</span>
        <span>Configurar Autenticación</span>
        <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-scale-in">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Proveedores de Autenticación
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Selecciona el proveedor de autenticación que utilizará tu organización.
              Los usuarios accederán a través de su sistema universitario.
            </p>
            
            <div className="space-y-2">
              {authProviders.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => handleProviderSelect(provider.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${
                    selectedProvider === provider.id
                      ? 'border-yellow-400 bg-yellow-50'
                      : 'border-gray-200 hover:border-yellow-300 hover:bg-yellow-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{provider.icon}</span>
                    <div>
                      <div className="font-medium text-gray-800">
                        {provider.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {provider.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {selectedProvider && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-600">✓</span>
                  <span className="text-sm text-yellow-800">
                    Proveedor seleccionado: {authProviders.find(p => p.id === selectedProvider)?.name}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
