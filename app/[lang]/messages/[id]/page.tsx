"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { getConversation, sendMessage, deleteConversation, ConversationDetail, Message } from "@/app/lib/api/conversations";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useAuth } from "@/app/contexts/AuthContext";

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
      alert(error?.message || t("page.conversation.loadError") || "Error al cargar la conversación");
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
      alert(error?.message || t("page.conversation.sendError") || "Error al enviar el mensaje");
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
      alert(t("page.conversation.deleteSuccess") || "Conversación eliminada exitosamente");
      router.push(`/${lang}/messages`);
    } catch (error: any) {
      console.error("Error deleting conversation:", error);
      alert(error?.message || t("page.conversation.deleteError") || "Error al eliminar la conversación");
      setDeleting(false);
    }
  };

  const isDriver = conversation && user && conversation.trip.driver.id === user.id;

  if (authLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <p className="text-gray-900">{t("page.conversation.loading") || "Cargando..."}</p>
      </div>
    );
  }

  if (!user || !conversation) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-200px)] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 p-4 rounded-t-lg shadow">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {conversation.trip.departure_location} → {conversation.trip.arrival_location}
            </h1>
            <p className="text-sm text-gray-600">
              {t("page.conversation.departure")}: {new Date(conversation.trip.departure_time).toLocaleString(lang)}
            </p>
            <p className="text-sm text-gray-600">
              {t("page.conversation.participants")}: {conversation.participants.map(p => p.name).join(", ")}
            </p>
          </div>
          <div className="flex gap-2">
            {isDriver && (
              <button
                onClick={handleDeleteConversation}
                disabled={deleting}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
              >
                {deleting ? t("page.conversation.deleting") || "..." : t("page.conversation.delete") || "Eliminar"}
              </button>
            )}
            <button
              onClick={() => router.push(`/${lang}/messages`)}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              {t("page.conversation.back")}
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 mt-8">
            {t("page.conversation.noMessages") || "No hay mensajes aún. ¡Envía el primero!"}
          </p>
        ) : (
          messages.map((message) => {
            const isOwn = message.user.id === user.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isOwn
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-900 border border-gray-300"
                  }`}
                >
                  {!isOwn && (
                    <p className="text-xs font-semibold mb-1 opacity-75">
                      {message.user.name}
                    </p>
                  )}
                  <p className="break-words">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwn ? "text-blue-200" : "text-gray-500"
                    }`}
                  >
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
      <form onSubmit={handleSendMessage} className="bg-white border-t border-gray-300 p-4 rounded-b-lg shadow">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t("page.conversation.messagePlaceholder") || "Escribe un mensaje..."}
            className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {sending ? t("page.conversation.sending") || "..." : t("page.conversation.send") || "Enviar"}
          </button>
        </div>
      </form>
    </div>
  );
}
