export const isValidateEmail = (emailAddress) => {
    // Ensure input exists and is a string
    if (!emailAddress || typeof emailAddress !== "string") {
        return { isValid: false, message: "Email is required" };
    }

    // Trim email before validation
    emailAddress = emailAddress.trim();
    if (emailAddress === "") {
        return { isValid: false, message: "Email is required" };
    }

    // Basic email pattern
    const emailPattern =
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?:\.[A-Za-z]{2,})?$/;

    if (!emailPattern.test(emailAddress)) {
        return { isValid: false, message: "Invalid email format" };
    }

    // Prevent consecutive dots
    if (emailAddress.includes("..")) {
        return { isValid: false, message: "Email cannot contain consecutive dots" };
    }

    const [local, domain] = emailAddress.split("@");

    // Prevent starting or ending with dot
    if (
        local.startsWith(".") ||
        local.endsWith(".") ||
        domain.startsWith(".") ||
        domain.endsWith(".")
    ) {
        return { isValid: false, message: "Email cannot start or end with a dot" };
    }

    return { isValid: true, message: "Valid email" };
};


export const isPasswordValid = (password) => {
    const generalFailureMessage =
        "Password must be at least 8 characters long and contain both letters and numbers";

    // Ensure password exists, is a string, and is not empty
    if (typeof password !== "string") {
        return { isValid: false, message: "Password is required", generalFailureMessage: generalFailureMessage };
    }
    // Trim password before validation
    password = password.trim();

    if (password === "") {
        return { isValid: false, message: "Password is required", generalFailureMessage: generalFailureMessage };
    }

    // 1. Minimum length
    if (password.length < 8) {
        return { isValid: false, message: "Password must be at least 8 characters", generalFailureMessage: generalFailureMessage };
    }

    // 2. At least one letter
    if (!/[a-zA-Z]/.test(password)) {
        return { isValid: false, message: "Password must include a letter", generalFailureMessage: generalFailureMessage };
    }

    // 3. At least one number
    if (!/\d/.test(password)) {
        return { isValid: false, message: "Password must include a number", generalFailureMessage: generalFailureMessage };
    }

    // 5. At least one special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return { isValid: false, message: "Password must include a special character", generalFailureMessage: generalFailureMessage };
    }

    return { isValid: true, message: "Valid password" };
};

export const isNameValid = (name) => {
    const generalFailureMessage = "Name must be at least 2 characters and contain only valid characters";

    // Ensure name exists and is a string
    if (typeof name !== "string") {
        return { isValid: false, message: "Name is required", generalFailureMessage };
    }

    // Trim input
    name = name.trim();

    if (name === "") {
        return { isValid: false, message: "Name is required", generalFailureMessage };
    }

    // Minimum length
    if (name.length < 2) {
        return { isValid: false, message: "Name must be at least 2 characters", generalFailureMessage };
    }

    // Maximum length (optional but smart)
    if (name.length > 50) {
        return { isValid: false, message: "Name is too long", generalFailureMessage };
    }

    // Allow letters, spaces, hyphens, and apostrophes
    const namePattern = /^[A-Za-z\s'-]+$/;

    if (!namePattern.test(name)) {
        return {
            isValid: false,
            message: "Name can only contain letters, spaces, hyphens, and apostrophes",
            generalFailureMessage
        };
    }

    // Prevent multiple consecutive spaces
    if (name.includes("  ")) {
        return {
            isValid: false,
            message: "Name cannot contain consecutive spaces",
            generalFailureMessage
        };
    }

    return { isValid: true, message: "Valid name" };
};