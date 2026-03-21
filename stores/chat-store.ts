import { create } from "zustand";
import type { ChatMessage, ChatSession } from "@/types/ai";
import { generateId } from "@/lib/utils";

interface ChatStore {
  sessions: ChatSession[];
  activeSessionId: string | null;

  // Derived
  activeSession: ChatSession | null;
  activeMessages: ChatMessage[];

  // Actions
  createSession: (title?: string) => string;
  setActiveSession: (id: string) => void;
  addMessage: (sessionId: string, message: Omit<ChatMessage, "id" | "timestamp">) => string;
  updateMessage: (sessionId: string, messageId: string, patch: Partial<ChatMessage>) => void;
  clearSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  sessions: [],
  activeSessionId: null,

  get activeSession() {
    const { sessions, activeSessionId } = get();
    return sessions.find((s) => s.id === activeSessionId) ?? null;
  },

  get activeMessages() {
    return get().activeSession?.messages ?? [];
  },

  createSession(title = "New Chat") {
    const id = generateId();
    const session: ChatSession = {
      id,
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      sessions: [session, ...state.sessions],
      activeSessionId: id,
    }));
    return id;
  },

  setActiveSession(id) {
    set({ activeSessionId: id });
  },

  addMessage(sessionId, message) {
    const id = generateId();
    const fullMessage: ChatMessage = { ...message, id, timestamp: new Date() };
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId
          ? { ...s, messages: [...s.messages, fullMessage], updatedAt: new Date() }
          : s
      ),
    }));
    return id;
  },

  updateMessage(sessionId, messageId, patch) {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              messages: s.messages.map((m) =>
                m.id === messageId ? { ...m, ...patch } : m
              ),
            }
          : s
      ),
    }));
  },

  clearSession(sessionId) {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, messages: [], updatedAt: new Date() } : s
      ),
    }));
  },

  deleteSession(sessionId) {
    set((state) => {
      const remaining = state.sessions.filter((s) => s.id !== sessionId);
      return {
        sessions: remaining,
        activeSessionId:
          state.activeSessionId === sessionId
            ? (remaining[0]?.id ?? null)
            : state.activeSessionId,
      };
    });
  },
}));
