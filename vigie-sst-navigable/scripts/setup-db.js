const { db } = require('@vercel/postgres');

async function main() {
  const client = await db.connect();

  try {
    // Enable pgvector extension
    await client.sql`CREATE EXTENSION IF NOT EXISTS vector;`;
    console.log('Extension "vector" created or already exists.');

    // Create documents table
    await client.sql`
      CREATE TABLE IF NOT EXISTS documents (
        id BIGSERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        url TEXT,
        published_date DATE,
        content TEXT,
        source TEXT NOT NULL,
        category TEXT,
        embedding vector(768),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log('Table "documents" created or already exists.');

    // Insert Seed Data
    // Note: We are inserting raw vectors as placeholders. In a real scenario, you would generate these using Gemini API before insertion.
    // Since this is a setup script, we keep the placeholder vectors from the original seed.sql, but formatted for pgvector string input.

    const documents = [
      {
        title: 'Code du Travail - Article L4121-1',
        url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000035640828',
        published_date: '2017-10-01',
        content: "L'employeur prend les mesures nécessaires pour assurer la sécurité et protéger la santé physique et mentale des travailleurs. Ces mesures comprennent : 1° Des actions de prévention des risques professionnels ; 2° Des actions d'information et de formation ; 3° La mise en place d'une organisation et de moyens adaptés.",
        source: 'Legifrance',
        category: 'Code du travail',
        // Example dummy vector (needs 768 dimensions in real usage, simplified here for demo script structure)
        // For the purpose of this script running without error on a real DB, we won't insert the vector if it's too long/complex to mock perfectly here.
        // We will just insert the metadata. If vectors are needed, they should be generated.
        // However, the schema requires vector(768). Let's insert NULL for now if allowed, or we must generate a dummy array of 768 zeros.
      },
      {
        title: 'Prévention des noyades lors des travaux à proximité de l\'eau',
        url: 'https://www.inrs.fr/risques/noyades/ce-qu-il-faut-retenir.html',
        published_date: '2023-05-15',
        content: 'Le risque de noyade existe lors de travaux sur des ouvrages hydrauliques, en bord de voie navigable ou lors de la navigation. Le port du gilet de sauvetage est obligatoire si la protection collective (garde-corps) n\'est pas suffisante.',
        source: 'INRS',
        category: 'Risque de noyade',
      },
      {
        title: 'Interventions en espaces confinés dans les ouvrages d\'assainissement',
        url: 'https://www.inrs.fr/risques/espaces-confines/ce-qu-il-faut-retenir.html',
        published_date: '2022-09-10',
        content: 'Les interventions dans les espaces confinés (écluses vides, galeries techniques) présentent des risques d\'anoxie ou d\'intoxication. La ventilation préalable et le contrôle de l\'atmosphère sont impératifs avant toute pénétration.',
        source: 'INRS',
        category: 'Espaces confinés',
      },
      {
        title: 'Travaux subaquatiques et hyperbares',
        url: 'https://www.preventionbtp.fr/ressources/documentation/travaux-subaquatiques',
        published_date: '2021-03-20',
        content: 'Les travaux immergés nécessitent des scaphandriers certifiés. L\'équipe doit être composée au minimum de 3 personnes : le scaphandrier, l\'opérateur de secours et le chef d\'opération hyperbare.',
        source: 'OPPBTP',
        category: 'Travaux subaquatiques',
      },
      {
        title: 'Règlement général de police de la navigation intérieure (RGPNI)',
        url: 'https://www.vnf.fr/vnf/reglementation/',
        published_date: '2023-01-01',
        content: 'Tout agent intervenant sur une écluse doit porter ses EPI et respecter les zones de circulation définies. L\'accès aux sas est interdit pendant les manœuvres de vantelles sans autorisation.',
        source: 'VNF',
        category: 'Règlement exploitation',
      }
    ];

    for (const doc of documents) {
      // Check if exists to avoid duplicates
      const { rowCount } = await client.sql`SELECT id FROM documents WHERE title = ${doc.title}`;
      if (rowCount === 0) {
         // Use a dummy vector string of 768 zeros for initialization if needed, or NULL if nullable.
         // Schema said: embedding vector(768). It is nullable by default.
         await client.sql`
          INSERT INTO documents (title, url, published_date, content, source, category)
          VALUES (${doc.title}, ${doc.url}, ${doc.published_date}, ${doc.content}, ${doc.source}, ${doc.category});
        `;
        console.log(`Inserted: ${doc.title}`);
      } else {
        console.log(`Skipped (exists): ${doc.title}`);
      }
    }

    console.log('Seed data processing complete.');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.end();
  }
}

main();
