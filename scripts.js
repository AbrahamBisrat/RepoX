function populateFields(username){
    let name = document.querySelector("#avatar-name");
    name.innerText = "@" + username;
    // fetch avatar image from api here

    const xhr = new XMLHttpRequest();
    const url = `https://api.github.com/users/${username}/repos`;

    xhr.open('GET', url, true);
    let listOfTitles = [];
    let count = 1;

    xhr.onload = function() {
        const data = JSON.parse(this.response);
        // console.log(data);
        const projectList = document.querySelector(".api-data");
        for(let i in data){
            const eachTitle = data[i].name;
            const eachDesc = data[i].description;
            const eachUrl = data[i].html_url;
            const eachLanguage = data[i].language;
            // if hasPages is true add a link to it.
            const hasPages = data[i].has_pages;
            console.log("has_pages : " + hasPages);

            listOfTitles.push(eachTitle);

            const newRepo = repoButtonMaker(eachTitle, eachDesc, eachLanguage, projectList);
            const repoContent = repoContentMaker(eachUrl, true, username, eachTitle);
            
            makeItCollapsible(newRepo);
            projectList.appendChild(repoContent);
            
            if(count++ > 2) // api call limit hack
                break;
        }
        drawMainChart(username, listOfTitles);
    }
    xhr.send();
}
function repoButtonMaker(eachTitle, eachDesc, eachLanguage, projectList) {
    const newRepo = document.createElement('button');
    newRepo.type = "button";
    newRepo.className = "collapsible";
    newRepo.innerText = eachTitle;
    newRepo.innerText += " -> " + eachLanguage
    if (eachDesc != null)
        newRepo.innerText += " : " + eachDesc;
    projectList.appendChild(newRepo);
    return newRepo;
}
function repoContentMaker(eachUrl, hasPages, username, hostedPage) {
    const repoContent = document.createElement('div');
    repoContent.className = 'repo-content';
    const repoLink = document.createElement('a');
    repoLink.href = eachUrl;
    repoLink.innerText = "Goto repository";
    const trial = document.createElement('h1');
    trial.textContent = "Graphs and details about the repo";
    repoContent.appendChild(trial);
    repoContent.appendChild(repoLink);
    if(hasPages){
        console.log("haspages")
        const pagesLink = document.createElement('a');
        pagesLink.href = `https://${username}.github.io/${hostedPage}/`;
        // https://username.github.io/repo-name/
        pagesLink.innerText = "Go to Deployed page";
        repoContent.appendChild(pagesLink);
    }
    return repoContent;
}
function makeItCollapsible(thisOne){
    thisOne.addEventListener('click', function(){
            thisOne.classList.toggle("active");
            var content = this.nextElementSibling;
            if(content.style.maxHeight){
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
    });
}
function drawMainChart(userURL, listOfRepo){
    const ctx = document.getElementById('user-languages');
    const xhrLan = new XMLHttpRequest();
    
    console.log("repositories");
    console.log(listOfRepo);
    
    let graphData = new Map();
    let counting = 1;
    for(const eachRepo of listOfRepo){
        // xhr('method', 'url', 'async')
        // set async to false to get all the responses, instead of just the last request.
        const urlLan = `https://api.github.com/repos/${userURL}/${eachRepo}/languages`;
        xhrLan.open('GET', urlLan, false);
        
        console.log("\n\n " + counting++ + " working on : " + eachRepo);
        xhrLan.onload = function() {
            let languagesList = JSON.parse(this.response);
            console.log(languagesList);
            for (const index in languagesList) {
                if(graphData.get(index) !== undefined){
                    let temp = Number(graphData.get(index)) + Number(languagesList[index]);
                    console.log(index + " : appended result : " + temp);
                    graphData.set(index, temp);
                    break;
                } // if key already exists, add to the value
                graphData.set(index, languagesList[index]);
            }
        };
        for(let key of graphData.keys())
            console.log(key + " : " + graphData.get(key) + "\n");
        xhrLan.send();
    }
    
    // mapping data to percentage
    let lanTotal = 0;
    for(let val of graphData.values())
        lanTotal += Number(val);
    for(let key of graphData.keys())
        graphData.set(key, (graphData.get(key) / lanTotal) * 100);
    let labels = [];
    for(let key of graphData.keys())
        labels.push(key);
    let labelData = [];
    for(let value of graphData.values())
        labelData.push(value);

    const mainChart = chartMain(ctx, labels, labelData);
}
function chartMain(ctx, labels, labelData) {
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Language breakdown',
                data: labelData,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
// public static void main ... lol
// let githubUser = 'okalu';
let githubUser = 'abrahammehari';
populateFields(githubUser);

// make use of bubbling property of DOM elements

// to work around api call limit, limit requests to only one.
// once the entire logic is working, OAuth can be added.