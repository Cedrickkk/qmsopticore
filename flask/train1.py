import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
from sklearn.metrics import confusion_matrix, classification_report
import seaborn as sns
import pandas as pd

train_dir = "./sign_data/train"
test_dir = "./sign_data/test"
validate_dir = "./sign_data/validation"

img_width, img_height = 150, 150  
batch_size = 5  

train_datagen = tf.keras.preprocessing.image.ImageDataGenerator(
    rescale=1./255,
    rotation_range=10,  # Reduced from 20
    width_shift_range=0.1,  # Reduced from 0.2
    height_shift_range=0.1,
    shear_range=0.1,
    zoom_range=0.1,
    horizontal_flip=False,  # Signatures shouldn't be flipped
    fill_mode='nearest'
)

test_datagen = tf.keras.preprocessing.image.ImageDataGenerator(rescale=1./255)
validate_datagen = tf.keras.preprocessing.image.ImageDataGenerator(rescale=1./255)


train_generator = train_datagen.flow_from_directory(
    train_dir,
    target_size=(img_width, img_height),
    batch_size=batch_size,
    class_mode='categorical',
    shuffle=True
)

test_generator = test_datagen.flow_from_directory(
    test_dir,
    target_size=(img_width, img_height),
    batch_size=batch_size,
    class_mode='categorical',
    shuffle=False
)

validate_generator = validate_datagen.flow_from_directory(
    validate_dir,
    target_size=(img_width, img_height),
    batch_size=batch_size,
    class_mode='categorical',
    shuffle=False
)


# Get number of classes
num_classes = len(train_generator.class_indices)
print(f'Number of classes: {num_classes}')

# Improved CNN Architecture with Dropout and Batch Normalization
model = tf.keras.Sequential([
    tf.keras.layers.Input(shape=(img_width, img_height, 3)),
    
    # Block 1
    tf.keras.layers.Conv2D(32, (3, 3), activation='relu', padding='same'),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Conv2D(32, (3, 3), activation='relu', padding='same'),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.MaxPooling2D((2, 2)),
    tf.keras.layers.Dropout(0.25),
    
    # Block 2
    tf.keras.layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.MaxPooling2D((2, 2)),
    tf.keras.layers.Dropout(0.25),
    
    # Block 3
    tf.keras.layers.Conv2D(128, (3, 3), activation='relu', padding='same'),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Conv2D(128, (3, 3), activation='relu', padding='same'),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.MaxPooling2D((2, 2)),
    tf.keras.layers.Dropout(0.25),
    
    # Block 4
    tf.keras.layers.Conv2D(256, (3, 3), activation='relu', padding='same'),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.MaxPooling2D((2, 2)),
    tf.keras.layers.Dropout(0.25),
    
    # Dense Layers
    tf.keras.layers.Flatten(),
    tf.keras.layers.Dense(512, activation='relu'),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dropout(0.5),
    tf.keras.layers.Dense(256, activation='relu'),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dropout(0.5),
    tf.keras.layers.Dense(num_classes, activation='softmax')
])

# model = tf.keras.Sequential([
#     tf.keras.layers.Input(shape=(img_width, img_height, 3)), 
#     tf.keras.layers.Conv2D(32, (3, 3), activation='relu'),
#     tf.keras.layers.MaxPooling2D((2, 2)),
#     tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),
#     tf.keras.layers.MaxPooling2D((2, 2)),
#     tf.keras.layers.Conv2D(128, (3, 3), activation='relu'),
#     tf.keras.layers.MaxPooling2D((2, 2)),
#     tf.keras.layers.Flatten(),
#     tf.keras.layers.Dense(256, activation='relu'),
#     tf.keras.layers.Dense(num_classes, activation='softmax')  
# ])

# Use learning rate scheduler
initial_learning_rate = 0.001
lr_schedule = tf.keras.optimizers.schedules.ExponentialDecay(
    initial_learning_rate,
    decay_steps=100,
    decay_rate=0.96,
    staircase=True
)

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),  # Use fixed value
    loss='categorical_crossentropy',
    metrics=['accuracy', tf.keras.metrics.TopKCategoricalAccuracy(k=5, name='top_5_accuracy')]
)

