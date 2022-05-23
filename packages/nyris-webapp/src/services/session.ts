import axios from "axios";
import {NyrisAPISettings} from "@nyris/nyris-api";

const httpClient = axios.create();

export const createSessionByApi = async (settings: NyrisAPISettings) => {
  const { apiKey, baseUrl} = settings;
  try {
    let headers = {
      "X-Api-Key": apiKey,
    };
    let response = await httpClient.request({
      method: "POST",
      url: `${baseUrl}/find/v1/session`,
      headers,
    });
    return response.data.session;
  } catch (error: any) {
    console.log("error createAction:", error);
  }
};
