'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { sql } from '@vercel/postgres';

export async function sendMessage(userMessage: string) {
  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        return "Erreur de configuration : Clé API manquante (GOOGLE_GENERATIVE_AI_API_KEY).";
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

    // 1. Generate Embedding for the user query
    // Note: This requires the correct model name. 'text-embedding-004' is a newer embedding model often used with Gemini.
    // However, the prompt mentioned 'embedding-001' or similar in earlier contexts. Let's use 'text-embedding-004' for better quality if available, or fallback to 'embedding-001'.
    // Let's stick to 'text-embedding-004' as it's standard for Gemini now.
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const resultEmbedding = await embeddingModel.embedContent(userMessage);
    const embedding = resultEmbedding.embedding.values;

    // 2. Search for relevant documents in Vercel Postgres
    // We format the vector as a string for pgvector input: '[0.1, 0.2, ...]'
    const vectorString = `[${embedding.join(',')}]`;

    // Perform similarity search
    // Note: The <=> operator returns the cosine distance (lower is better)
    // We select top 3 relevant documents
    // In a real scenario, the 'documents' table must exist and have data.
    // If the table is empty or doesn't exist, this query will fail.
    // We wrap this in a try-catch specific to DB to fallback gracefully if DB is not set up.

    let context = "";
    try {
        const result = await sql`
        SELECT content, source, title, 1 - (embedding <=> ${vectorString}::vector) as similarity
        FROM documents
        ORDER BY embedding <=> ${vectorString}::vector ASC
        LIMIT 3;
        `;

        if (result.rows.length > 0) {
            context = "Voici des informations issues de la base de connaissances (Légifrance, INRS, OPPBTP, VNF) :\n\n";
            result.rows.forEach((doc: any) => {
                context += `Source: ${doc.source} - ${doc.title}\nContenu: "${doc.content}"\n\n`;
            });
        } else {
            context = "Aucun document spécifique trouvé dans la base de connaissances pour cette question. Réponds en te basant sur tes connaissances générales en SST.\n\n";
        }
    } catch (dbError) {
        console.warn("Database query failed (likely not initialized yet):", dbError);
        context = "Note: La base de connaissances n'est pas accessible pour le moment. Réponds en tant qu'expert généraliste.";
    }

    // 3. Generate the answer with Gemini
    const chatModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      Tu es Jules, un expert en prévention Santé et Sécurité au Travail (SST) spécialisé dans les voies navigables.
      Ton rôle est d'aider les agents de terrain et les préventeurs.
      Utilise le contexte ci-dessous pour répondre à la question de l'utilisateur.
      Cite tes sources si elles proviennent du contexte.
      Sois précis, professionnel et bienveillant.

      CONTEXTE :
      ${context}

      QUESTION UTILISATEUR :
      ${userMessage}
    `;

    const chatResult = await chatModel.generateContent(prompt);
    const response = chatResult.response;
    return response.text();

  } catch (error) {
    console.error("Error in sendMessage action:", error);
    return "Désolé, une erreur est survenue lors du traitement de votre demande. (Vérifiez les logs serveur)";
  }
}
