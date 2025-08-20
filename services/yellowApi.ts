import { User, Conversation, Message } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

// This is a client-side app, so API_KEY will be exposed.
// This is acceptable for this exercise, but in a real app,
// this would be handled by a backend.
const API_KEY = "8rsoppZEvUh_aqZc2BY7Bk4cYWq2rJ8x7HeqC8nU";
if (!API_KEY) {
    alert("API_KEY is not configured. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

let users: User[] = [];
let conversations: Conversation[] = [];
let isInitialized = false;

// Schemas for structured JSON from Gemini
const userSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "A unique identifier for the user, e.g., a number as a string." },
        name: { type: Type.STRING },
        email: { type: Type.STRING },
        lastSeen: { type: Type.STRING, description: "e.g., 'Online', '5 minutes ago', 'Yesterday'" },
        createdAt: { type: Type.STRING, description: "ISO 8601 date string" },
    },
    required: ["id", "name", "email", "lastSeen", "createdAt"],
};

const usersListSchema = {
    type: Type.ARRAY,
    items: userSchema,
};

const messageSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "A unique identifier for the message" },
        text: { type: Type.STRING },
        timestamp: { type: Type.STRING, description: "ISO 8601 date string" },
        sender: { type: Type.STRING, enum: ['user', 'agent'] },
    },
    required: ["id", "text", "timestamp", "sender"],
}

const conversationSchema = {
    type: Type.ARRAY,
    items: messageSchema
};


export const yellowApi = {
  getUsers: async (): Promise<User[]> => {
    if (isInitialized) {
        return [...users];
    }

    isInitialized = true; // Set true immediately to prevent re-fetching
    if (!API_KEY) return [];

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Generate a list of 5 diverse and realistic users for a customer support dashboard. Each user must have a unique string id, name, email, a lastSeen status, and a createdAt ISO date string.',
            config: {
                responseMimeType: "application/json",
                responseSchema: usersListSchema,
            },
        });
        const generatedUsers = JSON.parse(response.text);
        users = generatedUsers.map((user: Omit<User, 'avatar'>) => ({
            ...user,
            avatar: `https://picsum.photos/seed/${user.name}/200`,
        }));
    } catch (error) {
        console.error("Failed to generate users with AI. The app will continue with an empty user list.", error);
        users = [];
    }
    return [...users];
  },

  createUser: async (userData: Omit<User, 'id' | 'avatar' | 'lastSeen' | 'createdAt'>): Promise<User> => {
    const newUser: User = {
      id: String(Date.now()),
      ...userData,
      avatar: `https://picsum.photos/seed/${Date.now()}/200`,
      lastSeen: 'Just now',
      createdAt: new Date().toISOString(),
    };
    users.unshift(newUser);
    return newUser;
  },

  updateUser: async (userId: string, userData: Partial<Omit<User, 'id'>>): Promise<User> => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error('User not found');
    users[userIndex] = { ...users[userIndex], ...userData };
    return users[userIndex];
  },

  deleteUser: async (userId: string): Promise<{ success: true }> => {
    users = users.filter(u => u.id !== userId);
    return { success: true };
  },

  deleteUsers: async (userIds: string[]): Promise<{ success: true }> => {
    users = users.filter(u => !userIds.includes(u.id));
    return { success: true };
  },

  getConversation: async (userId: string): Promise<Conversation> => {
    let conversation = conversations.find(c => c.userId === userId);
    if (conversation) {
        return JSON.parse(JSON.stringify(conversation));
    }

    if (!API_KEY) {
        const newConv = { userId, messages: [] };
        conversations.push(newConv);
        return newConv;
    }

    const user = users.find(u => u.id === userId);
    if (!user) throw new Error("User not found");
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a short, realistic customer support chat history for a user named ${user.name}. The conversation should have between 2 and 4 messages, alternating between 'user' and 'agent'. Each message needs a unique id, text, ISO timestamp, and sender. The last message should be from the user.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: conversationSchema,
            },
        });
        const messages = JSON.parse(response.text);
        conversation = { userId, messages };
        conversations.push(conversation);
    } catch (error) {
        console.error(`Failed to generate conversation for user ${userId}. Starting a new conversation.`, error);
        conversation = { userId, messages: [] };
        conversations.push(conversation);
    }
    return JSON.parse(JSON.stringify(conversation));
  },

  sendMessage: async (userId: string, text: string): Promise<Message[]> => {
    let conversation = conversations.find(c => c.userId === userId);
    if (!conversation) {
        // This should ideally not happen if getConversation is called first.
        conversation = { userId, messages: [] };
        conversations.push(conversation);
    }

    const agentMessage: Message = {
      id: String(Date.now()),
      text,
      sender: 'agent',
      timestamp: new Date().toISOString()
    };
    conversation.messages.push(agentMessage);
    
    if (!API_KEY) return [agentMessage];

    const conversationHistory = conversation.messages
        .map(m => `${m.sender === 'agent' ? 'Support Agent' : 'Customer'}: ${m.text}`)
        .join('\n');
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are a customer in a support chat. Below is the conversation history. Continue the conversation by providing a short, natural reply as the customer. Do not repeat previous messages. Your reply should be plain text, not JSON.\n\n## Conversation History:\n${conversationHistory}\n\n## Your Reply (as Customer):`,
            config: {
                temperature: 0.8,
                stopSequences: ['Support Agent:']
            }
        });

        const userReplyText = response.text.trim();

        if (userReplyText) {
            const userMessage: Message = {
                id: String(Date.now() + 1),
                text: userReplyText,
                sender: 'user',
                timestamp: new Date().toISOString()
            };
            conversation.messages.push(userMessage);
            return [agentMessage, userMessage];
        }
    } catch (error) {
        console.error("Failed to generate user reply", error);
    }
    
    return [agentMessage];
  },
};