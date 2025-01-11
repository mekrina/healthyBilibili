new MutationObserver(() => {
    console.log("title changed");
  }).observe(titleNode, { subtree: true, childList: true });