print(model.summary())
# Callbacks
early_stopping = tf.keras.callbacks.EarlyStopping(
    monitor='val_loss',
    patience=15,
    restore_best_weights=True,
    verbose=1
)

reduce_lr = tf.keras.callbacks.ReduceLROnPlateau(
    monitor='val_loss',
    factor=0.5,
    patience=5,
    min_lr=1e-7,
    verbose=1
)

model_checkpoint = tf.keras.callbacks.ModelCheckpoint(
    'models/best_model.keras',
    monitor='val_accuracy',
    save_best_only=True,
    verbose=1
)

# Train with more epochs and callbacks
history = model.fit(
    train_generator,
    steps_per_epoch=len(train_generator),
    epochs=100,  # Increased epochs
    validation_data=validate_generator,
    validation_steps=len(validate_generator),
    callbacks=[early_stopping, reduce_lr, model_checkpoint]
)

# history = model.fit(
#     train_generator,
#     steps_per_epoch=len(train_generator),
#     epochs=30, 
#     validation_data=validate_generator,
#     validation_steps=len(validate_generator),
# )

# Evaluate on test set - FIX: Unpack 3 values instead of 2
test_results = model.evaluate(test_generator, steps=len(test_generator))
test_loss = test_results[0]
test_acc = test_results[1]
test_top5_acc = test_results[2]

print(f'\n=== Test Set Evaluation ===')
print(f'Test Loss: {test_loss:.4f}')
print(f'Test Accuracy: {test_acc:.4f} ({test_acc * 100:.2f}%)')
print(f'Test Top-5 Accuracy: {test_top5_acc:.4f} ({test_top5_acc * 100:.2f}%)')

# Save model
model.save('models/model.keras')
print('\nModel saved as models/model.keras')

# Extract training history
train_accuracy = history.history['accuracy']
val_accuracy = history.history['val_accuracy']
train_loss = history.history['loss']
val_loss = history.history['val_loss']

best_epoch = np.argmax(val_accuracy) + 1 

print(f'\n=== Training Summary ===')
print(f'Best Epoch: {best_epoch}')
print(f'Training Accuracy at Best Epoch: {train_accuracy[best_epoch - 1]:.4f} ({train_accuracy[best_epoch - 1] * 100:.2f}%)')
print(f'Validation Accuracy at Best Epoch: {val_accuracy[best_epoch - 1]:.4f} ({val_accuracy[best_epoch - 1] * 100:.2f}%)')
print(f'Final Training Accuracy: {train_accuracy[-1]:.4f} ({train_accuracy[-1] * 100:.2f}%)')
print(f'Final Validation Accuracy: {val_accuracy[-1]:.4f} ({val_accuracy[-1] * 100:.2f}%)')

# ============================================
# VISUALIZATION 1: Training History (2x2 Grid)
# ============================================
fig, axes = plt.subplots(2, 2, figsize=(14, 10))
fig.suptitle('CNN Training Performance Metrics', fontsize=16, fontweight='bold')

# Plot 1: Accuracy
axes[0, 0].plot(range(1, len(train_accuracy) + 1), train_accuracy, 'b-', label='Training Accuracy', linewidth=2)
axes[0, 0].plot(range(1, len(val_accuracy) + 1), val_accuracy, 'r-', label='Validation Accuracy', linewidth=2)
axes[0, 0].axvline(x=best_epoch, color='g', linestyle='--', label=f'Best Epoch ({best_epoch})', alpha=0.7)
axes[0, 0].set_title('Model Accuracy Over Epochs', fontweight='bold')
axes[0, 0].set_xlabel('Epoch')
axes[0, 0].set_ylabel('Accuracy')
axes[0, 0].legend(loc='lower right')
axes[0, 0].grid(True, alpha=0.3)

# Plot 2: Loss
axes[0, 1].plot(range(1, len(train_loss) + 1), train_loss, 'b-', label='Training Loss', linewidth=2)
axes[0, 1].plot(range(1, len(val_loss) + 1), val_loss, 'r-', label='Validation Loss', linewidth=2)
axes[0, 1].axvline(x=best_epoch, color='g', linestyle='--', label=f'Best Epoch ({best_epoch})', alpha=0.7)
axes[0, 1].set_title('Model Loss Over Epochs', fontweight='bold')
axes[0, 1].set_xlabel('Epoch')
axes[0, 1].set_ylabel('Loss')
axes[0, 1].legend(loc='upper right')
axes[0, 1].grid(True, alpha=0.3)

