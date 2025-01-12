let DEBUGMODE = true;
// 向页面插入输入框  
function insertInputBox() {  
  const container = document.createElement("div");  
  container.id = "video-limit-container";  
  container.style.position = "fixed";  
  container.style.top = "10px";  
  container.style.right = "10px";  
  container.style.zIndex = "9999";  
  container.style.background = "rgba(0, 0, 0, 0.8)";  
  container.style.color = "white";  
  container.style.padding = "10px";  
  container.style.borderRadius = "5px";  

  const label = document.createElement("label");  
  label.innerText = `current：${videoCount}`;  
  label.style.marginRight = "10px";  

  const input = document.createElement("input");  
  input.type = "number";  
  input.style.width = "50px";  
  input.style.marginRight = "10px";  

  const button = document.createElement("button");
  button.innerText = "设置";  
  button.style.background = "green";  
  button.style.color = "white";  
  button.style.border = "none";  
  button.style.padding = "5px 10px";  
  button.style.cursor = "pointer";  

  button.addEventListener("click", () => {  
    const newMax = parseInt(input.value, 10);  
    if (isNaN(newMax) || newMax <= 0) {  
      alert("请输入一个有效的正整数。");  
      return;  
    }
    if (DEBUGMODE) {
      console.log("button clicked");
    }
    chrome.runtime.sendMessage({ type: "updateMaxVideoCount", newMax }, (response) => {  
      if (response && response.success) {  
        if(DEBUGMODE){
          console.log("maxVideoCount updated to " + newMax);
        }
        container.style.display = "none"; // 隐藏容器
      }
      else if(DEBUGMODE){
        console.log("broken when updating maxVideoCount");
      }
    });  
  });  
  container.appendChild(label);  
  container.appendChild(input);  
  container.appendChild(button);  
  document.body.appendChild(container);  
}  
function sendMessagePromise(message) {
  return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
          } else {
              resolve(response);
          }
      });
  });
}
async function getMaxVideo() {  
    await sendMessagePromise({ type: "getMaxVideo" })
    .then((response) => {  
      maxVideoCount = response.maxVideoCount;  
      videoCount = response.videoCount;  
    })
    .catch((error) => {  
      console.error(error);
    });  
}
async function updateMaxVideoCountAndRedirect() {
  try {
      await sendMessagePromise({ type: "updateMaxVideoCount", newMax: -1 });
      window.location.href = "https://www.bilibili.com";
  } catch (error) {
      console.error(error);
  }
}
async function incremet() {
    console.log("videoCount++");
    await sendMessagePromise({ type: "incrementVideoCount" }).catch(console.error);
}

function trimEnd(str) {
  return str.replace(/\/$/, "");
}
// function debounce(callback, delay) {
//   let timeout;
//   return function() {
//     const context = this;
//     const args = arguments;
//     clearTimeout(timeout);
//     timeout = setTimeout(() => {
//       callback.apply(context, args);
//     }, delay);
//   };
// }


// 向 background.js 发送会话开始信号
var maxVideoCount = -2;
var videoCount = 0;

if (DEBUGMODE){
  console.log("content.js loaded");
}

if (window.location.href.indexOf("bilibili.com") > -1) {
    (async () => {
      await getMaxVideo();
      if (maxVideoCount === -1) {
        chrome.runtime.sendMessage({ type: "startSession" });
        insertInputBox();
        if (DEBUGMODE){
          console.log("maxVideoCount = -1, please reset the maxVideoCount");
        }
      }
      if (DEBUGMODE){
        console.log(location.href);
      }
      if (window.location.href.includes("video") || window.location.href.includes("bangumi/play")) {
        if (DEBUGMODE){
          console.log("oh you are watching a video");
        }
        let lastUrl = trimEnd(location.href.split("?")[0]);
        incremet();
        const likeNum = document.querySelector(".video-like-info.video-toolbar-item-text");
        if(!(likeNum instanceof Node)){
          console.error("likeNum not found");
          return;
        }
        new MutationObserver(() => {
          if (window.location.href.includes("video") || window.location.href.includes("bangumi/play")) {
            let currentUrl = trimEnd(location.href.split("?")[0]);
            if (currentUrl !== lastUrl) {
              if (DEBUGMODE){
                console.log(`url changed to ${currentUrl}`);
              }
              incremet();
              lastUrl = currentUrl;
            }
          }
        }).observe(likeNum, {childList: true, subtree: true});
      }
    })();
}
else if (window.location.href.indexOf("http://localhost") > -1) {
  const links = document.querySelectorAll("a");
  links.forEach((link) => {
    if (link.href.includes("bilibili.com")) {
      link.addEventListener("click", () => {
        updateMaxVideoCountAndRedirect();
      });
    }
  });
}