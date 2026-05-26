const API_URL = "http://127.0.0.1:8000/api/emotions";

export async function analyzeEmotion(image) {
  const response = await fetch(`${API_URL}/analyze/`, {
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