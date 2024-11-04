import OpenAI from "openai";

async function queryLLM(
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
          You are a brilliant hypothesizer, able to generate concise summaries and un-opinionated hypotheses from data.
          You will be given the initial data, denoted by the variable INITIAL, predictive data denoted by the variable PREDICTIVE, and the algorithm used to generate
          said predictive denoted by the variable ALG_USED. Generate an summary/hypothesis, and only return the hypothesis, do not introduce yourself or introduce the fact that you can
          respond i.e. say "Here is a summary..." or anything of that matter, just reply with the summary/hypothesis. Also return the hypothesis/summary with markdown if necessary, or format it
          nicely.

          INITIAL-->${JSON.stringify(initial_data)}
          PREDICTIVE-->${JSON.stringify(predictive_data)}
          ALG_USED--->${model_alg}
        `,
      },
      {
        role: "user",
        content: "Give me a hypothesis/summary based on the given data.",
      },
    ],
    model: "@hf/thebloke/mistral-7b-instruct-v0.1-awq",
  });

  return response;
}

export { queryLLM };
