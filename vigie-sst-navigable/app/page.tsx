"use client";

import { useState } from "react";
import Link from "next/link";
import { sendMessage } from "./actions";

export default function Home() {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: 'Bonjour ! Je suis Jules, votre assistant en prévention SST. Je suis connecté aux bases de données Légifrance, INRS, OPPBTP et VNF. Comment puis-je vous aider ?' }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
        const response = await sendMessage(userMessage);
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
        setMessages(prev => [...prev, { role: 'assistant', content: "Désolé, une erreur est survenue." }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
             <h1 className="text-xl font-bold text-gray-800">Vigie-SST Navigable</h1>
             <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full border border-green-200">En ligne</span>
          </div>
          <Link href="/knowledge-base" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
            </svg>
            Voir la Knowledge Base
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xl p-4 rounded-lg shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border border-gray-200'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-500 p-4 rounded-lg border border-gray-200 animate-pulse">
                Jules réfléchit...
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto flex gap-2">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 shadow-sm disabled:opacity-50"
              placeholder="Posez votre question métier (ex: EPI obligatoires écluse...)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm disabled:opacity-50"
              disabled={isLoading}
            >
              Envoyer
            </button>
          </div>
          <p className="text-xs text-center text-gray-400 mt-2">
            Recherche active sur : Légifrance, INRS, OPPBTP, VNF.
          </p>
        </div>
      </div>

      {/* Side Panel - Visible on larger screens */}
      <div className="w-80 bg-white border-l border-gray-200 p-4 hidden lg:flex flex-col h-full shadow-lg z-10">
        <h2 className="text-lg font-bold mb-6 text-gray-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          Sources Pertinentes
        </h2>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Example Source Card 1 */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 hover:border-blue-300 transition cursor-pointer">
            <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded uppercase">Legifrance</span>
                <span className="text-[10px] text-gray-400">Code du Travail</span>
            </div>
            <h3 className="font-semibold text-blue-900 text-sm mb-1">Article L4121-1</h3>
            <p className="text-xs text-gray-600 line-clamp-3">
              L&apos;employeur prend les mesures nécessaires pour assurer la sécurité et protéger la santé physique et mentale des travailleurs.
            </p>
          </div>

          {/* Example Source Card 2 */}
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 hover:border-orange-300 transition cursor-pointer">
            <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded uppercase">VNF</span>
                <span className="text-[10px] text-gray-400">Règlement</span>
            </div>
            <h3 className="font-semibold text-orange-900 text-sm mb-1">Sécurité Écluses</h3>
            <p className="text-xs text-gray-600 line-clamp-3">
              Règlement de sécurité d&apos;exploitation. Port du gilet de sauvetage obligatoire aux abords des sas.
            </p>
          </div>

           <div className="text-xs text-gray-400 italic text-center mt-8 p-4 border border-dashed border-gray-300 rounded">
            Les sources s&apos;afficheront ici dynamiquement en fonction de votre conversation.
          </div>
        </div>
      </div>
    </div>
  );
}
