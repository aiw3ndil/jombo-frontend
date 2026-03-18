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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user || !conversation) return null;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-green-50 flex flex-col pt-8 pb-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto w-full flex flex-col flex-1">
        
        {/* Header del Chat */}
        <div className="bg-white border-2 border-green-100 p-6 rounded-[2.5rem] shadow-xl mb-6 flex-shrink-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-xs font-bold text-green-600 uppercase tracking-widest">CHAT EN VIVO</p>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-green-900 leading-tight">
                {conversation.trip.departure_location} → {conversation.trip.arrival_location}
              </h1>
              <div className="flex flex-wrap gap-4 text-xs font-bold text-green-700 uppercase tracking-wider">
                <span>{new Date(conversation.trip.departure_time).toLocaleString(lang, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}h</span>
                <span className="text-green-200">|</span>
                <span className="italic">{conversation.participants.map(p => p.name).join(" • ")}</span>
              </div>
            </div>
            <div className="flex gap-3">
              {isDriver && (
                <button
                  onClick={handleDeleteConversation}
                  disabled={deleting}
                  className="bg-white border-2 border-red-100 text-red-600 px-6 py-3 rounded-xl font-bold hover:bg-red-50 transition-all text-sm"
                >
                  {deleting ? "..." : (t("page.conversation.delete") || "BORRAR")}
                </button>
              )}
              <button
                onClick={() => router.push(`/${lang}/messages`)}
                className="bg-green-100 text-green-800 border-2 border-green-200 px-6 py-3 rounded-xl font-bold hover:bg-green-200 transition-all text-sm"
              >
                {t("page.conversation.back") || "VOLVER"}
              </button>
            </div>
          </div>
        </div>

        {/* Área de Mensajes */}
        <div className="flex-1 overflow-y-auto bg-white rounded-[2.5rem] border-2 border-green-50 p-6 sm:p-10 space-y-8 mb-6 shadow-inner min-h-[50vh] max-h-[60vh]">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-20 opacity-30 italic">
              <svg className="w-16 h-16 text-green-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              <p className="uppercase tracking-widest text-sm font-bold text-green-900">
                {t("page.conversation.noMessages") || "Di hola para empezar..."}
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
                    <div className="w-10 h-10 rounded-full bg-green-600 flex-shrink-0 mt-auto shadow-md flex items-center justify-center text-white font-bold text-sm overflow-hidden border-2 border-white">
                      {message.user.name.charAt(0)}
                    </div>
                  )}
                  <div className={`max-w-[80%] space-y-2 ${isOwn ? "items-end text-right" : "items-start"}`}>
                    <div className={`rounded-[2rem] px-6 py-4 relative shadow-md border-2 ${
                      isOwn 
                        ? "bg-green-600 text-white border-green-500 rounded-br-none" 
                        : "bg-green-50 text-green-900 border-green-100 rounded-bl-none"
                    }`}>
                      {!isOwn && (
                        <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">
                          {message.user.name}
                        </p>
                      )}
                      <p className="text-base font-medium leading-relaxed break-words">{message.content}</p>
                    </div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest text-green-400 opacity-60 ${isOwn ? "mr-4" : "ml-4"}`}>
                      {new Date(message.created_at).toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" })}h
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Formulario de envío */}
        <form onSubmit={handleSendMessage} className="bg-white border-2 border-green-100 p-3 rounded-[3rem] shadow-xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t("page.conversation.messagePlaceholder") || "Escribe un mensaje..."}
              className="flex-1 bg-green-50 border-2 border-green-100 rounded-full px-8 py-4 text-green-900 placeholder:text-green-300 focus:outline-none focus:border-green-400 transition-all font-bold text-base"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="bg-green-600 text-white w-14 h-14 rounded-full font-bold flex items-center justify-center transition-all hover:bg-green-700 hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:grayscale"
            >
              <svg className="w-6 h-6 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
