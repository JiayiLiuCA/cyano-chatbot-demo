'use client';

import { useState, useEffect, useRef } from 'react';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import ConversationList from '@/components/ConversationList';
import { storageUtils } from '@/lib/localStorage';
import { Conversation, Message } from '@/lib/types';

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, streamingMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = () => {
    const convs = storageUtils.getConversations();
    setConversations(convs);

    // Load current conversation messages
    if (currentConversationId) {
      const current = convs.find((c) => c.id === currentConversationId);
      if (current) {
        setCurrentMessages(current.messages);
      }
    }
  };

  const handleNewConversation = () => {
    const newConv = storageUtils.createConversation();
    setCurrentConversationId(newConv.id);
    setCurrentMessages([]);
    loadConversations();
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
    const conv = storageUtils.getConversation(id);
    if (conv) {
      setCurrentMessages(conv.messages);
    }
  };

  const handleDeleteConversation = (id: string) => {
    storageUtils.deleteConversation(id);
    if (currentConversationId === id) {
      setCurrentConversationId(null);
      setCurrentMessages([]);
    }
    loadConversations();
  };

  const handleSendMessage = async (content: string) => {
    try {
      setError(null);
      setIsLoading(true);
      setStreamingMessage('');

      // Create conversation if none exists
      let convId = currentConversationId;
      if (!convId) {
        const newConv = storageUtils.createConversation(content);
        convId = newConv.id;
        setCurrentConversationId(convId);
      }

      // Save user message to localStorage
      storageUtils.addMessage(convId, {
        role: 'user',
        content,
      });
      loadConversations();

      // Prepare messages for API
      const conv = storageUtils.getConversation(convId);
      if (!conv) return;

      const apiMessages = conv.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Call API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get response from API');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          fullResponse += chunk;
          setStreamingMessage(fullResponse);
        }
      }

      // Save assistant's response to localStorage
      if (fullResponse) {
        storageUtils.addMessage(convId, {
          role: 'assistant',
          content: fullResponse,
        });
        loadConversations();
        setStreamingMessage('');
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Get current conversation
  const currentConversation = conversations.find((c) => c.id === currentConversationId);

  return (
    <div className="flex h-screen bg-white dark:bg-gray-800">
      {/* Sidebar */}
      <ConversationList
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {currentConversation?.title || 'Chatbot Demo'}
          </h1>
          {error && (
            <div className="mt-2 text-sm text-red-600 dark:text-red-400">
              Error: {error}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto">
            {!currentConversationId ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <svg
                    className="mx-auto h-12 w-12 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                  <p className="text-lg font-medium">Start a new conversation</p>
                  <p className="text-sm mt-2">Click "New Chat" or send a message to begin</p>
                </div>
              </div>
            ) : (
              <>
                {currentMessages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {streamingMessage && (
                  <ChatMessage
                    message={{
                      id: 'streaming',
                      role: 'assistant',
                      content: streamingMessage,
                      timestamp: Date.now(),
                    }}
                  />
                )}
                {isLoading && !streamingMessage && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-4 py-2">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: '0.1s' }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Input */}
        <ChatInput onSend={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
