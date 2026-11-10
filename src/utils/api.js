import { axiosAuth } from "../Config/axios";

/** Calls the API with the saved token. Throws Error(message) with .code and .status from the server's error envelope. */
export async function api(method, url, body, { headers, params } = {}) {
  const token = localStorage.getItem("Tkn");
  try {
    const response = await axiosAuth().request({
      method,
      url,
      data: body,
      params,
      timeout: 12000,
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
    });
    return response.data;
  } catch (error) {
    const data = error?.response?.data;
    const message = error?.response?.status === 401
      ? "Your session expired. Please sign in again."
      : data?.message || (error?.response ? "Something went wrong. Please try again." : "Can't reach the server. Check your connection.");
    throw Object.assign(new Error(message), {
      code: data?.code,
      status: error?.response?.status,
      data,
    });
  }
}

export const refreshAll = () => ["wallet:refresh", "profile:refresh", "notif:refresh", "watch:refresh"].forEach((name) => window.dispatchEvent(new Event(name)));
