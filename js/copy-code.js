document.addEventListener('DOMContentLoaded', function() {
    var codeBlocks = document.querySelectorAll('figure.highlight');

    codeBlocks.forEach(function(codeBlock) {
        // 防止重复添加
        if (codeBlock.querySelector('.copy-btn')) return;

        var copyBtn = document.createElement('span');
        copyBtn.className = 'copy-btn';
        copyBtn.innerText = 'Copy';
        codeBlock.appendChild(copyBtn);

        copyBtn.addEventListener('click', function() {
            var codeToCopy = '';
            
            // Check if user has selected text within this code block
            var selection = window.getSelection();
            if (selection.rangeCount > 0 && !selection.isCollapsed && codeBlock.contains(selection.anchorNode)) {
                codeToCopy = selection.toString();
            } else {
                // Hexo 默认的 highlight 结构通常是 table (如果开启行号) 或者 pre
                var codeTable = codeBlock.querySelector('td.code');
                if (codeTable) {
                    codeToCopy = codeTable.innerText;
                } else {
                    var pre = codeBlock.querySelector('pre');
                    if (pre) {
                        codeToCopy = pre.innerText;
                    }
                }
            }

            // 执行复制
            if (navigator.clipboard && window.isSecureContext) {
                // 使用现代 API
                navigator.clipboard.writeText(codeToCopy).then(function() {
                    showCopied(copyBtn);
                }).catch(function(err) {
                    console.error('Failed to copy:', err);
                    fallbackCopy(codeToCopy, copyBtn);
                });
            } else {
                // 回退方案
                fallbackCopy(codeToCopy, copyBtn);
            }
        });
    });

    function showCopied(btn) {
        btn.classList.add('copied');
        
        setTimeout(function() {
            btn.classList.remove('copied');
        }, 500);
    }

    function fallbackCopy(text, btn) {
        var textArea = document.createElement("textarea");
        textArea.value = text;
        
        // 确保 textarea 不可见且不影响布局
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            var successful = document.execCommand('copy');
            if(successful) {
                showCopied(btn);
            } else {
                btn.innerText = 'Fail';
            }
        } catch (err) {
            console.error('Fallback copy failed', err);
            btn.innerText = 'Fail';
        }
        
        document.body.removeChild(textArea);
    }
});
