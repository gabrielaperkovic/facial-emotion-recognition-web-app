from django.db import models


class EmotionSession(models.Model):
    user_id = models.CharField(max_length=255)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    dominant_emotion = models.CharField(max_length=50, null=True, blank=True)
    average_confidence = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"Session {self.id} - {self.user_id}"


class EmotionSample(models.Model):
    session = models.ForeignKey(
        EmotionSession,
        on_delete=models.CASCADE,
        related_name="samples"
    )
    emotion = models.CharField(max_length=50, null=True, blank=True)
    confidence = models.FloatField(null=True, blank=True)
    face_detected = models.BooleanField(default=False)
    faces_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.emotion} ({self.confidence})"