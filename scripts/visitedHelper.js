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
                    var helperInterval = setInterval(lalala, 60000);
                    helperInterval;
                }
                catch (c) { alert("Unable to reach server") }
            }
        });

        xhr.open("POST", "https://pacific-woodland-35375.herokuapp.com/api/getcategory");
        xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded");
        xhr.setRequestHeader("cache-control", "no-cache");
        xhr.send(data);
    }
    catch (c) { alert("Unable to reach server") }
}

checkVisited = () => {
    // alert("Its here");
    let cats = JSON.parse(localStorage.getItem("visited"));
    let arr = Object.keys(cats);
    // alert(arr);
    for (let i in arr) {
        if (cats[arr[i]] == "true") {
            // alert("Started " + arr[i]);
            var data = `url=${arr[i]}`;
            visitedHelper(data, arr[i], cats);
            break;
        }
    }
    clearInterval(myInterval);
}
var helperInterval = setInterval(checkVisited, 60000);
helperInterval;