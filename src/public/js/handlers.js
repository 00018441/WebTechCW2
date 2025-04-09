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
    const path = event.detail.requestConfig.path;

    if (path.includes("forms/register")) {
        return history.pushState(null, "", "/register");
    }

    if (path.includes("forms/login")) {
        return history.pushState(null, "", "/login");
    }

    if (path.includes("pages/users")) {
        return history.pushState(null, "", "/users");
    }

    if (path.includes("forms/posts/")) {
        return history.pushState(null, "", "/update-post");
    }

    if (path.includes("forms/posts")) {
        return history.pushState(null, "", "/new-post");
    }

    if (path.includes("pages/posts/")) {
        return history.pushState(null, "", `/posts/${path.slice(path.lastIndexOf("/") + 1)}`);
    }

    if (path.includes("pages/posts")) {
        return history.pushState(null, "", "/posts");
    }

    history.pushState(null, "", "/");
});

document.addEventListener("htmx:afterOnLoad", function (event) {
    const kOlderLoadMoreButtonIdx = 1;

    const buttons = document.getElementsByClassName("load-more-button");
    if (buttons.length > 1) {
        buttons[kOlderLoadMoreButtonIdx].remove();
    }
});

document.addEventListener("no-more-users", function (event) {
    const button = document.querySelector(".load-more-button");
    button?.remove();
});

document.addEventListener("no-more-posts", function (event) {
    const button = document.querySelector(".load-more-button");
    button?.remove();
});
