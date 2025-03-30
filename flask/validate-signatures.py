import tensorflow as tf
import numpy as np
from preprocess import preprocess_image
from similarities import calculate_similarity
import sys
import json

def validate_signatures(signature_paths):
    try:
        model = tf.keras.models.load_model('model.keras')
        
        # Process images from file paths instead of request files
        processed_images = [preprocess_image(path) for path in signature_paths]

        intermediate_model = tf.keras.models.Model(
            inputs=model.inputs,
            outputs=[
                model.get_layer("conv2d_2").output,
                model.get_layer("dense_1").output
            ]
        )

        feature_vectors = []
        for image in processed_images:
            conv_output, dense_output = intermediate_model.predict(image)
            conv_flattened = conv_output.flatten()
            dense_flattened = dense_output.flatten()
            feature_vectors.append((conv_flattened, dense_flattened))

        similarities = []
        for i in range(len(feature_vectors)):
            for j in range(i + 1, len(feature_vectors)):
                conv1, dense1 = feature_vectors[i]
                conv2, dense2 = feature_vectors[j]
                similarity = calculate_similarity(conv1, conv2) + calculate_similarity(dense1, dense2)
                similarities.append(similarity)

        average_similarity = float(np.mean(similarities)) * 50
        is_match = average_similarity >= 90

        result = {
            "isMatch": is_match,
            "averageSimilarity": float(average_similarity),
            "success": True
        }

        print(json.dumps(result))
        sys.stdout.flush()

        return result

    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e)
        }
        print(json.dumps(error_result))
        sys.stdout.flush()
        return error_result

