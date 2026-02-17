"use client";

import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: 'Bonjour ! Je suis Jules, votre assistant en prévention SST. Comment puis-je vous aider aujourd\'hui ?' }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', content: input }]);
    setInput("");
    // Simulate response
    setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: "Je suis une version de démonstration. Je n'ai pas encore accès à l'API Gemini." }]);
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4">
          <h1 className="text-xl font-bold text-gray-800">Vigie-SST Navigable</h1>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xl p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border border-gray-200'}`}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Posez votre question sur la réglementation..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Envoyer
            </button>
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto hidden md:block">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Sources & Textes</h2>
        <div className="space-y-4">
          <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
            <h3 className="font-medium text-blue-600 text-sm">Code du Travail</h3>
            <p className="text-xs text-gray-500 mt-1">Article L4121-1</p>
            <p className="text-sm text-gray-600 mt-2">L&apos;employeur prend les mesures nécessaires pour assurer la sécurité et protéger la santé physique et mentale des travailleurs.</p>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
            <h3 className="font-medium text-blue-600 text-sm">Décret n° 2010-1118</h3>
            <p className="text-xs text-gray-500 mt-1">Opérations sur les installations électriques</p>
            <p className="text-sm text-gray-600 mt-2">Définit les règles de prévention contre les risques électriques.</p>
          </div>
          <div className="text-sm text-gray-400 italic text-center mt-8">
            Les sources pertinentes apparaîtront ici en fonction de la conversation.
          </div>
        </div>
      </div>
    </div>
  );
}
