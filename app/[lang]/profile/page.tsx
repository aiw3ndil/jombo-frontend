"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { useTranslation } from "@/app/hooks/useTranslation";
import { toast } from "sonner";
import { deleteUser, changePassword } from "@/app/lib/api/auth";

export default function ProfilePage({ params }: { params: Promise<{ lang: string }> }) {
  const router = useRouter();
  const { user, updateUser, logout, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [lang, setLang] = useState("es");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    language: "es",
    region: "es"
  });
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    password: "",
    password_confirmation: ""
  });
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
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
        language: user.language || lang,
        region: user.region || (lang === "fi" ? "fi" : "es")
      });
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
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("La imagen es demasiado grande. El tamaño máximo es 5MB.");
        e.target.value = '';
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
      formDataToSend.append("region", formData.region);

      if (pictureFile) {
        formDataToSend.append("picture", pictureFile);
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
      const response = await fetch(`${API_BASE_URL}/api/v1/users/profile`, {
        method: "PATCH",
        credentials: "include",
        body: formDataToSend,
      });

      const responseText = await response.text();
      if (!response.ok) {
        let errorData;
        try {
          errorData = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
          throw new Error(`Error del servidor: ${response.status}`);
        }
        throw new Error(errorData.error || errorData.message || "Error al actualizar el perfil");
      }

      const data = responseText ? JSON.parse(responseText) : {};
      updateUser(data.user || data);
      setPictureFile(null);
      setMessage({ type: "success", text: t("profile.updateSuccess") || "Perfil actualizado exitosamente" });
      toast.success(t("profile.updateSuccess") || "Perfil actualizado");
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || t("profile.updateError") || "Error al actualizar el perfil" });
      toast.error(error.message);
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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage(null);

    if (passwordData.password !== passwordData.password_confirmation) {
      setPasswordMessage({ 
        type: "error", 
        text: t("profile.passwordsDoNotMatch") || "Las contraseñas no coinciden" 
      });
      setPasswordLoading(false);
      return;
    }

    try {
      await changePassword(
        passwordData.current_password,
        passwordData.password,
        passwordData.password_confirmation
      );
      setPasswordMessage({ 
        type: "success", 
        text: t("profile.passwordUpdateSuccess") || "Contraseña actualizada exitosamente" 
      });
      setPasswordData({
        current_password: "",
        password: "",
        password_confirmation: ""
      });
      toast.success(t("profile.passwordUpdateSuccess") || "Contraseña actualizada");
    } catch (error: any) {
      setPasswordMessage({ 
        type: "error", 
        text: error.message || t("profile.passwordUpdateError") || "Error al actualizar la contraseña" 
      });
      toast.error(error.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteUser();
      await logout();
      toast.success(t("profile.deleteAccountSuccess") || "Cuenta eliminada exitosamente.");
      router.push(`/${lang}/`);
    } catch (error: any) {
      toast.error(error.message || t("profile.deleteAccountError") || "Error al eliminar la cuenta.");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (!isReady || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-green-900 mb-2">
            {t("profile.title") || "Mi Perfil"}
          </h1>
          <p className="text-green-700 text-lg">
            Gestiona tu información personal y seguridad
          </p>
        </div>

        {message && (
          <div className={`mb-8 p-4 rounded-xl border-2 flex items-center gap-4 ${
            message.type === "success" ? "bg-green-100 border-green-200 text-green-800" : "form-error"
          }`}>
            <span className="font-bold">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8">
          {/* Información Principal */}
          <div className="form-card">
            <h2 className="text-2xl font-bold text-green-900 mb-8 border-b-2 border-green-100 pb-2">Datos Personales</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row items-center gap-8 bg-green-50 p-6 rounded-2xl border-2 border-green-100">
                <div className="relative group">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md">
                    {picturePreview ? (
                      <img
                        src={picturePreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-green-600 flex items-center justify-center text-white text-4xl font-bold">
                        {formData.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-green-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-800 transition-colors shadow-lg border-2 border-white">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                    <input type="file" onChange={handlePictureChange} className="hidden" accept="image/*" />
                  </label>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-2xl font-bold text-green-900">{formData.name}</p>
                  <p className="text-green-600 font-medium">{formData.email}</p>
                  <p className="text-green-500 text-sm mt-1 uppercase tracking-wider font-bold">Haz clic en la cámara para subir foto</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">{t("profile.name") || "Nombre Público"}</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" required />
                </div>
                <div>
                  <label className="form-label">{t("profile.language") || "Idioma"}</label>
                  <div className="relative">
                    <select name="language" value={formData.language} onChange={handleChange} className="form-select">
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="fi">Suomi</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label">{t("profile.region") || "Región"}</label>
                  <div className="relative">
                    <select name="region" value={formData.region} onChange={handleChange} className="form-select">
                      <option value="es">{t("profile.regionSpain") || "España"}</option>
                      <option value="fi">{t("profile.regionFinland") || "Finlandia"}</option>
                    </select>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg">
                {loading ? "Actualizando..." : t("profile.save") || "Guardar cambios"}
              </button>
            </form>
          </div>

          {/* Seguridad */}
          <div className="form-card">
            <h2 className="text-2xl font-bold text-green-900 mb-8 border-b-2 border-green-100 pb-2">Seguridad</h2>
            {passwordMessage && (
              <div className={`mb-6 p-4 rounded-xl border-2 ${
                passwordMessage.type === "success" ? "bg-green-100 border-green-200 text-green-800" : "form-error"
              }`}>
                {passwordMessage.text}
              </div>
            )}
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label className="form-label">{t("profile.currentPassword") || "Contraseña Actual"}</label>
                <input type="password" name="current_password" value={passwordData.current_password} onChange={handlePasswordChange} className="form-input" required />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">{t("profile.newPassword") || "Nueva Contraseña"}</label>
                  <input type="password" name="password" value={passwordData.password} onChange={handlePasswordChange} className="form-input" required />
                </div>
                <div>
                  <label className="form-label">{t("profile.confirmNewPassword") || "Confirmar Nueva"}</label>
                  <input type="password" name="password_confirmation" value={passwordData.password_confirmation} onChange={handlePasswordChange} className="form-input" required />
                </div>
              </div>
              <button type="submit" disabled={passwordLoading} className="w-full bg-white border-2 border-green-600 text-green-700 py-4 rounded-xl font-bold hover:bg-green-50 transition-colors disabled:opacity-50">
                {passwordLoading ? "Cambiando..." : t("profile.changePasswordButton") || "Cambiar Contraseña"}
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 border-2 border-red-100 rounded-3xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-red-700 mb-4">{t("profile.dangerZone") || "Zona Crítica"}</h2>
            <p className="text-red-600 mb-6 font-medium">
              {t("profile.deleteAccountWarning") || "La eliminación de la cuenta es irreversible. Se borrarán todos tus datos."}
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-white border-2 border-red-200 text-red-600 px-8 py-3 rounded-xl font-bold hover:bg-red-100 hover:border-red-300 transition-all"
            >
              {t("profile.deleteAccountButton") || "Eliminar mi cuenta"}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-green-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 w-full max-w-lg shadow-2xl text-center border-2 border-red-100">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-100">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-red-700 mb-4">{t("profile.deleteAccountModalTitle") || "¿Seguro?"}</h3>
            <p className="text-gray-600 mb-10 text-lg leading-relaxed">
              {t("profile.deleteAccountModalMessage") || "Esta acción no se puede deshacer. Se borrarán tus viajes, mensajes y perfil."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-8 py-4 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-all"
              >
                {t("profile.deleteAccountCancel") || "No, cancelar"}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 px-8 py-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg"
              >
                {deleting ? "Eliminando..." : t("profile.deleteAccountConfirm") || "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
