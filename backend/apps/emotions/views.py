from rest_framework.decorators import api_view
from rest_framework.response import Response

from .services.emotion_service import analyze_emotion_from_base64


@api_view(["POST"])
def analyze_emotion(request):
    image_data = request.data.get("image")

    if not image_data:
        return Response(
            {"error": "Image is required"},
            status=400
        )

    try:
        result = analyze_emotion_from_base64(image_data)
        return Response(result)

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=500
        )