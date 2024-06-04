function deleteUrl(index, callback) {
    chrome.storage.local.get('urlList', function(data) {
        let urlList = data.urlList || [];
        if (index > -1 && index < urlList.length) {
            urlList.splice(index, 1);
            chrome.storage.local.set({ urlList: urlList }, function() {
                console.log('URL eliminada:', urlList);
                if (callback) callback();
            });
        }
    });
}
