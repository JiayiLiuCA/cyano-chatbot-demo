'use client';

import { Conversation } from '@/lib/types';

interface ConversationListProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
}

export default function ConversationList({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}: ConversationListProps) {
  return (
    <div className="w-64 bg-gray-100 dark:bg-gray-900 border-r border-gray-300 dark:border-gray-700 flex flex-col h-screen">
      <div className="p-4 border-b border-gray-300 dark:border-gray-700">
        <button
          onClick={onNewConversation}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8 px-4 text-sm">
            No conversations yet. Start a new chat!
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group relative mb-2 p-3 rounded-lg cursor-pointer transition-colors ${
                currentConversationId === conv.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              onClick={() => onSelectConversation(conv.id)}
            >
              <div className="pr-6">
                <p className="text-sm font-medium truncate">{conv.title}</p>
                <p className="text-xs opacity-75 mt-1">
                  {new Date(conv.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conv.id);
                }}
                className={`absolute top-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                  currentConversationId === conv.id
                    ? 'text-white hover:text-red-200'
                    : 'text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400'
                }`}
                aria-label="Delete conversation"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-300 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
