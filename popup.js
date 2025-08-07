document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 PageGPT插件开始初始化...');

  // 标记JavaScript已加载
  document.body.classList.add('js-loaded');

  // 页面切换相关元素
  const settingsTab = document.getElementById('settingsTab');
  const chatTab = document.getElementById('chatTab');
  const settingsPage = document.getElementById('settingsPage');
  const chatPage = document.getElementById('chatPage');

  // 立即检查是否应该显示对话页面，避免设置页面闪现
  chrome.storage.sync.get(['baseUrl', 'modelName', 'apiKey'], function(result) {
    if (result.apiKey && result.baseUrl && result.modelName) {
      console.log('🔄 检测到完整配置，立即切换到对话页面');
      // 立即切换，不使用延迟
      switchTab('chat');
    }
    // 如果配置不完整，设置页面已经是默认显示的，不需要额外操作
  });

  // 设置页面元素
  const baseUrlInput = document.getElementById('baseUrl');
  const modelNameInput = document.getElementById('modelName');
  const apiKeyInput = document.getElementById('apiKey');
  const systemPromptInput = document.getElementById('systemPrompt');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const settingsStatus = document.getElementById('settingsStatus');

  // 对话页面元素
  const currentPageTitle = document.getElementById('currentPageTitle');
  const currentPageUrlElement = document.getElementById('currentPageUrl');
  const messagesContainer = document.getElementById('messagesContainer');
  const messageInput = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');
  const clearChatBtn = document.getElementById('clearChatBtn');
  const refreshPageBtn = document.getElementById('refreshPageBtn');
  const chatStatsBtn = document.getElementById('chatStatsBtn');


  // 检查关键元素是否存在
  console.log('🔍 检查关键元素:');
  console.log('- saveSettingsBtn:', saveSettingsBtn ? '✅' : '❌');
  console.log('- settingsStatus:', settingsStatus ? '✅' : '❌');
  console.log('- baseUrlInput:', baseUrlInput ? '✅' : '❌');
  console.log('- messagesContainer:', messagesContainer ? '✅' : '❌');

  // 状态变量
  let currentTab = 'settings';
  let pageContext = null;
  let chatHistory = [];
  let currentPageUrl = null; // 用于区分不同页面的聊天记录

  // 页面切换功能
  function switchTab(tabName) {
    console.log(`🔄 切换到标签页: ${tabName}`);
    currentTab = tabName;

    if (!settingsTab || !chatTab || !settingsPage || !chatPage) {
      console.error('❌ 页面切换元素未找到');
      return;
    }

    // 更新标签页状态
    settingsTab.classList.toggle('active', tabName === 'settings');
    chatTab.classList.toggle('active', tabName === 'chat');

    // 切换页面
    settingsPage.classList.toggle('hidden', tabName !== 'settings');
    chatPage.classList.toggle('hidden', tabName !== 'chat');

    console.log(`✅ 页面切换完成: ${tabName}`);

    // 如果切换到对话页面，初始化页面信息
    if (tabName === 'chat') {
      console.log('🔄 初始化对话页面...');
      initializeChatPage();
      // 如果没有消息，显示欢迎消息
      if (messagesContainer && messagesContainer.children.length === 0) {
        console.log('📝 显示欢迎消息');
        showWelcomeMessage();
      }
    }
  }

  // 标签页点击事件
  settingsTab.addEventListener('click', () => switchTab('settings'));
  chatTab.addEventListener('click', () => switchTab('chat'));

  // 加载保存的设置
  console.log('📥 开始加载设置...');

  try {
    chrome.storage.sync.get(['baseUrl', 'modelName', 'apiKey', 'systemPrompt'], function(result) {
      if (chrome.runtime.lastError) {
        console.error('❌ 加载设置失败:', chrome.runtime.lastError);
        return;
      }

      console.log('📋 加载的设置:', result);

      if (result.baseUrl) {
        baseUrlInput.value = result.baseUrl;
      } else {
        baseUrlInput.value = "https://api.openai.com/v1/chat/completions";
      }

      if (result.modelName) {
        modelNameInput.value = result.modelName;
      } else {
        modelNameInput.value = "gpt-3.5-turbo";
      }

      if (result.apiKey) {
        apiKeyInput.value = result.apiKey;
      }

      if (result.systemPrompt) {
        systemPromptInput.value = result.systemPrompt;
      } else {
        systemPromptInput.value = "你是PageGPT，一个智能网页助手，能够分析网页内容并回答用户的问题。请基于提供的页面内容进行回答，保持友好、有帮助的语调。";
      }

      console.log('✅ 设置加载完成');
    });
  } catch (error) {
    console.error('❌ 加载设置时发生异常:', error);
  }

  // 保存设置
  function saveSettings() {
    console.log('💾 开始保存设置...');

    if (!baseUrlInput || !modelNameInput || !apiKeyInput || !systemPromptInput) {
      console.error('❌ 输入元素未找到');
      showSettingsStatus('页面元素加载错误，请刷新页面', 'error');
      return false;
    }

    const baseUrl = baseUrlInput.value.trim();
    const modelName = modelNameInput.value.trim();
    const apiKey = apiKeyInput.value.trim();
    const systemPrompt = systemPromptInput.value.trim();

    console.log('📝 设置值:', { baseUrl, modelName, apiKey: apiKey ? '***' : '', systemPrompt: systemPrompt.substring(0, 50) + '...' });

    // 验证必填字段
    if (!baseUrl) {
      console.warn('⚠️ Base URL为空');
      showSettingsStatus('请输入API Base URL', 'error');
      return false;
    }

    if (!modelName) {
      console.warn('⚠️ 模型名称为空');
      showSettingsStatus('请输入模型名称', 'error');
      return false;
    }

    if (!apiKey) {
      console.warn('⚠️ API密钥为空');
      showSettingsStatus('请输入API密钥', 'error');
      return false;
    }

    console.log('✅ 验证通过，开始保存到Chrome存储...');
    showSettingsStatus('正在保存设置...', 'loading');

    // 保存设置
    chrome.storage.sync.set({
      baseUrl: baseUrl,
      modelName: modelName,
      apiKey: apiKey,
      systemPrompt: systemPrompt
    }, function() {
      if (chrome.runtime.lastError) {
        console.error('❌ 保存失败:', chrome.runtime.lastError);
        showSettingsStatus('保存失败: ' + chrome.runtime.lastError.message, 'error');
        return;
      }

      console.log('✅ 设置保存成功');
      showSettingsStatus('设置保存成功！', 'success');

      // 保存成功后切换到对话页面
      setTimeout(() => {
        console.log('🔄 切换到对话页面');
        switchTab('chat');
      }, 1000);
    });

    return true;
  }

  // 显示设置状态消息
  function showSettingsStatus(message, type) {
    console.log(`设置状态: ${message} (${type})`);
    settingsStatus.textContent = message;
    settingsStatus.className = `status ${type}`;
    settingsStatus.style.display = 'block';

    if (type !== 'loading') {
      setTimeout(() => {
        settingsStatus.style.display = 'none';
      }, 3000);
    }
  }

  // 初始化对话页面
  async function initializeChatPage() {
    try {
      // 获取当前标签页信息
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true});

      if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
        currentPageTitle.textContent = '不支持的页面';
        currentPageUrlElement.textContent = '当前页面不支持PageGPT功能';
        return;
      }

      currentPageTitle.textContent = tab.title || '未知页面';
      currentPageUrlElement.textContent = tab.url;

      // 设置当前页面URL用于聊天记录
      currentPageUrl = tab.url;

      // 获取页面内容
      await getPageContext(tab.id);

      // 加载该页面的聊天记录
      loadChatHistory();

    } catch (error) {
      console.error('初始化对话页面失败:', error);
      currentPageTitle.textContent = '获取失败';
      currentPageUrlElement.textContent = '无法获取页面信息';
    }
  }

  // 获取页面上下文
  async function getPageContext(tabId) {
    return new Promise((resolve) => {
      // 首先检查content script是否已经加载
      chrome.tabs.sendMessage(tabId, { action: 'ping' }, function(response) {
        if (chrome.runtime.lastError) {
          // Content script未加载，尝试注入
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
          }).then(() => {
            setTimeout(() => {
              requestPageContent(tabId, resolve);
            }, 100);
          }).catch((error) => {
            console.error('注入content script失败:', error);
            resolve(null);
          });
        } else {
          // Content script已加载
          requestPageContent(tabId, resolve);
        }
      });
    });
  }

  // 请求页面内容
  function requestPageContent(tabId, callback) {
    chrome.tabs.sendMessage(tabId, {
      action: 'getPageContent'
    }, function(response) {
      if (chrome.runtime.lastError) {
        console.error('获取页面内容失败:', chrome.runtime.lastError);
        callback(null);
      } else if (response && response.success) {
        pageContext = response.content;
        console.log('页面内容获取成功:', pageContext);
        callback(pageContext);
      } else {
        console.error('页面内容获取失败:', response?.error);
        callback(null);
      }
    });
  }

  // 配置Markdown渲染器
  function setupMarkdownRenderer() {
    // 检查本地Markdown渲染器是否已加载
    if (typeof window.markdownRenderer !== 'undefined') {
      console.log('本地Markdown渲染器已就绪');
    } else {
      console.warn('Markdown渲染器未加载，将使用基本文本格式');
    }
  }

  // 渲染Markdown内容
  function renderMarkdown(content) {
    if (!content) return '';

    // 使用本地Markdown渲染器
    if (typeof window.markdownRenderer !== 'undefined') {
      try {
        return window.markdownRenderer.render(content);
      } catch (error) {
        console.error('Markdown渲染失败:', error);
        return content.replace(/\n/g, '<br>');
      }
    }

    // 如果渲染器未加载，使用基本格式化
    return formatBasicText(content);
  }

  // 基本文本格式化（备用方案）
  function formatBasicText(content) {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // 粗体
      .replace(/\*(.*?)\*/g, '<em>$1</em>')              // 斜体
      .replace(/`(.*?)`/g, '<code>$1</code>')            // 内联代码
      .replace(/\n/g, '<br>');                           // 换行
  }

  // 添加消息到DOM（内部函数）
  function addMessageToDOM(content, isUser = false, saveToHistory = true, messageId = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    if (messageId) {
      messageDiv.id = messageId;
    }

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';

    if (isUser) {
      // 用户消息保持纯文本
      messageContent.textContent = content;
    } else {
      // AI消息支持Markdown
      messageContent.innerHTML = renderMarkdown(content);
      // 高亮代码块
      setTimeout(() => {
        if (typeof window.hljs !== 'undefined') {
          messageContent.querySelectorAll('pre code').forEach((block) => {
            window.hljs.highlightElement(block);
          });
        }
      }, 10); // 短暂延迟确保DOM更新完成
    }

    const messageTime = document.createElement('div');
    messageTime.className = 'message-time';
    messageTime.textContent = new Date().toLocaleTimeString();

    messageDiv.appendChild(messageContent);
    messageDiv.appendChild(messageTime);

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // 保存到历史记录
    if (saveToHistory && !messageId) { // 只有完整消息才保存到历史
      chatHistory.push({
        content: content,
        isUser: isUser,
        timestamp: Date.now()
      });

      // 保存到存储
      saveChatHistory();
    }

    return messageDiv;
  }

  // 添加消息到对话（公共接口）
  function addMessage(content, isUser = false, messageId = null) {
    return addMessageToDOM(content, isUser, true, messageId);
  }

  // 创建流式消息
  function createStreamingMessage() {
    const messageId = 'streaming-' + Date.now();
    const messageDiv = addMessage('', false, messageId);
    messageDiv.classList.add('streaming');

    const messageContent = messageDiv.querySelector('.message-content');
    messageContent.innerHTML = '<span class="streaming-cursor"></span>';

    return {
      messageDiv: messageDiv,
      messageContent: messageContent,
      messageId: messageId
    };
  }

  // 更新流式消息内容
  function updateStreamingMessage(streamingMessage, content, isComplete = false) {
    const { messageContent, messageDiv } = streamingMessage;

    if (isComplete) {
      // 完成时移除流式状态并渲染最终内容
      messageDiv.classList.remove('streaming');
      messageContent.innerHTML = renderMarkdown(content);

      // 高亮代码块
      setTimeout(() => {
        if (typeof window.hljs !== 'undefined') {
          messageContent.querySelectorAll('pre code').forEach((block) => {
            window.hljs.highlightElement(block);
          });
        }
      }, 10);

      // 保存到历史记录
      chatHistory.push({
        content: content,
        isUser: false,
        timestamp: Date.now()
      });

      // 保存到存储
      saveChatHistory();
    } else {
      // 流式更新时显示当前内容加光标
      messageContent.innerHTML = renderMarkdown(content) + '<span class="streaming-cursor"></span>';
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // 显示输入指示器
  function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message typing-indicator';
    typingDiv.id = 'typingIndicator';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = `
      AI正在思考
      <div class="typing-dots">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;

    typingDiv.appendChild(messageContent);
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // 隐藏输入指示器
  function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  // 发送消息
  async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    // 检查设置
    const settings = await new Promise(resolve => {
      chrome.storage.sync.get(['baseUrl', 'modelName', 'apiKey', 'systemPrompt'], resolve);
    });

    if (!settings.apiKey || !settings.baseUrl || !settings.modelName) {
      addMessage('⚠️ 请先在设置页面配置API信息', false);
      switchTab('settings');
      return;
    }

    // 检查页面上下文
    if (!pageContext) {
      addMessage('⚠️ 正在获取页面信息，请稍后重试...', false);
      await initializeChatPage();
      return;
    }

    // 添加用户消息
    addMessage(message, true);
    messageInput.value = '';
    updateSendButton();

    // 隐藏打字指示器，创建流式消息
    hideTypingIndicator();
    const streamingMessage = createStreamingMessage();
    sendBtn.classList.add('loading');

    try {
      // 调用AI API (流式)
      await callAIStream(
        message,
        settings,
        // onChunk: 处理流式数据
        (content) => {
          updateStreamingMessage(streamingMessage, content, false);
        },
        // onComplete: 完成时的处理
        (finalContent) => {
          updateStreamingMessage(streamingMessage, finalContent, true);
          sendBtn.classList.remove('loading');
        },
        // onError: 错误处理
        (error) => {
          console.error('AI调用失败:', error);

          // 移除流式消息
          streamingMessage.messageDiv.remove();

          let errorMessage = '抱歉，发生了错误: ';
          if (error.message.includes('401')) {
            errorMessage += 'API密钥无效，请检查设置';
          } else if (error.message.includes('429')) {
            errorMessage += 'API调用频率过高，请稍后重试';
          } else if (error.message.includes('500')) {
            errorMessage += 'AI服务暂时不可用，请稍后重试';
          } else {
            errorMessage += error.message;
          }

          addMessage(`❌ ${errorMessage}`, false);
          sendBtn.classList.remove('loading');
        }
      );
    } catch (error) {
      // 这里处理callAIStream函数本身的错误
      console.error('发送消息失败:', error);
      streamingMessage.messageDiv.remove();
      addMessage(`❌ 发送失败: ${error.message}`, false);
      sendBtn.classList.remove('loading');
    }
  }

  // 调用AI API (支持流式输出)
  async function callAIStream(userMessage, settings, onChunk, onComplete, onError) {
    // 构建消息历史
    const messages = [
      {
        role: 'system',
        content: `${settings.systemPrompt}\n\n当前页面信息:\n标题: ${pageContext?.title || '未知'}\nURL: ${pageContext?.url || '未知'}\n内容摘要: ${pageContext?.textContent || '无内容'}`
      }
    ];

    // 添加最近的对话历史（最多10条）
    const recentHistory = chatHistory.slice(-20);
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      });
    });

    // 添加当前用户消息
    messages.push({
      role: 'user',
      content: userMessage
    });

    try {
      const response = await fetch(settings.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
          model: settings.modelName,
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          onComplete(fullContent);
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // 保留不完整的行

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.trim() === 'data: [DONE]') {
            onComplete(fullContent);
            return;
          }

          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6);
              const data = JSON.parse(jsonStr);

              if (data.choices && data.choices[0] && data.choices[0].delta) {
                const delta = data.choices[0].delta;
                if (delta.content) {
                  fullContent += delta.content;
                  onChunk(fullContent);
                }
              }
            } catch (e) {
              console.warn('解析SSE数据失败:', e, line);
            }
          }
        }
      }
    } catch (error) {
      onError(error);
    }
  }

  // 更新发送按钮状态
  function updateSendButton() {
    const hasText = messageInput.value.trim().length > 0;
    sendBtn.disabled = !hasText;
  }

  // 清空对话（带确认）
  function clearChat() {
    // 如果有聊天记录，显示确认对话
    if (chatHistory.length > 0) {
      const confirmed = confirm('确定要清空所有聊天记录吗？此操作无法撤销。');
      if (!confirmed) {
        return; // 用户取消，不执行清空
      }
    }

    // 执行清空
    chatHistory = [];

    // 清除存储中的聊天记录
    if (currentPageUrl) {
      const pageKey = getPageKey(currentPageUrl);
      const storageKey = `chatHistory_${pageKey}`;
      chrome.storage.local.remove([storageKey], () => {
        console.log('聊天记录已从存储中清除');
      });
    }

    // 重新显示欢迎消息
    showWelcomeMessage();
  }

  // 显示欢迎消息
  function showWelcomeMessage() {
    // 清除所有消息并重新添加欢迎消息
    messagesContainer.innerHTML = '';

    const welcomeContent = `👋 **你好！我是PageGPT**

我已经分析了当前页面的内容，可以回答关于这个页面的任何问题。`;

    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'welcome-message';

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai-message';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = renderMarkdown(welcomeContent);

    messageDiv.appendChild(messageContent);
    welcomeDiv.appendChild(messageDiv);
    messagesContainer.appendChild(welcomeDiv);
  }

  // 事件监听器
  console.log('🔗 设置事件监听器...');

  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', function(e) {
      console.log('🖱️ 保存设置按钮被点击');
      e.preventDefault();
      saveSettings();
    });
    console.log('✅ 保存设置按钮事件已绑定');
  } else {
    console.error('❌ 保存设置按钮未找到');
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
    console.log('✅ 发送按钮事件已绑定');
  }

  if (clearChatBtn) {
    clearChatBtn.addEventListener('click', clearChat);
    console.log('✅ 清空聊天按钮事件已绑定');
  }

  if (refreshPageBtn) {
    refreshPageBtn.addEventListener('click', initializeChatPage);
    console.log('✅ 刷新页面按钮事件已绑定');
  }

  if (chatStatsBtn) {
    chatStatsBtn.addEventListener('click', showChatStats);
    console.log('✅ 聊天统计按钮事件已绑定');
  }



  messageInput.addEventListener('input', updateSendButton);
  messageInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) {
        sendMessage();
      }
    }
  });

  // 自动调整输入框高度
  messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
  });

  // 聊天记录管理功能

  // 生成页面唯一标识
  function getPageKey(url) {
    if (!url) return 'default';
    try {
      const urlObj = new URL(url);
      return `${urlObj.hostname}${urlObj.pathname}`;
    } catch (e) {
      return url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    }
  }

  // 保存聊天记录
  function saveChatHistory() {
    if (!currentPageUrl) return;

    const pageKey = getPageKey(currentPageUrl);
    const storageKey = `chatHistory_${pageKey}`;

    const chatData = {
      url: currentPageUrl,
      history: chatHistory,
      timestamp: Date.now(),
      pageTitle: pageContext?.title || '未知页面'
    };

    chrome.storage.local.set({
      [storageKey]: chatData
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('保存聊天记录失败:', chrome.runtime.lastError);
      } else {
        console.log('聊天记录已保存:', storageKey);
      }
    });
  }

  // 加载聊天记录
  function loadChatHistory() {
    // 等待页面URL设置后再加载
    setTimeout(() => {
      if (!currentPageUrl) return;

      const pageKey = getPageKey(currentPageUrl);
      const storageKey = `chatHistory_${pageKey}`;

      chrome.storage.local.get([storageKey], (result) => {
        if (chrome.runtime.lastError) {
          console.error('加载聊天记录失败:', chrome.runtime.lastError);
          return;
        }

        const chatData = result[storageKey];
        if (chatData && chatData.history && Array.isArray(chatData.history)) {
          chatHistory = chatData.history;
          console.log('聊天记录已加载:', chatHistory.length, '条消息');

          // 重新渲染聊天界面
          renderChatHistory();
        } else {
          console.log('没有找到聊天记录，使用默认欢迎消息');
          chatHistory = [];
          showWelcomeMessage(); // 显示欢迎消息
        }
      });
    }, 500);
  }

  // 渲染聊天历史
  function renderChatHistory() {
    // 清空当前消息
    messagesContainer.innerHTML = '';

    if (chatHistory.length === 0) {
      showWelcomeMessage(); // 显示欢迎消息
      return;
    }

    // 渲染历史消息
    chatHistory.forEach(msg => {
      addMessageToDOM(msg.content, msg.isUser, false); // false表示不保存到历史
    });

    // 滚动到底部
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // 清理旧的聊天记录（保留最近30天的记录）
  function cleanupOldChatHistory() {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

    chrome.storage.local.get(null, (allData) => {
      if (chrome.runtime.lastError) return;

      const keysToRemove = [];
      Object.keys(allData).forEach(key => {
        if (key.startsWith('chatHistory_')) {
          const data = allData[key];
          if (data.timestamp && data.timestamp < thirtyDaysAgo) {
            keysToRemove.push(key);
          }
        }
      });

      if (keysToRemove.length > 0) {
        chrome.storage.local.remove(keysToRemove, () => {
          console.log('清理了', keysToRemove.length, '个过期的聊天记录');
        });
      }
    });
  }

  // 显示聊天统计信息
  function showChatStats() {
    const userMessages = chatHistory.filter(msg => msg.isUser).length;
    const aiMessages = chatHistory.filter(msg => !msg.isUser).length;
    const totalMessages = chatHistory.length;

    let statsMessage = `📊 **聊天统计信息**\n\n`;
    statsMessage += `- 总消息数: ${totalMessages}\n`;
    statsMessage += `- 用户消息: ${userMessages}\n`;
    statsMessage += `- AI回复: ${aiMessages}\n`;

    if (totalMessages > 0) {
      const firstMessage = new Date(chatHistory[0].timestamp).toLocaleString();
      const lastMessage = new Date(chatHistory[chatHistory.length - 1].timestamp).toLocaleString();
      statsMessage += `- 首条消息: ${firstMessage}\n`;
      statsMessage += `- 最新消息: ${lastMessage}\n`;
    }

    statsMessage += `\n💾 聊天记录会自动保存，关闭插件后重新打开仍可查看历史对话。`;

    addMessage(statsMessage, false);
  }



  // 初始化Markdown渲染器
  setupMarkdownRenderer();

  // 加载聊天记录
  loadChatHistory();

  // 清理旧的聊天记录（异步执行，不阻塞界面）
  setTimeout(cleanupOldChatHistory, 1000);
});
