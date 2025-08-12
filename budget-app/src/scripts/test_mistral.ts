// Simple script to send a prompt to your local Ollama Mistral server

async function queryMistral(prompt: string) {
  const response = await fetch('http://127.0.0.1:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'mistral',
      prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.response;
}

// Example usage
(async () => {
  const prompt = "What is the capital of France?";
  try {
    const answer = await queryMistral(prompt);
    console.log("Mistral's answer:", answer);
  } catch (err) {
    console.error('Error querying Mistral:', err);
  }
})();
