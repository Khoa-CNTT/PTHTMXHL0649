import { jwtDecode } from "jwt-decode";

export const handleDecoded = () => {
    const token = localStorage.getItem("token");
    let decoded = {};
    if (token && token !== 'undefined') {
        decoded = jwtDecode(token);
    }
    return { decoded, token };
};