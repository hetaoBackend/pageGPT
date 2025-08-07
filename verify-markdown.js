// Markdown渲染器验证脚本
// 在浏览器控制台中运行此脚本来测试渲染器

function verifyMarkdownRenderer() {
  console.log('🧪 开始验证Markdown渲染器...');
  
  // 检查渲染器是否加载
  if (typeof window.markdownRenderer === 'undefined') {
    console.error('❌ Markdown渲染器未加载');
    return false;
  }
  
  console.log('✅ Markdown渲染器已加载');
  
  // 测试用例
  const testCases = [
    {
      name: '标题测试',
      input: '# 一级标题\n## 二级标题\n### 三级标题',
      expected: ['<h1>', '<h2>', '<h3>']
    },
    {
      name: '文本格式测试',
      input: '**粗体** *斜体* `代码` ~~删除线~~',
      expected: ['<strong>', '<em>', '<code>', '<del>']
    },
    {
      name: '列表测试',
      input: '- 项目1\n- 项目2\n\n1. 第一项\n2. 第二项',
      expected: ['<ul>', '<li>', '<ol>']
    },
    {
      name: '代码块测试',
      input: '```javascript\nfunction test() {\n  return true;\n}\n```',
      expected: ['<pre>', '<code>']
    },
    {
      name: '表格测试',
      input: '| 列1 | 列2 |\n|-----|-----|\n| 数据1 | 数据2 |',
      expected: ['<table>', '<th>', '<td>']
    },
    {
      name: '引用测试',
      input: '> 这是一个引用',
      expected: ['<blockquote>']
    },
    {
      name: '链接测试',
      input: '[链接文本](https://example.com)',
      expected: ['<a href=']
    }
  ];
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  testCases.forEach((testCase, index) => {
    console.log(`\n🔍 测试 ${index + 1}: ${testCase.name}`);
    console.log(`输入: ${testCase.input}`);
    
    try {
      const result = window.markdownRenderer.render(testCase.input);
      console.log(`输出: ${result}`);
      
      let passed = true;
      testCase.expected.forEach(expectedElement => {
        if (!result.includes(expectedElement)) {
          console.error(`❌ 缺少预期元素: ${expectedElement}`);
          passed = false;
        }
      });
      
      if (passed) {
        console.log('✅ 测试通过');
        passedTests++;
      } else {
        console.error('❌ 测试失败');
      }
    } catch (error) {
      console.error(`❌ 渲染错误: ${error.message}`);
    }
  });
  
  console.log(`\n📊 测试结果: ${passedTests}/${totalTests} 通过`);
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！Markdown渲染器工作正常。');
    return true;
  } else {
    console.log('⚠️ 部分测试失败，请检查渲染器实现。');
    return false;
  }
}

// 测试代码高亮功能
function verifyCodeHighlighting() {
  console.log('\n🎨 开始验证代码高亮功能...');
  
  if (typeof window.hljs === 'undefined') {
    console.error('❌ 代码高亮器未加载');
    return false;
  }
  
  console.log('✅ 代码高亮器已加载');
  
  // 创建测试元素
  const testElement = document.createElement('code');
  testElement.className = 'language-javascript';
  testElement.textContent = 'function test() { return "hello"; }';
  
  try {
    window.hljs.highlightElement(testElement);
    
    if (testElement.innerHTML.includes('<span')) {
      console.log('✅ 代码高亮测试通过');
      console.log(`高亮结果: ${testElement.innerHTML}`);
      return true;
    } else {
      console.error('❌ 代码高亮未生效');
      return false;
    }
  } catch (error) {
    console.error(`❌ 代码高亮错误: ${error.message}`);
    return false;
  }
}

// 完整验证
function runFullVerification() {
  console.log('🚀 开始完整验证...');
  
  const markdownOk = verifyMarkdownRenderer();
  const highlightOk = verifyCodeHighlighting();
  
  if (markdownOk && highlightOk) {
    console.log('\n🎉 验证完成！所有功能正常工作。');
    console.log('💡 你现在可以在AI助手中测试Markdown功能了。');
  } else {
    console.log('\n⚠️ 验证发现问题，请检查相关功能。');
  }
  
  return markdownOk && highlightOk;
}

// 导出函数供外部调用
if (typeof window !== 'undefined') {
  window.verifyMarkdownRenderer = verifyMarkdownRenderer;
  window.verifyCodeHighlighting = verifyCodeHighlighting;
  window.runFullVerification = runFullVerification;
}

// 如果在Node.js环境中，导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    verifyMarkdownRenderer,
    verifyCodeHighlighting,
    runFullVerification
  };
}

console.log('📋 验证脚本已加载。运行 runFullVerification() 开始测试。');
