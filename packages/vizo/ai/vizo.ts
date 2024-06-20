import Compressor from "compressorjs";

import { ChatOpenAI } from "@langchain/openai";
import Groq from "groq-sdk";

import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { convertToOpenAIFunction } from "@langchain/core/utils/function_calling";
import { RunnableSequence } from "@langchain/core/runnables";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";

import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { formatToOpenAIFunctionMessages } from "langchain/agents/format_scratchpad";
import { OpenAIFunctionsAgentOutputParser } from "langchain/agents/openai/output_parser";
import {
  getImageAnalysisTool,
  getImageAssesmentTool,
  getOCRTool,
} from "./tools";
import { storeImage } from "./utils/indexDb";
import { ImageAssessmentDataType, OcrAssessmentDataType, TOOL } from "./types";

const MEMORY_KEY = "chat_history";
const REQUEST_IMAGE_KEY = "request-image-key";

// const model = 'gpt-3.5-turbo-0125'
const modelName = "gpt-4o";

export class VizoAgent {
  chatHistory: BaseMessage[] = [];
  ocrResult: OcrAssessmentDataType = {};
  private executorWithMemory: any;
  private agentExecutor: any;
  private imageAssessment: ImageAssessmentDataType = {};
  private results: any;
  private openAiApiKey: string;
  private groqApiKey: string;

  private groq: Groq;

  private customer: string;
  private customerDescription: string;

