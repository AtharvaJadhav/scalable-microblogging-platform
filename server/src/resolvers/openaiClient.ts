import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: "Enter Your Api Key",
});

export async function moderateContent(content: string): Promise<boolean> {
  try {
    const response = await openai.completions.create({
      model: "text-davinci-003",
      prompt: `Analyze the following user-submitted content for any signs of hate speech, inappropriate content, or spam. Provide a detailed assessment and conclude if it's suitable for a general audience.\n\nContent: "${content}"\nAssessment:`,
      max_tokens: 150,
      temperature: 0.7,
    });
    console.log("Response - ", response)
    const output = response.choices[0].text.trim();
    console.log("Output - ", output)
    return !output.toLowerCase().includes("not suitable");
  } catch (error) {
    console.error("Error in content moderation:", error);
    return false;
  }
}
