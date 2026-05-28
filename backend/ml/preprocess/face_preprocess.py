import cv2


def crop_first_face(image, faces):
    if len(faces) == 0:
        return None

    x, y, w, h = faces[0]

    face = image[y:y + h, x:x + w]

    return face


def preprocess_face_for_model(face_image, target_size=(48, 48)):
    if face_image is None:
        return None

    gray_face = cv2.cvtColor(face_image, cv2.COLOR_BGR2GRAY)

    resized_face = cv2.resize(gray_face, target_size)

    normalized_face = resized_face / 255.0

    return normalized_face