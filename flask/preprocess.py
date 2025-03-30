import fitz  # PyMuPDF
import cv2
import numpy as np
from PIL import Image
import tensorflow as tf
from unsharpen import unsharpen_mask

def remove_signature_background(image_array):
    if len(image_array.shape) == 3 and image_array.shape[2] == 3:  # BGR
        img = cv2.cvtColor(image_array, cv2.COLOR_BGR2BGRA)
    else:
        img = image_array

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    thresh = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 15, 10
    )

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    mask = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

    mask = cv2.GaussianBlur(mask, (5, 5), 0)

    result = cv2.bitwise_and(img, img, mask=mask)

    result_rgba = cv2.cvtColor(result, cv2.COLOR_BGR2BGRA)
    result_rgba[:, :, 3] = mask  

    return result_rgba

def add_signature_above_name(pdf_path, signature_image_path, name):
    signature_with_transparent_bg = remove_signature_background(signature_image_path)

    sharpened_signature = unsharpen_mask(signature_with_transparent_bg)

    _, img_buffer = cv2.imencode('.png', sharpened_signature) 
    
    img_bytes = img_buffer.tobytes() 

    pdf_document = fitz.open(pdf_path)

    for page_number in range(len(pdf_document)):
        page = pdf_document[page_number]

        text_instances = page.search_for(name)
        if not text_instances:
            continue  

        for rect in text_instances:
            x1, y1, x2, y2 = rect  
            x = x1  
            y = y1 - 50 - (-10)

            signature_rect = fitz.Rect(x, y, x + 100, y + 50)

            page.insert_image(signature_rect, stream=img_bytes)

    pdf_document.save(pdf_path, incremental=True, encryption=0)
    pdf_document.close()


def preprocess_image(file):
    try:
        image = Image.open(file)

        image = image.resize((150, 150))

        image = tf.keras.preprocessing.image.img_to_array(image) / 255.0

        return np.expand_dims(image, axis=0)

    except Exception as e:
        raise ValueError(f"Failed to preprocess the image. Error: {str(e)}")