document.addEventListener("DOMContentLoaded", () => {
    let user = null;

    try {
        user = JSON.parse(localStorage.getItem("velora_user"));
    } catch (e) {}

    const devItems = document.querySelectorAll(".dropdown-item--dev");

    devItems.forEach(item => {
        if (user && user.account_type === "developer") {
            item.style.display = "flex";
        } else {
            item.style.display = "none";
        }
    });
});