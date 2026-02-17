import Link from "next/link";

const sources = [
  {
    name: "Légifrance",
    description: "Code du travail (Section IV) et textes réglementaires.",
    status: "Connecté",
    lastUpdated: "24/10/2023",
    count: 1450,
    color: "bg-red-100 text-red-800 border-red-200"
  },
  {
    name: "INRS",
    description: "Dossiers techniques : Noyade, Espaces confinés, etc.",
    status: "Connecté",
    lastUpdated: "15/10/2023",
    count: 320,
    color: "bg-blue-100 text-blue-800 border-blue-200"
  },
  {
    name: "OPPBTP",
    description: "Fiches prévention BTP et ouvrages d'art.",
    status: "Connecté",
    lastUpdated: "01/10/2023",
    count: 215,
    color: "bg-orange-100 text-orange-800 border-orange-200"
  },
  {
    name: "VNF.fr",
    description: "Règlements de sécurité et d'exploitation des voies navigables.",
    status: "Connecté",
    lastUpdated: "20/09/2023",
    count: 85,
    color: "bg-green-100 text-green-800 border-green-200"
  }
];

export default function KnowledgeBase() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Knowledge Base SST</h1>
        <Link href="/" className="text-blue-600 hover:underline">
          &larr; Retour au Chat
        </Link>
      </header>

      <main className="max-w-5xl mx-auto py-10 px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Sources de Données</h2>
          <p className="text-gray-600">
            Ces sources alimentent le moteur de recherche et l&apos;assistant Jules pour vos questions métier.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sources.map((source) => (
            <div key={source.name} className={`p-6 rounded-lg border ${source.color} shadow-sm`}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">{source.name}</h3>
                <span className="px-2 py-1 bg-white bg-opacity-60 rounded text-xs font-medium uppercase tracking-wide">
                  {source.status}
                </span>
              </div>
              <p className="mb-4 text-sm opacity-90">{source.description}</p>
              <div className="flex justify-between items-center text-xs opacity-75 pt-4 border-t border-black/10">
                <span>Dernière MàJ : {source.lastUpdated}</span>
                <span>{source.count} documents</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Ajouter une nouvelle source</h3>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="URL de la source (ex: https://...)"
              className="flex-1 border border-gray-300 rounded p-2 text-sm"
              disabled
            />
            <button className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition opacity-50 cursor-not-allowed">
              Indexer (Admin)
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            L&apos;ajout de sources est restreint aux administrateurs pour garantir la fiabilité des réponses.
          </p>
        </div>
      </main>
    </div>
  );
}
