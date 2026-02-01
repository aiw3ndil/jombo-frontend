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
      <div className="max-w-4xl mx-auto py-12 px-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-white/5 border-t-brand-cyan animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-white/5 border-t-brand-purple animate-spin" style={{ animationDuration: '1.5s' }}></div>
        </div>
        <p className="text-brand-gray uppercase tracking-widest text-xs font-black animate-pulse">Autenticando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 relative">
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[400px] h-[400px] bg-brand-cyan/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tightest uppercase italic mb-2">
          {t("profile.title") || "Mi Perfil"}
        </h1>
        <p className="text-brand-gray/80 font-bold uppercase tracking-[0.2em] text-xs">
          Configura tu identidad en el sistema
        </p>
      </div>

      {message && (
        <div
          className={`mb-8 p-6 rounded-3xl border backdrop-blur-xl relative overflow-hidden flex items-center gap-4 ${message.type === "success"
            ? "bg-brand-cyan/10 border-brand-cyan/20 text-brand-cyan"
            : "bg-brand-pink/10 border-brand-pink/20 text-brand-pink"
            }`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === "success" ? "bg-brand-cyan/20" : "bg-brand-pink/20"}`}>
            {message.type === "success" ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            )}
          </div>
          <span className="font-bold text-sm tracking-tight">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden space-y-10">
        <div className="absolute inset-0 bg-hacker-dots opacity-5 pointer-events-none"></div>

        <div className="relative">
          <label className="block text-xs font-black text-brand-gray/90 uppercase tracking-[0.2em] ml-4 mb-4">
            {t("profile.picture") || "Imagen de Usuario"}
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-brand-gradient opacity-20 blur-xl rounded-full scale-110 group-hover:opacity-40 transition-opacity"></div>
              {picturePreview ? (
                <img
                  src={picturePreview}
                  alt="Profile preview"
                  className="relative w-32 h-32 rounded-full object-cover border-2 border-white/10 shadow-2xl transition-transform group-hover:scale-[1.02]"
                />
              ) : (
                <div className="relative w-32 h-32 rounded-full bg-brand-gradient flex items-center justify-center text-white text-4xl font-black">
                  {formData.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-brand-dark rounded-full border border-white/10 flex items-center justify-center shadow-lg group-hover:border-brand-cyan/50 transition-colors">
                <svg className="w-5 h-5 text-brand-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <input
                type="file"
                id="picture"
                accept="image/*"
                onChange={handlePictureChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
            </div>
            <div className="space-y-1">
              <p className="text-white font-black text-lg">{formData.name}</p>
              <p className="text-brand-gray text-xs uppercase tracking-widest">{t("profile.email")}: {formData.email}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 relative">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-xs font-black text-brand-gray/90 uppercase tracking-[0.2em] ml-4">
              {t("profile.name") || "Nombre Público"}
            </label>
            <div className="relative group/input">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-gray group-focus-within/input:text-brand-cyan transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-black/20 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-white focus:border-brand-cyan/50 focus:ring-0 transition-all outline-none font-bold italic"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="language" className="block text-xs font-black text-brand-gray/90 uppercase tracking-[0.2em] ml-4">
              {t("profile.language") || "Interfaz"}
            </label>
            <div className="relative group/input">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-gray group-focus-within/input:text-brand-purple transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5a18.022 18.022 0 01-3.827-5.802M10.5 9h-5M3 13l2 2m5-5c1.11 0 2.08.406 2.599 1m1.401 3L14 18l1.5-3" /></svg>
              </div>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full bg-black/20 border border-white/5 rounded-2xl pl-14 pr-10 py-4 text-white focus:border-brand-purple/50 focus:ring-0 transition-all outline-none font-bold italic appearance-none cursor-pointer"
              >
                <option value="es" className="bg-brand-dark">Español</option>
                <option value="en" className="bg-brand-dark">English</option>
                <option value="fi" className="bg-brand-dark">Suomi</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-6 relative">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-gradient text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-brand-cyan/20 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {t("profile.saving") || "PROCESANDO"}
              </span>
            ) : (t("profile.save") || "ACTUALIZAR PERFIL")}
          </button>
        </div>
      </form>

      <div className="mt-20 pt-12 border-t border-white/5 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/5 blur-[100px] pointer-events-none"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-brand-pink/5 backdrop-blur-3xl border border-brand-pink/10 rounded-[2.5rem] p-8 md:p-10 overflow-hidden">
          <div className="relative space-y-2">
            <h2 className="text-2xl font-black text-brand-pink tracking-tightest uppercase italic">
              {t("profile.dangerZone") || "ZONA CRÍTICA"}
            </h2>
            <p className="text-brand-gray text-xs font-medium uppercase tracking-[0.1em] max-w-md">
              {t("profile.deleteAccountWarning") || "La eliminación de la cuenta es irreversible. Se purgarán todos tus datos del sistema."}
            </p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={deleting}
            className="relative px-8 py-4 rounded-2xl bg-brand-pink/10 text-brand-pink border border-brand-pink/20 hover:bg-brand-pink hover:text-white transition-all font-black uppercase tracking-widest text-[10px] disabled:opacity-50"
          >
            {deleting ? (t("profile.deletingAccount") || "ELIMINANDO...") : (t("profile.deleteAccountButton") || "ELIMINAR MI CUENTA")}
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}></div>
          <div className="relative bg-[#1a1435] border border-white/10 rounded-[3rem] p-8 md:p-12 w-full max-w-lg shadow-2xl overflow-hidden text-center">
            <div className="absolute inset-0 bg-hacker-dots opacity-10 pointer-events-none"></div>
            <div className="w-20 h-20 bg-brand-pink/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-brand-pink/20">
              <svg className="w-10 h-10 text-brand-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-3xl font-black text-white mb-4 tracking-tightest uppercase italic">{t("profile.deleteAccountModalTitle") || "¿PROCEDER?"}</h3>
            <p className="text-brand-gray font-medium mb-10 text-sm leading-relaxed">
              {t("profile.deleteAccountModalMessage") || "Esta acción es definitiva. Al confirmar, iniciaremos el protocolo de eliminación permanente de tu identidad y registros."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 px-8 py-4 rounded-2xl bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all font-bold uppercase tracking-widest text-xs"
              >
                {t("profile.deleteAccountCancel") || "CANCELAR"}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 px-8 py-4 rounded-2xl bg-brand-pink text-white hover:bg-brand-pink/80 transition-all font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-pink/20"
              >
                {deleting ? (t("profile.deletingAccount") || "ELIMINANDO...") : (t("profile.deleteAccountConfirm") || "CONFIRMAR")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
