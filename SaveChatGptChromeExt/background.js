chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.set({ mySelectValue: "none" });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case "do-TXT":
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs.length > 0) {
          const activeTab = tabs[0];
          chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            function: saveAsTxt,
          });
        }
      });
      break;
    case "do-PDF":
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs.length > 0) {
          const activeTab = tabs[0];
          chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            function: saveAsPDF,
          });
        }
      });
      break;
    case "do-Markdown":
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs.length > 0) {
          const activeTab = tabs[0];
          chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            function: saveAsMarkdown,
          });
        }
      });
      break;
    case "do-Copy":
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs.length > 0) {
          const activeTab = tabs[0];

          chrome.scripting.executeScript(
            {
              target: { tabId: activeTab.id },
              func: copyToClipboard,
            },
            ([result]) => {
              // Send the result back to popup.js
              chrome.runtime.sendMessage({ action: "scriptResult", result });
            }
          );
        }
      });
      break;
    case "do-Copy-content":
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs.length > 0) {
          const activeTab = tabs[0];

          chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            func: copyToClipboard,
          });
        }
      });
      break;

    default:
      // Retrieve data from local storage
      chrome.storage.local.get(["mySelectValue"], function (result) {
        var selectedValue = result.mySelectValue;
        // Send data to content.js
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            tabs.forEach(function (tab) {
              chrome.scripting.executeScript(
                {
                  target: { tabId: tab.id },
                  files: ["content.js"],
                },
                function () {
                  chrome.tabs.sendMessage(tab.id, { data: selectedValue });
                }
              );
            });
          }
        );
      });
      break;
  }

  return true;
});

// Function to save text to chatData as TXT
async function saveAsTxt() {
  let element = document.querySelector(".text-base" && ".mx-auto");
  if (!element || element.innerText === undefined) {
    alert(chrome.i18n.getMessage("alert"));
    return;
  }
  const elements = document.querySelectorAll(".text-base" && ".mx-auto");
  let chatData = "";
  for (const element of elements) {
    if (element.querySelector(".whitespace-pre-wrap")) {
      let innerText = element.querySelector(".whitespace-pre-wrap").innerText;
      chatData += `${element.querySelectorAll("svg").length < 4 ? "You:" : "ChatGPT:"
        }\n\n\n${innerText}\n------------------\n`;
    }
  }
  let handle = await window.showSaveFilePicker({
    suggestedName: "Saved_ChatGPT_.txt",
  });
  let stream = await handle.createWritable();
  await stream.write(chatData);
  await stream.close();
}

