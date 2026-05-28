from rest_framework import serializers
from .models import EmotionSession, EmotionSample


class EmotionSampleSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmotionSample
        fields = "__all__"


class EmotionSessionSerializer(serializers.ModelSerializer):
    samples = EmotionSampleSerializer(many=True, read_only=True)

    class Meta:
        model = EmotionSession
        fields = "__all__"