import axios from "axios";
import {NyrisAPISettings} from "@nyris/nyris-api";

const httpClient = axios.create();

export const createSessionByApi = async (settings: NyrisAPISettings) => {
  const { apiKey, baseUrl} = settings;
  try {
    let headers: any = {
      "X-Api-Key": apiKey,
    };
    return await httpClient.request({
      method: "POST",
      url: `${baseUrl}/find/v1/session`,
      headers,
    });
  } catch (error: any) {
    console.log("error createAction:", error);
  }
};
