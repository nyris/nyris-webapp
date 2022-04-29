import NyrisAPI from "@nyris/nyris-api";
import axios, { AxiosInstance } from "axios";

const httpClient = axios.create();

export const createSessionByApi = async (state: any) => {
  const { search, settings } = state;
  try {
    let headers: any = {
      "X-Api-Key": settings.apiKey,
    };
    return await httpClient.request({
      method: "POST",
      url: `${settings.imageMatchingUrl}/session`,
      headers,
    });
  } catch (error: any) {
    console.log("error createAction:", error);
  }
};
