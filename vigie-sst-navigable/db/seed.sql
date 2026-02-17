INSERT INTO documents (title, url, published_date, content, source, category, embedding) VALUES
-- Légifrance : Code du Travail (Sécurité)
(
    'Code du Travail - Article L4121-1',
    'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000035640828',
    '2017-10-01',
    'L\'employeur prend les mesures nécessaires pour assurer la sécurité et protéger la santé physique et mentale des travailleurs. Ces mesures comprennent : 1° Des actions de prévention des risques professionnels ; 2° Des actions d\'information et de formation ; 3° La mise en place d\'une organisation et de moyens adaptés.',
    'Legifrance',
    'Code du travail',
    '[0.012, 0.045, -0.012, ...]'
),
-- INRS : Risque de noyade
(
    'Prévention des noyades lors des travaux à proximité de l\'eau',
    'https://www.inrs.fr/risques/noyades/ce-qu-il-faut-retenir.html',
    '2023-05-15',
    'Le risque de noyade existe lors de travaux sur des ouvrages hydrauliques, en bord de voie navigable ou lors de la navigation. Le port du gilet de sauvetage est obligatoire si la protection collective (garde-corps) n\'est pas suffisante.',
    'INRS',
    'Risque de noyade',
    '[0.022, -0.015, 0.032, ...]'
),
-- INRS : Espaces confinés
(
    'Interventions en espaces confinés dans les ouvrages d\'assainissement',
    'https://www.inrs.fr/risques/espaces-confines/ce-qu-il-faut-retenir.html',
    '2022-09-10',
    'Les interventions dans les espaces confinés (écluses vides, galeries techniques) présentent des risques d\'anoxie ou d\'intoxication. La ventilation préalable et le contrôle de l\'atmosphère sont impératifs avant toute pénétration.',
    'INRS',
    'Espaces confinés',
    '[0.052, 0.005, -0.082, ...]'
),
-- OPPBTP : Travaux subaquatiques
(
    'Travaux subaquatiques et hyperbares',
    'https://www.preventionbtp.fr/ressources/documentation/travaux-subaquatiques',
    '2021-03-20',
    'Les travaux immergés nécessitent des scaphandriers certifiés. L\'équipe doit être composée au minimum de 3 personnes : le scaphandrier, l\'opérateur de secours et le chef d\'opération hyperbare.',
    'OPPBTP',
    'Travaux subaquatiques',
    '[-0.012, 0.075, 0.022, ...]'
),
-- VNF : Règlements de sécurité
(
    'Règlement général de police de la navigation intérieure (RGPNI)',
    'https://www.vnf.fr/vnf/reglementation/',
    '2023-01-01',
    'Tout agent intervenant sur une écluse doit porter ses EPI et respecter les zones de circulation définies. L\'accès aux sas est interdit pendant les manœuvres de vantelles sans autorisation.',
    'VNF',
    'Règlement exploitation',
    '[0.032, 0.025, 0.012, ...]'
);
