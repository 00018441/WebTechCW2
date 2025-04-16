export function signSuccessMessageCookie(res, message) {
    res.clearCookie("successMessage");
    res.cookie("successMessage", message, {
        secure: process.env.NODE_ENV === "production",
        maxAge: 15000,
    });
}
