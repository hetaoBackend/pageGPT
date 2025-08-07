// Background Script - Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('PageGPT已安装');
  
  // 设置默认配置
  chrome.storage.sync.set({
    customPrompt: "请根据这个网页的内容，生成一个有趣、幽默或者有启发性的弹窗消息。可以是一个有趣的观察、一个相关的笑话、或者一个有用的提示。"
  });
});

// 处理插件图标点击
chrome.action.onClicked.addListener((tab) => {
  // 这里可以添加额外的逻辑，比如快速分析
  console.log('插件图标被点击，当前标签页:', tab.url);
});

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'logAnalysis') {
    console.log('页面分析结果:', request.data);
  }
  
  // 可以在这里添加更多的后台处理逻辑
  return true;
});

// 处理标签页更新事件
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // 页面加载完成时的处理逻辑
    console.log('页面加载完成:', tab.url);
  }
});

// 错误处理
chrome.runtime.onStartup.addListener(() => {
  console.log('PageGPT启动');
});
