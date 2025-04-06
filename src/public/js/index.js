document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("response-message-container");

    container.addEventListener("click", function (event) {
        if (event.target.closest(".dismiss-button")) {
            container.innerHTML = "";
        }
    });
});
