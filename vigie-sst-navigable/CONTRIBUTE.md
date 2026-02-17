# Contribution : Indexer de nouveaux textes réglementaires

Pour enrichir la base de connaissances de Vigie-SST Navigable, suivez la procédure ci-dessous pour ajouter de nouveaux textes de loi, décrets ou fiches de prévention.

## Prérequis

*   Accès à la base de données Supabase du projet.
*   Accès à l'API Gemini (ou autre modèle d'embedding configuré) pour générer les vecteurs.

## Procédure d'indexation

1.  **Récupération du document**
    *   Obtenez le texte officiel (Légifrance, INRS, OPPBTP).
    *   Notez le **Titre**, la **Date de publication**, et l'**URL** source.

2.  **Préparation du contenu**
    *   Si le document est un PDF, extrayez le texte brut.
    *   Nettoyez le texte si nécessaire (suppression des en-têtes/pieds de page répétitifs).
    *   Si le texte est très long, découpez-le en segments (chunks) de ~500-1000 mots pour une meilleure précision sémantique.

3.  **Génération des Embeddings**
    *   Utilisez le modèle d'embedding configuré (ex: `text-embedding-004` de Gemini).
    *   Générez un vecteur pour le contenu textuel.

4.  **Insertion en Base de Données**
    *   Exécutez une requête SQL d'insertion dans la table `documents`.

    ```sql
    INSERT INTO documents (title, url, published_date, content, embedding)
    VALUES (
        'Titre du Décret',
        'https://legifrance.gouv.fr/...',
        '2023-10-25',
        'Contenu extrait du texte...',
        '[0.012, -0.045, ...]' -- Le vecteur généré
    );
    ```

## Scripts d'automatisation (À venir)

Des scripts Python/Node.js seront mis à disposition dans le dossier `scripts/` pour automatiser l'extraction et l'insertion à partir d'un fichier PDF ou d'une URL.
