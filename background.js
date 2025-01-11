DEBUGMODE = true;
let maxVideoCount = -1; // 最大视频观看数
let videoCount = 0;    // 当前观看视频数
let sessionStart = null; // 当前会话的开始时间
if (DEBUGMODE) {
  console.log("background.js reloaded");
}
// 初始化监听器
chrome.runtime.onInstalled.addListener(() => {
  console.log("Bilibili Watch Control extension installed.");
});

// 监听来自 content.js 的消息
chrome.runtime.onMessage.addListener((message, sendResponse) => {
  if (message.type === "getMaxVideo") {
    sendResponse({ "maxVideoCount": maxVideoCount, "videoCount": videoCount });
  }
  else if (message.type === "startSession") {
    sessionStart = Date.now();
    if (DEBUGMODE) {
      console.log("Session started");
    }
  }
  else if (message.type === "incrementVideoCount") {
    checkVideoLimit();
    if(videoCount < maxVideoCount)
    { 
      videoCount++;
    }
    if (DEBUGMODE) {
      console.log("increment signal received");
    }
  }
  else if (message.type === "updateMaxVideoCount") {
    maxVideoCount = message.newMax;
    if (DEBUGMODE) {
      console.log("maxVideoCount updated to " + maxVideoCount);
    }
    sendResponse({ success: true });
  }
});

// 检查是否需要重定向
function checkVideoLimit() {
  if (videoCount + 1 > maxVideoCount) {
    console.log("正在重定向")
    setTimeout(() => {
      chrome.tabs.query({active:true,currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
          // todo
          if (DEBUGMODE) {
            console.log("No tabs found");
          }
          return;
        }
        chrome.tabs.update(tabs[0].id, { url: "http://localhost/suggest.html" });
      });
    }, 1000);
  }
}

// 定时任务：检查是否超过30分钟
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "checkSessionTime") {
    if (sessionStart && Date.now() - sessionStart > 30 * 60 * 1000) {
      sessionStart = Date.now();
      // TODO: 弹出提醒
      alert("You have watched for 30 minutes, please take a break.");
    }
  }
});

// 定期检查的定时器
chrome.alarms.create("checkSessionTime", { delayInMinutes: 1, periodInMinutes: 1 });