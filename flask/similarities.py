import numpy as np

def calculate_similarity(vector1, vector2):
    cosine_similarity = np.dot(vector1, vector2) / (
        np.linalg.norm(vector1) * np.linalg.norm(vector2)
    )
    return cosine_similarity