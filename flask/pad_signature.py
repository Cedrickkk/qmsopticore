import fitz  # PyMuPDF
import cv2
import numpy as np
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

def apply_ink_color(signature_image, ink_color='black'):
    result = signature_image.copy()
    
    colors = {
        'black': (0, 0, 0),         
        'blue': (255, 0, 0),       
    }
    
    if ink_color not in colors:
        ink_color = 'black'
    
    target_color = colors[ink_color]
    
    alpha = result[:, :, 3]
    
    for i in range(3):
        result[:, :, i] = np.where(alpha > 0, target_color[i], result[:, :, i])
    
    return result

def add_signature_above_name(pdf_path, signature_image_path, name, representative_name=None, ink_color='black'):
    signature_with_transparent_bg = remove_signature_background(signature_image_path)
    
    colored_signature = apply_ink_color(signature_with_transparent_bg, ink_color)
    
    sharpened_signature = unsharpen_mask(colored_signature)

    _, img_buffer = cv2.imencode('.png', sharpened_signature) 
    img_bytes = img_buffer.tobytes() 

    pdf_document = fitz.open(pdf_path)
    
    occurrences = []
    for page_number in range(len(pdf_document)):
        page = pdf_document[page_number]
        text_instances = page.search_for(name)
        
        for rect in text_instances:
            occurrences.append((page_number, rect))
    
    if not occurrences:
        print(f"Name '{name}' not found in the document.")
        pdf_document.close()
        return False
    
    last_page_number, last_rect = occurrences[-1]
    
    page = pdf_document[last_page_number]
    x1, y1, x2, y2 = last_rect
    x = x1
    y = y1 - 50 - (-10)
    
    signature_rect = fitz.Rect(x, y, x + 100, y + 50)
    page.insert_image(signature_rect, stream=img_bytes)
    
    if representative_name:
        rep_y = y2 + 2
        
        page.insert_text(
            (x1, rep_y + 10),  
            representative_name,
            fontsize=9,
            fontname="helv",  
            color=(0, 0, 0) 
        )
        
        page.insert_text(
            (x1, rep_y + 22),  
            "Representative",
            fontsize=8,
            fontname="hebo",
            color=(0.3, 0.3, 0.3)
        )
    
    if len(pdf_document) == 1:
        print(f"Signature for '{name}' placed on the only page with {ink_color} ink.")
    else:
        print(f"Signature for '{name}' placed on page {last_page_number + 1} of {len(pdf_document)} with {ink_color} ink.")
    
    if representative_name:
        print(f"Representative '{representative_name}' added below '{name}'.")
    
    pdf_document.save(pdf_path, incremental=True, encryption=fitz.PDF_ENCRYPT_KEEP)
    pdf_document.close()
    
    return True

# import fitz  # PyMuPDF
# import cv2
# from unsharpen import unsharpen_mask

# def remove_signature_background(image_array):
#     if len(image_array.shape) == 3 and image_array.shape[2] == 3:  # BGR
#         img = cv2.cvtColor(image_array, cv2.COLOR_BGR2BGRA)
#     else:
#         img = image_array

#     gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

#     thresh = cv2.adaptiveThreshold(
#         gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 15, 10
#     )

#     kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
#     mask = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

#     mask = cv2.GaussianBlur(mask, (5, 5), 0)

#     result = cv2.bitwise_and(img, img, mask=mask)

#     result_rgba = cv2.cvtColor(result, cv2.COLOR_BGR2BGRA)
#     result_rgba[:, :, 3] = mask  

#     return result_rgba

# def add_signature_above_name(pdf_path, signature_image_path, name, representative_name=None):
#     signature_with_transparent_bg = remove_signature_background(signature_image_path)
#     sharpened_signature = unsharpen_mask(signature_with_transparent_bg)

#     _, img_buffer = cv2.imencode('.png', sharpened_signature) 
#     img_bytes = img_buffer.tobytes() 

#     pdf_document = fitz.open(pdf_path)
    
#     occurrences = []
#     for page_number in range(len(pdf_document)):
#         page = pdf_document[page_number]
#         text_instances = page.search_for(name)
        
#         for rect in text_instances:
#             occurrences.append((page_number, rect))
    
#     if not occurrences:
#         print(f"Name '{name}' not found in the document.")
#         pdf_document.close()
#         return False
    
#     last_page_number, last_rect = occurrences[-1]
    
#     page = pdf_document[last_page_number]
#     x1, y1, x2, y2 = last_rect
#     x = x1
#     y = y1 - 50 - (-10)
    
#     signature_rect = fitz.Rect(x, y, x + 100, y + 50)
#     page.insert_image(signature_rect, stream=img_bytes)
    
#     if representative_name:
#         rep_y = y2 + 2
        
#         page.insert_text(
#             (x1, rep_y + 10),  
#             representative_name,
#             fontsize=9,
#             fontname="helv",  
#             color=(0, 0, 0) 
#         )
        
#         page.insert_text(
#             (x1, rep_y + 22),  
#             "Representative",
#             fontsize=8,
#             fontname="hebo",
#             color=(0.3, 0.3, 0.3)
#         )
    
#     if len(pdf_document) == 1:
#         print(f"Signature for '{name}' placed on the only page of the document.")
#     else:
#         print(f"Signature for '{name}' placed on page {last_page_number + 1} of {len(pdf_document)}.")
    
#     if representative_name:
#         print(f"Representative '{representative_name}' added below '{name}'.")
    
#     pdf_document.save(pdf_path, incremental=True, encryption=fitz.PDF_ENCRYPT_KEEP)
#     pdf_document.close()
    
#     return True