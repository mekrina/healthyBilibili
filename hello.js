const abcd = document.querySelector(".video-like-info.video-toolbar-item-text");
if(!(abcd instanceof Node)){
  console.error("abcd not found");
}
new MutationObserver(() => {
  console.log("hello world");
}).observe(abcd, {characterData: true});