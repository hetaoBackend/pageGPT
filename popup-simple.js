// 简化版本的popup.js，用于调试基本功能

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 简化版AI助手开始初始化...');
  
  // 获取元素
  const settingsTab = document.getElementById('settingsTab');
  const chatTab = document.getElementById('chatTab');
  const settingsPage = document.getElementById('settingsPage');
  const chatPage = document.getElementById('chatPage');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const settingsStatus = document.getElementById('settingsStatus');
  const baseUrlInput = document.getElementById('baseUrl');
  const modelNameInput = document.getElementById('modelName');
  const apiKeyInput = document.getElementById('apiKey');
  const systemPromptInput = document.getElementById('systemPrompt');
  
  console.log('🔍 元素检查:');
  console.log('- settingsTab:', settingsTab ? '✅' : '❌');
  console.log('- chatTab:', chatTab ? '✅' : '❌');
  console.log('- saveSettingsBtn:', saveSettingsBtn ? '✅' : '❌');
  console.log('- settingsStatus:', settingsStatus ? '✅' : '❌');
  console.log('- baseUrlInput:', baseUrlInput ? '✅' : '❌');
  
  // 显示状态消息
  function showStatus(message, type) {
    console.log(`📢 状态: ${message} (${type})`);
    if (settingsStatus) {
      settingsStatus.textContent = message;
      settingsStatus.className = `status ${type}`;
      settingsStatus.style.display = 'block';
      
      if (type !== 'loading') {
        setTimeout(() => {
          settingsStatus.style.display = 'none';
        }, 3000);
      }
    }
  }
  
  // 页面切换
  function switchTab(tabName) {
    console.log(`🔄 切换到: ${tabName}`);
    
    if (settingsTab && chatTab && settingsPage && chatPage) {
      settingsTab.classList.toggle('active', tabName === 'settings');
      chatTab.classList.toggle('active', tabName === 'chat');
      settingsPage.classList.toggle('hidden', tabName !== 'settings');
      chatPage.classList.toggle('hidden', tabName !== 'chat');
      console.log('✅ 页面切换完成');
    } else {
      console.error('❌ 页面切换元素缺失');
    }
  }
  
  // 保存设置
  function saveSettings() {
    console.log('💾 开始保存设置...');
    
    if (!baseUrlInput || !modelNameInput || !apiKeyInput || !systemPromptInput) {
      console.error('❌ 输入元素缺失');
      showStatus('页面元素错误', 'error');
      return;
    }
    
    const baseUrl = baseUrlInput.value.trim();
    const modelName = modelNameInput.value.trim();
    const apiKey = apiKeyInput.value.trim();
    const systemPrompt = systemPromptInput.value.trim();
    
    console.log('📝 设置值:', { 
      baseUrl, 
      modelName, 
      apiKey: apiKey ? '***' : '', 
      systemPrompt: systemPrompt.substring(0, 30) + '...' 
    });
    
    // 验证
    if (!baseUrl) {
      showStatus('请输入API Base URL', 'error');
      return;
    }
    if (!modelName) {
      showStatus('请输入模型名称', 'error');
      return;
    }
    if (!apiKey) {
      showStatus('请输入API密钥', 'error');
      return;
    }
    
    showStatus('正在保存...', 'loading');
    
    // 保存到Chrome存储
    try {
      chrome.storage.sync.set({
        baseUrl: baseUrl,
        modelName: modelName,
        apiKey: apiKey,
        systemPrompt: systemPrompt
      }, function() {
        if (chrome.runtime.lastError) {
          console.error('❌ 保存失败:', chrome.runtime.lastError);
          showStatus('保存失败: ' + chrome.runtime.lastError.message, 'error');
        } else {
          console.log('✅ 保存成功');
          showStatus('保存成功！', 'success');
          
          // 切换到对话页面
          setTimeout(() => {
            switchTab('chat');
          }, 1000);
        }
      });
    } catch (error) {
      console.error('❌ 保存异常:', error);
      showStatus('保存异常: ' + error.message, 'error');
    }
  }
  
  // 加载设置
  function loadSettings() {
    console.log('📥 加载设置...');
    
    try {
      chrome.storage.sync.get(['baseUrl', 'modelName', 'apiKey', 'systemPrompt'], function(result) {
        if (chrome.runtime.lastError) {
          console.error('❌ 加载失败:', chrome.runtime.lastError);
          return;
        }
        
        console.log('📋 加载结果:', result);
        
        // 设置默认值
        if (baseUrlInput) {
          baseUrlInput.value = result.baseUrl || 'https://api.openai.com/v1/chat/completions';
        }
        if (modelNameInput) {
          modelNameInput.value = result.modelName || 'gpt-3.5-turbo';
        }
        if (apiKeyInput) {
          apiKeyInput.value = result.apiKey || '';
        }
        if (systemPromptInput) {
          systemPromptInput.value = result.systemPrompt || '你是PageGPT，一个智能网页助手，能够分析网页内容并回答用户的问题。';
        }
        
        console.log('✅ 设置加载完成');
        
        // 如果有完整配置，切换到对话页面
        if (result.apiKey && result.baseUrl && result.modelName) {
          console.log('🔄 检测到完整配置，切换到对话页面');
          setTimeout(() => switchTab('chat'), 100);
        }
      });
    } catch (error) {
      console.error('❌ 加载异常:', error);
    }
  }
  
  // 设置事件监听器
  console.log('🔗 设置事件监听器...');
  
  if (settingsTab) {
    settingsTab.addEventListener('click', () => switchTab('settings'));
    console.log('✅ 设置标签页事件已绑定');
  }
  
  if (chatTab) {
    chatTab.addEventListener('click', () => switchTab('chat'));
    console.log('✅ 对话标签页事件已绑定');
  }
  
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', function(e) {
      console.log('🖱️ 保存按钮被点击');
      e.preventDefault();
      saveSettings();
    });
    console.log('✅ 保存按钮事件已绑定');
  } else {
    console.error('❌ 保存按钮未找到');
  }
  
  // 加载设置
  setTimeout(loadSettings, 100);
  
  console.log('🎉 简化版初始化完成');
});

console.log('📄 简化版popup.js已加载');
