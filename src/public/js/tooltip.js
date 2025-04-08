document.addEventListener("htmx:afterSwap", (event) => {
    if (!pageContainsUsername(event)) {
        return;
    }

    const userInfoTooltip = document.getElementById("user-info-tooltip");
    const usernameDivs = document.querySelectorAll('[hx-trigger="mouseover"][hx-target="#user-info-tooltip"]');

    let currentTarget;

    usernameDivs.forEach((div) => {
        div.addEventListener("mouseover", (event) => {
            currentTarget = event.currentTarget;
            showTooltip(event);
        });

        div.addEventListener("mouseout", () => {
            hideTooltip();
            currentTarget = null;
        });
    });

    function showTooltip(event) {
        // no info yet -- return
        if (!userInfoTooltip.children.length) {
            return;
        }

        // some tooltip positioning logic
        // thanks to guys from stackoverflow
        const rect = event.target.getBoundingClientRect();
        const tooltipWidth = userInfoTooltip.offsetWidth;
        const tooltipHeight = userInfoTooltip.offsetHeight;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const offsetX = 10;

        let top = rect.bottom + offsetX;
        let left = rect.left + offsetX;

        if (left + tooltipWidth > viewportWidth) {
            left = viewportWidth - tooltipWidth - offsetX;
        }

        if (top + tooltipHeight > viewportHeight) {
            top = rect.top - tooltipHeight - offsetX * 2;
        }

        userInfoTooltip.style.top = `${top}px`;
        userInfoTooltip.style.left = `${left}px`;
        userInfoTooltip.classList.add("visible");
    }

    function hideTooltip() {
        userInfoTooltip.classList.remove("visible");
    }
});

// activate tooltip display in necessary pages
function pageContainsUsername(event) {
    const path = event.detail.requestConfig.path;

    if (path.includes("api/users")) {
        return true;
    }

    if (path.includes("api/pages/users")) {
        return true;
    }

    return false;
}
