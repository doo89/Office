-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store reference documents (Textes de loi, fiches, etc.)
create table documents (
  id bigserial primary key,
  title text not null,       -- Titre du document (ex: "Décret n°...")
  url text,                  -- Lien vers la source officielle (Légifrance, etc.)
  published_date date,       -- Date de publication ou d'effet
  content text,              -- Contenu textuel complet ou extrait
  embedding vector(768),     -- Vecteur pour la recherche sémantique (taille dépend du modèle utilisé, ex: 768 pour Gemini)
  created_at timestamptz default now()
);

-- Create a function to search for documents based on cosine similarity
create or replace function match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  title text,
  url text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    documents.id,
    documents.content,
    documents.title,
    documents.url,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;
