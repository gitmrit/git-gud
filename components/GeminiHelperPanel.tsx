import React, { useState, useEffect } from 'react';
import { generateExplanation } from '../services/geminiService';
import { SparklesIcon, PaperAirplaneIcon, BrainCircuitIcon } from './Icons';

interface Message {
    sender: 'user' | 'bot';
    text: string;
}

interface GeminiHelperPanelProps {
    topicToExplain: string | null;
    onExplanationDone: () => void;
}

const GeminiHelperPanel: React.FC<GeminiHelperPanelProps> = ({ topicToExplain, onExplanationDone }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'bot', text: "Hello! I'm your Git assistant. Ask me any Git questions, or click the 💡 icons in the Scenarios panel for hints on the current exercise!" }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    // This function is the single source for generating explanations
    const fetchExplanation = async (topic: string, fromHint: boolean) => {
        if (!topic.trim() || isLoading) return;
        
        setIsLoading(true);

        const userMessage: Message = { sender: 'user', text: fromHint ? `Explain: ${topic}` : topic };
        
        // If it's from a hint, reset the conversation. Otherwise, append.
        const newMessages = fromHint 
            ? [userMessage]
            : [...messages, userMessage];
        
        setMessages([...newMessages, { sender: 'bot', text: '' }]);

        try {
            const stream = await generateExplanation(topic);
            if (typeof stream === 'string') {
                setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1].text = stream;
                    return updated;
                });
            } else {
                for await (const chunk of stream) {
                    const chunkText = chunk.text;
                    setMessages(prev => {
                        const updated = [...prev];
                        updated[updated.length - 1].text += chunkText;
                        return updated;
                    });
                }
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1].text = "Sorry, an error occurred.";
                return updated;
            });
        } finally {
            setIsLoading(false);
            if (fromHint) {
              onExplanationDone();
            }
        }
    };

    useEffect(() => {
        if (topicToExplain) {
            fetchExplanation(topicToExplain, true);
        }
    }, [topicToExplain]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchExplanation(input, false);
        setInput('');
    };

    return (
        <div className="bg-pr-dark h-full flex flex-col">
            <div className="p-4">
                <h3 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
                    <BrainCircuitIcon className="w-8 h-8 text-pr-lime" />
                    <span>Git AI Helper</span>
                </h3>
            </div>
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`rounded-lg px-4 py-2 max-w-sm ${msg.sender === 'user' ? 'bg-pr-lime/90 text-pr-dark' : 'bg-gray-700 text-gray-200'}`}>
                            <p className="text-base whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && messages[messages.length-1]?.sender === 'bot' && (
                    <div className="flex justify-start">
                         <div className="rounded-lg px-4 py-2 bg-gray-700 text-gray-200">
                            <div className="flex items-center gap-2">
                                <SparklesIcon className="w-5 h-5 animate-pulse" />
                                <span className="text-base">Thinking...</span>
                            </div>
                         </div>
                    </div>
                )}
            </div>
            <div className="p-4 border-t-2 border-pr-border">
                <form onSubmit={handleFormSubmit} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Explain 'git rebase'..."
                        className="w-full bg-gray-700 rounded-md border-gray-600 focus:ring-pr-lime focus:border-pr-lime text-base"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading} className="bg-pr-lime text-pr-dark p-2.5 rounded-md disabled:opacity-50 hover:opacity-90 transition-opacity border-2 border-pr-border">
                        <PaperAirplaneIcon className="w-6 h-6" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default GeminiHelperPanel;