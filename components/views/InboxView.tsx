import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Conversation, Message } from '../../types';
import { yellowApi } from '../../services/yellowApi';
import { SendIcon } from '../icons/SendIcon';

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const isAgent = message.sender === 'agent';
    return (
        <div className={`flex items-end gap-2 my-2 ${isAgent ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl ${isAgent ? 'bg-primary text-gray-900 rounded-br-none' : 'bg-secondary text-text-primary rounded-bl-none'}`}>
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 text-right ${isAgent ? 'text-gray-700' : 'text-gray-400'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </div>
    );
};

const MessageThread: React.FC<{ user: User }> = ({ user }) => {
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    useEffect(() => {
        const fetchConversation = async () => {
            setLoading(true);
            const conv = await yellowApi.getConversation(user.id);
            setConversation(conv);
            setLoading(false);
        };
        fetchConversation();
    }, [user.id]);
    
    useEffect(() => {
        scrollToBottom();
    }, [conversation?.messages]);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !conversation || isSending) return;

        setIsSending(true);
        const messageToSend = newMessage;
        
        // Optimistically add agent's message to the UI
        const optimisticAgentMessage: Message = {
            id: `optimistic-${Date.now()}`,
            text: messageToSend,
            sender: 'agent',
            timestamp: new Date().toISOString()
        };
        setConversation(prev => prev ? ({ ...prev, messages: [...prev.messages, optimisticAgentMessage] }) : null);
        setNewMessage('');

        const newMessages = await yellowApi.sendMessage(user.id, messageToSend);
        
        // Replace optimistic message with actual ones from API to sync state
        setConversation(prev => {
            if (!prev) return null;
            const filteredMessages = prev.messages.filter(m => m.id !== optimisticAgentMessage.id);
            return { ...prev, messages: [...filteredMessages, ...newMessages]};
        });
        
        setIsSending(false);
    };

    if (loading) return <div className="flex-1 flex items-center justify-center text-text-secondary">Loading conversation...</div>;
    
    return (
        <div className="flex flex-col h-full bg-surface">
             <header className="flex items-center p-4 border-b border-gray-700 bg-secondary">
                <img className="w-10 h-10 rounded-full mr-4" src={user.avatar} alt={user.name}/>
                <div>
                    <h2 className="font-semibold text-text-primary">{user.name}</h2>
                    <p className="text-sm text-text-secondary">{user.lastSeen}</p>
                </div>
            </header>
            <div className="flex-1 overflow-y-auto p-4">
                {conversation?.messages.length === 0 ? (
                    <div className="text-center text-text-secondary mt-8">No messages yet. Start the conversation!</div>
                ) : (
                    conversation?.messages.map(msg => <MessageBubble key={msg.id} message={msg} />)
                )}
                <div ref={messagesEndRef} />
            </div>
            <footer className="p-4 border-t border-gray-700 bg-secondary">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input 
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="w-full bg-gray-900 border border-gray-600 rounded-full py-2 px-4 focus:ring-primary focus:border-primary text-text-primary"
                        disabled={isSending}
                    />
                    <button type="submit" className="bg-primary p-3 rounded-full text-gray-900 hover:bg-primary-focus transition-colors disabled:opacity-50" disabled={!newMessage.trim() || isSending}>
                        {isSending ? (
                             <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <SendIcon className="w-5 h-5"/>
                        )}
                    </button>
                </form>
            </footer>
        </div>
    );
};


const InboxView: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const fetchedUsers = await yellowApi.getUsers();
        setUsers(fetchedUsers);
        if (fetchedUsers.length > 0) {
            setSelectedUser(fetchedUsers[0]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return (
        <div className="flex h-full">
            <aside className="w-80 border-r border-gray-700 flex flex-col">
                 <header className="p-4 border-b border-gray-700">
                    <h1 className="text-xl font-bold">Inbox</h1>
                    <input type="text" placeholder="Search users..." className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 mt-4 text-sm focus:ring-primary focus:border-primary"/>
                 </header>
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="text-center p-8 text-text-secondary">Loading users...</div>
                    ) : users.length === 0 ? (
                        <div className="text-center p-8 text-text-secondary">No users found.</div>
                    ) : (
                        <ul>
                            {users.map(user => (
                                <li key={user.id} onClick={() => setSelectedUser(user)} className={`flex items-center p-3 cursor-pointer border-l-4 ${selectedUser?.id === user.id ? 'bg-secondary border-primary' : 'border-transparent hover:bg-secondary'}`}>
                                    <img className="w-10 h-10 rounded-full mr-3" src={user.avatar} alt={user.name}/>
                                    <div>
                                        <p className="font-semibold text-sm">{user.name}</p>
                                        <p className="text-xs text-text-secondary">{user.lastSeen}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </aside>
            <main className="flex-1">
                {selectedUser ? (
                    <MessageThread user={selectedUser} />
                ) : (
                    !loading && <div className="flex items-center justify-center h-full text-text-secondary">Select a user to view conversation</div>
                )}
            </main>
        </div>
    );
};

export default InboxView;