
from django.urls import path
from .views import analyze_emotion

urlpatterns = [
    path("analyze/", analyze_emotion, name="analyze_emotion"),
]