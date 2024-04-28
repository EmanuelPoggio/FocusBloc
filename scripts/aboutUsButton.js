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
        chrome.tabs.create({ url: "https://economic-fibre-af0.notion.site/About-Us-05cc7cb3c7c5470593ed4f33cc98713b?pvs=4"});
    });
});
