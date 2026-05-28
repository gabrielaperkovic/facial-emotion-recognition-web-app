import base64
import cv2
import numpy as np

from ml.detectors.face_detector import detect_faces
from ml.preprocess.face_preprocess import (
    crop_first_face,
    preprocess_face_for_model,
)
from ml.predictors.emotion_predictor import predict_emotion


def analyze_emotion_from_base64(image_data):
    format, imgstr = image_data.split(";base64,")

    image_bytes = base64.b64decode(imgstr)
    np_array = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)

    faces = detect_faces(image)

    faces_count = len(faces)
    face_detected = faces_count > 0

    emotion = None
    confidence = None

    if face_detected:
        face = crop_first_face(image, faces)
        processed_face = preprocess_face_for_model(face)

        prediction = predict_emotion(processed_face)

        emotion = prediction["emotion"]
        confidence = prediction["confidence"]

    return {
        "faceDetected": face_detected,
        "facesCount": faces_count,
        "emotion": emotion,
        "confidence": confidence,
    }