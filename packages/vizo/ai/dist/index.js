"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = require("@langchain/openai");
const prompts_1 = require("@langchain/core/prompts");
const output_parsers_1 = require("@langchain/core/output_parsers");
const constant_1 = require("./constant");
const prompt = prompts_1.ChatPromptTemplate.fromMessages([
    ["system", "You are a world class technical documentation writer."],
    ["user", "{input}"],
]);
const outputParser = new output_parsers_1.StringOutputParser();
const chatModel = new openai_1.ChatOpenAI({
    apiKey: constant_1.OPENAI_API_KEY,
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
//# sourceMappingURL=index.js.map