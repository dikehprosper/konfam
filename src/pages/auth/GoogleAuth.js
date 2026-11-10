import { useGoogleLogin } from "@react-oauth/google";
import { useAuthWithGoogleMutation } from "../../redux/services/auth";

export default function useGoogleAuth(onSuccessRedirect, setError) {
    const [doAuthWithGoogle, { isLoading }] = useAuthWithGoogleMutation();

    const googleLogin = useGoogleLogin({
        flow: 'auth-code', 
        onSuccess: async (codeResponse) => {
            try {
                const result = await doAuthWithGoogle({
                    googleAuthcode: codeResponse.code
                }).unwrap();

                console.log("Google login successful, backend response:", result);
                localStorage.setItem("Tkn", result.accessToken);
                
                onSuccessRedirect();
            } catch (error) {
                console.error("Google login error:", error);
                setError?.(error?.data?.message || "Google login failed. Please try again.");
            }
        },

        onError: (error) => {
            console.error("Google OAuth error:", error);
            setError?.("Google login failed. Please try again.");
        },
    });

    return { googleLogin, isLoading };
}

