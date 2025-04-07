document.addEventListener("DOMContentLoaded", function () {
    document.addEventListener("click", function (event) {
        const container = document.getElementById("response-message-container");
        if (container && event.target.closest(".dismiss-button")) {
            container.innerHTML = "";
        }
    });
});
