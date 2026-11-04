import axios from "axios";

export const axiosAuth = () => {
    const url = process.env.REACT_APP_API_URL;
    return axios.create({
        baseURL: url,
        headers: {
            "Content-Type": "application/json",
        },
    });

};