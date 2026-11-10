import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { resetAccessToken } from "../auth";
const baseUrl = process.env.REACT_APP_API_URL;

const baseQueryWithInterceptor = (baseOptions) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders: async (headers) => {
      let token = localStorage.getItem("Tkn");
console.log("Preparing headers with token:", token);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
    ...baseOptions,
  });

  return async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
      try {
        const token = localStorage.getItem("Tkn");
        const newToken = await resetAccessToken(token);

        if (newToken) {
          // Retry the original request with new token
          const retryArgs = typeof args === 'string'
            ? { url: args, headers: { Authorization: `Bearer ${newToken}` } }
            : { ...args, headers: { ...args.headers, Authorization: `Bearer ${newToken}` } };

          // Retry request with new token
          result = await baseQuery(retryArgs, api, extraOptions);
        }
      } catch (error) {
        localStorage.removeItem("Tkn");
        const { clearClientData } = await import("../../features/client");
        api.dispatch(clearClientData());

        window.location.replace("/login");
      }
    }

    return result;
  };
};

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithInterceptor(),
  tagTypes: ["User"],
  endpoints: () => ({}),
});
