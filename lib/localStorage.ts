import { Conversation, Message } from './types';

const STORAGE_KEY = 'chatbot-conversations';

export const storageUtils = {
  // Get all conversations
  getConversations(): Conversation[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  },

  // Get a specific conversation by ID
  getConversation(id: string): Conversation | null {
    const conversations = this.getConversations();
    return conversations.find(conv => conv.id === id) || null;
  },

  // Save all conversations
  saveConversations(conversations: Conversation[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  // Create a new conversation
  createConversation(firstMessage?: string): Conversation {
    const conversation: Conversation = {
      id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: firstMessage ? this.generateTitle(firstMessage) : 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const conversations = this.getConversations();
    conversations.unshift(conversation); // Add to beginning
    this.saveConversations(conversations);

    return conversation;
  },

  // Update an existing conversation
  updateConversation(id: string, updates: Partial<Conversation>): void {
    const conversations = this.getConversations();
    const index = conversations.findIndex(conv => conv.id === id);

    if (index !== -1) {
      conversations[index] = {
        ...conversations[index],
        ...updates,
        updatedAt: Date.now(),
      };
      this.saveConversations(conversations);
    }
  },

  // Add a message to a conversation
  addMessage(conversationId: string, message: Omit<Message, 'id' | 'timestamp'>): void {
    const conversations = this.getConversations();
    const conversation = conversations.find(conv => conv.id === conversationId);

    if (conversation) {
      const newMessage: Message = {
        ...message,
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };

      conversation.messages.push(newMessage);
      conversation.updatedAt = Date.now();

      // Update title if it's the first user message
      if (conversation.messages.length === 1 && message.role === 'user') {
        conversation.title = this.generateTitle(message.content);
      }

      this.saveConversations(conversations);
    }
  },

  // Delete a conversation
  deleteConversation(id: string): void {
    const conversations = this.getConversations();
    const filtered = conversations.filter(conv => conv.id !== id);
    this.saveConversations(filtered);
  },

  // Clear all conversations
  clearAll(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  },

  // Generate a title from the first message (truncated)
  generateTitle(message: string): string {
    const maxLength = 50;
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength).trim() + '...';
  },
};
