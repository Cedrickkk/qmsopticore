import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt


train_dir = "./sign_data/train"
test_dir = "./sign_data/test"
validate_dir = "./sign_data/validation"

img_width, img_height = 150, 150  
batch_size = 5  

train_datagen = tf.keras.preprocessing.image.ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2, 
    horizontal_flip=True,
    fill_mode='nearest',
    preprocessing_function=lambda x: tf.image.resize(x, (img_width, img_height))
)

test_datagen = tf.keras.preprocessing.image.ImageDataGenerator(rescale=1./255)
validate_datagen = tf.keras.preprocessing.image.ImageDataGenerator(rescale=1./255)

train_generator = train_datagen.flow_from_directory(
    train_dir,
    target_size=(img_width, img_height),
    batch_size=batch_size,
    class_mode='categorical'
)

test_generator = test_datagen.flow_from_directory(
    test_dir,
    target_size=(img_width, img_height),
    batch_size=batch_size,
    class_mode='categorical'
)

validate_generator = validate_datagen.flow_from_directory(
    validate_dir,
    target_size=(img_width, img_height),
    batch_size=batch_size,
    class_mode='categorical'
)

model = tf.keras.Sequential([
    tf.keras.layers.Input(shape=(img_width, img_height, 3)), 
    tf.keras.layers.Conv2D(32, (3, 3), activation='relu'),
    tf.keras.layers.MaxPooling2D((2, 2)),
    tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),
    tf.keras.layers.MaxPooling2D((2, 2)),
    tf.keras.layers.Conv2D(128, (3, 3), activation='relu'),
    tf.keras.layers.MaxPooling2D((2, 2)),
    tf.keras.layers.Flatten(),
    tf.keras.layers.Dense(256, activation='relu'),
    tf.keras.layers.Dense(24, activation='softmax')  
])

model.compile(optimizer='adam',
              loss='categorical_crossentropy',
              metrics=['accuracy'])

history = model.fit(
    train_generator,
    steps_per_epoch=len(train_generator),
    epochs=30, 
    validation_data=validate_generator,
    validation_steps=len(validate_generator),
)


test_loss, test_acc = model.evaluate(test_generator, steps=len(test_generator))
print(f'Test accuracy: {test_acc}')

model.save('model.keras')
print('Model saved as model.keras')

train_accuracy = history.history['accuracy']
val_accuracy = history.history['val_accuracy']

best_epoch = np.argmax(val_accuracy) + 1 

print(model.summary())
print(f'Epoch with the highest validation accuracy: {best_epoch}')
print(f'Training accuracy at this epoch: {train_accuracy[best_epoch - 1]}')
print(f'Validation accuracy at this epoch: {val_accuracy[best_epoch - 1] * 100}')

plt.plot(range(1, len(train_accuracy) + 1), train_accuracy, label='Training Accuracy')
plt.plot(range(1, len(val_accuracy) + 1), val_accuracy, label='Validation Accuracy')
plt.title('Training and Validation Accuracy Over Epochs')
plt.xlabel('Epochs')
plt.ylabel('Accuracy')
plt.legend()
plt.show()