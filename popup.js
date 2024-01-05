let saveAsTxtButton = document.getElementById("saveAsTxtButton");
let saveAsMarkdownButton = document.getElementById("saveAsMarkdownButton");
let saveAsPDFButton = document.getElementById("saveAsPDFButton");
let copyButton = document.getElementById("copyButton");
const button = document.querySelector("#copyButton");
const icon = button.querySelector("span");

const display_option = document.querySelector("label");
display_option.innerHTML = chrome.i18n.getMessage("display_option");

const settingArea = document.getElementById("settingArea");
const toggleButton = document.getElementById("toggle-button");
const select = document.querySelector(".dropdown");

let toggleShow = false;
settingArea.addEventListener("click", () => {
  if (!toggleShow) {
    select.style.display = "flex";
    toggleButton.innerHTML = "&#9660;";
    toggleShow = true;
  } else {
    select.style.display = "none";
    toggleButton.innerHTML = "&#9658;";
    toggleShow = false;
  }
});

const selectedValue = document.getElementById("display-option");

document.addEventListener("DOMContentLoaded", function () {
  chrome.storage.local.get(["mySelectValue"], function (result) {
    if (result.mySelectValue) {
      selectedValue.value = result.mySelectValue;
    }
  });
});

selectedValue.addEventListener("change", function (event) {
  var selectedValue = event.target.value;
  chrome.storage.local.set({ mySelectValue: selectedValue });
  chrome.runtime.sendMessage({ data: selectedValue });
});

saveAsTxtButton.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.runtime.sendMessage({ action: "do-TXT", tabId: tab.id });
});

saveAsMarkdownButton.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.runtime.sendMessage({ action: "do-Markdown", tabId: tab.id });
});

saveAsPDFButton.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.runtime.sendMessage({ action: "do-PDF", tabId: tab.id });
});

copyButton.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.runtime.sendMessage({ action: "do-Copy", tabId: tab.id });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "scriptResult") {
    // Remove any existing success/failure icons
    icon.classList.remove("success-icon");
    icon.classList.remove("failure-icon");

    // Logic to change icon depending on status
    if (message.result.result.success) {
      icon.classList.add("success-icon");
    } else {
      icon.classList.add("failure-icon");
    }

    // Revert the icon back to default after 2 seconds
    setTimeout(() => {
      icon.classList.remove("success-icon");
      icon.classList.remove("failure-icon");
    }, 2000);
  }
});
