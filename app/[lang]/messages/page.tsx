"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getConversations, deleteConversation, Conversation } from "@/app/lib/api/conversations";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useAuth } from "@/app/contexts/AuthContext";
import { toast } from "sonner";
import Link from "next/link";

export default function MessagesPage() {
  const { t, loading: translationsLoading } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || "es";
  const { user, loading: authLoading } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/${lang}/login?redirect=/${lang}/messages`);
      return;
    }

    if (user) {
      loadConversations();
    }
  }, [user, authLoading, router, lang]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await getConversations();
      setConversations(data);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId: number) => {
    if (!confirm(t("page.messages.confirmDelete") || "¿Estás seguro de eliminar esta conversación?")) {
      return;
    }

    setDeletingId(conversationId);
    try {
      await deleteConversation(conversationId);
      toast.success(t("page.messages.deleteSuccess") || "Conversación eliminada exitosamente");
      await loadConversations();
    } catch (error: any) {
      toast.error(error?.message || t("page.messages.deleteError") || "Error al eliminar la conversación");
    } finally {
      setDeletingId(null);
    }
  };

  if (translationsLoading || authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) return null;

  const isDriver = (conversation: Conversation) => {
    return conversation.trip.driver.id === user.id;
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-green-900 mb-2">
              {t("page.messages.title") || "Mis Mensajes"}
            </h1>
            <p className="text-green-700 text-lg">
              {t("page.messages.subtitle") || "Conversaciones con otros viajeros"}
            </p>
          </div>
          <button
            onClick={() => router.push(`/${lang}`)}
            className="bg-green-50 text-green-700 border-2 border-green-200 px-8 py-3 rounded-xl font-bold hover:bg-green-100 transition-all shadow-sm"
          >
            {t("page.messages.back") || "Volver"}
          </button>
        </div>

        {conversations.length === 0 ? (
          <div className="text-center py-24 bg-green-50 rounded-[3rem] border-2 border-green-100">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-green-200 text-green-600">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p className="text-2xl text-green-900 font-bold mb-4">
              {t("page.messages.noConversations") || "No hay mensajes activos"}
            </p>
            <p className="text-green-600 font-medium">
              Chatea con el conductor después de solicitar una reserva.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {conversations.map((conversation) => (
              <div key={conversation.id} className="result-card hover:border-green-400 transition-all cursor-pointer group">
                <div className="flex flex-col xl:flex-row justify-between gap-8">
                  <Link href={`/${lang}/messages/${conversation.id}`} className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-green-200">
                        CANAL ACTIVO
                      </span>
                      <span className="text-green-500 font-bold text-sm uppercase tracking-wider">
                        {new Date(conversation.trip.departure_time).toLocaleDateString(lang, { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    <h2 className="text-3xl font-bold text-green-900 leading-tight group-hover:text-green-700 transition-colors">
                      {conversation.trip.departure_location} → {conversation.trip.arrival_location}
                    </h2>

                    <div className="flex items-center gap-2 text-sm font-bold text-green-600 uppercase tracking-widest">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      {conversation.participants.map(p => p.name).join(" • ")}
                    </div>

                    {conversation.last_message && (
                      <div className="mt-4 p-5 bg-green-50 rounded-2xl border border-green-100 group-hover:bg-green-100 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <p className="text-xs font-bold text-green-700 uppercase tracking-widest">
                            ÚLTIMO MENSAJE DE <span className="text-green-900">{conversation.last_message.user.name}</span>
                          </p>
                        </div>
                        <p className="text-green-800 font-medium italic line-clamp-2">
                          "{conversation.last_message.content}"
                        </p>
                        <p className="text-[10px] font-bold text-green-400 mt-2 uppercase">
                          {new Date(conversation.last_message.created_at).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}h
                        </p>
                      </div>
                    )}
                  </Link>

                  <div className="flex flex-col sm:flex-row xl:flex-col gap-3 min-w-[200px] justify-center">
                    <Link
                      href={`/${lang}/messages/${conversation.id}`}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-center shadow-md transition-all"
                    >
                      {t("page.messages.openChat") || "Abril Chat"}
                    </Link>

                    {isDriver(conversation) && (
                      <button
                        onClick={() => handleDeleteConversation(conversation.id)}
                        disabled={deletingId === conversation.id}
                        className="bg-white border-2 border-red-100 text-red-600 px-8 py-4 rounded-xl font-bold hover:bg-red-50 transition-all font-bold"
                      >
                        {deletingId === conversation.id ? "Eliminando..." : (t("page.messages.delete") || "Cerrar canal")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