  constructor({
    openAiApiKey,
    groqApiKey,
    customer,
    customerDescription,
  }: {
    openAiApiKey: string;
    groqApiKey: string;
    customer: string;
    customerDescription: string;
  }) {
    this.customer = customer;
    this.openAiApiKey = openAiApiKey;
    this.groqApiKey = groqApiKey;
    this.customerDescription = customerDescription;
    this.initializeAgent();

    this.groq = new Groq({
      apiKey: groqApiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  async initializeAgent() {
    /**
     * Define your chat model to use.
     */
    const model = new ChatOpenAI({
      model: modelName,
      temperature: 0,
      apiKey: this.openAiApiKey,
      streaming: false,
    });

    const tools: any = [
      getImageAssesmentTool({
        apiKey: this.openAiApiKey,
        customer: this.customer,
        customerDescription: this.customerDescription,
      }),
      getImageAnalysisTool({ apiKey: this.openAiApiKey }),
      // getOCRTool({ apiKey: this.apiKey }),
    ];

    const memoryPrompt = ChatPromptTemplate.fromMessages([
      ["system", "{system}"],
      new MessagesPlaceholder(MEMORY_KEY),
      ["user", "{input}"],
      new MessagesPlaceholder("agent_scratchpad"),
    ]);

    const modelWithFunctions = model.bind({
      functions: tools.map((tool: any) => convertToOpenAIFunction(tool)),
    });

    const agentWithMemory = RunnableSequence.from([
      {
        input: (i) => i.input,
        agent_scratchpad: (i) => formatToOpenAIFunctionMessages(i.steps),
        chat_history: (i) => i.chat_history,
      },
      memoryPrompt,
      modelWithFunctions,
      new OpenAIFunctionsAgentOutputParser(),
    ]);

    this.executorWithMemory = AgentExecutor.fromAgentAndTools({
      agent: agentWithMemory,
      tools,
      verbose: false,
      returnIntermediateSteps: true,
      maxIterations: 3,
      earlyStoppingMethod: "force",
    });

    const agent = await createOpenAIFunctionsAgent({
      llm: model,
      prompt: memoryPrompt,
      tools,
    });

    // Create the executor
    this.agentExecutor = new AgentExecutor({
      agent,
      tools,
      verbose: false,
      returnIntermediateSteps: true,
      maxIterations: 3,
      earlyStoppingMethod: "force",
      callbacks: [],
    });
  }

  async getGroqChatCompletion(ocr: string[]) {
    return this.groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a powerful spare parts finding assistant. Your task is to clean the provided OCR text, keeping only the information relevant for identifying a spare part.
             Relevant information includes part numbers, model numbers, brand names, and specific part descriptions (e.g., dimensions, specifications). Discard any irrelevant text such as dates, general text not related to the part, and extraneous symbols.
            Don't use any tools and don't add json tag or any other information that is not asked.`,
        },
        {
          role: "user",
          content: `
            List of products: ${JSON.stringify(this.results)}.
            List of OCR: ${JSON.stringify(ocr)}
            
            After cleaning the OCR, use the refined OCR to re-rank the provided products. The re-ranked products should be at the top. Return only the cleaned OCR text and the re-ranked JSON results.

            Return the result as an object with the following format and JSON.parsable. Don't add a json tag.
            {
              "skus": "A list of string with the sku of list of products after refined",
              "ocr": "A list of string used for refining the products",
            }
            Products matched with ocrContent should be at the top.`,
        },
      ],

      // The language model which will generate the completion.
      model: "llama3-70b-8192",
      // model: "llama3-8b-8192",

      temperature: 0,

      // The maximum number of tokens to generate. Requests can use up to
      // 2048 tokens shared between prompt and completion.

      // max_tokens: 1024,

      top_p: 1,
      stop: null,
      stream: false,
      response_format: { type: "json_object" },
    });
  }

  private refineAssessmentResult(res: any): ImageAssessmentDataType {
    let ocr: OcrAssessmentDataType = {};
    let imageAssessment = {};

    if (res.intermediateSteps?.length > 0) {
      res.intermediateSteps.forEach((step: any) => {
        if (step.action.tool === TOOL.OCR_DETECTION) {
          try {
            ocr = JSON.parse(step.observation || "");
          } catch (error) {
            console.log({ error });
          }
        }
        if (step.action.tool === TOOL.IMAGE_ASSESSMENT) {
          try {
            imageAssessment = JSON.parse(step.observation || "");
          } catch (error) {}
        }
      });
    }
    this.ocrResult = ocr;
    this.imageAssessment = { ...ocr, ...imageAssessment };

    return this.imageAssessment;
  }

  async runImageAssessment(): Promise<{
    assessment: ImageAssessmentDataType;
    message: string;
  }> {
    const result = await this.agentExecutor.invoke({
      system: `You are a very powerful assistant.The request image path is ${REQUEST_IMAGE_KEY}.`,
      input: `Run image assessment to validate input image and return the observation. The image path is ${REQUEST_IMAGE_KEY}`,
      [MEMORY_KEY]: this.chatHistory,
    });

    this.chatHistory.push(
      new HumanMessage(
        `Run OCR detection. If OCR is not detected fot the image run image assessment and return result. The image path is ${REQUEST_IMAGE_KEY}`
      )
    );
    this.chatHistory.push(new AIMessage(result.output));

    return {
      assessment: this.refineAssessmentResult(result),
      message: result.output,
    };
  }

  async runUserQuery(text: string) {
    const result = await this.agentExecutor.invoke({
      system: `You are very powerful assistant.The request image path is ${REQUEST_IMAGE_KEY}. 
       Only run image analysis, image assessment or ocr detection if the query is related to the image. Otherwise use this product list ${JSON.stringify(
         this.results
       )} to find products or refine result.
      If asked to do product search or refine products or refine result always return list of "sku" of the products in JSON.parsable format. Don't add json tag or any other information. If no match is found output only "No result found" without any extra information.`,
      input: text,
      [MEMORY_KEY]: this.chatHistory,
    });

    this.chatHistory.push(new HumanMessage(text));
    this.chatHistory.push(new AIMessage(result.output));

    return result.output;
  }

  async getFilters() {
    let input = "";
    let system = "";

    input = `${JSON.stringify(
      this.results
    )}. Return top 10 strings from the list of products based on the number of times that string appears in the product list. Ignore availability, score. Return the result in JSON parsable list of string format without any other information.`;

    system = `You are very powerful assistant.The request image path is ${REQUEST_IMAGE_KEY}. Don't add json tag or any other information that is not asked. `;

    const result = await this.agentExecutor.invoke({
      system: system,
      input: input,
      [MEMORY_KEY]: this.chatHistory,
    });

    this.chatHistory.push(new HumanMessage(input));

    this.chatHistory.push(new AIMessage(result.output));

    return { ocr: false, filter: true, result: JSON.parse(result.output) };
  }

  async refineResult(ocr: string[]) {
    let input = "";
    let system = `You are a powerful spare parts finding assistant. Your task is to clean the provided OCR text, keeping only the information relevant for identifying a spare part. Relevant information includes part numbers, model numbers, brand names, and specific part descriptions (e.g., dimensions, specifications). Discard any irrelevant text such as dates, general text not related to the part, and extraneous symbols. Don't use any tools and don't add json tag or any other information that is not asked.`;

    input = `
    List of products: ${JSON.stringify(this.results)}.
    List of OCR: ${JSON.stringify(ocr)}
    
    After cleaning the OCR, use the refined OCR to re-rank the provided products. The re-ranked products should be at the top. Return only the cleaned OCR text and the re-ranked JSON results.

    Return the result as an object with the following format and JSON.parsable. Don't add a json tag.
    {
      "skus": "A list of string with the sku of list of products after refined",
      "ocr": "A list of string used for refining the products",
    }
    Products matched with ocrContent should be at the top.`;

    const result = await this.agentExecutor.invoke({
      system: system,
      input: input,
      [MEMORY_KEY]: this.chatHistory,
    });

    this.chatHistory.push(new HumanMessage(input));

    this.chatHistory.push(new AIMessage(result.output));

    return { filter: false, ocr: true, result: JSON.parse(result.output) };
  }

  async refineResultGroq(ocr: string[]) {
    let input = "";
    let system = `You are a powerful spare parts finding assistant. Your task is to clean the provided OCR text, keeping only the information relevant for identifying a spare part. Relevant information includes part numbers, model numbers, brand names, and specific part descriptions (e.g., dimensions, specifications). Discard any irrelevant text such as dates, general text not related to the part, and extraneous symbols. Don't use any tools and don't add json tag or any other information that is not asked.`;

    input = `
    List of products: ${JSON.stringify(this.results)}.
    List of OCR: ${JSON.stringify(ocr)}
    
    After cleaning the OCR, use the refined OCR to re-rank the provided products. The re-ranked products should be at the top. Return only the cleaned OCR text and the re-ranked JSON results.

    Return the result as an object with the following format and JSON.parsable. Don't add a json tag.
    {
      "skus": "A list of string with the sku of list of products after refined",
      "ocr": "A list of string used for refining the products",
    }
    Products matched with ocrContent should be at the top.`;

    const chatCompletion = await this.getGroqChatCompletion(ocr);
    // Print the completion returned by the LLM.
    const output = chatCompletion.choices[0]?.message?.content || "";

    // const result = await this.agentExecutor.invoke({
    //   system: system,
    //   input: input,
    //   [MEMORY_KEY]: this.chatHistory,
    // });

    this.chatHistory.push(new HumanMessage(input));

    this.chatHistory.push(new AIMessage(output));

    return { filter: false, ocr: true, result: JSON.parse(output) };
  }

  updateImage(selectedImage: File) {
    if (selectedImage) {
      new Compressor(selectedImage, {
        quality: 1,
        maxHeight: 500,
        maxWidth: 500,
        strict: true,
        convertSize: 1 * 1024 * 1024,
        success: (compressedResult) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            storeImage(reader.result as string, REQUEST_IMAGE_KEY);
          };
          reader.readAsDataURL(compressedResult);
        },
        error: (err) => {
          console.error("Compression error:", err);
        },
      });
    }

    this.resetAgent();
  }

  setResults(results: any) {
    this.results = results;
  }

  resetAgent() {
    this.chatHistory = [];
    this.initializeAgent();
    this.imageAssessment = {};
    this.ocrResult = {};
  }
}
