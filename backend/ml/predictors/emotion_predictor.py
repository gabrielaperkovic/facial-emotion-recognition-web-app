from tensorflow.keras.models import load_model
import numpy as np


EMOTION_LABELS = [
    "Angry",
    "Disgust",
    "Fear",
    "Happy",
    "Sad",
    "Surprise",
    "Neutral",
]


model = load_model(
    "ml/models/fer2013_mini_XCEPTION.102-0.66.hdf5",
    compile=False
)


def predict_emotion(face_image):

    if face_image is None:
        return {
            "emotion": None,
            "confidence": None
        }

    face_image = np.expand_dims(face_image, axis=-1)

    face_image = np.expand_dims(face_image, axis=0)

    predictions = model.predict(face_image, verbose=0)[0]

    emotion_index = np.argmax(predictions)

    emotion = EMOTION_LABELS[emotion_index]

    confidence = float(predictions[emotion_index] * 100)

    return {
        "emotion": emotion,
        "confidence": round(confidence, 2)
    }