// Content Script - 在网页中运行
class AIWebAssistant {
  constructor() {
    this.isOverlayVisible = false;
    this.setupMessageListener();
  }

  // 设置消息监听器
  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('Content script收到消息:', request);

      if (request.action === 'ping') {
        sendResponse({ success: true, message: 'pong' });
        return true;
      }

      if (request.action === 'getPageContent') {
        const pageContent = this.extractPageContent();
        sendResponse({ success: true, content: pageContent });
        return true;
      }

      if (request.action === 'analyzePageWithAI') {
        this.analyzePageWithAI(request.baseUrl, request.modelName, request.apiKey, request.prompt)
          .then(result => {
            console.log('AI分析完成:', result);
            sendResponse(result);
          })
          .catch(error => {
            console.error('AI分析失败:', error);
            sendResponse({success: false, error: error.message});
          });
        return true; // 保持消息通道开放
      }
    });
  }

  // 提取页面内容
  extractPageContent() {
    const title = document.title;
    const url = window.location.href;
    
    // 提取主要文本内容
    const textContent = this.getMainTextContent();
    
    // 提取页面元数据
    const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
    const metaKeywords = document.querySelector('meta[name="keywords"]')?.content || '';
    
    return {
      title,
      url,
      textContent: textContent.substring(0, 2000), // 限制长度
      metaDescription,
      metaKeywords,
      domain: new URL(url).hostname
    };
  }

  // 获取主要文本内容
  getMainTextContent() {
    // 移除脚本和样式标签
    const scripts = document.querySelectorAll('script, style, nav, footer, aside');
    scripts.forEach(el => el.remove());
    
    // 尝试找到主要内容区域
    const mainSelectors = [
      'main', 
      'article', 
      '.content', 
      '.main-content', 
      '#content', 
      '#main',
      '.post-content',
      '.entry-content'
    ];
    
    let mainContent = null;
    for (const selector of mainSelectors) {
      mainContent = document.querySelector(selector);
      if (mainContent) break;
    }
    
    // 如果没找到主要内容区域，使用body
    if (!mainContent) {
      mainContent = document.body;
    }
    
    return mainContent.innerText.replace(/\s+/g, ' ').trim();
  }

  // 调用AI API分析页面
  async analyzePageWithAI(baseUrl, modelName, apiKey, prompt) {
    try {
      const pageContent = this.extractPageContent();
      
      const aiPrompt = `
网页信息:
标题: ${pageContent.title}
域名: ${pageContent.domain}
描述: ${pageContent.metaDescription}
内容摘要: ${pageContent.textContent}

用户要求: ${prompt}

请生成一个简短、有趣且相关的弹窗消息（不超过100字）。
`;

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            {
              role: 'user',
              content: aiPrompt
            }
          ],
          max_tokens: 150,
          temperature: 0.8
        })
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const data = await response.json();
      const aiMessage = data.choices[0].message.content.trim();
      
      // 显示弹窗
      this.showAIPopup(aiMessage, pageContent.title);
      
      return {success: true, message: aiMessage};
      
    } catch (error) {
      console.error('AI分析失败:', error);
      throw error;
    }
  }

  // 显示AI生成的弹窗
  showAIPopup(message, pageTitle) {
    // 移除现有弹窗
    this.removeExistingPopup();
    
    // 创建弹窗容器
    const overlay = document.createElement('div');
    overlay.id = 'ai-assistant-overlay';
    overlay.innerHTML = `
      <div class="ai-popup">
        <div class="ai-popup-header">
          <span class="ai-popup-icon">🤖</span>
          <span class="ai-popup-title">PageGPT说</span>
          <button class="ai-popup-close">&times;</button>
        </div>
        <div class="ai-popup-content">
          <p>${message}</p>
        </div>
        <div class="ai-popup-footer">
          <small>基于页面"${pageTitle}"生成</small>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    this.isOverlayVisible = true;
    
    // 添加事件监听器
    this.setupPopupEvents(overlay);
    
    // 添加动画效果
    setTimeout(() => {
      overlay.classList.add('show');
    }, 10);
    
    // 自动关闭（可选）
    setTimeout(() => {
      this.hidePopup();
    }, 10000); // 10秒后自动关闭
  }

  // 设置弹窗事件
  setupPopupEvents(overlay) {
    const closeBtn = overlay.querySelector('.ai-popup-close');
    closeBtn.addEventListener('click', () => this.hidePopup());
    
    // 点击背景关闭
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.hidePopup();
      }
    });
    
    // ESC键关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOverlayVisible) {
        this.hidePopup();
      }
    });
  }

  // 隐藏弹窗
  hidePopup() {
    const overlay = document.getElementById('ai-assistant-overlay');
    if (overlay) {
      overlay.classList.remove('show');
      setTimeout(() => {
        overlay.remove();
        this.isOverlayVisible = false;
      }, 300);
    }
  }

  // 移除现有弹窗
  removeExistingPopup() {
    const existing = document.getElementById('ai-assistant-overlay');
    if (existing) {
      existing.remove();
      this.isOverlayVisible = false;
    }
  }
}

// 初始化AI助手
const aiAssistant = new AIWebAssistant();
console.log('PageGPT Content Script 已加载');