//Function to save text to chatData as pdf
function saveAsPDF() {
  const elements = document.querySelectorAll(".text-base" && ".mx-auto");
  let content = "";
  for (const element of elements) {
    if (element.querySelector(".whitespace-pre-wrap")) {
      let innerHtml = element.querySelector(".whitespace-pre-wrap").innerHTML;
      // innerHtml = innerHtml.replace(/<pre>/g, '<pre style="background-color: grey; color: white;">');
      console.log(element.querySelectorAll("svg").length);
      content += `${element.querySelectorAll("svg").length < 4
        ? `<div class="role-you">
          <svg xmlns="http://www.w3.org/2000/svg" width="41" height="41" viewBox="0 0 32 32">
          <path fill="currentColor" d="M16 8a5 5 0 1 0 5 5a5 5 0 0 0-5-5Zm0 8a3 3 0 1 1 3-3a3.003 3.003 0 0 1-3 3Z"/>
          <path fill="currentColor" d="M16 2a14 14 0 1 0 14 14A14.016 14.016 0 0 0 16 2Zm-6 24.377V25a3.003 3.003 0 0 1 3-3h6a3.003 3.003 0 0 1 3 3v1.377a11.899 11.899 0 0 1-12 0Zm13.992-1.451A5.002 5.002 0 0 0 19 20h-6a5.002 5.002 0 0 0-4.992 4.926a12 12 0 1 1 15.985 0Z"/>
        </svg>
                
        &nbsp;You:</div>`
        : `<div class="role-gpt">
          <svg width="41" height="41" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg" stroke-width="1.5" class="h-6 w-6" role="img"><text x="-9999" y="-9999">ChatGPT</text><path d="M37.5324 16.8707C37.9808 15.5241 38.1363 14.0974 37.9886 12.6859C37.8409 11.2744 37.3934 9.91076 36.676 8.68622C35.6126 6.83404 33.9882 5.3676 32.0373 4.4985C30.0864 3.62941 27.9098 3.40259 25.8215 3.85078C24.8796 2.7893 23.7219 1.94125 22.4257 1.36341C21.1295 0.785575 19.7249 0.491269 18.3058 0.500197C16.1708 0.495044 14.0893 1.16803 12.3614 2.42214C10.6335 3.67624 9.34853 5.44666 8.6917 7.47815C7.30085 7.76286 5.98686 8.3414 4.8377 9.17505C3.68854 10.0087 2.73073 11.0782 2.02839 12.312C0.956464 14.1591 0.498905 16.2988 0.721698 18.4228C0.944492 20.5467 1.83612 22.5449 3.268 24.1293C2.81966 25.4759 2.66413 26.9026 2.81182 28.3141C2.95951 29.7256 3.40701 31.0892 4.12437 32.3138C5.18791 34.1659 6.8123 35.6322 8.76321 36.5013C10.7141 37.3704 12.8907 37.5973 14.9789 37.1492C15.9208 38.2107 17.0786 39.0587 18.3747 39.6366C19.6709 40.2144 21.0755 40.5087 22.4946 40.4998C24.6307 40.5054 26.7133 39.8321 28.4418 38.5772C30.1704 37.3223 31.4556 35.5506 32.1119 33.5179C33.5027 33.2332 34.8167 32.6547 35.9659 31.821C37.115 30.9874 38.0728 29.9178 38.7752 28.684C39.8458 26.8371 40.3023 24.6979 40.0789 22.5748C39.8556 20.4517 38.9639 18.4544 37.5324 16.8707ZM22.4978 37.8849C20.7443 37.8874 19.0459 37.2733 17.6994 36.1501C17.7601 36.117 17.8666 36.0586 17.936 36.0161L25.9004 31.4156C26.1003 31.3019 26.2663 31.137 26.3813 30.9378C26.4964 30.7386 26.5563 30.5124 26.5549 30.2825V19.0542L29.9213 20.998C29.9389 21.0068 29.9541 21.0198 29.9656 21.0359C29.977 21.052 29.9842 21.0707 29.9867 21.0902V30.3889C29.9842 32.375 29.1946 34.2791 27.7909 35.6841C26.3872 37.0892 24.4838 37.8806 22.4978 37.8849ZM6.39227 31.0064C5.51397 29.4888 5.19742 27.7107 5.49804 25.9832C5.55718 26.0187 5.66048 26.0818 5.73461 26.1244L13.699 30.7248C13.8975 30.8408 14.1233 30.902 14.3532 30.902C14.583 30.902 14.8088 30.8408 15.0073 30.7248L24.731 25.1103V28.9979C24.7321 29.0177 24.7283 29.0376 24.7199 29.0556C24.7115 29.0736 24.6988 29.0893 24.6829 29.1012L16.6317 33.7497C14.9096 34.7416 12.8643 35.0097 10.9447 34.4954C9.02506 33.9811 7.38785 32.7263 6.39227 31.0064ZM4.29707 13.6194C5.17156 12.0998 6.55279 10.9364 8.19885 10.3327C8.19885 10.4013 8.19491 10.5228 8.19491 10.6071V19.808C8.19351 20.0378 8.25334 20.2638 8.36823 20.4629C8.48312 20.6619 8.64893 20.8267 8.84863 20.9404L18.5723 26.5542L15.206 28.4979C15.1894 28.5089 15.1703 28.5155 15.1505 28.5173C15.1307 28.5191 15.1107 28.516 15.0924 28.5082L7.04046 23.8557C5.32135 22.8601 4.06716 21.2235 3.55289 19.3046C3.03862 17.3858 3.30624 15.3413 4.29707 13.6194ZM31.955 20.0556L22.2312 14.4411L25.5976 12.4981C25.6142 12.4872 25.6333 12.4805 25.6531 12.4787C25.6729 12.4769 25.6928 12.4801 25.7111 12.4879L33.7631 17.1364C34.9967 17.849 36.0017 18.8982 36.6606 20.1613C37.3194 21.4244 37.6047 22.849 37.4832 24.2684C37.3617 25.6878 36.8382 27.0432 35.9743 28.1759C35.1103 29.3086 33.9415 30.1717 32.6047 30.6641C32.6047 30.5947 32.6047 30.4733 32.6047 30.3889V21.188C32.6066 20.9586 32.5474 20.7328 32.4332 20.5338C32.319 20.3348 32.154 20.1698 31.955 20.0556ZM35.3055 15.0128C35.2464 14.9765 35.1431 14.9142 35.069 14.8717L27.1045 10.2712C26.906 10.1554 26.6803 10.0943 26.4504 10.0943C26.2206 10.0943 25.9948 10.1554 25.7963 10.2712L16.0726 15.8858V11.9982C16.0715 11.9783 16.0753 11.9585 16.0837 11.9405C16.0921 11.9225 16.1048 11.9068 16.1207 11.8949L24.1719 7.25025C25.4053 6.53903 26.8158 6.19376 28.2383 6.25482C29.6608 6.31589 31.0364 6.78077 32.2044 7.59508C33.3723 8.40939 34.2842 9.53945 34.8334 10.8531C35.3826 12.1667 35.5464 13.6095 35.3055 15.0128ZM14.2424 21.9419L10.8752 19.9981C10.8576 19.9893 10.8423 19.9763 10.8309 19.9602C10.8195 19.9441 10.8122 19.9254 10.8098 19.9058V10.6071C10.8107 9.18295 11.2173 7.78848 11.9819 6.58696C12.7466 5.38544 13.8377 4.42659 15.1275 3.82264C16.4173 3.21869 17.8524 2.99464 19.2649 3.1767C20.6775 3.35876 22.0089 3.93941 23.1034 4.85067C23.0427 4.88379 22.937 4.94215 22.8668 4.98473L14.9024 9.58517C14.7025 9.69878 14.5366 9.86356 14.4215 10.0626C14.3065 10.2616 14.2466 10.4877 14.2479 10.7175L14.2424 21.9419ZM16.071 17.9991L20.4018 15.4978L24.7325 17.9975V22.9985L20.4018 25.4983L16.071 22.9985V17.9991Z" fill="currentColor"></path></svg>
        
          &nbsp;ChatGPT:</div>`
        }<br>${innerHtml}<br>------------------<br><br>`;
    }
  }

  if (content.trim() === "") {
    alert(chrome.i18n.getMessage("alert"));
    return;
  }

  // Create a new printable HTML
  function createPrintableHtml(content) {
    return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    @media print {
                        body {
                            font-size: 12pt;
                            font-family: Söhne, sans-serif;
                            color: #222;
                        }
                        .role-you{
                          color: dodgerblue;
                          display: flex;
                          align-items: center;
                        }
                        .role-gpt{
                          color: lightgreen;
                          display: flex;
                          align-items: center;
                        }
                                      pre {
                                        border: 1px solid grey;
                                        border-radius: 3px;
                                        padding: 10px;
                background-color:#c2c2c2 !important;
                color: #06103d !important;
              }
              button{
                display: none;
              }
                    }
                </style>
            </head>
            <body>
                ${content}
            </body>
            <script>

            </script>
            </html> 
        `;
  }

  const printableHtml = createPrintableHtml(content);

  // Create a new hidden iframe
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  // Set up a listener for the iframe load event
  iframe.onload = function () {
    // Invoke the print functionality of the browser
    try {
      iframe.contentWindow.print();
    } catch (error) {
      console.error("Printing failed:", error);
    }

    // Remove the hidden iframe after a short delay
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 100);
  };

  // Write the printable HTML to the iframe
  iframe.contentDocument.write(printableHtml);
  iframe.contentDocument.close();
}

// Function to save text to chatData as Markdown
async function saveAsMarkdown() {
  // Function to convert HTML to Markdown
  function htmlToMarkdown(html) {
    let markdown = html;
    markdown = markdown.replace(/<\/?div[^>]*>/g, "");
    markdown = markdown.replace(/<br[^>]*>/g, "\n");

    markdown = markdown.replace(/<strong>(.*?)<\/strong>/g, "**$1**");
    markdown = markdown
      // Replace opening <blockquote> tag with '>'
      .replace(/<blockquote[^>]*>/g, "> ")
      // Replace closing </blockquote> tag with empty string
      .replace(/<\/blockquote>/g, "")
      // Remove indentation and extra line breaks
      .trim();
    markdown = markdown.replace(
      /<hr>/g,
      "_____________________________________________________________________________________________\n"
    );
    markdown = markdown.replace(/<em>(.*?)<\/em>/g, "*$1*");
    markdown = markdown.replace(/<u>(.*?)<\/u>/g, "__$1__");
    markdown = markdown.replace(/<code>(.*?)<\/code>/g, "`$1`");
    // markdown = markdown.replace(/<a href="(.*?)">(.*?)<\/a>/g, "[$2]($1)");
    markdown = markdown.replace(/<a href="(.*?)".*?>(.*?)<\/a>/g, "[$2]($1)");
    markdown = markdown.replace(/<h1>(.*?)<\/h1>/g, "# $1\n");
    markdown = markdown.replace(/<h2>(.*?)<\/h2>/g, "## $1\n");
    markdown = markdown.replace(/<h3>(.*?)<\/h3>/g, "### $1\n");
    markdown = markdown.replace(/<h4>(.*?)<\/h4>/g, "#### $1\n");
    markdown = markdown.replace(/<h5>(.*?)<\/h5>/g, "##### $1\n");
    markdown = markdown.replace(/<h6>(.*?)<\/h6>/g, "###### $1\n");
    markdown = markdown.replace(/<code class="[^"]*">/g, "\n"); // remove code tag
    markdown = markdown.replace(/<\/code>/g, ""); // remove pre tag
    markdown = markdown.replace(
      /<pre><span class="">(.*?)<\/span>/g,
      "<pre>$1\n"
    ); // remove language tag portion
    markdown = markdown.replace(/<pre>/g, "```"); // replace pre tag with code blocks
    markdown = markdown.replace(/<\/pre>/g, "\n```\n"); // replace pre tag with code blocks
    markdown = markdown.replace(
      /<button class="flex ml-auto gap-2">(.*?)<\/button>/g,
      ""
    ); // Remove copy button SVG
    markdown = markdown.replace(/<span(?: class="[^"]*")?>|<\/span>/g, ""); // Remove span tag with or without a class
    markdown = markdown.replace(/<p>(.*?)<\/p>/gs, "$1\n\n");

    // Add these lines to convert &lt; and &gt; to < and >, respectively
    markdown = markdown.replace(/&lt;/g, "<");
    markdown = markdown.replace(/&gt;/g, ">");

    function htmlToMd(html) {
      const dom = new DOMParser().parseFromString(html, "text/html");
      let md = "";
      let indentLevel = -1;

      function increaseIndent() {
        indentLevel += 1;
      }

      function decreaseIndent() {
        indentLevel -= 1;
      }

      function addIndent() {
        if (indentLevel > -1) {
          const lastChar = md.slice(-1);
          if (lastChar === "\n") {
            md += "".padStart(indentLevel * 3);
          }
        }
      }

      function parseElement(element) {
        if (!element.tagName) {
          if (element.nodeType === Node.TEXT_NODE) {
            addIndent();
            md += "\n" + element.textContent.trim() + "\n";
          }
          return;
        }
        switch (element.tagName.toLowerCase()) {
          case "li":
            addIndent();
            md += "- ";
            break;
          case "ul":
          case "ol":
            increaseIndent();
            break;
        }

        element.childNodes.forEach((child) => {
          if (child.nodeType === Node.ELEMENT_NODE) {
            parseElement(child);
          } else if (child.nodeType === Node.TEXT_NODE) {
            addIndent();
            md += child.textContent.trim() + "\n";
          }
        });

        switch (element.tagName.toLowerCase()) {
          case "ul":
          case "ol":
            decreaseIndent();
            addIndent();
            break;
        }
      }

      dom.body.childNodes.forEach((child) => parseElement(child));
      md += "\n";
      return md;
    }

    // const unorderedLists = extractLargestOlBlocks(unorderedRegex);

    const orderedRegex = /<ol(?:\s+[^>]+)?>([\s\S]*?)<\/ol>/gi;
    const orderedLists = markdown.match(orderedRegex);
    if (orderedLists) {
      orderedLists.forEach((orderedList) => {
        // console.log(orderedList);
        console.log("-------------");
        const md = htmlToMd(orderedList);
        markdown = markdown.replace(orderedList, "\n" + md);
      });
    }

    function extractLargestUlBlocks(domCode) {
      // Find all <ul> blocks within the DOM code
      const ulBlocks = domCode.match(/<ul\b[^>]*>([\s\S]*?)<\/ul>/gi);

      if (!ulBlocks) {
        // Return an empty array if no <ul> blocks are found
        return [];
      }

      // Array to store the largest <ul> block from each list block
      const largestUlBlocks = [];

      // Iterate through each <ul> block
      for (let i = 0; i < ulBlocks.length; i++) {
        // Count the number of nested <ul> tags within the current block
        const nestedUlCount = (ulBlocks[i].match(/<ul\b/g) || []).length;

        if (nestedUlCount === 0) {
          // If the <ul> block has no nested <ul>, it is the largest in its list block
          largestUlBlocks.push(ulBlocks[i]);
        } else if (nestedUlCount > 0) {
          // If the <ul> block has nested <ul>, extract the innermost <ul> block
          const innermostUl = ulBlocks[i].match(
            /<ul\b[^>]*>([\s\S]*?)<\/ul>/i
          )[0];
          largestUlBlocks.push(innermostUl);
        }
      }

      return largestUlBlocks;
    }

    // const unorderedRegex =
    // /<ul(?:\s+[^>]+)?>([\s\S]*?)<\/ul>(?![\s\S]*<\/ul>)/gi;

    // const unorderedLists = markdown.match(unorderedRegex);
    const unorderedLists = extractLargestUlBlocks(markdown);

    if (unorderedLists) {
      unorderedLists.forEach((unorderedList) => {
        const md = htmlToMd(unorderedList);
        console.log(unorderedList);
        markdown = markdown.replace(unorderedList, "\n" + md);
      });
    }

    markdown = markdown.replace(/<\/li>/g, "");
    markdown = markdown.replace(/<\/ul>/g, "");

    const tableRegex = /<table>.*?<\/table>/gs;
    const tableRowRegex = /<tr>.*?<\/tr>/gs;
    const tableHeaderRegex = /<th.*?>(.*?)<\/th>/gs;
    const tableDataRegex = /<td.*?>(.*?)<\/td>/gs;

    const tables = html.match(tableRegex);
    if (tables) {
      tables.forEach((table) => {
        let markdownTable = "\n";
        const rows = table.match(tableRowRegex);
        if (rows) {
          rows.forEach((row) => {
            let markdownRow = "\n";
            const headers = row.match(tableHeaderRegex);
            if (headers) {
              headers.forEach((header) => {
                markdownRow += `| ${header.replace(tableHeaderRegex, "$1")} `;
              });
              markdownRow += "|\n";
              markdownRow += "| --- ".repeat(headers.length) + "|";
            }
            const data = row.match(tableDataRegex);
            if (data) {
              data.forEach((d) => {
                markdownRow += `| ${d.replace(tableDataRegex, "$1")} `;
              });
              markdownRow += "|";
            }
            markdownTable += markdownRow;
          });
        }
        markdown = markdown.replace(table, markdownTable);
      });
    }
    return markdown;
  }

  let element = document.querySelector(".text-base" && ".mx-auto");
  if (!element || element.innerText === undefined) {
    alert(chrome.i18n.getMessage("alert"));
    return;
  }

  const elements = document.querySelectorAll(".text-base" && ".mx-auto");
  let chatData = "";
  for (const element of elements) {
    try {
      if (element.querySelector(".whitespace-pre-wrap")) {
        let innerHtml = element.querySelector(".whitespace-pre-wrap").innerHTML;
        chatData += `${htmlToMarkdown(
          element.querySelectorAll("svg").length < 4 ? `**You:**` : `**ChatGPT:**`
        )}\n\n${htmlToMarkdown(innerHtml)}\n\n------------------\n\n`;
      }
    } catch (error) {
      console.error(error);
    }
  }

  let handle = await window.showSaveFilePicker({
    suggestedName: "Saved_ChatGPT_.md",
  });

  let stream = await handle.createWritable();
  await stream.write(chatData);
  await stream.close();
}

// function to copy the text to clipboard
async function copyToClipboard() {
  const elements = document.querySelectorAll(".text-base" && ".mx-auto");
  let chatData = "";
  for (const element of elements) {
    if (element.querySelector(".whitespace-pre-wrap")) {
      let innerText = element.querySelector(".whitespace-pre-wrap").innerText;
      console.log(element.querySelectorAll("svg").length);
      chatData += `${element.querySelectorAll("svg").length < 4 ? "You:" : "ChatGPT:"
        }\n\n${innerText}\n\n------------------\n\n`;
    }
  }

  if (!chatData || chatData === "") {
    return { success: false };
  }

  // Create a textarea element, copy the text, and remove the textarea
  const textarea = document.createElement("textarea");
  document.body.appendChild(textarea);
  textarea.value = chatData;
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
  return { success: true };
}
