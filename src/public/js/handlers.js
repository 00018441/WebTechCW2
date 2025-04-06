// workaround for showing the success
// message after a full page refresh
document.addEventListener("DOMContentLoaded", function () {
    const cookies = document.cookie.split("; ");
    let successMessage = "";

    cookies.forEach((cookie) => {
        const [name, value] = cookie.split("=");
        if (name === "successMessage") {
            successMessage = decodeURIComponent(value);
        }
    });

    if (successMessage) {
        const messageContainer = document.getElementById("response-message-container");
        if (messageContainer) {
            messageContainer.innerHTML = successMessage;
        }
    }
});

// client side routing, pretty hard to handle with htmx
document.addEventListener("htmx:afterRequest", function (event) {
    if (event.detail.requestConfig.path.includes("forms/register")) {
        return history.pushState(null, "", "/register");
    }

    if (event.detail.requestConfig.path.includes("forms/login")) {
        return history.pushState(null, "", "/login");
    }

    history.pushState(null, "", "/");
});
