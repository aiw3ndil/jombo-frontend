"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { getConversation, sendMessage, deleteConversation, ConversationDetail, Message } from "@/app/lib/api/conversations";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useAuth } from "@/app/contexts/AuthContext";
import { toast } from "sonner";

export default function ConversationPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || "es";
  const conversationId = parseInt(params?.id as string);
  const { user, loading: authLoading } = useAuth();

  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/${lang}/login?redirect=/${lang}/messages/${conversationId}`);
      return;
    }

    if (user && conversationId) {
      loadConversation();
    }
  }, [user, authLoading, router, lang, conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversation = async () => {
    try {
      setLoading(true);
      const data = await getConversation(conversationId);
      setConversation(data);
      setMessages(data.messages);
    } catch (error: any) {
      console.error("Error loading conversation:", error);
      toast.error(error?.message || t("page.conversation.loadError") || "Error al cargar la conversación");
      router.push(`/${lang}/messages`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    setSending(true);

    try {
      const message = await sendMessage(conversationId, newMessage.trim());
      setMessages([...messages, message]);
      setNewMessage("");
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error(error?.message || t("page.conversation.sendError") || "Error al enviar el mensaje");
    } finally {
      setSending(false);
    }
  };

  const handleDeleteConversation = async () => {
    if (!confirm(t("page.conversation.confirmDelete") || "¿Estás seguro de eliminar esta conversación?")) {
      return;
    }

    setDeleting(true);

    try {
      await deleteConversation(conversationId);
      toast.success(t("page.conversation.deleteSuccess") || "Conversación eliminada exitosamente");
      router.push(`/${lang}/messages`);
    } catch (error: any) {
      console.error("Error deleting conversation:", error);
      toast.error(error?.message || t("page.conversation.deleteError") || "Error al eliminar la conversación");
      setDeleting(false);
    }
  };

  const isDriver = conversation && user && conversation.trip.driver.id === user.id;

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-white/5 border-t-brand-cyan animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-white/5 border-t-brand-purple animate-spin" style={{ animationDuration: '1.5s' }}></div>
        </div>
        <p className="text-brand-gray/80 uppercase tracking-widest text-xs font-black animate-pulse">Abriendo canal de datos...</p>
      </div>
    );
  }

  if (!user || !conversation) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto min-h-[calc(100vh-80px)] flex flex-col relative py-8 px-4 sm:px-6 mb-12">
      <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-brand-cyan/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header HUD */}
      <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden mb-6 flex-shrink-0">
        <div className="absolute inset-0 bg-hacker-dots opacity-5 pointer-events-none"></div>
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse"></span>
              <p className="text-xs font-black text-brand-cyan uppercase tracking-[0.3em]">CONEXIÓN ESTABLECIDA</p>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tightest uppercase italic flex items-center gap-4">
              {conversation.trip.departure_location}
              <svg className="w-6 h-6 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              {conversation.trip.arrival_location}
            </h1>
            <div className="flex flex-wrap gap-4 text-xs font-black text-brand-gray/80 uppercase tracking-widest">
              <span>{new Date(conversation.trip.departure_time).toLocaleString(lang, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
              <span className="text-white/20">|</span>
              <span className="text-brand-gray/60 italic">{conversation.participants.map(p => p.name).join(" • ")}</span>
            </div>
          </div>
          <div className="flex gap-4">
            {isDriver && (
              <button
                onClick={handleDeleteConversation}
                disabled={deleting}
                className="bg-brand-pink/10 text-brand-pink border border-brand-pink/20 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-pink hover:text-white transition-all disabled:opacity-50"
              >
                {deleting ? "..." : (t("page.conversation.delete") || "BORRAR")}
              </button>
            )}
            <button
              onClick={() => router.push(`/${lang}/messages`)}
              className="bg-white/5 text-white/70 border border-white/10 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:text-white hover:border-white/20 transition-all"
            >
              {t("page.conversation.back") || "VOLVER"}
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-[4] overflow-y-auto bg-black/20 rounded-[2.5rem] border border-white/5 p-8 space-y-8 scrollbar-hide mb-4 relative hover:border-white/10 transition-colors min-h-[60vh] max-h-[70vh]">
        <div className="absolute inset-0 bg-hacker-dots opacity-[0.03] pointer-events-none"></div>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-20 grayscale opacity-20 italic">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            <p className="uppercase tracking-widest text-xs font-black">
              {t("page.conversation.noMessages") || "Esperando transmisión..."}
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.user.id === user.id;
            return (
              <div
                key={message.id}
                className={`flex gap-4 ${isOwn ? "justify-end" : "justify-start"}`}
              >
                {!isOwn && (
                  <div className="w-10 h-10 rounded-full bg-brand-gradient p-0.5 flex-shrink-0 mt-auto shadow-lg shadow-brand-cyan/20">
                    <div className="w-full h-full rounded-full bg-brand-dark flex items-center justify-center text-white font-black text-sm overflow-hidden">
                      {message.user.name.charAt(0)}
                    </div>
                  </div>
                )}
                <div
                  className={`max-w-[85%] space-y-2 ${isOwn ? "items-end text-right" : "items-start"}`}
                >
                  <div
                    className={`rounded-[2.5rem] px-8 py-5 relative group ${isOwn
                      ? "bg-brand-gradient text-white rounded-tr-none shadow-2xl shadow-brand-cyan/20"
                      : "bg-white/10 backdrop-blur-3xl text-white border border-white/10 rounded-tl-none shadow-xl"
                      }`}
                  >
                    {!isOwn && (
                      <p className="text-xs font-black text-brand-cyan/80 uppercase tracking-widest mb-3">
                        {message.user.name}
                      </p>
                    )}
                    <p className="text-base font-medium leading-relaxed break-words">{message.content}</p>
                  </div>
                  <p className={`text-[10px] font-black uppercase tracking-widest font-mono opacity-40 ${isOwn ? "mr-6" : "ml-6"}`}>
                    {new Date(message.created_at).toLocaleTimeString(lang, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="bg-white/5 backdrop-blur-3xl border border-white/10 p-3 rounded-[3rem] shadow-2xl relative group flex-shrink-0">
        <div className="absolute -inset-1.5 bg-brand-gradient rounded-[3.2rem] opacity-0 blur-2xl group-focus-within/input:opacity-20 transition-opacity"></div>
        <div className="relative flex items-end gap-4">
          <textarea
            rows={3}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t("page.conversation.messagePlaceholder") || "Codificar mensaje..."}
            className="flex-1 bg-black/20 border border-white/5 rounded-[2.5rem] px-8 py-5 text-white placeholder:text-brand-gray/30 focus:outline-none focus:border-brand-cyan/50 focus:ring-0 transition-all font-bold italic text-base resize-none"
            disabled={sending}
            autoFocus={false}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="bg-brand-gradient text-white px-10 py-5 h-[62px] rounded-[2.5rem] font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.03] active:scale-95 shadow-xl shadow-brand-cyan/20 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group flex items-center justify-center mb-1"
          >
            {sending ? "..." : (t("page.conversation.send") || "ENVIAR")}
          </button>
        </div>
      </form>
    </div>
  );
}
