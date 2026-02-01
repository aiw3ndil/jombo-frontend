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
      console.error("Error deleting conversation:", error);
      toast.error(error?.message || t("page.messages.deleteError") || "Error al eliminar la conversación");
    } finally {
      setDeletingId(null);
    }
  };

  if (translationsLoading || authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-white/5 border-t-brand-cyan animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-white/5 border-t-brand-purple animate-spin" style={{ animationDuration: '1.5s' }}></div>
        </div>
        <p className="text-brand-gray uppercase tracking-widest text-[10px] font-black animate-pulse">Sincronizando red de mensajes...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isDriver = (conversation: Conversation) => {
    return conversation.trip.driver.id === user.id;
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 relative">
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[400px] h-[400px] bg-brand-cyan/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tightest uppercase italic mb-2">
            {t("page.messages.title")}
          </h1>
          <p className="text-brand-gray font-medium uppercase tracking-[0.2em] text-[10px]">
            Canales de comunicación seguros
          </p>
        </div>
        <button
          onClick={() => router.push(`/${lang}`)}
          className="bg-white/5 text-white/50 border border-white/10 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:text-white hover:border-white/20 transition-all shadow-xl"
        >
          {t("page.messages.back")}
        </button>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-24 bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-hacker-dots opacity-5 pointer-events-none"></div>
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10 text-brand-gray/30">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <p className="text-xl text-brand-gray font-medium uppercase tracking-widest mb-4">
            {t("page.messages.noConversations") || "Sin transmisiones activas"}
          </p>
          <p className="text-brand-gray/70 text-xs font-black uppercase tracking-[0.2em] max-w-md mx-auto">
            {t("page.messages.conversationsInfo") || "Las conversaciones se crean automáticamente cuando se confirma una reserva"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className="group relative bg-white/5 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 hover:border-brand-cyan/20 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-cyan/5 overflow-hidden"
            >
              <div className="absolute inset-0 bg-hacker-dots opacity-5 pointer-events-none"></div>

              <div className="relative flex flex-col xl:flex-row justify-between xl:items-center gap-8">
                <div className="flex-1 space-y-6">
                  <Link
                    href={`/${lang}/messages/${conversation.id}`}
                    className="block group/link"
                  >
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <span className="bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                        CANAL ACTIVO
                      </span>
                      <span className="text-brand-gray/80 text-xs font-black uppercase tracking-[0.2em]">
                        {new Date(conversation.trip.departure_time).toLocaleDateString(lang, { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tightest italic flex items-center gap-4 group-hover/link:text-brand-cyan transition-colors mb-4">
                      {conversation.trip.departure_location}
                      <svg className="w-6 h-6 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                      {conversation.trip.arrival_location}
                    </h2>

                    <div className="flex flex-wrap items-center gap-6 text-xs font-black text-brand-gray uppercase tracking-widest">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        {conversation.participants.map(p => p.name).join(" • ")}
                      </div>
                    </div>

                    {conversation.last_message && (
                      <div className="mt-6 p-6 bg-black/20 rounded-[2rem] border border-white/5 group-hover/link:border-brand-cyan/20 transition-all">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan"></div>
                          <p className="text-xs font-black text-brand-gray/90 uppercase tracking-widest">
                            ÚLTIMA TRANSMISIÓN DE <span className="text-white">{conversation.last_message.user.name}</span>
                          </p>
                        </div>
                        <p className="text-white font-medium italic opacity-70 leading-relaxed">
                          "{conversation.last_message.content.substring(0, 100)}
                          {conversation.last_message.content.length > 100 ? "..." : ""}"
                        </p>
                        <p className="text-xs font-black text-brand-gray/60 mt-3 uppercase font-mono tracking-tighter">
                          {new Date(conversation.last_message.created_at).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    )}
                  </Link>
                </div>

                <div className="flex flex-col sm:flex-row xl:flex-col gap-4 min-w-[200px] justify-center items-stretch">
                  <Link
                    href={`/${lang}/messages/${conversation.id}`}
                    className="flex-1 bg-brand-gradient text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-center shadow-2xl shadow-brand-cyan/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    {t("page.messages.openChat") || "ABRIR CANAL"}
                  </Link>

                  {isDriver(conversation) && (
                    <button
                      onClick={() => handleDeleteConversation(conversation.id)}
                      disabled={deletingId === conversation.id}
                      className="flex-1 bg-brand-pink/10 text-brand-pink border border-brand-pink/20 px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-brand-pink hover:text-white transition-all disabled:opacity-50"
                    >
                      {deletingId === conversation.id
                        ? (t("page.messages.deleting") || "ELIMINANDO...")
                        : (t("page.messages.delete") || "BORRAR CANAL")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
