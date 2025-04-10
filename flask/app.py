import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
import tensorflow as tf
import numpy as np
from flask_cors import CORS
from preprocess import preprocess_image
from flask import Flask, request, jsonify
from pad_signature import add_signature_above_name
from similarities import calculate_similarity
from augmented import create_augmented_signature

BASE_DIR = os.path.dirname(os.path.abspath(__file__)) 
LARAVEL_BASE_DIR = os.path.join(BASE_DIR, '..')
LARAVEL_STORAGE_DIR = os.path.join(LARAVEL_BASE_DIR, "storage/app/private")

app = Flask(__name__)
CORS(app, 
     resources={
         r"/api/*": {
             "origins": ["*"],
             "methods": ["GET", "POST", "OPTIONS"],
             "allow_headers": ["Content-Type", "X-Requested-With"],
             "expose_headers": ["Content-Type"],
             "supports_credentials": True,
             "send_wildcard": False
         }
     })

@app.route('/api/status', methods=['GET'])
def status():
    return jsonify({"status": "ok", "message": "App status: Successful", "base_dir":LARAVEL_BASE_DIR }), 200

@app.route('/api/sign', methods=['POST'])
def sign():
    data = request.get_json()

    if not data or 'pdf' not in data or 'signatory' not in data or 'signatures' not in data:
        return jsonify({"error": "PDF file path, signatory, and signature images are required."}), 400

    pdf_file = os.path.join(LARAVEL_STORAGE_DIR, data['pdf'].replace('/storage', '').lstrip('/'))

    signatory = data['signatory'] 

    signature_paths = data['signatures']
    
    signature_full_paths = [
    os.path.join(LARAVEL_STORAGE_DIR, sig_path.replace('/storage', '').lstrip('/'))
        for sig_path in signature_paths
    ]

    if not os.path.exists(pdf_file):
        return jsonify({"error": f"Document file not found: {os.path.basename(pdf_file)}"}), 400

    try:
        augmented_signature = create_augmented_signature(signature_full_paths)
        # TODO: Handle when name is not on the document
        add_signature_above_name(pdf_file, augmented_signature, signatory)

        return jsonify({"message": "Signature added successfully!"}), 200

    except Exception as e:
        print(f"Error adding signature: {e}")
        return jsonify({"error": f"Failed to add signature: {str(e)}"}), 500


@app.route('/api/validate-signatures', methods=['POST'])
def validate_signatures():
    if 'signatures' not in request.files:
        return jsonify({"error": "No files uploaded"}), 400

    files = request.files.getlist('signatures')

    try:
        model = tf.keras.models.load_model('model.keras')

        processed_images = [preprocess_image(file) for file in files]

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

        average_similarity = np.mean(similarities) 
        
        average_similarity = average_similarity * 50

        is_match = bool(average_similarity >= 85)

        return jsonify({
            "isMatch": is_match,
            "averageSimilarity": round(average_similarity, 2),
            "rawSimilarity": round(average_similarity, 4),
            "confidence": "high" if average_similarity >= 85 
                        else "medium" if average_similarity >= 75 
                        else "low"
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 200

if __name__ == '__main__':    
    app.run()