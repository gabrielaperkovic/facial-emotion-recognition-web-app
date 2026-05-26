import base64
import cv2
import numpy as np

from rest_framework.decorators import api_view
from rest_framework.response import Response

from ml.detectors.face_detector import detect_faces


@api_view(["POST"])
def analyze_emotion(request):

    image_data = request.data.get("image")

    if not image_data:
        return Response(
            {"error": "Image is required"},
            status=400
        )

    try:

        # ukloni base64 header
        format, imgstr = image_data.split(";base64,")

        # decode base64
        image_bytes = base64.b64decode(imgstr)

        # bytes -> numpy array
        np_array = np.frombuffer(image_bytes, np.uint8)

        # numpy -> OpenCV image
        image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)

        faces = detect_faces(image)

        faces_count = len(faces)
        face_detected = faces_count > 0

        return Response({
            "faceDetected": face_detected,
            "facesCount": faces_count,
            "emotion": "Happy" if face_detected else None,
            "confidence": 92 if face_detected else None
        })

    except Exception as e:

        return Response(
            {"error": str(e)},
            status=500
        )