import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';

import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { apiClient } from '../api/client';

export default function ChatTerminal() {
  const [messages, setMessages] = useState<{ role: 'ai'|'user', content: string }[]>([
    { role: 'ai', content: "Hello! I'm your NutriSense AI Coach. I can help answer nutrition questions, analyze your habits, or generate specific recipes. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await apiClient.post('/chat', {
        userId: 'demo-user',
        message: userMessage,
      });
      setMessages(prev => [...prev, { role: 'ai', content: response.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Connection error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-primary/20 text-primary flex items-center justify-center rounded-xl">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI Coach Terminal</h1>
          <p className="text-primary text-sm flex items-center gap-1"><Sparkles className="w-3 h-3" /> Sarvam AI Powered</p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden p-0 bg-black/60 border border-white/5">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-4 ${msg.role === 'ai' ? '' : 'flex-row-reverse'}`}
            >
              <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${msg.role === 'ai' ? 'bg-primary/20 text-primary' : 'bg-gray-800 text-gray-300'}`}>
                {msg.role === 'ai' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'ai' 
                  ? 'bg-white/5 border border-white/10 rounded-tl-none' 
                  : 'bg-primary text-primary-foreground rounded-tr-none shadow-[0_0_15px_rgba(0,255,102,0.2)]'
              }`}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-start gap-4"
            >
              <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-primary/20 text-primary">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4 flex gap-1">
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-2 h-2 rounded-full bg-primary/50" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 rounded-full bg-primary/50" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 rounded-full bg-primary/50" />
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 bg-black/40 border-t border-white/5">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about nutrition, request recipes, or review habits..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-4 pr-16 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-medium"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 p-2 rounded-lg bg-primary text-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => setInput("What should I eat for dinner?")} className="text-xs text-gray-500 hover:text-primary transition-colors bg-white/5 rounded px-2 py-1">Suggest dinner</button>
            <button type="button" onClick={() => setInput("How is my protein intake?")} className="text-xs text-gray-500 hover:text-primary transition-colors bg-white/5 rounded px-2 py-1">Check protein</button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
