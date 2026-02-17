'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
// We use process.env directly here. Ensure these are set in your environment.
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

export async function sendMessage(userMessage: string) {
  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        return "Erreur de configuration : Clé API Gemini manquante.";
    }
    if (!supabaseUrl || !supabaseKey) {
        return "Erreur de configuration : Identifiants Supabase manquants.";
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Generate Embedding for the user query
    // Using 'text-embedding-004' as standard for Gemini.
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const resultEmbedding = await embeddingModel.embedContent(userMessage);
    const embedding = resultEmbedding.embedding.values;

    // 2. Search for relevant documents in Supabase (documents_sst)
    // We call the RPC function 'match_documents_sst' defined in schema.sql
    let context = "";

    const { data: documents, error } = await supabase.rpc('match_documents_sst', {
        query_embedding: embedding,
        match_threshold: 0.5, // Adjust threshold as needed
        match_count: 3
    });

    if (error) {
        console.error("Supabase RPC error:", error);
        context = "Note: Impossible d'accéder à la base de connaissances pour le moment. Réponds en tant qu'expert généraliste.";
    } else if (documents && documents.length > 0) {
        context = "Voici des informations issues de la base de connaissances (Légifrance, INRS, OPPBTP, VNF) :\n\n";
        documents.forEach((doc: any) => {
            context += `Source: ${doc.source} - ${doc.title}\nContenu: "${doc.content}"\n\n`;
        });
    } else {
        context = "Aucun document spécifique trouvé dans la base de connaissances pour cette question. Réponds en te basant sur tes connaissances générales en SST.\n\n";
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
