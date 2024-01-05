chrome.storage.local.get(["mySelectValue"], function (result) {
  type = result.mySelectValue;
});
selectedValueChanged = 0;

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action != "scriptResult") {
    type = message.data;
  }
  selectedValueChanged = 1;
  observeButton();
});

function observeButton() {
  const targetNode = document.querySelector(".btn-neutral");

  if (
    targetNode &&
    targetNode.innerHTML.slice(-16) == "Regenerate</div>"
  ) {
    const parentNode = targetNode.parentNode;

    const myButton = document.createElement("button");
    if (type == "Copy") {
      myButton.innerText = chrome.i18n.getMessage("copy");
    } else if (type == "PDF" || type == "Markdown" || type == "TXT") {
      myButton.innerText = chrome.i18n.getMessage("save") + type;
    }
    // Add some styles to the button
    myButton.classList.add(
      "btn",
      "relative",
      "btn-neutral",
      "-z-0",
      "border-0",
      "md:border",
      "my-button"
    );
    myButton.style.marginLeft = "7px";

    if (
      parentNode.innerHTML.slice(-25) == "Regenerate</div></button>" &&
      type != "none"
    ) {
      // Insert the button after the "Regenerate response" button

      targetNode.parentNode.insertBefore(myButton, targetNode.nextSibling);
    } else if (selectedValueChanged == 1) {
      const nextSibling = targetNode.nextElementSibling; // Get the next sibling element

      if (nextSibling) {
        nextSibling.remove(); // Remove the next sibling if it exists
      }
      if (type != "none") {
        targetNode.parentNode.insertBefore(myButton, targetNode.nextSibling);
        selectedValueChanged = 0;
      }
    }

    // Add a click event listener to the button
    myButton.addEventListener("click", function () {
      if (type == "Copy") {
        chrome.runtime.sendMessage({ action: "do-Copy-content" });
      } else if (type == "PDF" || type == "Markdown" || type == "TXT") {
        chrome.runtime.sendMessage({ action: "do-" + type });
      }
    });
  }
}

// Detect the change of URL
// Function to handle URL change
function handleURLChange() {
  // let colorValue = document.querySelector("html").className;
  // console.log(colorValue);
  // chrome.runtime.sendMessage({ action: "sendColorValue", value: colorValue });
  observeButton();
}

// Create a new MutationObserver instance
observer = new MutationObserver(handleURLChange);

// Observe changes in the URL by observing the <body> element
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Detect the load or reload
window.addEventListener("load", function () {
  // let colorValue = document.querySelector("html").className;
  // console.log(colorValue);
  // chrome.runtime.sendMessage({ action: "sendColorValue", value: colorValue });
  observeButton();
});
