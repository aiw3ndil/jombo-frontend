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
    <div className="min-h-screen bg-white">
      {/* ── HERO ── */}
      <section className="bg-green-50 border-b-2 border-green-100 py-20 px-4">
        <div className="max-w-5xl mx-auto text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-green-100 border border-green-300 text-green-800 px-5 py-2 rounded-full text-sm font-bold mb-6 uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-green-600"></span>
            {t("profile.badge")}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-green-900 leading-tight mb-6">
            {t("profile.title")}
          </h1>
          <p className="text-xl md:text-2xl text-green-700 max-w-2xl leading-relaxed font-normal">
            {t("profile.subtitle")}
          </p>
        </div>
      </section>

      {/* ── CONTENIDO ── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto space-y-12">
          
          {message && (
            <div className={`p-6 rounded-2xl border-2 flex items-center gap-4 animate-shake ${
              message.type === "success" ? "bg-green-100 border-green-200 text-green-800" : "form-error"
            }`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${message.type === 'success' ? 'bg-green-200' : 'bg-red-100'}`}>
                {message.type === 'success' ? '✓' : '!'}
              </div>
              <span className="font-bold text-lg">{message.text}</span>
            </div>
          )}

          {/* Sección: Datos Personales */}
          <div className="form-card">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b-2 border-green-50 pb-8">
              <div>
                <h2 className="text-3xl font-bold text-green-900 mb-2">{t("profile.personalInfoTitle")}</h2>
                <p className="text-green-600 font-medium">{t("profile.personalInfoDescription")}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Avatar Upload */}
              <div className="flex flex-col sm:flex-row items-center gap-10 bg-green-50/50 p-8 rounded-[2rem] border-2 border-green-100 shadow-inner">
                <div className="relative group">
                  <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white">
                    {picturePreview ? (
                      <img
                        src={picturePreview}
                        alt="Profile"
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-green-700 flex items-center justify-center text-white text-5xl font-bold">
                        {formData.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                       </svg>
                    </div>
                  </div>
                  <label className="absolute bottom-2 right-2 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-700 transition-all shadow-xl border-4 border-white active:scale-90">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <input type="file" onChange={handlePictureChange} className="hidden" accept="image/*" />
                  </label>
                </div>
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <h4 className="text-2xl font-black text-green-900">{formData.name || t("profile.name")}</h4>
                  <p className="bg-green-100 text-green-700 px-4 py-1.5 rounded-lg text-sm font-bold inline-block border border-green-200">
                    {formData.email}
                  </p>
                  <p className="text-green-500 text-sm font-bold uppercase tracking-widest block pt-2">{t("profile.avatarInfo")}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="form-label">{t("profile.name")}</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    className="form-input" 
                    placeholder={t("profile.namePlaceholder")}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="form-label">{t("profile.language") || "Idioma de la APP"}</label>
                  <div className="relative">
                    <select name="language" value={formData.language} onChange={handleChange} className="form-select">
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="fi">Suomi</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-green-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="form-label">{t("profile.region") || "Región / País"}</label>
                  <div className="relative">
                    <select name="region" value={formData.region} onChange={handleChange} className="form-select">
                      <option value="es">{t("profile.regionSpain") || "España"}</option>
                      <option value="fi">{t("profile.regionFinland") || "Finlandia"}</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-green-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" disabled={loading} className="btn-primary w-full md:w-auto min-w-[240px]">
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      {t("profile.saving") || "Guardando..."}
                    </span>
                  ) : (t("profile.save") || "Actualizar Perfil")}
                </button>
              </div>
            </form>
          </div>

          {/* Sección: Seguridad */}
          <div className="form-card">
            <div className="mb-12 border-b-2 border-green-50 pb-8">
              <h2 className="text-3xl font-bold text-green-900 mb-2">{t("profile.securityTitle")}</h2>
              <p className="text-green-600 font-medium">{t("profile.securityDescription")}</p>
            </div>

            {passwordMessage && (
              <div className={`mb-8 p-6 rounded-2xl border-2 animate-shake ${
                passwordMessage.type === "success" ? "bg-green-100 border-green-200 text-green-800" : "form-error"
              }`}>
                <span className="font-bold">{passwordMessage.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-8">
              <div className="max-w-md">
                <label className="form-label">{t("profile.currentPassword") || "Contraseña Actual"}</label>
                <input 
                  type="password" 
                  name="current_password" 
                  value={passwordData.current_password} 
                  onChange={handlePasswordChange} 
                  className="form-input" 
                  required 
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="form-label">{t("profile.newPassword") || "Nueva Contraseña"}</label>
                  <input 
                    type="password" 
                    name="password" 
                    value={passwordData.password} 
                    onChange={handlePasswordChange} 
                    className="form-input" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="form-label">{t("profile.confirmNewPassword") || "Confirmar Nueva"}</label>
                  <input 
                    type="password" 
                    name="password_confirmation" 
                    value={passwordData.password_confirmation} 
                    onChange={handlePasswordChange} 
                    className="form-input" 
                    required 
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={passwordLoading} 
                  className="btn-secondary w-full md:w-auto min-w-[240px]"
                >
                  {passwordLoading ? t("profile.processing") : t("profile.changePasswordButton")}
                </button>
              </div>
            </form>
          </div>

          {/* Sección: Zona de Peligro */}
          <div className="bg-red-50 border-2 border-red-100 rounded-[3rem] p-10 md:p-16 overflow-hidden relative shadow-sm">
             {/* Decoración */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/50 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-black text-red-700 mb-4">{t("profile.dangerZone") || "Zona de Riesgo"}</h2>
                <p className="text-red-600/80 text-lg max-w-xl font-medium leading-relaxed">
                  {t("profile.deleteAccountWarning") || "Si eliminas tu cuenta, perderás todos tus datos de forma permanente. Esta acción es irreversible."}
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-white border-2 border-red-200 text-red-600 px-10 py-5 rounded-2xl font-black hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-md active:scale-95 whitespace-nowrap"
              >
                {t("profile.deleteAccountButton") || "Eliminar Cuenta"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-green-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] p-10 md:p-16 w-full max-w-xl shadow-2xl text-center border-2 border-red-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>
            
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-red-100">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-4xl font-bold text-red-700 mb-6">{t("profile.deleteAccountModalTitle") || "¿Confirmar Eliminación?"}</h3>
            <p className="text-gray-500 mb-12 text-xl leading-relaxed">
              {t("profile.deleteAccountModalMessage") || "Esta acción es definitiva. Se borrarán tus viajes, mensajes y toda tu actividad en Jombo."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-8 py-5 rounded-2xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-all text-lg"
              >
                {t("profile.deleteAccountCancel") || "Cancelar"}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 px-8 py-5 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg text-lg active:scale-95"
              >
                {deleting ? t("profile.deletingAccount") || "Procesando..." : t("profile.deleteAccountConfirm") || "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
