# Vigie-SST Navigable

Plateforme intelligente de veille et de conseil en Santé et Sécurité au Travail (SST) pour les voies navigables.

## Technologies

*   **Framework :** Next.js 15+ (App Router)
*   **Base de données :** Supabase (PostgreSQL + pgvector)
*   **IA :** Google Gemini (Embeddings + Chat)
*   **UI :** Tailwind CSS

## Configuration Environnement (Local & Vercel)

Pour que l'application fonctionne, vous devez configurer les variables d'environnement suivantes.

### 1. Variables Supabase
Ces variables sont nécessaires pour connecter l'application à votre base de données Supabase.

*   `SUPABASE_URL` : L'URL de votre projet Supabase (ex: `https://xyz.supabase.co`).
*   `SUPABASE_ANON_KEY` : La clé publique (anon) de votre projet.

### 2. Variable Google Gemini (IA)
Cette variable est requise pour générer les réponses de l'assistant Jules et les vecteurs de recherche.

*   `GOOGLE_GENERATIVE_AI_API_KEY` : Votre clé API Google AI Studio (Gemini).

## Déploiement sur Vercel

1.  Connectez votre dépôt GitHub à Vercel.
2.  Dans les paramètres du projet ("Settings" > "Environment Variables"), ajoutez les trois clés ci-dessus :
    *   `SUPABASE_URL`
    *   `SUPABASE_ANON_KEY`
    *   `GOOGLE_GENERATIVE_AI_API_KEY`
3.  Redéployez l'application pour que les changements prennent effet.

## Contribution & Indexation

Voir le fichier [CONTRIBUTE.md](./CONTRIBUTE.md) pour savoir comment ajouter de nouveaux textes réglementaires.
