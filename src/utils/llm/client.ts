import OpenAI from "openai";

async function queryLLM(
  country: string,
  initial_data: any,
  predictive_data: any,
  model_alg: string
) {
  const client = new OpenAI({
    apiKey: process.env.CLOUDFLARE_WORKERS_AI_API_KEY,
    baseURL: `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/v1`,
  });

  const response = await client.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `
          You will be provided with data based on topics like world hunger, etc. although that may not be specified.\n
                    Past, present and predicted future data will be given as well as the algorithm used to predict it.\n
                    Your job is to create a 1-2 sentence, jargon-free human-readable summary, as people who are not knowledgable in this topic.\n
                    may also wish to see what the data is about, so you need to create a hypothesis/summary to immediately and concisely tell them what is going to happen.\n\n
                    Examples (Take w as the country, Take x as past/present data, y as future, predicted data and z as the algorithm used):\n\n
                    Schema for W: "{STRING}" [Just as string]
                    Schema for X: {{...},{...},{...}} [Basically any sort of array or JSON list or similar]\n
                    Schema for Y: {{...},{...},{...}} [Basically any sort of array or JSON list or similar]\n
                    Schema for Z: "{STRING}" [Just a string]\n\n
                    
                    First Example:\n\n
                    User: 'Country: {w}\n\n{x}\n\n{y}\n\nAlgorithm Used: {z}' (Take w as Afghanistan, data topic as Average Caloric Intake, x as data ranging from 2008-2023, and y as future predicted data ranging from 2024 to any year in the future
                    and z as Holt-Winters Exponential Smoothing)
                    
                    Assistant: {w}'s average caloric intake has been on a steady rise, ~1.8% per year. Future data indicate that percentage may increase exponentially as
                    caloric intake increases per year, as predicted by the {z} Algorithm.

                    Second Example:\n\n
                    User: 'Country: {w}\n\n{x}\n\n{y}\n\nAlgorithm Used: {z}' (Take w as Africa, data topic as Cereal import dependency ratio, x as data ranging from 2000-2022, and y as future predicted data ranging from 2024 to any year in the future
                    and z as Drift Forecasting)

                    Assistant: The data shows that the cereal import dependency ratio in {w} has been increasing steadily over the past 3 years. The predicted future values indicate that this trend may continue, with a potential increase of 0.82% per year, as predicted by the {z} algorithm.
        `,
      },
      {
        role: "user",
        content: `Country: ${country}\n\n${initial_data}\n\n${predictive_data}\n\nAlgorithm Used: ${model_alg}`,
      },
    ],
    model: "@hf/thebloke/mistral-7b-instruct-v0.1-awq",
  });

  return response;
}

export { queryLLM };
