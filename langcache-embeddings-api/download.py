from sentence_transformers import SentenceTransformer

model_name = "redis/langcache-embed-v1"
model = SentenceTransformer(model_name)
embedding_dimensions = model.get_sentence_embedding_dimension()
print(model_name, "with embedding dimensions:",
      embedding_dimensions, "downloaded ..")

print("testing generating embeddings ...")
model.encode(["hello world"], normalize_embeddings=True)
