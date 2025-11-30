"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getConversations, deleteConversation, Conversation } from "@/app/lib/api/conversations";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useAuth } from "@/app/contexts/AuthContext";
import Link from "next/link";

export default function MessagesPage() {
  const { t } = useTranslation();
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
      alert(t("page.messages.deleteSuccess") || "Conversación eliminada exitosamente");
      await loadConversations();
    } catch (error: any) {
      console.error("Error deleting conversation:", error);
      alert(error?.message || t("page.messages.deleteError") || "Error al eliminar la conversación");
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <p className="text-gray-100">{t("page.messages.loading") || "Cargando..."}</p>
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
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-100">
          {t("page.messages.title")}
        </h1>
        <button
          onClick={() => router.push(`/${lang}`)}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          {t("page.messages.back")}
        </button>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-4">
            {t("page.messages.noConversations") || "No tienes conversaciones"}
          </p>
          <p className="text-gray-500 text-sm">
            {t("page.messages.conversationsInfo") || "Las conversaciones se crean automáticamente cuando se confirma una reserva"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className="border border-gray-300 rounded-lg p-4 bg-white shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Link
                    href={`/${lang}/messages/${conversation.id}`}
                    className="block hover:opacity-80"
                  >
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {conversation.trip.departure_location} → {conversation.trip.arrival_location}
                    </h2>
                    <p className="text-sm text-gray-600 mb-2">
                      {t("page.messages.departure")}: {new Date(conversation.trip.departure_time).toLocaleString(lang)}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      {t("page.messages.participants")}: {conversation.participants.map(p => p.name).join(", ")}
                    </p>
                    {conversation.last_message && (
                      <div className="mt-3 p-2 bg-gray-50 rounded">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">{conversation.last_message.user.name}:</span>{" "}
                          {conversation.last_message.content.substring(0, 100)}
                          {conversation.last_message.content.length > 100 ? "..." : ""}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(conversation.last_message.created_at).toLocaleString(lang)}
                        </p>
                      </div>
                    )}
                  </Link>
                </div>

                <div className="ml-4 flex flex-col gap-2">
                  <Link
                    href={`/${lang}/messages/${conversation.id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 text-center"
                  >
                    {t("page.messages.openChat")}
                  </Link>
                  
                  {isDriver(conversation) && (
                    <button
                      onClick={() => handleDeleteConversation(conversation.id)}
                      disabled={deletingId === conversation.id}
                      className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 disabled:bg-gray-400"
                    >
                      {deletingId === conversation.id
                        ? (t("page.messages.deleting") || "...")
                        : (t("page.messages.delete") || "Eliminar")}
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
