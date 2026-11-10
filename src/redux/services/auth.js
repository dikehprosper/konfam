import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { axiosAuth } from "../../Config/axios";

// Base API URL from environment variables
const baseUrl = process.env.REACT_APP_API_URL;

/**
 * Verifies and refreshes an access token
 *
 * Purpose:
 * Sends current access token to backend for validation/refresh
 * and stores updated token in localStorage.
 *
 * @async
 * @param {string} accessToken - Current user access token
 * @returns {Promise<string>} New refreshed access token
 */
export const resetAccessToken = async (accessToken) => {
  // Send token to backend verification endpoint
  const data = await axiosAuth().post(`/token/verify`, { accessToken });

  // Extract new token from response
  const newToken = data?.data?.accessToken;

  // Persist refreshed token locally
  localStorage.setItem("Tkn", newToken);

  return newToken;
};

/**
 * RTK Query Authentication API Slice
 *
 * Purpose:
 * Centralized authentication endpoints for:
 * - Login
 * - Sign Up
 * - Forgot Password
 * - Reset Password
 *
 * Features:
 * - Auto attaches JWT token if available
 * - Global auth reducer path
 * - JSON request formatting
 */
export const authApi = createApi({
  // Redux slice key
  reducerPath: "authApi",

  /**
   * Base query configuration
   *
   * Handles:
   * - Base URL
   * - Authorization header injection
   * - Default content type
   */
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,

    /**
     * Dynamically attaches access token to every request
     *
     * @param {Headers} headers
     * @returns {Headers}
     */
    prepareHeaders: (headers) => {
      // Retrieve stored JWT token
      let token = localStorage.getItem("Tkn");

      // Attach Authorization header if token exists
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },

    // Default request headers
    headers: {
      "Content-Type": "application/json",
    },
  }),

  /**
   * Authentication endpoints
   */
  endpoints: (builder) => ({
    /**
     * Login Endpoint
     *
     * Sends:
     * - email
     * - password
     */
    login: builder.mutation({
      query: (data) => ({
        url: "/auth/login",
        method: "POST",
        body: data,
      }),
    }),

    /**
     * Sign Up Endpoint
     *
     * Sends:
     * - name
     * - email
     * - password
     */
    signUp: builder.mutation({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
    }),

    /**
     * Forgot Password Endpoint
     *
     * Sends:
     * - email
     *
     * Backend sends reset email if account exists
     */
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: data,
      }),
    }),

    /**
     * Reset Password Endpoint
     *
     * URL Param:
     * - token (from reset link)
     *
     * Sends:
     * - password
     * - confirmPassword
     *
     * Example:
     * POST /auth/reset/abc123token
     */
    resetPassword: builder.mutation({
      query: ({ token, password, confirmPassword }) => ({
        // Inject token dynamically into route params
        url: `/auth/reset/${token}`,

        method: "POST",

        // Request body
        body: {
          password,
          confirmPassword,
        },
      }),
    }),
    authWithGoogle: builder.mutation({
      query: (data) => ({
        url: "/auth/google/callback",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

/**
 * Auto-generated RTK Query hooks
 *
 * Usage:
 * const [doLogin] = useLoginMutation();
 */
export const {
  useLoginMutation,
  useSignUpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useAuthWithGoogleMutation
} = authApi;