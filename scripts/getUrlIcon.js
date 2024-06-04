function getUrlIcon(url) {
    let hostname = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}`;
}
