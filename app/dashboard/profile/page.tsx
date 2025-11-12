"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../../contexts/AuthContext";
import { authService } from "../../services/authService";
import { UpdateProfileRequest } from "../../types/auth";
import { useFormValidation } from "../../hooks/useFormValidation";
import PasswordInput from "../../components/PasswordInput";
import PasswordMeter from "../../components/PasswordMeter";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout, updateUser } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    password: "",
    confirmPassword: "",
    photourl: ""
  });
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Validación
  const { errors, validateSingleField, validateForm, clearAllErrors } = useFormValidation({
    name: { required: false, minLength: 3 },
    password: { required: false, minLength: 6 },
    confirmPassword: {
      required: false,
      custom: (v: string) => {
        if (v && v !== form.password) return "Las contraseñas no coinciden";
        return null;
      }
    }
  });

  // Cargar datos iniciales
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (user) {
      setForm((prev: typeof form) => ({
        ...prev,
        name: user.name || "",
        photourl: user.photoUrl || ""
      }));
      setPhotoPreview(user.photoUrl || "");
    }
  }, [user]);

  // Handlers
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, files } = e.target;
    if (name === "photourl" && type === "file" && files && files[0]) {
      // Preview local file
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // NOTA: Aquí podrías subir la imagen a un storage y obtener la URL, pero por ahora solo preview
      setForm((prev: typeof form) => ({ ...prev, photourl: "" }));
    } else {
      setForm((prev: typeof form) => ({ ...prev, [name]: value }));
      if (name === "photourl") setPhotoPreview(value);
    }
    validateSingleField(name, value);
    if (name === "password" && form.confirmPassword) {
      validateSingleField("confirmPassword", form.confirmPassword);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Nada que actualizar
    if (!form.name.trim() && !form.password.trim() && !form.photourl.trim()) {
      setError("No hay cambios para guardar. Ingresa nombre, contraseña o foto.");
      return;
    }

    if (!validateForm({
      name: form.name,
      password: form.password,
      confirmPassword: form.confirmPassword,
    })) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('planifika_token');
      if (!token) throw new Error('Sesión no válida. Inicia sesión nuevamente.');

      const payload: UpdateProfileRequest = {};
      if (form.name.trim() && form.name.trim() !== (user?.name || "")) payload.name = form.name.trim();
      if (form.password.trim()) payload.password = form.password.trim();
  if (form.photourl.trim() && form.photourl.trim() !== (user?.photoUrl || "")) payload.photourl = form.photourl.trim();

      const resp = await authService.updateProfile(token, payload);

      // Actualizar estado local del usuario si cambió el nombre o foto
      if ((payload.name || payload.photourl) && updateUser) {
        updateUser({
          ...(payload.name ? { name: payload.name } : {}),
          ...(payload.photourl ? { photoUrl: payload.photourl } : {})
        });
      }

      setSuccess("Perfil actualizado correctamente.");
      setForm((prev: typeof form) => ({ ...prev, password: "", confirmPassword: "" }));
      clearAllErrors();
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar el perfil');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Image
                src="/assets/images/planifika_logo.png"
                alt="Planifika Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  <span className="text-blue-600">Mi Perfil</span>
                </h1>
                <p className="text-sm text-gray-600">Edita tu información</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-800 text-sm">← Volver</Link>
              <button onClick={logout} className="text-gray-500 hover:text-gray-700 text-sm font-medium">Cerrar Sesión</button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success && (
          <div className="mb-4 p-4 rounded bg-green-50 text-green-800 border border-green-200">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 rounded bg-red-50 text-red-800 border border-red-200">
            {error}
          </div>
        )}
        <div className="bg-white rounded-lg shadow p-8">
          {/* Foto de perfil grande y centrada */}
          <div className="flex flex-col items-center mb-6">
            {photoPreview ? (
              photoPreview.startsWith('http') ? (
                <img
                  src={photoPreview}
                  alt="Foto de perfil"
                  width={128}
                  height={128}
                  className="rounded-full object-cover border-4 border-blue-200 shadow-lg mb-2"
                />
              ) : (
                <Image
                  src={photoPreview}
                  alt="Foto de perfil"
                  width={128}
                  height={128}
                  className="rounded-full object-cover border-4 border-blue-200 shadow-lg mb-2"
                />
              )
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-5xl mb-2">?</div>
            )}
            <input
              type="text"
              name="photourl"
              value={form.photourl}
              onChange={handleChange}
              placeholder="URL de la foto de perfil"
              className="w-72 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 text-gray-800 text-base mt-2"
            />
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Tu nombre"
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 text-base ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
                <PasswordInput
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200 text-base bg-white dark:bg-gray-800 ${errors.password ? 'border-red-300' : 'border-gray-300'}`}
                  error={errors.password}
                />
                {form.password && <PasswordMeter password={form.password} />}
                {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
                <PasswordInput
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200 text-base bg-white dark:bg-gray-800 ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'}`}
                  error={errors.confirmPassword}
                />
                {errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setForm({ name: user.name || "", password: "", confirmPassword: "", photourl: user.photoUrl || "" });
                  setPhotoPreview(user.photoUrl || "");
                  clearAllErrors();
                  setError(null);
                  setSuccess(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Deshacer
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {submitting ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
