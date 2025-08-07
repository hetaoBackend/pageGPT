// 简单但功能完整的Markdown渲染器
// 专为Chrome扩展设计，无需外部依赖

class MarkdownRenderer {
  constructor() {
    this.rules = [
      // 标题 (### ## #)
      {
        pattern: /^(#{1,6})\s+(.+)$/gm,
        replacement: (match, hashes, text) => {
          const level = hashes.length;
          return `<h${level}>${text.trim()}</h${level}>`;
        }
      },
      
      // 粗体 **text** 或 __text__
      {
        pattern: /\*\*(.*?)\*\*/g,
        replacement: '<strong>$1</strong>'
      },
      {
        pattern: /__(.*?)__/g,
        replacement: '<strong>$1</strong>'
      },
      
      // 斜体 *text* 或 _text_
      {
        pattern: /\*(.*?)\*/g,
        replacement: '<em>$1</em>'
      },
      {
        pattern: /_(.*?)_/g,
        replacement: '<em>$1</em>'
      },
      
      // 内联代码 `code`
      {
        pattern: /`([^`]+)`/g,
        replacement: '<code>$1</code>'
      },
      
      // 链接 [text](url)
      {
        pattern: /\[([^\]]+)\]\(([^)]+)\)/g,
        replacement: '<a href="$2" target="_blank">$1</a>'
      },
      
      // 删除线 ~~text~~
      {
        pattern: /~~(.*?)~~/g,
        replacement: '<del>$1</del>'
      }
    ];
  }

  // 渲染Markdown文本
  render(markdown) {
    if (!markdown) return '';
    
    let html = markdown;
    
    // 处理代码块 (必须在其他规则之前处理)
    html = this.renderCodeBlocks(html);
    
    // 处理引用块
    html = this.renderBlockquotes(html);
    
    // 处理列表
    html = this.renderLists(html);
    
    // 处理表格
    html = this.renderTables(html);
    
    // 应用内联规则
    this.rules.forEach(rule => {
      if (typeof rule.replacement === 'function') {
        html = html.replace(rule.pattern, rule.replacement);
      } else {
        html = html.replace(rule.pattern, rule.replacement);
      }
    });
    
    // 处理段落和换行
    html = this.renderParagraphs(html);
    
    return html;
  }

  // 渲染代码块
  renderCodeBlocks(text) {
    // 处理围栏代码块 ```language\ncode\n```
    text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
      const lang = language ? ` class="language-${language}"` : '';
      return `<pre><code${lang}>${this.escapeHtml(code.trim())}</code></pre>`;
    });
    
    // 处理简单代码块 ```\ncode\n```
    text = text.replace(/```\n([\s\S]*?)```/g, (match, code) => {
      return `<pre><code>${this.escapeHtml(code.trim())}</code></pre>`;
    });
    
    return text;
  }

  // 渲染引用块
  renderBlockquotes(text) {
    return text.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');
  }

  // 渲染列表
  renderLists(text) {
    // 处理有序列表
    text = text.replace(/^(\d+\.\s+.+(?:\n\d+\.\s+.+)*)/gm, (match) => {
      const items = match.trim().split('\n').map(line => {
        const content = line.replace(/^\d+\.\s+/, '').trim();
        return `<li>${content}</li>`;
      }).join('');
      return `<ol>${items}</ol>`;
    });

    // 处理无序列表
    text = text.replace(/^([-*+]\s+.+(?:\n[-*+]\s+.+)*)/gm, (match) => {
      const items = match.trim().split('\n').map(line => {
        const content = line.replace(/^[-*+]\s+/, '').trim();
        return `<li>${content}</li>`;
      }).join('');
      return `<ul>${items}</ul>`;
    });

    return text;
  }

  // 渲染表格
  renderTables(text) {
    // 匹配表格格式: | 列1 | 列2 | \n |-----|-----| \n | 数据1 | 数据2 |
    const tableRegex = /^\|.+\|\s*\n\|[-:\s|]+\|\s*\n(\|.+\|\s*\n?)+/gm;

    return text.replace(tableRegex, (match) => {
      const lines = match.trim().split('\n').filter(line => line.trim());
      if (lines.length < 3) return match; // 至少需要标题、分隔符、数据行

      const headers = this.parseTableRow(lines[0]);
      const dataRows = lines.slice(2).map(line => this.parseTableRow(line));

      const headerHtml = `<thead><tr>${headers.map(cell => `<th>${cell}</th>`).join('')}</tr></thead>`;
      const bodyHtml = `<tbody>${dataRows.map(row =>
        `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
      ).join('')}</tbody>`;

      return `<table>${headerHtml}${bodyHtml}</table>`;
    });
  }

  // 解析表格行
  parseTableRow(row) {
    return row.split('|').slice(1, -1).map(cell => cell.trim());
  }

  // 渲染段落
  renderParagraphs(text) {
    // 分割成段落，保留空行作为分隔符
    const paragraphs = text.split(/\n\s*\n/);

    return paragraphs.map(paragraph => {
      paragraph = paragraph.trim();
      if (!paragraph) return '';

      // 如果已经是HTML块级元素，不要包装在<p>中
      if (paragraph.match(/^<(h[1-6]|ul|ol|table|pre|blockquote|div)/)) {
        return paragraph;
      }

      // 如果包含块级元素，不要包装
      if (paragraph.includes('<table>') || paragraph.includes('<ul>') || paragraph.includes('<ol>') || paragraph.includes('<pre>')) {
        return paragraph;
      }

      // 处理单行换行
      paragraph = paragraph.replace(/\n/g, '<br>');

      return `<p>${paragraph}</p>`;
    }).join('\n');
  }

  // HTML转义
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// 创建全局实例
window.markdownRenderer = new MarkdownRenderer();

// 兼容性函数，模拟marked.js的API
window.marked = {
  parse: (markdown) => window.markdownRenderer.render(markdown),
  setOptions: () => {} // 空函数，保持兼容性
};

// 简单的代码高亮功能
window.hljs = {
  highlightElement: (element) => {
    const language = element.className.match(/language-(\w+)/)?.[1] || 'javascript';
    let code = element.textContent;

    // JavaScript/TypeScript 关键字
    if (language === 'javascript' || language === 'js' || language === 'typescript' || language === 'ts') {
      const keywords = [
        'function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return',
        'class', 'async', 'await', 'import', 'export', 'default', 'from', 'try',
        'catch', 'finally', 'throw', 'new', 'this', 'super', 'extends', 'static'
      ];

      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        code = code.replace(regex, `<span style="color: #d73a49; font-weight: bold;">${keyword}</span>`);
      });

      // 高亮字符串
      code = code.replace(/(["'`])((?:(?!\1)[^\\]|\\.)*)(\1)/g, '<span style="color: #032f62;">$1$2$3</span>');

      // 高亮注释
      code = code.replace(/(\/\/.*$)/gm, '<span style="color: #6a737d; font-style: italic;">$1</span>');
      code = code.replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color: #6a737d; font-style: italic;">$1</span>');

      // 高亮数字
      code = code.replace(/\b(\d+\.?\d*)\b/g, '<span style="color: #005cc5;">$1</span>');
    }

    // Python 关键字
    else if (language === 'python' || language === 'py') {
      const keywords = [
        'def', 'class', 'if', 'else', 'elif', 'for', 'while', 'return', 'import',
        'from', 'as', 'try', 'except', 'finally', 'with', 'lambda', 'and', 'or', 'not'
      ];

      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        code = code.replace(regex, `<span style="color: #d73a49; font-weight: bold;">${keyword}</span>`);
      });

      // 高亮字符串
      code = code.replace(/(["'])((?:(?!\1)[^\\]|\\.)*)(\1)/g, '<span style="color: #032f62;">$1$2$3</span>');

      // 高亮注释
      code = code.replace(/(#.*$)/gm, '<span style="color: #6a737d; font-style: italic;">$1</span>');
    }

    element.innerHTML = code;
  },
  getLanguage: (lang) => ['javascript', 'python', 'html', 'css', 'json'].includes(lang)
};

console.log('Markdown渲染器已加载');
