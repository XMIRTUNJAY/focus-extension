usageHelper = (id, cat) => {
    try {
        var xhr = new XMLHttpRequest();
        var data = `id=${id}&category=${cat}&timeSpent=0`;
        xhr.withCredentials = true;
        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                try {
                    var obj = JSON.parse(this.responseText);
                    if (obj[Object.keys(obj)[0]] - 1 >= 0) {
                        var a = JSON.parse(localStorage.getItem("done"));
                        delete a[Object.keys(obj)[0]];
                        localStorage.setItem('done', JSON.stringify(a));
                    }
                }
                catch (c) { alert("Unable to reach server") }
            }
        });

        xhr.open("POST", "https://pacific-woodland-35375.herokuapp.com/api/insert2");
        xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded");
        xhr.setRequestHeader("cache-control", "no-cache");
        xhr.send(data);
    }
    catch (c) { alert("Unable to reach server") }
}
checkUsage = () => {
    alert('I am running ' + (new Date()));
    if (localStorage.getItem('user_id') !== null) {
        var a = JSON.parse(localStorage.getItem("done"));
        if (a != null) {
            let b = Object.keys(a);
            for (let i in b) {
                usageHelper(localStorage.getItem('user_id'), b[i]);
            }
        }
    }
}
setInterval(checkUsage, 30000);
