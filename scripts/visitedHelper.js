visitedHelper = (data, c, newObj) => {
    try {
        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                // alert(c + " " + this.responseText + " <= Using Helper");
                try {
                    newObj[c] = JSON.parse(this.responseText).msg;
                    localStorage.setItem("visited", JSON.stringify(newObj));
                    clearInterval(visitedInterval);
                    var visitedInterval = setInterval(checkVisited, 90000);
                }
                catch (err) {
                    delete newObj[c];
                    localStorage.setItem("visited", JSON.stringify(newObj));
                    alert("Unable to classify "+c);
                }
            }
        });

        xhr.open("POST", "https://pacific-woodland-35375.herokuapp.com/api/getcategory");
        xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded");
        xhr.setRequestHeader("cache-control", "no-cache");
        xhr.send(data);
    }
    catch (err) { alert("Unable to reach server") }
}

checkVisited = () => {
    // alert("Its here");
    let cats = JSON.parse(localStorage.getItem("visited"));
    alert(JSON.stringify(cats));
    if (cats != null) {
        let arr = Object.keys(cats);
        // alert(arr);
        for (let i in arr) {
            if (cats[arr[i]] == "true") {
                // alert("For " + arr[i]);
                var data = `url=${arr[i]}`;
                cats[arr[i]] = "In-Process";
                localStorage.setItem("visited", JSON.stringify(cats));
                visitedHelper(data, arr[i], cats);
                break;
            }
        }
    }
}

var visitedInterval = setInterval(checkVisited, 90000);