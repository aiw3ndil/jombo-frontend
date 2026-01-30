"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { useTranslation } from "@/app/hooks/useTranslation";
import { toast } from "sonner";
import { deleteUser } from "@/app/lib/api/auth";

export default function ProfilePage({ params }: { params: Promise<{ lang: string }> }) {
  const router = useRouter();
  const { user, updateUser, logout, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [lang, setLang] = useState("es");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    language: "es"
  });
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false); // New state for delete loading
  const [showDeleteModal, setShowDeleteModal] = useState(false); // State for delete confirmation modal
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    params.then(p => setLang(p.lang));
  }, [params]);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push(`/${lang}/login`);
    } else {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        language: user.language || lang
      });
      // Backend puede retornar 'picture' o 'picture_url'
      const pictureUrl = user.picture_url || user.picture;
      if (pictureUrl) {
        setPicturePreview(pictureUrl);
      }
      setIsReady(true);
    }
  }, [user, authLoading, router, lang]);

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast.error("La imagen es demasiado grande. El tamaño máximo es 5MB.");
        e.target.value = ''; // Clear the input
        return;
      }
      
      setPictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("language", formData.language);
      
      if (pictureFile) {
        console.log("📸 Uploading picture:", pictureFile.name, pictureFile.type);
        formDataToSend.append("picture", pictureFile);
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
      console.log("🚀 Sending profile update directly to backend:", `${API_BASE_URL}/api/v1/users/profile`);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/users/profile`, {
        method: "PATCH",
        credentials: "include",
        body: formDataToSend,
      });

      console.log("📥 Response status:", response.status);
      console.log("📥 Response headers:", Object.fromEntries(response.headers.entries()));

      const contentType = response.headers.get("content-type");
      const responseText = await response.text();
      console.log("📥 Response text:", responseText.substring(0, 500));

      if (!response.ok) {
        let errorData;
        try {
          errorData = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
          console.error("❌ Response is not JSON:", responseText);
          
          // Handle specific status codes
          if (response.status === 500) {
            throw new Error("Error del servidor al procesar la solicitud. Intenta sin subir imagen o contacta con soporte.");
          }
          
          throw new Error(`Server error: ${response.status} - ${responseText.substring(0, 100) || "Sin respuesta del servidor"}`);
        }
        console.error("❌ Profile update failed:", errorData);
        console.error("❌ Full error context:", { status: response.status, responseText, errorData });
        throw new Error(errorData.error || errorData.message || (Object.keys(errorData).length === 0 ? "Error desconocido al actualizar el perfil." : `Error del servidor (${response.status})`));
      }

      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.error("❌ Success response is not JSON:", responseText);
        throw new Error("Invalid server response");
      }

      console.log("✅ Profile updated successfully:", data);
      updateUser(data.user || data);
      setPictureFile(null);
      setMessage({ type: "success", text: t("profile.updateSuccess") || "Perfil actualizado exitosamente" });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: error.message || t("profile.updateError") || "Error al actualizar el perfil" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteUser();
      await logout(); // Logout the user after successful deletion
      toast.success(t("profile.deleteAccountSuccess") || "Cuenta eliminada exitosamente.");
      router.push(`/${lang}/`); // Redirect to home or login page
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error(error.message || t("profile.deleteAccountError") || "Error al eliminar la cuenta.");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (!isReady || !user) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <div className="h-24 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-black">{t("profile.title") || "Mi Perfil"}</h1>

      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div>
          <label htmlFor="picture" className="block text-sm font-medium text-gray-700 mb-2">
            {t("profile.picture") || "Foto de perfil"}
          </label>
          <div className="flex items-center gap-4">
            {picturePreview && (
              <img
                src={picturePreview}
                alt="Profile preview"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
              />
            )}
            <input
              type="file"
              id="picture"
              accept="image/*"
              onChange={handlePictureChange}
              className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            {t("profile.name") || "Nombre"}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            {t("profile.email") || "Email"}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            disabled
          />
          <p className="text-sm text-gray-500 mt-1">{t("profile.emailNotEditable") || "El email no puede ser modificado"}</p>
        </div>

        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
            {t("profile.language") || "Idioma"}
          </label>
          <select
            id="language"
            name="language"
            value={formData.language}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          >
            <option value="es">Español</option>
            <option value="en">English</option>
            <option value="fi">Suomi</option>
          </select>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (t("profile.saving") || "Guardando...") : (t("profile.save") || "Guardar cambios")}
          </button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h2 className="text-xl font-bold text-red-600 mb-4">{t("profile.dangerZone") || "Zona de Peligro"}</h2>
        <p className="text-gray-700 mb-4">
          {t("profile.deleteAccountWarning") || "Eliminar tu cuenta es una acción permanente y no se puede deshacer."}
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          disabled={deleting}
          className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {deleting ? (t("profile.deletingAccount") || "Eliminando...") : (t("profile.deleteAccountButton") || "Eliminar Cuenta")}
        </button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t("profile.deleteAccountModalTitle") || "¿Estás seguro?"}</h3>
            <p className="text-gray-700 mb-6">
              {t("profile.deleteAccountModalMessage") || "Esta acción es irreversible. Todos tus datos serán eliminados permanentemente."}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("profile.deleteAccountCancel") || "Cancelar"}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (t("profile.deletingAccount") || "Eliminando...") : (t("profile.deleteAccountConfirm") || "Sí, eliminar")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
