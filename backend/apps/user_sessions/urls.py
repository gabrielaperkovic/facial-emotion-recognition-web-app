from django.urls import path
from .views import (
    start_session,
    save_sample,
    finish_session,
    session_history,
)

urlpatterns = [
    path("start/", start_session, name="start_session"),
    path("sample/", save_sample, name="save_sample"),
    path("finish/", finish_session, name="finish_session"),
    path("history/", session_history, name="session_history"),
]