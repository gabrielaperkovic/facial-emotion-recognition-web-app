from django.shortcuts import render

from collections import Counter

from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import EmotionSession, EmotionSample
from .serializers import EmotionSessionSerializer


@api_view(["POST"])
def start_session(request):
    user_id = request.data.get("user_id")

    if not user_id:
        return Response({"error": "user_id is required"}, status=400)

    session = EmotionSession.objects.create(user_id=user_id)

    return Response({
        "id": session.id,
        "user_id": session.user_id,
        "started_at": session.started_at,
    })


@api_view(["POST"])
def save_sample(request):
    session_id = request.data.get("session_id")

    if not session_id:
        return Response({"error": "session_id is required"}, status=400)

    try:
        session = EmotionSession.objects.get(id=session_id)
    except EmotionSession.DoesNotExist:
        return Response({"error": "Session not found"}, status=404)

    sample = EmotionSample.objects.create(
        session=session,
        emotion=request.data.get("emotion"),
        confidence=request.data.get("confidence"),
        face_detected=request.data.get("faceDetected", False),
        faces_count=request.data.get("facesCount", 0),
    )

    return Response({
        "id": sample.id,
        "emotion": sample.emotion,
        "confidence": sample.confidence,
        "faceDetected": sample.face_detected,
        "facesCount": sample.faces_count,
    })


@api_view(["POST"])
def finish_session(request):
    session_id = request.data.get("session_id")

    if not session_id:
        return Response({"error": "session_id is required"}, status=400)

    try:
        session = EmotionSession.objects.get(id=session_id)
    except EmotionSession.DoesNotExist:
        return Response({"error": "Session not found"}, status=404)

    samples = session.samples.filter(face_detected=True, emotion__isnull=False)

    if samples.exists():
        emotions = [sample.emotion for sample in samples]
        confidences = [
            sample.confidence for sample in samples
            if sample.confidence is not None
        ]

        dominant_emotion = Counter(emotions).most_common(1)[0][0]
        average_confidence = (
            sum(confidences) / len(confidences)
            if confidences else None
        )

        session.dominant_emotion = dominant_emotion
        session.average_confidence = average_confidence

    session.ended_at = timezone.now()
    session.save()

    return Response({
        "id": session.id,
        "dominant_emotion": session.dominant_emotion,
        "average_confidence": session.average_confidence,
        "ended_at": session.ended_at,
    })


@api_view(["GET"])
def session_history(request):
    user_id = request.GET.get("user_id")

    if not user_id:
        return Response({"error": "user_id is required"}, status=400)

    sessions = EmotionSession.objects.filter(
        user_id=user_id
    ).order_by("-started_at")

    serializer = EmotionSessionSerializer(sessions, many=True)

    return Response(serializer.data)