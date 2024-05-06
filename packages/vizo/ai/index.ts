import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

import { OPENAI_API_KEY } from "./constant";

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a world class technical documentation writer."],
  ["user", "{input}"],
]);

const outputParser = new StringOutputParser();

const chatModel = new ChatOpenAI({
  apiKey: OPENAI_API_KEY,
});

const chain = prompt.pipe(chatModel);
const llmChain = prompt.pipe(chatModel).pipe(outputParser);

const func = async () => {
  const res = await llmChain.invoke({
    input: "what is LangSmith?",
  });
  console.log({ res });
};

func();
