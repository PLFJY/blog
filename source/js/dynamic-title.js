var OriginTitle = document.title;
var timeout;

document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
        document.title = "🤨 嗯嗯？怎么就走了！~";
        clearTimeout(timeout);
    } else {
        document.title = "😊 欢迎回来（嘻嘻）！";
        timeout = setTimeout(function () {
            document.title = OriginTitle;
        }, 3000);
    }
});