document.addEventListener("DOMContentLoaded", function() {

    var aboutUsImage = document.getElementById("about-us-image");

    aboutUsImage.style.cursor = "pointer";

    aboutUsImage.addEventListener("mouseenter", function() {
        aboutUsImage.style.background = "rgba(0, 0, 0, 0.1)";
    });

    aboutUsImage.addEventListener("mouseleave", function() {
        aboutUsImage.style.background = "transparent";
    });
    aboutUsImage.addEventListener("click", function() {
        chrome.tabs.create({ url: "https://emanuelpoggiodev.notion.site/About-Us-11df6d8fb4d5443297f20be9b506dae0?pvs=4"});
    });
});