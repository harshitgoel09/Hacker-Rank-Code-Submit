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

(async function () {
    try {
        let browserObj = await browserOpenPromise;
        browser = browserObj;
        let pagesArrPromise = browser.pages();

        let tabs = await pagesArrPromise;
        page = tabs[0];

        await page.goto("https://www.hackerrank.com/auth/login");

        await waitAndType('input[type="text"]', emailObj.email, page);

        await waitAndType('input[type="password"]', emailObj.password, page);

        await page.keyboard.press("Enter");

        await waitAndClick("#base-card-1-link", page);

        await waitAndClick('h3[title="Warm-up Challenges"]', page);

        await page.waitForSelector("a.js-track-click.challenge-list-item", { visible: true });

        let allQuesArr = await page.$$('a[data-js-track="Challenge-Title"]');

        console.log("Total Question ", allQuesArr.length);
        // Solve and Mark First Question

        questionSolver(page, allQuesArr[0], answers[0]);

    } catch (err) {
        console.log("Error ❗❗" + err);
    }

})();

//*****************************User Defined Function********************************** */
async function waitAndClick(selector, tab) {
    try {
        await tab.waitForSelector(selector, { visible: true });
        await tab.click(selector, { delay: 1000 });
    } catch (err) {
        console.log("Error ❗❗ 😉" + err);
    }
}

async function waitAndType(selector, text, tab) {
    try {
        await tab.waitForSelector(selector, { visible: true });
        await tab.type(selector, text, { delay: 10 });
    } catch (err) {
        console.log("Error ❗❗" + err);
    }

}

async function questionSolver(tab, quesSelector, ans) {
    try {
        // Open Question
        await quesSelector.click();
        // Wait for Opening Question
        await page.waitForTimeout(3000);
        // Click on Test against custom input (check Box)
        await waitAndClick('input[type="checkbox"]', page);
        // writing code, copying it and at last pasting it
        await typecopyPaste(tab, ans, ".monaco-editor.no-user-select.vs");
        // submitting code
        await waitAndClick(".ui-btn.ui-btn-normal.ui-btn-primary.pull-right.hr-monaco-submit.ui-btn-styled", tab);
        // Wait for Successful submit of Question
        await page.waitForTimeout(9000);
        await tab.goBack();
        // Mark Star on Solved Question
        await page.waitForSelector('button[aria-label="Add bookmark"]', { visible: true });
        //=>> Get star array
        let starArr = await tab.$$('button[aria-label="Add bookmark"]');
        //=>> Mark solved ques
        await starArr[0].click();
    }
    catch (err) {
        console.log("Error ❗❗" + err);
    }
}

async function typecopyPaste(tab, ans, monacoSelector) {
    try {
        //1. Typing Code in Text Area
        await tab.keyboard.type(ans);
        //2. Copy Code From Text area
        await tab.keyboard.down("Control");
        await tab.keyboard.press("A", { delay: 100 });
        await tab.keyboard.press("X", { delay: 100 });
        await tab.keyboard.up("Control");

        //3. Focus or Select Monaco Editor and Paste code in it
        await waitAndClick(monacoSelector, tab);

        await tab.keyboard.down("Control");
        await tab.keyboard.press("A", { delay: 100 });
        await tab.keyboard.press("V", { delay: 100 });
        await tab.keyboard.up("Control");

    } catch (err) {
        console.log("Error ❗❗" + err);
    }
}