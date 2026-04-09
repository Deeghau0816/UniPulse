import { useEffect, useState, useRef } from 'react';

export type MessageRole = 'USER' | 'TECHNICIAN' | 'ADMIN';

interface Message {
  id: number;
  senderName: string;
  senderRole: MessageRole;
  messageContent: string;
  sentAt: string;
}

interface MessageChatProps {
  ticketId: string;
  currentUserName: string;
  currentUserRole: MessageRole;
  recipientName: string;
  isTechnician: boolean;
}

const MessageChat = ({ 
  ticketId, 
  currentUserName, 
  currentUserRole, 
  recipientName, 
  isTechnician 
}: MessageChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchMessages();
  }, [ticketId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8083/api/tickets/${ticketId}/messages`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      setMessages(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`http://localhost:8083/api/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderName: currentUserName,
          senderRole: currentUserRole,
          messageContent: newMessage.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const newMsg = await response.json();
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      setError(null);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
    }
  };

  const getRoleBadge = (role: MessageRole): string => {
    switch (role) {
      case 'USER':
        return 'Ticket Creator';
      case 'TECHNICIAN':
        return 'Technician';
      case 'ADMIN':
        return 'Admin';
      default:
        return role;
    }
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <style>{`
        .message-chat {
          display: flex;
          flex-direction: column;
          height: 500px;
          background: #ffffff;
          border: 1px solid #e4e4e7;
          border-radius: 16px;
          overflow: hidden;
        }

        .chat-header {
          padding: 16px;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border-bottom: 1px solid #e4e4e7;
        }

        .chat-title {
          font-size: 16px;
          font-weight: 700;
          color: #111111;
          margin-bottom: 4px;
        }

        .chat-subtitle {
          font-size: 13px;
          color: #52525b;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .message {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 16px;
          word-wrap: break-word;
        }

        .message.sent {
          align-self: flex-end;
          background: linear-gradient(135deg, #3b82f6, #60a5fa);
          color: white;
        }

        .message.received {
          align-self: flex-start;
          background: #f8fafc;
          border: 1px solid #e4e4e7;
          color: #111111;
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
          font-size: 11px;
          opacity: 0.8;
        }

        .message-sent .message-header {
          color: rgba(255, 255, 255, 0.9);
        }

        .message-received .message-header {
          color: #52525b;
        }

        .message-sender {
          font-weight: 600;
        }

        .message-role {
          padding: 2px 6px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .message-sent .message-role {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .message-received .message-role {
          background: #f1f5f9;
          color: #475569;
        }

        .message-content {
          font-size: 14px;
          line-height: 1.4;
        }

        .message-input-container {
          padding: 16px;
          border-top: 1px solid #e4e4e7;
          background: #f8fafc;
        }

        .message-input-wrapper {
          display: flex;
          gap: 8px;
        }

        .message-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #d4d4d8;
          border-radius: 12px;
          font-size: 14px;
          outline: none;
          background: #ffffff;
        }

        .message-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
        }

        .send-button {
          padding: 12px 20px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #3b82f6, #60a5fa);
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .send-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .loading-messages {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100px;
          color: #52525b;
        }

        .error-message {
          padding: 12px;
          background: #fee2e2;
          border: 1px solid #fca5a5;
          border-radius: 8px;
          color: #991b1b;
          font-size: 13px;
          text-align: center;
        }

        .empty-messages {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100px;
          color: #52525b;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .message-chat {
            height: 400px;
          }

          .message {
            max-width: 85%;
          }

          .message-input-wrapper {
            flex-direction: column;
          }

          .send-button {
            width: 100%;
          }
        }
      `}</style>
      
      <div className="message-chat">
        <div className="chat-header">
          <div className="chat-title">
            {isTechnician ? `Message to ${recipientName}` : `Message from ${recipientName}`}
          </div>
          <div className="chat-subtitle">
            {isTechnician ? 'Ticket Creator' : 'Assigned Technician'}
          </div>
        </div>

        <div className="messages-container">
          {loading ? (
            <div className="loading-messages">Loading messages...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : messages.length === 0 ? (
            <div className="empty-messages">No messages yet. Start the conversation!</div>
          ) : (
            messages.map((message) => {
              const isSent = message.senderName === currentUserName && message.senderRole === currentUserRole;
              return (
                <div
                  key={message.id}
                  className={`message ${isSent ? 'sent' : 'received'}`}
                >
                  <div className="message-header">
                    <span className="message-sender">{message.senderName}</span>
                    <span
                      className="message-role"
                      style={{ 
                        backgroundColor: isSent ? 'rgba(255, 255, 255, 0.2)' : '#f1f5f9',
                        color: isSent ? 'white' : '#475569'
                      }}
                    >
                      {getRoleBadge(message.senderRole)}
                    </span>
                    <span>{formatTime(message.sentAt)}</span>
                  </div>
                  <div className="message-content">{message.messageContent}</div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="message-input-container">
          <div className="message-input-wrapper">
            <input
              type="text"
              className="message-input"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={loading}
            />
            <button
              className="send-button"
              onClick={sendMessage}
              disabled={!newMessage.trim() || loading}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MessageChat;
