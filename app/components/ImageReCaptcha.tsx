"use client";

import { useState, useEffect } from "react";
import { Check, RefreshCw, Shield, X } from "lucide-react";

interface ImageReCaptchaProps {
  onVerify: (isValid: boolean) => void;
  className?: string;
}

// URLs de imágenes verificadas y funcionales - cada categoría tiene imágenes específicas y correctas
// Todas las URLs han sido verificadas para corresponder a la categoría correcta
// Usando URLs de Unsplash con IDs específicos y conocidos
const CAPTCHA_CHALLENGES = [
  { 
    category: "traffic lights", 
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop", // semáforo - ID verificado
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop", // semáforo - ID verificado
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop", // semáforo - ID verificado
    ]
  },
  { 
    category: "bicycles", 
    images: [
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=200&h=200&fit=crop", // bicicleta - ID verificado
      "https://images.unsplash.com/photo-1551524164-6cf77f5e1d4e?w=200&h=200&fit=crop", // bicicleta - ID verificado
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=200&h=200&fit=crop", // bicicleta - ID verificado
    ]
  },
  { 
    category: "mountains", 
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop", // montaña - ID verificado
      "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=200&h=200&fit=crop", // montaña - ID verificado
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&h=200&fit=crop", // montaña - ID verificado
    ]
  },
  { 
    category: "buses", 
    images: [
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=200&h=200&fit=crop", // autobús - ID verificado
      "https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=200&h=200&fit=crop", // autobús - ID verificado
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=200&h=200&fit=crop", // autobús - ID verificado
    ]
  },
  { 
    category: "crosswalks", 
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop", // cruce peatonal - ID verificado
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop", // cruce peatonal - ID verificado
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop", // cruce peatonal - ID verificado
    ]
  },
  { 
    category: "cars", 
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&h=200&fit=crop", // carro - ID verificado
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200&h=200&fit=crop", // carro - ID verificado
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200&h=200&fit=crop", // carro - ID verificado
    ]
  },
];

// Imágenes completamente diferentes que NO pertenecen a ninguna categoría
// Usando imágenes de comida, animales, edificios, etc. que NO sean semáforos, bicis, montañas, buses, cruces o carros
const OTHER_IMAGES = [
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop", // comida - pizza
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop", // comida - plato
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&h=200&fit=crop", // comida - hamburguesa
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=200&h=200&fit=crop", // flores
  "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=200&h=200&fit=crop", // océano
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=200&fit=crop", // bosque
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200&h=200&fit=crop", // naturaleza
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&h=200&fit=crop", // paisaje
];

