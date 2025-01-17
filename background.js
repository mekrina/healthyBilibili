DEBUGMODE = true;

//执行初始化操作
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.set({ 'maxVideoCount': -1 , 'videoCount': 0 , 'sessionStart': null })
});
let maxVideoCount,videoCount;

function getStorageItems(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (data) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(data);
      }
    });
  });
}
const data = await getStorageItems(['maxVideoCount','videoCount']);
maxVideoCount = data.maxVideoCount || -1;
videoCount = data.videoCount || 0;

if (DEBUGMODE) {
  console.log("background.js reloaded");
}

// 监听来自 content.js 的消息
chrome.runtime.onMessage.addListener((message,sender, sendResponse) => {
  if (message.type === "getMaxVideo") {
    sendResponse({ "maxVideoCount": maxVideoCount, "videoCount": videoCount });
  }
  else if (message.type === "startSession") {
    chrome.storage.set('sessionStart',Date.now());
    if (DEBUGMODE) {
      console.log("Session started");
    }
  }
  else if (message.type === "incrementVideoCount") {
    checkVideoLimit();
    if(videoCount < maxVideoCount)
    { 
      videoCount++;
      chrome.storage.set({'videoCount':videoCount})
    }
    if (DEBUGMODE) {
      console.log("increment signal received");
    }
  }
  else if (message.type === "updateMaxVideoCount") {
    maxVideoCount = message.newMax;
    chrome.storage.set({'maxVideoCount':maxVideoCount});
    if (DEBUGMODE) {
      console.log("maxVideoCount updated to " + maxVideoCount);
    }
  }
  sendResponse({ success: true });
});

// 检查是否需要重定向
function checkVideoLimit() {
  if (videoCount + 1 > maxVideoCount) {
    console.log("正在重定向")
    setTimeout( async () => {
      let tabs = await chrome.tabs.query({active:true,currentWindow: true })
        if (tabs.length === 0) {
          // todo
          if (DEBUGMODE) {
            console.log("No tabs found");
          }
          return;
        }
        chrome.tabs.update(tabs[0].id, { url: "http://localhost/suggest.html" });;
    }, 1000);
  }
}

// 定时任务：检查是否超过30分钟
chrome.alarms.onAlarm.addListener(async () => {
  let sessionStart = await getStorageItems('sessionStart').sessionStart;
  if (alarm.name === "checkSessionTime") {
    if (sessionStart && Date.now() - sessionStart > 30 * 60 * 1000) {
      chrome.storage.set({'sessionStart:': Date.now()});
      // TODO: 弹出提醒
      alert("You have watched for 30 minutes, please take a break.");
    }
  }
});

// 定期检查的定时器
chrome.alarms.create("checkSessionTime", { delayInMinutes: 11, periodInMinutes: 11 });