import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    clearClientData,
    updateClientData,
} from "../../../redux/features/client";
import { useGetUserDataQuery, userApi } from "../../../redux/services/queries";


const PublicGuard = ({ children }) => {
    const dispatch = useDispatch();
    const { userData, isAuthChecked } = useSelector(
        (state) => state.client
    );

    const token = localStorage.getItem("Tkn");
    const shouldFetchUserData = !!token && !isAuthChecked;
    
    // IMPORTANT: Always call hooks unconditionally
    const {
        data: userDetails,
        isLoading,
        isError,
        isSuccess,
    } = useGetUserDataQuery(undefined, {
        skip: !shouldFetchUserData,
        refetchOnMountOrArgChange: true,
    });


// Cache user data when verified
    useEffect(() => {
        if (isSuccess && userDetails?.user) {
            dispatch(
                updateClientData({
                    userData: userDetails.user.userData || userDetails.user,
                    isAuthChecked: true,
                })
            );
        }
    }, [isSuccess, userDetails, dispatch]);

    // Handle API error: invalid token
    useEffect(() => {
        if (isError) {
            localStorage.removeItem("Tkn");
            dispatch(clearClientData());
        }
    }, [isError, dispatch]);

    // // Clear auth state when token is removed (logout detected)
    useEffect(() => {
        if (!token && (isAuthChecked || userData)) {
            dispatch(clearClientData());
            dispatch(userApi.util.resetApiState());
        }
    }, [token, isAuthChecked, userData, dispatch]);


    // If token exists but still verifying → show loading
    if (token && !isAuthChecked && isLoading) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    flexDirection: "column",
                    gap: "1rem",
                }}
            >
                <div className='spinner'>Loading...</div>
                <p>Verifying your session...</p>
            </div>
        );
    }

    // // Token verified and user data exists → redirect to dashboard
    if (token && isAuthChecked && userData) {
        return <Navigate to='/dashboard' replace />;
    }

    console.log("PublicGuard: No valid token or user data. Rendering public page.");

    // No token or token invalid → allow public page
    return <>{children}</>;
};

export default PublicGuard;
