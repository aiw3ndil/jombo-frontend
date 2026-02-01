const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export interface Message {
  id: number;
  content: string;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    picture_url?: string;
  };
}

export interface Conversation {
  id: number;
  trip_id: number;
  created_at: string;
  trip: {
    id: number;
    departure_location: string;
    arrival_location: string;
    departure_time: string;
    driver: {
      id: number;
      name: string;
      email: string;
      picture_url?: string;
    };
  };
  participants: Array<{
    id: number;
    name: string;
    email: string;
    picture_url?: string;
  }>;
  last_message?: {
    id: number;
    content: string;
    created_at: string;
    user: {
      id: number;
      name: string;
      picture_url?: string;
    };
  };
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
}

// Obtener todas las conversaciones del usuario
export async function getConversations(): Promise<Conversation[]> {
  const url = `${API_BASE}/api/v1/conversations`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Error al obtener las conversaciones");
  }

  return await res.json();
}

// Obtener una conversación específica con todos sus mensajes
export async function getConversation(conversationId: number): Promise<ConversationDetail> {
  const url = `${API_BASE}/api/v1/conversations/${conversationId}`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Error al obtener la conversación");
  }

  const data = await res.json();
  return {
    ...data.conversation,
    messages: data.messages
  };
}

// Obtener conversación de un viaje específico
export async function getTripConversation(tripId: number): Promise<ConversationDetail> {
  const url = `${API_BASE}/api/v1/trips/${tripId}/conversation`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Error al obtener la conversación del viaje");
  }

  const data = await res.json();
  return {
    ...data.conversation,
    messages: data.messages
  };
}

// Enviar un mensaje
export async function sendMessage(conversationId: number, content: string): Promise<Message> {
  const url = `${API_BASE}/api/v1/conversations/${conversationId}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      message: { content }
    }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.errors?.join(", ") || "Error al enviar el mensaje");
  }

  return await res.json();
}

// Eliminar una conversación (solo conductor)
export async function deleteConversation(conversationId: number): Promise<void> {
  const url = `${API_BASE}/api/v1/conversations/${conversationId}`;

  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Error al eliminar la conversación");
  }
}

// Eliminar un mensaje (solo autor)
export async function deleteMessage(conversationId: number, messageId: number): Promise<void> {
  const url = `${API_BASE}/api/v1/conversations/${conversationId}/messages/${messageId}`;

  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Error al eliminar el mensaje");
  }
}

export default {
  getConversations,
  getConversation,
  getTripConversation,
  sendMessage,
  deleteConversation,
  deleteMessage,
};
