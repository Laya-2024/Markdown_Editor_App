const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const wordCount = document.getElementById('wordCount');
const themeToggle = document.getElementById('themeToggle');
const downloadMd = document.getElementById('downloadMd');
const downloadHtml = document.getElementById('downloadHtml');
const copyHtml = document.getElementById('copyHtml');
const toolButtons = document.querySelectorAll('.tool-btn');

// Load saved content
editor.value = localStorage.getItem('markdown') || '';
updatePreview();

// Live preview
editor.addEventListener('input', () => {
    updatePreview();
    localStorage.setItem('markdown', editor.value);
});

function updatePreview() {
    const markdown = editor.value;
    preview.innerHTML = parseMarkdown(markdown);
    updateWordCount(markdown);
}

function updateWordCount(text) {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    wordCount.textContent = `${words} word${words !== 1 ? 's' : ''}`;
}

function parseMarkdown(md) {
    let html = md;
    
    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Strikethrough
    html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
    
    // Unordered lists
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Ordered lists
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
    
    // Horizontal rule
    html = html.replace(/^---$/gim, '<hr>');
    
    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');
    
    return '<p>' + html + '</p>';
}

// Toolbar actions
toolButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        insertMarkdown(action);
    });
});

function insertMarkdown(action) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = editor.value.substring(start, end);
    const beforeText = editor.value.substring(0, start);
    const afterText = editor.value.substring(end);
    
    let insertion = '';
    let cursorOffset = 0;
    
    switch(action) {
        case 'bold':
            insertion = `**${selectedText || 'bold text'}**`;
            cursorOffset = selectedText ? insertion.length : 2;
            break;
        case 'italic':
            insertion = `*${selectedText || 'italic text'}*`;
            cursorOffset = selectedText ? insertion.length : 1;
            break;
        case 'strikethrough':
            insertion = `~~${selectedText || 'strikethrough'}~~`;
            cursorOffset = selectedText ? insertion.length : 2;
            break;
        case 'h1':
            insertion = `# ${selectedText || 'Heading 1'}`;
            cursorOffset = insertion.length;
            break;
        case 'h2':
            insertion = `## ${selectedText || 'Heading 2'}`;
            cursorOffset = insertion.length;
            break;
        case 'h3':
            insertion = `### ${selectedText || 'Heading 3'}`;
            cursorOffset = insertion.length;
            break;
        case 'link':
            insertion = `[${selectedText || 'link text'}](url)`;
            cursorOffset = selectedText ? insertion.length - 4 : insertion.length - 4;
            break;
        case 'image':
            insertion = `![${selectedText || 'alt text'}](image-url)`;
            cursorOffset = insertion.length - 1;
            break;
        case 'code':
            insertion = `\`${selectedText || 'code'}\``;
            cursorOffset = selectedText ? insertion.length : 1;
            break;
        case 'quote':
            insertion = `> ${selectedText || 'quote'}`;
            cursorOffset = insertion.length;
            break;
        case 'ul':
            insertion = `- ${selectedText || 'list item'}`;
            cursorOffset = insertion.length;
            break;
        case 'ol':
            insertion = `1. ${selectedText || 'list item'}`;
            cursorOffset = insertion.length;
            break;
        case 'table':
            insertion = `| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |`;
            cursorOffset = insertion.length;
            break;
        case 'clear':
            if (confirm('Clear all content?')) {
                editor.value = '';
                updatePreview();
                localStorage.removeItem('markdown');
            }
            return;
    }
    
    editor.value = beforeText + insertion + afterText;
    editor.focus();
    editor.setSelectionRange(start + cursorOffset, start + cursorOffset);
    updatePreview();
    localStorage.setItem('markdown', editor.value);
}

// Keyboard shortcuts
editor.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key.toLowerCase()) {
            case 'b':
                e.preventDefault();
                insertMarkdown('bold');
                break;
            case 'i':
                e.preventDefault();
                insertMarkdown('italic');
                break;
        }
    }
});

// Theme toggle
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    themeToggle.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
});

// Load theme
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
    themeToggle.textContent = '☀️';
}

// Download Markdown
downloadMd.addEventListener('click', () => {
    const blob = new Blob([editor.value], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(url);
});

// Download HTML
downloadHtml.addEventListener('click', () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Document</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; line-height: 1.6; }
        h1, h2, h3 { margin-top: 1.5em; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
        blockquote { border-left: 4px solid #ddd; padding-left: 15px; color: #666; }
        img { max-width: 100%; }
        a { color: #0066cc; }
    </style>
</head>
<body>
    ${preview.innerHTML}
</body>
</html>`;
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    a.click();
    URL.revokeObjectURL(url);
});

// Copy HTML
copyHtml.addEventListener('click', () => {
    navigator.clipboard.writeText(preview.innerHTML).then(() => {
        const originalText = copyHtml.textContent;
        copyHtml.textContent = '✅ Copied!';
        setTimeout(() => {
            copyHtml.textContent = originalText;
        }, 2000);
    });
});
