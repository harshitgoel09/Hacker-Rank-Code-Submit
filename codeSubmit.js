const puppeteer = require("puppeteer");
let { answers } = require("./codes");
let emailObj = require("./secret");
let fs = require("fs");

let page;
let browser;

let browserOpenPromise = puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--start-maximized", "--disable-notifications"]
});

browserOpenPromise.then(function (browserObj) {
    browser = browserObj;
    let pagesArrPromise = browser.pages();
    return pagesArrPromise;
}).then(function (tabs) {
    // Get current opened tab
    page = tabs[0];

    // Goto sepecific url
    let hrPagePromise = page.goto("https://www.hackerrank.com/auth/login");
    return hrPagePromise;
}).then(function () {
    let waitTypePromise = waitAndType('input[type="text"]', emailObj.email, page);
    return waitTypePromise;
}).then(function () {
    let waitTypePromise = waitAndType('input[type="password"]', emailObj.password, page);
    return waitTypePromise;
}).then(function () {
    let enterPromise = page.keyboard.press("Enter");
    return enterPromise;
}).then(function () {
    let waitClickPromise = waitAndClick("#base-card-1-link", page);
    return waitClickPromise;
}).then(function () {
    let waitClickPromise = waitAndClick('h3[title="Warm-up Challenges"]', page);
    return waitClickPromise;
}).then(function () {
    let elementPromise = page.waitForSelector("a.js-track-click.challenge-list-item", { visible: true });
    return elementPromise;
}).then(function () {
    let elementArrPromise = page.$$('a[data-js-track="Challenge-Title"]');
    return elementArrPromise;
}).then(function (allQuesArr) {
    // Solve and Mark First Question
    let solvedQuesPromise = questionSolver(page, allQuesArr[0], answers[0]);
    return solvedQuesPromise;
})

//*****************************User Defined Function********************************** */
function waitAndClick(selector, tab) {
    return new Promise(function (resolve, reject) {
        let elementPromise = tab.waitForSelector(selector, { visible: true });
        elementPromise.then(function () {
            let clickedPromise = tab.click(selector, { delay: 1000 });
            return clickedPromise;
        }).then(function () {
            resolve();
        }).catch(function (err) {
            reject(err);
        })
    });
}

function waitAndType(selector, text, tab) {
    return new Promise(function (resolve, reject) {
        let elementPromise = tab.waitForSelector(selector, { visible: true });
        elementPromise.then(function () {
            let typingPromise = tab.type(selector, text, { delay: 10 });
            return typingPromise;
        }).then(function () {
            resolve();
        }).catch(function (err) {
            reject(err);
        })
    })
}

function questionSolver(tab, quesSelector, ans) {
    return new Promise(function (resolve, reject) {
        // Open Question
        let quesPromise = quesSelector.click();
        quesPromise.then(function () {
            // Static Wait For 2 seconds
            let waitPromise = tab.waitFor(2000);
            return waitPromise;
        }).then(function () {
            // Click on Test against custom input (check Box)
            return waitAndClick('input[type="checkbox"]', page);
        }).then(function () {
            // writing code, copying it and at last pasting it
            return typecopyPaste(tab, ans, ".monaco-editor.no-user-select.vs");
        }).then(function () {
            // submitting code
            return waitAndClick(".ui-btn.ui-btn-normal.ui-btn-primary.pull-right.hr-monaco-submit.ui-btn-styled", tab);
        }).then(function () {
            // Wait For submitting
            let waitPromise = page.waitFor(10000);
            return waitPromise;
        }).then(function () {
            return tab.goBack();
        }).then(function () {
            // Mark Star on Solved Question
            let elementPromise = page.waitForSelector('button[aria-label="Add bookmark"]', { visible: true });
            return elementPromise;
        }).then(function () {
            //=>> Get star array
            let elementArrPromise = tab.$$('button[aria-label="Add bookmark"]');
            return elementArrPromise;
        }).then(function (starArr) {
            //=>> Mark solved ques
            let markPromise = starArr[0].click();
            return markPromise;
        }).then(function () {
            resolve();
        }).catch(function (err) {
            reject(err);
        })
    })
}

function typecopyPaste(tab, ans, monacoSelector) {
    return new Promise(function (resolve, reject) {
        //1. Typing Code in Text Area
        let typingPromise = tab.keyboard.type(ans);

        //2. Copy Code From Text area
        typingPromise.then(function () {
            return tab.keyboard.down("Control");
        }).then(function () {
            return tab.keyboard.press("A", { delay: 100 });
        }).then(function () {
            return tab.keyboard.press("X", { delay: 100 });
        }).then(function () {
            return tab.keyboard.up("Control");
        })
            //3. Focus or Select Monaco Editor and Paste code in it
            .then(function () {
                let focusMonacoPromise = waitAndClick(monacoSelector, tab);
                return focusMonacoPromise;
            }).then(function () {
                return tab.keyboard.down("Control");
            }).then(function () {
                return tab.keyboard.press("A", { delay: 100 });
            }).then(function () {
                return tab.keyboard.press("V", { delay: 100 });
            }).then(function () {
                return tab.keyboard.up("Control");
            }).then(function () {
                resolve();
            }).catch(function (err) {
                reject(err);
            })
    });
}