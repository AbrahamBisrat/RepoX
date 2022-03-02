function takeUserInput() {
    document.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());
        // console.log(data.userId);
        if(!doesThisUserExist(data.userId)){
            // user doesn't exist message
            // set the search bar border redish
            // clear the input field
            // const form = 
        }
    });
}
function doesThisUserExist(username){
    const userXhr = new XMLHttpRequest();
    // https://api.github.com/users/abrahammehari
    // parse avatar_url from json -> this is the image address  
    const userUrl = `https://api.github.com/users/${username}`;
    userXhr.open('GET', userUrl, false); // do not perform this in async

    userXhr.onload = function(){
        const data = JSON.parse(this.response);
        if(data['login'] != null){
            // violla
            console.log(username + " => user Found");
            
            // turn on display for header, main-chart, api-data, footer
            // I should have just included it in one div
            // wait you can still do it, who am I kidding, I am too lazy for that
            manipulateDisplays();

            populateFields(username);
            return true;
        }else if (data['message'] === 'Not Found'){
            console.log(username + "  => user not found");
            let searchBar = document.querySelector('#user-input');
            // turn the input field color redish
            searchBar.style.border = '5px solid red';
            // clear input field
            searchBar.value = '';
            searchBar.setAttribute('placeholder', 'type valid id');
            return false;
        }
        else{
            // Error 403 or other api denial
            console.log("Aww, snap!\nSomething went wrong!");
            console.log("Github api response limit has been reached.");
            alert("Github Api call limit reached, try again later or change ip with proxy. 😂")
            return false;
        }
    }
    userXhr.send();
}
function manipulateDisplays() {
    const header = document.querySelector('.header');
    const mainChart = document.querySelector('#main-chart');
    const apiData = document.querySelector('.api-data');
    const footer = document.querySelector('.footer');
    const takeInput = document.querySelector('.take-input');

    header.style.display = 'flex';
    mainChart.style.display = 'flex';
    apiData.style.display = 'flex';
    footer.style.display = 'flex';
    takeInput.style.display = 'none';
}
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function populateFields(username){
    grabUserAvatar(username);
    let name = document.querySelector("#avatar-name");
    name.innerText = "@" + capitalizeFirstLetter(username);
    // more feature to display follower and following numbers

    const xhr = new XMLHttpRequest();
    const url = `https://api.github.com/users/${username}/repos`;

    xhr.open('GET', url, true); // async
    let listOfTitles = [];
    let count = 1;

    xhr.onload = function() {
        const data = JSON.parse(this.response);
        const projectList = document.querySelector(".api-data");
        for(let i in data){
            const eachTitle = data[i].name;
            const eachUrl = data[i].html_url;
            // if hasPages is true add a link to it.
            const hasPages = data[i].has_pages;
            // console.log("has_pages : " + hasPages);
            listOfTitles.push(eachTitle);
            const newRepo = repoButtonMaker(
                data[i].name,
                data[i].description,
                data[i].language,
                projectList
            );
            const repoContent = repoContentMaker(eachUrl, hasPages, username, eachTitle);
            makeItCollapsible(newRepo);
            projectList.appendChild(repoContent);
            
            // if(count++ > 0) // api call limit
            //     break;
        }
        drawMainChart(username, listOfTitles);
    }
    xhr.send();
}
function grabUserAvatar(username){
    const avatarImg = document.querySelector('#avatar');
    const imageXhr = new XMLHttpRequest();
    // https://api.github.com/users/abrahammehari
    // parse avatar_url from json -> this is the image address
    const imageUrl = `https://api.github.com/users/${username}`
    // console.log(imageUrl);
    imageXhr.open('GET', imageUrl, true); // async
    imageXhr.onload = function() {
        const userInfo = JSON.parse(this.response);
        // console.log(userInfo);
        avatarImg.setAttribute('src', userInfo['avatar_url']);
    }
    imageXhr.send();
}
function repoButtonMaker(eachTitle, eachDesc, eachLanguage, projectList) {
    const newRepo = document.createElement('button');
    newRepo.type = "button";
    newRepo.className = "collapsible";
    // check if title is valid(start with an alphabet)
    newRepo.innerText = eachTitle;
    if(eachLanguage != null && eachLanguage != 'null')
        newRepo.innerText += "   >>   " + eachLanguage
    if (eachDesc != null && eachDesc != 'null')
        newRepo.innerText += "  :: " + eachDesc;
    projectList.appendChild(newRepo);
    return newRepo;
}
function repoContentMaker(eachUrl, hasPages, username, title) {
    const repoContent = document.createElement('div');
    repoContent.className = 'repo-content';
    const repoLink = document.createElement('a');
    repoLink.href = eachUrl;
    repoLink.innerText = "Goto repository";
    const graphContainer = document.createElement('div');
    graphContainer.setAttribute('id', title);
    const canvas = document.createElement('canvas');
    canvas.setAttribute('id', `${validateTitle(title)}-canvas`);
    canvas.setAttribute('width', '100%');
    canvas.setAttribute('height', '100%');
    graphContainer.appendChild(canvas);
    repoContent.appendChild(graphContainer);
    repoContent.appendChild(repoLink);
    if(hasPages){
        // console.log("haspages");
        const pagesLink = document.createElement('a');
        pagesLink.href = `http://${username}.github.io/${title}/`;
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
    
    // console.log("repositories");
    // console.log(listOfRepo);
    
    let graphData = new Map();
    let counting = 1;
    for(const eachRepo of listOfRepo){
        // xhr('method', 'url', 'async')
        // set async to false to get all the responses, instead of just the last request.
        const urlLan = `https://api.github.com/repos/${userURL}/${eachRepo}/languages`;
        xhrLan.open('GET', urlLan, false); // pay attention to async
        
        // console.log("\n\n " + counting++ + " working on : " + eachRepo);
        xhrLan.onload = function() {
            let languagesList = JSON.parse(this.response);
            // console.log(languagesList);
            let eachGraph = new Map();
            for (const index in languagesList) {
                eachGraph.set(index, Number(languagesList[index]));
                if(graphData.get(index)){
                    let temp = Number(graphData.get(index)) + Number(languagesList[index]);
                    // console.log(index + " : appended result : " + temp);
                    graphData.set(index, temp);
                    // if key already exists, add to the value
                } else{
                    graphData.set(index, languagesList[index]);
                    // console.log("Added : " + index);
                }
            }
            // append chart to each element
            drawEachGraph(eachRepo, eachGraph);
        };
        // for(let key of graphData.keys())
        //     console.log(key + " : " + graphData.get(key) + "\n");
        xhrLan.send();
    }
    
    // mapping data to percentage
    // caution: smelly code ahead
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
    const mainChart = chartData(ctx, labels, labelData, 'Language Breakdown');
}
function drawEachGraph(eachRepo, eachGraph) {
    // graphContainer.setAttribute('id', `${title}-canvas`);
    const container = document.querySelector(`#${validateTitle(eachRepo)}-canvas`);
    // console.log("trying to build on " + validateTitle(eachRepo));
    // const details = document.createElement('p');
    // for (let key of eachGraph.keys()) {
    //     // console.log("e: " + key + "  :  " + eachGraph.get(key));
    //     details.innerText += key + "  :  " + eachGraph.get(key) + "\n";
    // }
    // container.appendChild(details);
    
    let eachGraphLangs = [];
    let eachGraphPercentages = [];
    for(let key of eachGraph.keys()){
        eachGraphLangs.push(key);
        eachGraphPercentages.push(eachGraph.get(key));
    }
    const drawDetails = chartData(container, eachGraphLangs, eachGraphPercentages, 'Proportions')
}
function chartData(ctx, labels, labelData, title) {
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: title,
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
            scales: { // remove grid lines
                x: {
                    grid: {
                        display: false
                    },
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        autoSkip: false,
                    }
                },
            },
            indexAxis: 'y',
            // Elements options apply to all of the options unless overridden in a dataset
            // In this case, we are setting the border of each horizontal bar to be 2px wide
            elements: {
              bar: {
                borderWidth: 2,
              }
            },
            responsive: true,
            plugins: {
              legend: {
                display: false,
                // position: 'left',
              },
              title: {
                display: true,
                text: 'Language Breakdown'
              }
            },
            maintainAspectRatio: false,
        },
    });
}
function validateTitle(title){ 
    // make sure the id attributes being set are valid
    // id=".identifier" should not be allowed b/c it
    // will pose a problem when accessing with JS
    // make a function that makes sure that the first 
    // char of the name is valid is an alphabet
    // also replace if the first character happens to be 
    // a number, replace it with a letter
    title = title.replace(/[^0-9a-z]/gi, '');
    if(title.charAt(0) <= '9' && title.charAt(0) >= '0'){
        let replaceThisNumber = 65 + (Number(title.charAt(0)) % 26);
        title =  String.fromCharCode(replaceThisNumber) + title.slice(1);
    }
    return title;
}
// let githubUser = 'okalu';
// let githubUser = 'SagarNepali';
// let githubUser = 'okonnu';
// let githubUser = 'abrahammehari';
// let githubUser = 'torvalds';
// let githubUser = 'meaw';
// let githubUser = 'taniarascia';

// make use of bubbling property of DOM elements
// once the entire logic is working, OAuth can be added.

takeUserInput();
