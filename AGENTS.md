# Instructions pour l'Agent (Jules) : Projet "Vigie-SST Navigable"

## 1. Contexte & Vision
* **Produit :** Une plateforme intelligente de veille et de conseil en Santé et Sécurité au Travail (SST).
* **Domaine spécifique :** Travaux publics et exploitation des voies navigables (VNF, maintenance d'écluses, dragage, travaux subaquatiques).
* **Utilisateur :** Assistant en prévention (Expert métier).
* **Mission :** L'outil doit permettre de sourcer la réglementation (Code du Travail, arrêtés fluviaux), répondre à des questions précises et agir comme un "mentor" qui challenge l'utilisateur sur ses plans de prévention.

## 2. Stack Technique Préconisée
* **Framework :** Next.js 15 (App Router).
* **Langage :** TypeScript (Type-safe pour les données juridiques).
* **Base de données / Vecteurs :** Supabase (PostgreSQL + pgvector) pour stocker les textes de loi et permettre la recherche sémantique.
* **IA / LLM :** Intégration de l'API Gemini 1.5 Pro ou Flash pour l'analyse des textes et le mode "Challenge".
* **UI :** Tailwind CSS + Shadcn/UI (Style sobre, professionnel, accès rapide à l'information).

## 3. Fonctionnalités Clés à Implémenter (MVP)
1. **Module de Recherche (RAG) :** Capacité d'uploader des PDF (ex: nouveaux décrets) et de poser des questions dessus avec citation des sources.
2. **Tableau de Bord de Veille :** Flux d'actualités sur le droit des travailleurs et l'hygiène.
3. **Mode "Challenge" :** Un module où l'IA pose des questions à l'utilisateur sur des scénarios de risques spécifiques aux voies navigables (ex: chute à l'eau, travail en espace confiné dans une écluse).
4. **Générateur de mémo :** Transformer une question complexe en une fiche de prévention simplifiée pour les agents de terrain.

## 4. Règles de Développement
* **Fiabilité :** Chaque réponse générée par l'IA DOIT inclure une section "Sources" (Code du travail, INRS, OPPBTP).
* **Sécurité :** Mise en place d'une authentification simple (NextAuth).
* **Accessibilité :** L'interface doit être lisible sur tablette (usage sur les chantiers/voies).

## 5. Première Mission (Bootstrap)
Jules, pour ton premier run :
1. Initialise l'architecture Next.js avec TypeScript et Tailwind.
2. Crée une interface de Chat simple avec un panneau latéral pour afficher les "Sources" et les "Textes de loi associés".
3. Prépare un schéma de base de données pour stocker des documents de référence (Titre, Date, URL, Contenu).
4. Ajoute un fichier `CONTRIBUTE.md` expliquant comment indexer de nouveaux textes réglementaires dans le système.