# Plot 3: Accuracy Gap (Overfitting Analysis)
accuracy_gap = [train - val for train, val in zip(train_accuracy, val_accuracy)]
axes[1, 0].plot(range(1, len(accuracy_gap) + 1), accuracy_gap, 'purple', linewidth=2)
axes[1, 0].axhline(y=0, color='black', linestyle='-', alpha=0.3)
axes[1, 0].fill_between(range(1, len(accuracy_gap) + 1), accuracy_gap, alpha=0.3, color='purple')
axes[1, 0].set_title('Training-Validation Accuracy Gap\n(Overfitting Indicator)', fontweight='bold')
axes[1, 0].set_xlabel('Epoch')
axes[1, 0].set_ylabel('Accuracy Difference')
axes[1, 0].grid(True, alpha=0.3)

# Plot 4: Performance Summary Bar Chart
metrics_data = {
    'Training': [train_accuracy[-1] * 100],
    'Validation': [val_accuracy[-1] * 100],
    'Test': [test_acc * 100]
}
x_pos = np.arange(len(metrics_data))
bars = axes[1, 1].bar(x_pos, [metrics_data[key][0] for key in metrics_data.keys()], 
                      color=['#1f77b4', '#ff7f0e', '#2ca02c'], alpha=0.8, width=0.6)
axes[1, 1].set_title('Final Accuracy Comparison', fontweight='bold')
axes[1, 1].set_ylabel('Accuracy (%)')
axes[1, 1].set_xticks(x_pos)
axes[1, 1].set_xticklabels(metrics_data.keys())
axes[1, 1].set_ylim([0, 100])
axes[1, 1].grid(True, alpha=0.3, axis='y')

# Add value labels on bars
for i, bar in enumerate(bars):
    height = bar.get_height()
    axes[1, 1].text(bar.get_x() + bar.get_width()/2., height,
                    f'{height:.2f}%', ha='center', va='bottom', fontweight='bold')

plt.tight_layout()
plt.savefig('training_history_grid.png', dpi=300, bbox_inches='tight')
print('\nSaved: training_history_grid.png')
plt.show()

# ============================================
# VISUALIZATION 2: Confusion Matrix
# ============================================
print('\n=== Generating Confusion Matrix ===')

# Reset test generator
test_generator.reset()

# Get predictions
predictions = model.predict(test_generator, steps=len(test_generator), verbose=1)
predicted_classes = np.argmax(predictions, axis=1)
true_classes = test_generator.classes
class_labels = list(test_generator.class_indices.keys())

# Compute confusion matrix
cm = confusion_matrix(true_classes, predicted_classes)

# Plot confusion matrix
plt.figure(figsize=(12, 10))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
            xticklabels=class_labels, yticklabels=class_labels,
            cbar_kws={'label': 'Count'}, linewidths=0.5)
plt.title('Confusion Matrix - Signature Classification', fontsize=16, fontweight='bold', pad=20)
plt.ylabel('True Label', fontsize=12, fontweight='bold')
plt.xlabel('Predicted Label', fontsize=12, fontweight='bold')
plt.xticks(rotation=45, ha='right')
plt.yticks(rotation=0)
plt.tight_layout()
plt.savefig('confusion_matrix.png', dpi=300, bbox_inches='tight')
print('Saved: confusion_matrix.png')
plt.show()

# ============================================
# VISUALIZATION 3: Classification Report
# ============================================
print('\n=== Classification Report ===')
report = classification_report(true_classes, predicted_classes, 
                               target_names=class_labels, 
                               output_dict=True)
print(classification_report(true_classes, predicted_classes, target_names=class_labels))

# Convert to DataFrame for better visualization
report_df = pd.DataFrame(report).transpose()
report_df = report_df.round(4)

# Save report to CSV
report_df.to_csv('classification_report.csv')
print('\nSaved: classification_report.csv')

# ============================================
# VISUALIZATION 4: Per-Class Performance
# ============================================
fig, axes = plt.subplots(1, 3, figsize=(18, 6))
fig.suptitle('Per-Class Performance Metrics', fontsize=16, fontweight='bold')

