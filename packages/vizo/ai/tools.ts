import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { getImage } from "./utils/indexDb";
import axios from "axios";
import { TOOL } from "./types";

enum Model {
  "gpt-4-vision-preview" = "gpt-4-vision-preview",
  "gpt-4o" = "gpt-4o",
}

export const getImageAssesmentTool = ({
  apiKey,
  customer,
  customerDescription,
}: {
  apiKey: string;
  customer: string;
  customerDescription: string;
}) =>
  new DynamicStructuredTool({
    name: TOOL.IMAGE_ASSESSMENT,
    description:
      "Use this tool for assessing the request image when the user wants feedback on the search results.",
    schema: z.object({
      imagePath: z.string().describe("The image path"),
    }),
    func: async ({ imagePath }) => {
      const base64Image = await getImage(imagePath);

      const requestBody = {
        model: Model["gpt-4o"],
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `The given image was used for image retrieval operation against a database containing images of ${customer} products,
                which normally contain ${customerDescription}.

                Assess this image and provide necessary information as a object with following format and JSON.parsable. Don't add json tag.

                {
                  "imageQuality": "A string value indicating the quality of image. Choose one value from ['good', 'okay', 'poor'].",
                  "hasValidObject": "A boolean indicating if the image has any meaningful object.",
                  "numOfObjects": "An string indicating number of objects in the image. Choose one value from ['single', 'multiple'].",
                  "objectVisibility": "A string value indicating the visibility of object(s) in the image. Choose one value from ['visible', 'occluded'].", # noqa
                  "isRelevantObject": "A boolean indicating if the image has one or more objects that are relevant to {customer}.",
                }

                `,
              },
              {
                type: "image_url",
                image_url: { url: `${base64Image}`, detail: "low" },
              },
            ],
          },
        ],
        max_tokens: 300,
      };

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      return (
        response.data.choices[0].message.content || "image assessment failed"
      );
    },
  });

export const getOCRTool = ({ apiKey }: { apiKey: string }) =>
  new DynamicStructuredTool({
    name: TOOL.OCR_DETECTION,
    description: "Use this tool for finding OCR",
    schema: z.object({
      imagePath: z.string().describe("The image path"),
    }),
    func: async ({ imagePath }) => {
      const base64Image = await getImage(imagePath);

      const requestBody = {
        model: Model["gpt-4o"],
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `
                Detect OCR in the image and clean the ocr result to only useful information.
                Provide the response in key value format and in a single JSON.parsable object format.
                Don't add json tag. 
                If OCR is not detected return empty object "{}". 
                  `,
              },
              {
                type: "image_url",
                image_url: { url: `${base64Image}`, detail: "low" },
              },
            ],
          },
        ],
        max_tokens: 300,
      };

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      try {
        JSON.parse(response.data.choices[0].message.content || "");
        return (
          response.data.choices[0].message.content || "OCR detection failed"
        );
      } catch (error) {
        return "OCR result format was not correct. Run OCR detection again.";
      }
    },
  });

export const getImageAnalysisTool = ({ apiKey }: { apiKey: string }) =>
  new DynamicStructuredTool({
    name: TOOL.IMAGE_ANALYSIS,
    description: `Use this tool for describing the image or answering specific questions about the contents in the image. "
    "You must provide two parameters to this tool. There names must be 'imagePath' and 'textQuery'.`,
    schema: z.object({
      imagePath: z.string().describe("The image path"),
      textQuery: z.string().describe("The text query for the request image"),
    }),
    func: async ({ imagePath, textQuery }) => {
      const base64Image = await getImage(imagePath);

      const requestBody = {
        model: Model["gpt-4o"],
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: textQuery,
              },
              {
                type: "image_url",
                image_url: { url: `${base64Image}` },
              },
            ],
          },
        ],
        max_tokens: 300,
      };

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      return (
        response.data.choices[0].message.content || "image analysis failed"
      );
    },
  });
