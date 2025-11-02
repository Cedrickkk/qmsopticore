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
    representative_name = data.get('representative_name')

    signature_paths = data['signatures']
    
    signature_full_paths = [
        os.path.join(LARAVEL_STORAGE_DIR, sig_path.replace('/storage', '').lstrip('/'))
        for sig_path in signature_paths
    ]

    if not os.path.exists(pdf_file):
        return jsonify({"error": f"Document file not found: {os.path.basename(pdf_file)}"}), 400

    try:
        augmented_signature = create_augmented_signature(signature_full_paths)

        add_signature_above_name(pdf_file, augmented_signature, signatory, representative_name)

        return jsonify({"message": "Signature added successfully!"}), 200

    except Exception as e:
        print(f"Error adding signature: {e}")
        return jsonify({"error": f"Failed to add signature: {str(e)}"}), 200


@app.route('/api/validate-signatures', methods=['POST'])
def validate_signatures():
    try:
        if 'signatures' not in request.files:
            return jsonify({
                "isMatch": False,
                "averageSimilarity": 0,
                "confidence": "Low",
                "errorCode": "no_files",
                "error": "No signature files uploaded."
            })
        
        files = request.files.getlist('signatures')
        
        if len(files) < 3:
            return jsonify({
                "isMatch": False,
                "averageSimilarity": 0,
                "confidence": "Low",
                "errorCode": "insufficient_files",
                "error": "Please upload at least 3 signature samples for validation."
            })

        for file in files:
            if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                return jsonify({
                    "isMatch": False,
                    "averageSimilarity": 0,
                    "confidence": "Low",
                    "errorCode": "invalid_file_type",
                    "error": "Please ensure all uploaded files are valid signature images (PNG, JPG, JPEG)."
                })

        try:
            model = tf.keras.models.load_model('model.keras')
            processed_images = []
            
            for file in files:
                try:
                    processed = preprocess_image(file)
                    processed_images.append(processed)
                except Exception as img_err:
                    if "has transparency" in str(img_err).lower():
                        return jsonify({
                            "isMatch": False,
                            "averageSimilarity": 0,
                            "confidence": "Low",
                            "errorCode": "transparency_detected",
                            "error": "Please upload signatures without transparency (solid background only)."
                        })
                    else:
                        return jsonify({
                            "isMatch": False,
                            "averageSimilarity": 0,
                            "confidence": "Low",
                            "errorCode": "preprocessing_error",
                            "error": "Please ensure your signature images are clear and properly formatted."
                        })
            
            intermediate_model = tf.keras.models.Model(
                inputs=model.inputs,
                outputs=[
                    model.get_layer("conv2d_2").output,  
                    model.get_layer("dense_1").output 
                ]
            )

            feature_vectors = []
            for image in processed_images:
                try:
                    conv_output, dense_output = intermediate_model.predict(image)
                    conv_flattened = conv_output.flatten()
                    dense_flattened = dense_output.flatten()
                    feature_vectors.append((conv_flattened, dense_flattened))
                except tf.errors.InvalidArgumentError as shape_err:
                    return jsonify({
                        "isMatch": False,
                        "averageSimilarity": 0,
                        "confidence": "Low",
                        "errorCode": "image_format_error",
                        "error": "Please upload clearer signature images without transparency or special formats."
                    })

            similarities = []
            for i in range(len(feature_vectors)):
                for j in range(i + 1, len(feature_vectors)):
                    conv1, dense1 = feature_vectors[i]
                    conv2, dense2 = feature_vectors[j]
                    
                    similarity = float(calculate_similarity(conv1, conv2) + calculate_similarity(dense1, dense2))
                    similarities.append(similarity)

            if not similarities:
                return jsonify({
                    "isMatch": False,
                    "averageSimilarity": 0,
                    "confidence": "Low",
                    "errorCode": "no_comparisons",
                    "error": "Could not compare signatures. Please upload clearer images."
                })

            average_similarity = float(np.mean(similarities)) * 50
            
            if average_similarity < 60:
                return jsonify({
                    "isMatch": False,
                    "averageSimilarity": round(average_similarity, 2),
                    "rawSimilarity": round(float(np.mean(similarities)), 4),
                    "confidence": "Low",
                    "errorCode": "inconsistent_signatures",
                    "error": "The signatures appear too different from each other. Please upload more consistent signature samples."
                })

            is_match = bool(average_similarity >= 85)
            confidence = "High" if average_similarity >= 85 else "Medium" if average_similarity >= 75 else "Low"
            
            return jsonify({
                "isMatch": is_match,
                "averageSimilarity": round(average_similarity, 2),
                "rawSimilarity": round(float(np.mean(similarities)), 4),
                "confidence": confidence.lower()
            })
            
        except tf.errors.OpError as tf_err:
            # Handle specific TensorFlow errors
            if "incompatible with the layer" in str(tf_err):
                return jsonify({
                    "isMatch": False,
                    "averageSimilarity": 0,
                    "confidence": "Low",
                    "errorCode": "image_format_error",
                    "error": "Please upload clearer signature images. Some images may have transparency or incorrect dimensions."
                })
            else:
                raise tf_err

    except Exception as e:
        print(f"Error in validate_signatures: {str(e)}")
        error_message = str(e)
        error_code = "general_error"
        
        if "expected shape" in error_message and "found shape" in error_message:
            error_code = "image_format_error"
            error_message = "Please upload clearer signature images without transparency."
        elif "object of type float32" in error_message.lower():
            error_code = "serialization_error"
            error_message = "Error processing signature similarity. Please try again."
        
        return jsonify({
            "isMatch": False,
            "averageSimilarity": 0,
            "confidence": "Low",
            "errorCode": error_code,
            "error": error_message
        })

if __name__ == '__main__':    
    app.run()


# def validate_signatures():
#     if 'signatures' not in request.files:
#         return jsonify({"error": "No files uploaded"}), 400

#     files = request.files.getlist('signatures')

#     try:
#         model = tf.keras.models.load_model('model.keras')

#         processed_images = [preprocess_image(file) for file in files]

#         intermediate_model = tf.keras.models.Model(
#             inputs=model.inputs,
#             outputs=[
#                 model.get_layer("conv2d_2").output,  
#                 model.get_layer("dense_1").output 
#             ]
#         )

#         feature_vectors = []
#         for image in processed_images:
#             conv_output, dense_output = intermediate_model.predict(image)
#             conv_flattened = conv_output.flatten()
#             dense_flattened = dense_output.flatten()
#             feature_vectors.append((conv_flattened, dense_flattened))

#         similarities = []
#         for i in range(len(feature_vectors)):
#             for j in range(i + 1, len(feature_vectors)):
#                 conv1, dense1 = feature_vectors[i]
#                 conv2, dense2 = feature_vectors[j]
                
#                 similarity = calculate_similarity(conv1, conv2) + calculate_similarity(dense1, dense2) 
#                 similarities.append(similarity)

#         average_similarity = np.mean(similarities) 
        
#         average_similarity = average_similarity * 50

#         is_match = bool(average_similarity >= 85)

#         return jsonify({
#             "isMatch": is_match,
#             "averageSimilarity": round(average_similarity, 2),
#             "rawSimilarity": round(average_similarity, 4),
#             "confidence": "high" if average_similarity >= 85 
#                         else "medium" if average_similarity >= 75 
#                         else "low"
#         })

#     except Exception as e:
#         print(f"Error: {e}")
#         return jsonify({"error": f"An error occurred: {str(e)}"}), 200