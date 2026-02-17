const { createClient } = require('@supabase/supabase-js');

// IMPORTANT: This script requires SUPABASE_URL and SUPABASE_ANON_KEY to be set in the environment.
// It assumes the 'documents_sst' table already exists (use db/schema.sql in Supabase SQL Editor).

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Seeding data into 'documents_sst'...");

  const documents = [
    {
      title: 'Code du Travail - Article L4121-1',
      url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000035640828',
      published_date: '2017-10-01',
      content: "L'employeur prend les mesures nécessaires pour assurer la sécurité et protéger la santé physique et mentale des travailleurs. Ces mesures comprennent : 1° Des actions de prévention des risques professionnels ; 2° Des actions d'information et de formation ; 3° La mise en place d'une organisation et de moyens adaptés.",
      source: 'Legifrance',
      category: 'Code du travail',
      // Note: In a real scenario, embeddings should be generated before insertion.
      // This seed script relies on the table allowing null embeddings or we should update them later.
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
    // Check if exists
    const { data: existing, error: selectError } = await supabase
        .from('documents_sst')
        .select('id')
        .eq('title', doc.title)
        .maybeSingle();

    if (selectError) {
        console.error(`Error checking existence for ${doc.title}:`, selectError.message);
        continue;
    }

    if (!existing) {
        const { error: insertError } = await supabase
            .from('documents_sst')
            .insert([doc]);

        if (insertError) {
            console.error(`Error inserting ${doc.title}:`, insertError.message);
        } else {
            console.log(`Inserted: ${doc.title}`);
        }
    } else {
        console.log(`Skipped (exists): ${doc.title}`);
    }
  }

  console.log("Seeding complete.");
}

main();
