import numpy as np

# def calculate_similarity(vector1, vector2):
#     cosine_similarity = np.dot(vector1, vector2) / (
#         np.linalg.norm(vector1) * np.linalg.norm(vector2)
#     )
#     return cosine_similarity

# def calculate_similarity(vector1, vector2):
#     magnitude1 = np.linalg.norm(vector1)
#     magnitude2 = np.linalg.norm(vector2)

#     cosine_similarity = np.dot(vector1, vector2) / (magnitude1 * magnitude2)
    
#     return float(np.clip(cosine_similarity, 0, 1))

def calculate_similarity(vector1, vector2):
    if isinstance(vector1, np.ndarray):
        vector1 = vector1.astype(float).tolist()
    
    if isinstance(vector2, np.ndarray):
        vector2 = vector2.astype(float).tolist()
    
    v1 = np.array(vector1, dtype=float)
    v2 = np.array(vector2, dtype=float)
    
    magnitude1 = np.linalg.norm(v1)
    magnitude2 = np.linalg.norm(v2)
    
    if magnitude1 == 0 or magnitude2 == 0:
        return 0.0
    
    cosine_similarity = np.dot(v1, v2) / (magnitude1 * magnitude2)
    
    result = float(np.clip(cosine_similarity, 0, 1))
    
    return result