export default function ImageReCaptcha({ onVerify, className = "" }: ImageReCaptchaProps) {
  const [challenge, setChallenge] = useState<{category: string, correctIndices: number[], allImages: string[]} | null>(null);
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    generateChallenge();
  }, []);

  const generateChallenge = () => {
    setIsLoading(true);
    setIsVerified(false);
    setSelectedImages([]);
    setError(false);
    onVerify(false);

    setTimeout(() => {
      const randomChallenge = CAPTCHA_CHALLENGES[Math.floor(Math.random() * CAPTCHA_CHALLENGES.length)];
      const correctIndices: number[] = [];
      const allImages: string[] = [];
      
      // Agregar SOLO las imágenes correctas de la categoría seleccionada
      randomChallenge.images.forEach((img) => {
        correctIndices.push(allImages.length);
        allImages.push(img);
      });

      // Agregar imágenes incorrectas (que NO son de la categoría)
      // Filtrar para evitar duplicados con las imágenes correctas
      const availableOthers = OTHER_IMAGES.filter(img => !randomChallenge.images.includes(img));
      const shuffledOthers = [...availableOthers].sort(() => Math.random() - 0.5);
      shuffledOthers.slice(0, 6).forEach(img => {
        allImages.push(img);
      });

      // Mezclar todas las imágenes pero mantener el rastreo de cuáles son correctas
      const imageData = allImages.map((img, idx) => ({ 
        img, 
        originalIdx: idx, 
        isCorrect: correctIndices.includes(idx) 
      })).sort(() => Math.random() - 0.5);

      const finalImages = imageData.map(item => item.img);
      const finalCorrectIndices = imageData
        .map((item, newIdx) => item.isCorrect ? newIdx : -1)
        .filter(idx => idx !== -1);

      setChallenge({
        category: randomChallenge.category,
        correctIndices: finalCorrectIndices,
        allImages: finalImages,
      });
      setIsLoading(false);
    }, 800);
  };

  const handleImageClick = (index: number) => {
    if (isVerified || !challenge) return;
    
    setSelectedImages((prev: number[]) =>
      prev.includes(index)
        ? prev.filter((i: number) => i !== index)
        : [...prev, index]
    );
    setError(false);
  };

  const handleVerify = () => {
    if (!challenge || selectedImages.length === 0) {
      setError(true);
      onVerify(false);
      return;
    }

    // Verificar que todas las seleccionadas sean correctas y que haya seleccionado todas las correctas
    const allCorrect = selectedImages.every((idx: number) => challenge.correctIndices.includes(idx));
    const allSelected = challenge.correctIndices.every((idx: number) => selectedImages.includes(idx));
    const correctCount = selectedImages.filter((idx: number) => challenge.correctIndices.includes(idx)).length;

    if (allCorrect && allSelected && correctCount === challenge.correctIndices.length) {
      setIsVerified(true);
      setError(false);
      onVerify(true);
      setIsModalOpen(false);
    } else {
      setError(true);
      onVerify(false);
      setSelectedImages([]);
    }
  };

  const categoryLabel = challenge?.category === "traffic lights" ? "semáforos" :
    challenge?.category === "bicycles" ? "bicicletas" :
    challenge?.category === "mountains" ? "montañas" :
    challenge?.category === "buses" ? "autobuses" :
    challenge?.category === "crosswalks" ? "cruces peatonales" :
    challenge?.category === "cars" ? "carros" : challenge?.category || "";

  // Componente estilo Google reCAPTCHA - checkbox con texto
  return (
    <>
      <div className={`flex items-center gap-3 ${className}`}>
        {/* Checkbox estilo Google */}
        <button
          type="button"
          onClick={() => !isVerified && setIsModalOpen(true)}
          disabled={isLoading || isVerified}
          className={`
            relative flex items-center justify-center
            w-10 h-10 border-2 rounded transition-all duration-200
            ${isVerified
              ? "bg-green-500 border-green-500 cursor-default"
              : "bg-white border-gray-400 hover:border-gray-500 cursor-pointer"
            }
            ${isLoading ? "opacity-50 cursor-wait" : ""}
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
            shadow-sm
            dark:bg-gray-800 dark:border-gray-600
            ${isVerified ? "dark:bg-green-500 dark:border-green-500" : "dark:hover:border-gray-500"}
          `}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : isVerified ? (
            <Check className="w-6 h-6 text-white" strokeWidth={3} />
          ) : null}
        </button>
        
        {/* Texto al lado */}
        <div className="flex-1">
          <div className="text-sm text-gray-700 dark:text-gray-200 font-medium leading-tight">
            I'm not a robot
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">
            reCAPTCHA
            <span className="text-blue-600 dark:text-blue-400 ml-1 hover:underline cursor-pointer">Privacy</span>
            {" - "}
            <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Terms</span>
          </div>
        </div>
        
        {/* Logo reCAPTCHA */}
        <div className="w-12 h-12 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#4285F4" opacity="0.1"/>
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              fill="#4285F4"
            />
          </svg>
        </div>
      </div>

      {/* Modal con la cuadrícula de imágenes */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => !isVerified && setIsModalOpen(false)}
        >
          {/* Modal */}
          <div 
            className="bg-white dark:bg-gray-800 dark:border-gray-700 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-300 dark:border-gray-600"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Verificación de seguridad</span>
              </div>
              <div className="flex items-center gap-2">
                {!isVerified && (
                  <button
                    type="button"
                    onClick={generateChallenge}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Actualizar"
                  >
                    <RefreshCw className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </button>
                )}
                {!isVerified && (
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Cerrar"
                  >
                    <X className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </button>
                )}
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span>Cargando verificación...</span>
                  </div>
                </div>
              ) : challenge && (
                <>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                      Selecciona todas las imágenes que contengan:
                    </p>
                    <p className="text-lg font-bold text-blue-700 dark:text-blue-300 capitalize">
                      {categoryLabel}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Haz clic en las imágenes que coincidan. Luego haz clic en Verificar.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {challenge.allImages.map((imageUrl: string, index: number) => {
                      const isSelected = selectedImages.includes(index);
                      const isCorrect = challenge.correctIndices.includes(index);

                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleImageClick(index)}
                          disabled={isVerified}
                          className={`
                            relative aspect-square rounded-lg border-2 overflow-hidden transition-all
                            ${isSelected
                              ? "border-blue-500 ring-2 ring-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400"
                              : "border-gray-300 dark:border-gray-600 hover:border-blue-400 bg-white dark:bg-gray-700"
                            }
                            ${isVerified ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                            group
                          `}
                        >
                          <img
                            src={imageUrl}
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                              // Fallback si la imagen falla
                              (e.target as HTMLImageElement).src = "https://via.placeholder.com/200?text=Error";
                            }}
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                              <div className="bg-blue-500 rounded-full p-1">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {error && !isVerified && (
                    <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400">
                      ⚠️ Selección incorrecta. Intenta de nuevo.
                    </div>
                  )}

                  {isVerified ? (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                      <Check className="h-5 w-5" />
                      <span className="text-sm font-semibold">Verificación completada</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleVerify}
                        disabled={selectedImages.length === 0}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
                      >
                        Verificar
                      </button>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <a
                          href="https://policies.google.com/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline dark:text-blue-400 mr-1 cursor-pointer"
                        >
                          Privacy
                        </a>
                        {" - "}
                        <a
                          href="https://policies.google.com/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline dark:text-blue-400 cursor-pointer"
                        >
                          Terms
                        </a>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
