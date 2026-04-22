import hnswlib
import numpy as np
from bson import ObjectId
from app.db.mongo_connection import files_collection
from typing import Dict, List, Optional, Any

# Global Constants
DIM = 512

class IndexManager:
    """
    Manages per-user HNSW indexes for face embeddings.
    """
    def __init__(self):
        # Structure: { user_id: { "index": hnswlib.Index, "file_ids": [str, ...] } }
        self.user_indexes: Dict[str, Optional[Dict[str, Any]]] = {}

    def ensure_user_index(self, user_id: str):
        """
        Ensure the index for the user exists. If not, rebuild it from Mongo.
        """
        if user_id not in self.user_indexes:
            self._rebuild_user_index(user_id)

    def _rebuild_user_index(self, user_id: str):
        """
        Fetch files from Mongo and rebuild the HNSW index.
        If user_id is "global", it fetches ALL files with embeddings.
        """
        query = {"embedding": {"$exists": True, "$ne": None}}
        
        if user_id != "global":
            try:
                user_oid = ObjectId(user_id)
                query["user_id"] = user_oid
            except Exception:
                self.user_indexes[user_id] = None
                return

        # Fetch files with embeddings
        cursor = files_collection.find(query)

        embeddings = []
        file_ids = []

        for doc in cursor:
            emb = doc.get("embedding")
            if emb and len(emb) == DIM:
                embeddings.append(emb)
                file_ids.append(str(doc["_id"]))

        if not embeddings:
            self.user_indexes[user_id] = None
            return

        # Build HNSW index
        num_elements = len(embeddings)
        p = hnswlib.Index(space='cosine', dim=DIM)
        
        # Initialize index with some buffer for new additions
        # max_elements must be >= current count. We add a buffer.
        p.init_index(max_elements=num_elements + 10000, ef_construction=200, M=16)
        
        # Add items
        data = np.array(embeddings, dtype=np.float32)
        p.add_items(data, np.arange(num_elements))
        
        # Set ef parameter for query time
        p.set_ef(50)

        self.user_indexes[user_id] = {
            "index": p,
            "file_ids": file_ids
        }


    def add_embedding(self, user_id: str, file_id: str, embedding: List[float]):
        """
        Add a single embedding to the user's index (in-memory only).
        """
        self.ensure_user_index(user_id)

        if len(embedding) != DIM:
            print(f"Warning: Embedding dimension mismatch. Expected {DIM}, got {len(embedding)}")
            return

        user_data = self.user_indexes.get(user_id)

        # If index doesn't exist (None), initialize a new one
        if user_data is None:
            p = hnswlib.Index(space='cosine', dim=DIM)
            p.init_index(max_elements=10000, ef_construction=200, M=16)
            p.set_ef(50)
            
            user_data = {
                "index": p,
                "file_ids": []
            }
            self.user_indexes[user_id] = user_data

        p = user_data["index"]
        file_ids = user_data["file_ids"]

        # Check capacity and resize if necessary
        curr_count = p.get_current_count()
        if curr_count >= p.get_max_elements():
            # Resize index (double capacity)
            new_capacity = p.get_max_elements() * 2
            p.resize_index(new_capacity)

        # Prepare data
        data = np.array([embedding], dtype=np.float32)
        
        # Add item with label = current length of file_ids (which serves as the new index)
        label = len(file_ids)
        p.add_items(data, np.array([label]))
        
        # Update file_ids mapping
        file_ids.append(file_id)

    def search(self, user_id: str, embedding: List[float], top_k: int = 5, threshold: float = 0.4) -> List[Dict[str, float]]:
        """
        Search for similar embeddings in the user's index.
        Returns a list of dicts with file_id and similarity score.
        """
        self.ensure_user_index(user_id)

        user_data = self.user_indexes.get(user_id)
        if user_data is None:
            return []

        p = user_data["index"]
        file_ids = user_data["file_ids"]
        
        if p.get_current_count() == 0:
            return []

        # Prepare query
        query = np.array([embedding], dtype=np.float32)

        # Query HNSW
        # k cannot be larger than current element count
        k = min(top_k, p.get_current_count())
        
        original_labels, distances = p.knn_query(query, k=k)
        
        results = []
        # knn_query returns [[]] for single query
        labels_flat = original_labels[0]
        distances_flat = distances[0]

        for label, dist in zip(labels_flat, distances_flat):
            # For cosine space in hnswlib, distance = 1 - similarity (roughly, check doc)
            # Actually hnswlib cosine distance is 1 - dot(a,b). 
            # So similarity = 1 - distance.
            similarity = 1 - dist
            
            if similarity >= threshold:
                # Map label back to file_id
                if 0 <= label < len(file_ids):
                    results.append({
                        "file_id": file_ids[label],
                        "similarity": float(similarity)
                    })

        return results

    def remove_embedding(self, user_id: str, file_id: str):
        """
        Remove a file from the user's index.
        Since HNSW index structure is complex to mutate for deletions, 
        we rebuild the index from MongoDB to ensure consistency.
        Assumption: The file document has already been deleted from MongoDB.
        """
        if user_id in self.user_indexes:
            self._rebuild_user_index(user_id)

# Global Singleton
index_manager = IndexManager()
