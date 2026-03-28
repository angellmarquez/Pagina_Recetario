const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: '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' });

async function main() {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: `Eres VENIA, una abuela venezolana virtual... Devuelve ÚNICAMENTE en formato json (objeto JSON) válido con la siguiente estructura: {"feed": [{"titulo": "...", "historia": "...", "tiempo": "...", "dificultad": "...", "tags": ["..."]}]}` }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });
    console.log("SUCCESS:", chatCompletion.choices[0]?.message?.content);
  } catch (err) {
    console.error("GROQ ERROR CODE:", err.status);
    console.error("GROQ ERROR MESSAGE:", err.message);
    if (err.error && err.error.error) {
      console.error("GROQ DETAILS:", err.error.error);
    }
  }
}

main();
