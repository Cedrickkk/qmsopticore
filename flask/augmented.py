import numpy as np
import tensorflow as tf
from PIL import Image
import random

augment_datagen = tf.keras.preprocessing.image.ImageDataGenerator(
    rescale=1./255,
    zoom_range=0.01,
    fill_mode='nearest',
    preprocessing_function=lambda x: tf.image.resize(x, (150, 150))
)

def create_augmented_signature(signature_paths):
    signature_path = random.choice(signature_paths)
    
    img = Image.open(signature_path)
    
    img_array = np.array(img)
    
    img_array = np.expand_dims(img_array, axis=0)
    
    augmented_img = augment_datagen.random_transform(img_array[0])
    
    return augmented_img