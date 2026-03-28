const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: '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' });

async function main() {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Dime una receta de arepa rapido" }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });
    console.log("SUCCESS:", chatCompletion.choices[0]?.message?.content);
  } catch (err) {
    console.error("GROQ ERROR:", err);
  }
}

main();
