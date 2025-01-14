const likeNum = document.querySelector(".video-like-info.video-toolbar-item-text") || document.querySelector(".info-text");
if (!likeNum) {
  console.error("likeNum not found");
}
new MutationObserver(() => {
  console.log("hello world");
}).observe(likeNum, {childList: true, subtree: true, characterData: true});