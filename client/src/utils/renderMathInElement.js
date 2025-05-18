import katex from 'katex';
import 'katex/dist/katex.min.css';

const renderMathInElement = (element, options = {}) => {
  if (!element) return;

  const defaultOptions = {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false },
      { left: '\\(', right: '\\)', display: false },
      { left: '\\[', right: '\\]', display: true }
    ],
    throwOnError: false,
    errorColor: '#cc0000'
  };

  const config = { ...defaultOptions, ...options };

  const renderMath = (text, display) => {
    try {
      return katex.renderToString(text, {
        ...config,
        displayMode: display
      });
    } catch (error) {
      console.error('KaTeX rendering error:', error);
      return text;
    }
  };

  const processNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      let text = node.textContent;
      let newHTML = text;

      config.delimiters.forEach(({ left, right, display }) => {
        const regex = new RegExp(`${left}(.*?)${right}`, 'g');
        newHTML = newHTML.replace(regex, (_, math) => renderMath(math, display));
      });

      if (newHTML !== text) {
        const temp = document.createElement('div');
        temp.innerHTML = newHTML;
        while (temp.firstChild) {
          node.parentNode.insertBefore(temp.firstChild, node);
        }
        node.parentNode.removeChild(node);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE') {
        Array.from(node.childNodes).forEach(processNode);
      }
    }
  };

  processNode(element);
};

export default renderMathInElement; 