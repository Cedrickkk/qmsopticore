import numpy as np

def calculate_similarity(vector1, vector2):
    cosine_similarity = np.dot(vector1, vector2) / (
        np.linalg.norm(vector1) * np.linalg.norm(vector2)
    )
    return cosine_similarity

# def calculate_similarity(vector1, vector2):
#     magnitude1 = np.linalg.norm(vector1)
#     magnitude2 = np.linalg.norm(vector2)

#     cosine_similarity = np.dot(vector1, vector2) / (magnitude1 * magnitude2)
    
#     return float(np.clip(cosine_similarity, 0, 1))