metrics = ['precision', 'recall', 'f1-score']
colors = ['#3498db', '#e74c3c', '#2ecc71']

for idx, metric in enumerate(metrics):
    values = [report[label][metric] for label in class_labels]
    bars = axes[idx].bar(range(len(class_labels)), values, color=colors[idx], alpha=0.7)
    axes[idx].set_title(f'{metric.capitalize()} by Class', fontweight='bold')
    axes[idx].set_xlabel('Class')
    axes[idx].set_ylabel(metric.capitalize())
    axes[idx].set_xticks(range(len(class_labels)))
    axes[idx].set_xticklabels(class_labels, rotation=45, ha='right')
    axes[idx].set_ylim([0, 1])
    axes[idx].grid(True, alpha=0.3, axis='y')
    axes[idx].axhline(y=np.mean(values), color='red', linestyle='--', 
                     label=f'Mean: {np.mean(values):.3f}', linewidth=2)
    axes[idx].legend()

plt.tight_layout()
plt.savefig('per_class_performance.png', dpi=300, bbox_inches='tight')
print('Saved: per_class_performance.png')
plt.show()

# ============================================
# VISUALIZATION 5: Model Architecture Diagram
# ============================================
from tensorflow.keras.utils import plot_model

try:
    plot_model(model, to_file='model_architecture.png', 
               show_shapes=True, show_layer_names=True, 
               rankdir='TB', expand_nested=True, dpi=150)
    print('Saved: model_architecture.png')
except:
    print('Note: graphviz not installed. Skipping architecture diagram.')

# ============================================
# VISUALIZATION 6: Learning Curves Comparison
# ============================================
plt.figure(figsize=(14, 6))

plt.subplot(1, 2, 1)
plt.plot(train_accuracy, 'b-', label='Training Accuracy', linewidth=2, marker='o', markersize=4)
plt.plot(val_accuracy, 'r-', label='Validation Accuracy', linewidth=2, marker='s', markersize=4)
plt.fill_between(range(len(train_accuracy)), train_accuracy, val_accuracy, alpha=0.2)
plt.title('Accuracy Learning Curves', fontsize=14, fontweight='bold')
plt.xlabel('Epoch', fontsize=12)
plt.ylabel('Accuracy', fontsize=12)
plt.legend(loc='lower right', fontsize=10)
plt.grid(True, alpha=0.3)

plt.subplot(1, 2, 2)
plt.plot(train_loss, 'b-', label='Training Loss', linewidth=2, marker='o', markersize=4)
plt.plot(val_loss, 'r-', label='Validation Loss', linewidth=2, marker='s', markersize=4)
plt.fill_between(range(len(train_loss)), train_loss, val_loss, alpha=0.2)
plt.title('Loss Learning Curves', fontsize=14, fontweight='bold')
plt.xlabel('Epoch', fontsize=12)
plt.ylabel('Loss', fontsize=12)
plt.legend(loc='upper right', fontsize=10)
plt.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig('learning_curves.png', dpi=300, bbox_inches='tight')
print('Saved: learning_curves.png')
plt.show()

# ============================================
# Save Training Statistics to File
# ============================================
stats = {
    'Total Epochs': len(train_accuracy),
    'Best Epoch': int(best_epoch),
    'Best Validation Accuracy': float(val_accuracy[best_epoch - 1]),
    'Final Training Accuracy': float(train_accuracy[-1]),
    'Final Validation Accuracy': float(val_accuracy[-1]),
    'Test Accuracy': float(test_acc),
    'Final Training Loss': float(train_loss[-1]),
    'Final Validation Loss': float(val_loss[-1]),
    'Test Loss': float(test_loss),
    'Number of Classes': num_classes,
    'Image Size': f'{img_width}x{img_height}',
    'Batch Size': batch_size,
    'Total Parameters': model.count_params()
}

with open('training_statistics.txt', 'w') as f:
    f.write('=== CNN Training Statistics ===\n\n')
    for key, value in stats.items():
        f.write(f'{key}: {value}\n')

print('\nSaved: training_statistics.txt')
print('\n=== All visualizations generated successfully! ===')