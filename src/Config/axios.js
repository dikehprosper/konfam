import axios from "axios";

let refreshPromise;

export const axiosAuth = () => {
    const url = process.env.REACT_APP_API_URL;
    const client = axios.create({
        baseURL: url,
        headers: {
            "Content-Type": "application/json",
        },
    });

    client.interceptors.response.use(undefined, async (error) => {
        const request = error.config;
        const authorization = request?.headers?.get?.("Authorization")
            || request?.headers?.Authorization
            || request?.headers?.authorization;
        if (error.response?.status !== 401 || !authorization || request._retry || request.url?.includes("/token/verify")) {
            return Promise.reject(error);
        }

        request._retry = true;
        const token = localStorage.getItem("Tkn");
        if (!token) return Promise.reject(error);

        try {
            const currentToken = authorization.replace(/^Bearer\s+/i, "");
            const newToken = currentToken !== token
                ? token
                : await (refreshPromise ||= axios.post(
                    `${url}/token/verify`,
                    { accessToken: token },
                    { headers: { "Content-Type": "application/json" }, timeout: 8000 },
                ).then((response) => {
                    const refreshedToken = response.data?.accessToken || response.data?.data?.accessToken;
                    if (!refreshedToken) throw new Error("Session refresh returned no access token.");
                    localStorage.setItem("Tkn", refreshedToken);
                    return refreshedToken;
                }).finally(() => { refreshPromise = null; }));
            request.headers = { ...request.headers, Authorization: `Bearer ${newToken}` };
            return client(request);
        } catch (refreshError) {
            if (refreshError.response?.status === 401) {
                if (localStorage.getItem("Tkn") === token) localStorage.removeItem("Tkn");
                window.location.replace("/");
            }
            return Promise.reject(refreshError);
        }
    });

    return client;
};
