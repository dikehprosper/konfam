import { userApi } from "./baseSetUp";


export const userEndpoints = userApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserData: builder.query({
      query: () => ({
        url: "/users",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    resetPassword: builder.mutation({
      query: (data) => ({
        url: "/users/password/update?passwordUpdateType=password-reset",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: "/users/password/update?passwordUpdateType=password-change",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    changeProfile: builder.mutation({
      query: (data) => ({
        url: "/users/profile/update",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/users/logout",
        method: "GET",
      }),
      invalidatesTags: ["User"],
    }),
    deleteProfile: builder.mutation({
      query: () => ({
        url: "/users/profile/delete",
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    })
  }),
  overrideExisting: false,
});

export const {
  useVerifyEmailQuery,
  useResetPasswordMutation,
  useGetUserDataQuery,
  useLogoutMutation,
  useChangePasswordMutation,
  useChangeProfileMutation,
  useDeleteProfileMutation
} = userEndpoints;
;