
const API_URL = import.meta.env.VITE_API_URL;

export async function analyzeEmotion(image) {
  const response = await fetch(`${API_URL}/emotions/analyze/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ image }),
  });

  if (!response.ok) {
    throw new Error("Emotion analysis failed");
  }

  return response.json();
}

export async function startEmotionSession(userId) {
  const response = await fetch(`${API_URL}/sessions/start/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: userId }),
  });

  if (!response.ok) {
    throw new Error("Session start failed");
  }

  return response.json();
}

export async function saveEmotionSample(sample) {
  const response = await fetch(`${API_URL}/sessions/sample/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sample),
  });

  if (!response.ok) {
    throw new Error("Sample save failed");
  }

  return response.json();
}

export async function finishEmotionSession(sessionId) {
  const response = await fetch(`${API_URL}/sessions/finish/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ session_id: sessionId }),
  });

  if (!response.ok) {
    throw new Error("Session finish failed");
  }

  return response.json();
}

export async function getSessionHistory(userId) {
  const response = await fetch(`${API_URL}/sessions/history/?user_id=${userId}`);

  if (!response.ok) {
    throw new Error("Session history fetch failed");
  }

  return response.json();
}