import cv2

def unsharpen_mask(image):
    gaussian_3 = cv2.GaussianBlur(image, (9, 9), 10.0)
    unsharp_image = cv2.addWeighted(image, 1.5, gaussian_3, -0.5, 0, image)
    return unsharp_image

