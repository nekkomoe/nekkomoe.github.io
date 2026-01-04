(function() {
    'use strict';

    function addCopyListener() {
        if (!window.MathJax || !window.MathJax.startup || !window.MathJax.startup.document) return;
        
        const mathItems = window.MathJax.startup.document.getMathItemsWithin(document.body);
        
        mathItems.forEach(item => {
            const element = item.typesetRoot;
            if (!element) return;
            
            // 防止重复添加
            if (element.hasAttribute('data-copy-attached')) return;
            element.setAttribute('data-copy-attached', 'true');
            
            element.style.cursor = 'pointer';
            element.title = 'Click to copy TeX';
            
            element.addEventListener('click', function(e) {
                e.stopPropagation(); // 防止事件冒泡
                const tex = item.math; // 获取原始 TeX 代码
                
                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(tex).then(() => {
                        showFeedback(element);
                    }).catch(err => {
                        console.error('Failed to copy TeX:', err);
                        fallbackCopy(tex, element);
                    });
                } else {
                    fallbackCopy(tex, element);
                }
            });
        });
    }

    function showFeedback(element) {
        // 视觉反馈：颜色变化
        const originalColor = element.style.color;
        const originalTransition = element.style.transition;
        
        element.style.transition = 'color 0.2s';
        element.style.color = '#4caf50'; // 绿色
        
        setTimeout(() => {
            element.style.color = originalColor;
            element.style.transition = originalTransition;
        }, 500);

        // 视觉反馈：浮层提示
        const rect = element.getBoundingClientRect();
        const tip = document.createElement('div');
        tip.innerText = 'Copied TeX!';
        tip.style.position = 'absolute';
        tip.style.background = 'rgba(0, 0, 0, 0.8)';
        tip.style.color = '#fff';
        tip.style.padding = '4px 8px';
        tip.style.borderRadius = '4px';
        tip.style.fontSize = '12px';
        tip.style.fontFamily = 'sans-serif';
        tip.style.pointerEvents = 'none';
        tip.style.zIndex = '10000';
        tip.style.opacity = '0';
        tip.style.transition = 'opacity 0.2s';
        
        // 计算位置：在公式上方居中
        const top = rect.top + window.scrollY - 30;
        const left = rect.left + window.scrollX + (rect.width / 2);
        tip.style.top = top + 'px';
        tip.style.left = left + 'px';
        tip.style.transform = 'translateX(-50%)';
        
        document.body.appendChild(tip);
        
        // 显示
        requestAnimationFrame(() => {
            tip.style.opacity = '1';
        });

        // 消失
        setTimeout(() => {
            tip.style.opacity = '0';
            setTimeout(() => {
                if (tip.parentNode) tip.parentNode.removeChild(tip);
            }, 200);
        }, 800);
    }

    function fallbackCopy(text, element) {
        var textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            var successful = document.execCommand('copy');
            if (successful) {
                showFeedback(element);
            }
        } catch (err) {
            console.error('Fallback copy failed', err);
        }
        
        document.body.removeChild(textArea);
    }

    // 等待 MathJax 准备就绪
    function waitMathJax() {
        if (window.MathJax && window.MathJax.startup && window.MathJax.startup.promise) {
            window.MathJax.startup.promise.then(() => {
                addCopyListener();
                // 也可以监听后续的 typeset 调用（如果页面有动态渲染）
            });
        } else {
            // 轮询检查
            setTimeout(waitMathJax, 200);
        }
    }

    waitMathJax();

})();
