// src/html.js
import { getFileList } from './lib.js';

// ===== Common SVG Icons =====
const ICONS = {
  upload: '<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>',
  share: '<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>',
  check: '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>',
  copy: '<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>',
  lock: '<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>',
  unlock: '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/></svg>',
  file: '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
  warning: '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>',
  error: '<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  download: '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>',
};

// ===== Common HTML Fragments =====
const THEME_TOGGLE_HTML =
  '<span class="theme-toggle" onclick="toggleTheme()"><span id="themeLabel"></span></span>';

const THEME_TOGGLE_POS = '<div style="position:absolute;top:0.75rem;right:1.75rem;font-size:0.7rem">' + THEME_TOGGLE_HTML + '</div>';

const THEME = `
  :root {
    --bg-body: #F4F6F9;
    --bg-card: #FFFFFF;
    --text-primary: #1F2937;
    --text-secondary: #6B7280;
    --border-color: #E5E7EB;
    --input-bg: #FFFFFF;
    --primary: #4F46E5;
    --primary-light: #E0E7FF;
    --primary-hover: #4338CA;
    --shadow-card: 0 10px 15px -3px rgba(0,0,0,0.04), 0 4px 6px -2px rgba(0,0,0,0.02);
    --shadow-focus: 0 0 0 3px rgba(79,70,229,0.15);
    --btn-bg: #4F46E5;
    --btn-hover-bg: #4338CA;
  }
  .dark {
    --bg-body: #070B14;
    --bg-card: #0C1220;
    --text-primary: #CBD5E1;
    --text-secondary: #8896A8;
    --border-color: #1A2435;
    --input-bg: #0C1220;
    --primary: #94A3D8;
    --primary-light: #1E2740;
    --primary-hover: #7E8DC4;
    --shadow-card: 0 10px 15px -3px rgba(0,0,0,0.6);
    --shadow-focus: 0 0 0 3px rgba(148,163,216,0.2);
    --btn-bg: #4F46AA;
    --btn-hover-bg: #5B52C0;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: var(--bg-body);
    color: var(--text-primary);
    font-size: 14px;
    line-height: 1.6;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .container {
    width: 100%;
    max-width: 440px;
    margin: 0 auto;
  }
  .card {
    background: var(--bg-card);
    border-radius: 20px;
    box-shadow: var(--shadow-card);
    border: 1px solid var(--border-color);
    padding: 2rem 1.75rem;
    position: relative;
  }
  .card-wide { max-width: 560px; }

  /* Tabs */
  .tabs {
    display: flex;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 1.25rem;
  }
  .tab {
    flex: 1;
    text-align: center;
    padding: 0.6rem 0;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-secondary);
    position: relative;
    transition: color 0.2s;
    user-select: none;
  }
  .tab:hover { color: var(--primary); }
  .tab.active { color: var(--primary); font-weight: 600; }
  .tab.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 20%;
    width: 60%;
    height: 2px;
    background: var(--btn-bg);
    border-radius: 2px;
  }

  /* Form */
  .form-group { margin-bottom: 1rem; }
  .form-group label {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.4rem;
    color: var(--text-primary);
  }
  textarea, input {
    width: 100%;
    padding: 0.7rem 0.9rem;
    background: var(--input-bg);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    font-size: 0.9rem;
    color: var(--text-primary);
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
    font-family: inherit;
  }
  textarea::placeholder, input::placeholder { color: #A1A1AA; }
  .dark textarea::placeholder, .dark input::placeholder { color: #64748B; }
  textarea:focus, input:focus {
    border-color: var(--primary);
    box-shadow: var(--shadow-focus);
  }
  textarea {
    resize: vertical;
    min-height: 100px;
    max-height: 60vh;
    height: 120px;
    line-height: 1.5;
  }
  /* Custom select dropdown */
  .custom-select { position: relative; }
  .select-trigger {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 0.7rem 0.9rem;
    background: var(--input-bg);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    font-size: 0.9rem;
    color: var(--text-primary);
    cursor: pointer;
    font-family: inherit;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .select-trigger:hover { border-color: var(--primary); }
  .select-trigger:focus-visible, .select-trigger.open {
    border-color: var(--primary);
    box-shadow: var(--shadow-focus);
    outline: none;
  }
  .select-menu {
    display: none;
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    box-shadow: var(--shadow-card);
    z-index: 20;
    overflow: hidden;
  }
  .select-menu.open { display: block; }
  .select-option {
    padding: 0.6rem 0.9rem;
    cursor: pointer;
    font-size: 0.9rem;
    color: var(--text-primary);
    transition: background 0.15s;
  }
  .select-option:hover { background: var(--bg-body); }
  .select-option.active { color: var(--primary); font-weight: 500; background: var(--primary-light); }
  .dark .select-option:hover { background: rgba(255,255,255,0.04); }
  .dark .select-option.active { color: #94A3D8; }

  /* Upload area */
  .upload-area {
    border: 2px dashed var(--border-color);
    background: var(--input-bg);
    border-radius: 12px;
    padding: 1.5rem 1rem;
    min-height: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
  }
  .upload-area:hover {
    border-color: var(--primary);
    background: var(--primary-light);
  }
  .upload-area .icon { color: var(--text-secondary); margin-bottom: 0.5rem; }
  .upload-area:hover .icon { color: var(--primary); }
  .upload-area p { font-weight: 500; font-size: 0.85rem; color: var(--text-primary); }
  .upload-area .hint { font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px; }

  /* Buttons */
  .btn {
    width: 100%;
    padding: 0.8rem;
    background: var(--btn-bg);
    color: #F8FAFC;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    font-family: inherit;
  }

  .btn:hover { background: var(--btn-hover-bg); }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-sm {
    width: auto;
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
    border-radius: 8px;
  }

  /* Char counter */
  .char-counter {
    text-align: right;
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-top: 4px;
    padding-right: 2px;
  }
  .char-counter.over { color: #EF4444; }

  /* Progress bar */
  .progress-wrap {
    margin-top: 0.75rem;
    height: 4px;
    background: var(--border-color);
    border-radius: 2px;
    overflow: hidden;
    display: none;
  }
  .progress-wrap.active { display: block; }
  .progress-bar {
    height: 100%;
    width: 0%;
    background: var(--btn-bg);
    transition: width 0.15s ease;
    border-radius: 2px;
  }

  /* File items */
  .file-list:not(:empty) { margin-top: 0.5rem; }
  .file-item {
    display: flex;
    align-items: center;
    padding: 0.55rem 0.7rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    margin-bottom: 0.35rem;
    background: var(--input-bg);
  }
  .file-item-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.85rem; }
  .file-item-size { color: var(--text-secondary); font-size: 0.8rem; white-space: nowrap; margin: 0 0.5rem; }
  .file-item-action { flex-shrink: 0; }
  .file-item-remove { cursor: pointer; color: var(--text-secondary); font-size: 1rem; padding: 0 2px; }
  .file-item-remove:hover { color: #EF4444; }

  /* Result area */
  .result-header { display: flex; align-items: center; gap: 8px; margin-bottom: 1rem; }
  .success-icon {
    width: 28px; height: 28px;
    background: #DEF7EC; color: #046C4E;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .dark .success-icon { background: #064E3B; color: #6EE7B7; }
  .success-title { font-weight: 600; font-size: 0.95rem; color: var(--text-primary); }

  /* Link box */
  .link-box {
    background: var(--bg-body);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 0.8rem 0.9rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 1rem;
  }
  .link-box .link-text {
    font-size: 0.85rem;
    color: var(--primary);
    word-break: break-all;
    font-family: 'SF Mono', 'Courier New', Consolas, monospace;
  }
  .copy-icon { color: var(--text-secondary); cursor: pointer; flex-shrink: 0; transition: color 0.2s; }
  .copy-icon:hover { color: var(--primary); }

  /* Meta row */
  .meta-row {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin: 1rem 0 1rem;
  }
  .meta-row .tag {
    flex: 1;
    text-align: center;
    font-size: 0.75rem;
    color: var(--text-secondary);
    background: var(--bg-body);
    border: 1px solid var(--border-color);
    padding: 0.25rem 0.55rem;
    border-radius: 6px;
    white-space: nowrap;
  }
  .dark .meta-row .tag { background: #151F2E; border-color: #1A2435; color: #8896A8; }

  /* Alerts */
  .warning-box {
    padding: 0.55rem 0.75rem;
    border-radius: 8px;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 6px;
    animation: fadeIn 0.2s ease;
    background: #FFFBEB;
    border: 1px solid #FDE68A;
    color: #92400E;
    margin: -0.5rem 0 1rem;
  }
  .warning-box svg { flex-shrink: 0; }
  .dark .warning-box { background: #2D1A0E; border-color: #4A2A15; color: #FCD34D; }
  .pass-error.visible {
    background: #FEF2F2;
    border: 1px solid #FECACA;
    color: #DC2626;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0.55rem 0.75rem;
    border-radius: 8px;
    font-size: 0.8rem;
    animation: fadeIn 0.2s ease;
  }
  .dark .pass-error.visible { background: #2E0A0A; border-color: #4A1515; color: #FCA5A5; }

  .toast {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    font-size: 0.8rem;
    margin: -0.5rem 0 0.5rem;
    animation: fadeIn 0.25s ease;
  }
  .toast-warning {
    background: #FFFBEB;
    border: 1px solid #FDE68A;
    color: #92400E;
  }
  .dark .toast-warning { background: #422006; border-color: #4A2A15; color: #FCD34D; }
  .toast-success {
    background: #F0FDF4;
    border: 1px solid #BBF7D0;
    color: #166534;
  }
  .dark .toast-success { background: #0A2E1A; border-color: #1A4A2A; color: #6EE7B7; }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* View content */
  .content-box {
    background: var(--input-bg);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 1rem;
    font-size: 0.85rem;
    color: var(--text-primary);
    line-height: 1.7;
    font-family: 'SF Mono', 'Courier New', Consolas, monospace;
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 60vh;
    overflow-y: auto;
  }

  /* Password page */
  .lock-icon-wrap { text-align: center; margin-bottom: 1rem; }
  .lock-icon {
    width: 48px; height: 48px;
    background: var(--primary-light); color: var(--primary);
    border-radius: 50%;
    display: inline-flex; align-items: center; justify-content: center;
  }
  .pass-error { font-size: 0.8rem; display: none; }
  .pass-error.visible { display: flex; margin: -0.5rem 0 0.5rem; }

  /* Error page */
  .error-page {
    text-align: center;
    padding: 2.5rem 1rem;
  }
  .error-page h2 {
    font-size: 3.5rem;
    font-weight: 700;
    letter-spacing: -0.04em;
    color: var(--text-primary);
    line-height: 1.1;
    margin-bottom: 0;
  }
  .error-page .error-line {
    width: 120px;
    height: 2px;
    background: var(--border-color);
    margin: 1rem auto;
    border-radius: 1px;
  }
  .error-page p {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  /* Theme toggle */
  .theme-toggle {
    cursor: pointer;
    user-select: none;
    color: var(--text-secondary);
  }
  .theme-toggle:hover { color: var(--primary); }

  /* Utilities */
  .hidden { display: none !important; }
  #text-mode, #file-mode {
    min-height: 180px;
    margin-bottom: 0.75rem;
  }
  #text-mode .form-group textarea {
    height: 120px;
    min-height: 120px;
    resize: vertical;
    max-height: 60vh;
    line-height: 1.5;
  }
  #text-mode.hidden, #file-mode.hidden { display: none !important; }
  #text-mode:not(.hidden), #file-mode:not(.hidden) { animation: fadeIn 0.15s ease; }
  #resultArea:not(.hidden) { animation: fadeIn 0.25s ease; }
  .file-item { animation: fadeIn 0.2s ease; }
  .file-dl-form { display: inline; }
  /* Scrollbar */
  .content-box::-webkit-scrollbar,
  textarea::-webkit-scrollbar { width: 6px; }
  .content-box::-webkit-scrollbar-track,
  textarea::-webkit-scrollbar-track { background: transparent; }
  .content-box::-webkit-scrollbar-thumb,
  textarea::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 3px; }
  .content-box::-webkit-scrollbar-thumb:hover,
  textarea::-webkit-scrollbar-thumb:hover { background: var(--text-secondary); }

  /* Responsive */
  @media (max-width: 640px) {
    body { padding: 16px; }
    .card { padding: 1.5rem 1.25rem; border-radius: 16px; }
    .tabs .tab { font-size: 0.85rem; padding: 0.5rem 0; }
    textarea { min-height: 100px; }
    .upload-area { padding: 1.25rem 0.75rem; }
    .btn { padding: 0.7rem; font-size: 0.9rem; }
    .link-box { flex-direction: column; gap: 6px; }
    .link-box .link-text { font-size: 0.8rem; }
    .content-box { font-size: 0.8rem; padding: 0.75rem; }
    .card-wide { max-width: 100%; }
  }
  @media (max-width: 400px) {
    body { padding: 10px; }
    .card { padding: 1rem 0.9rem; border-radius: 14px; }
    .tabs { margin-bottom: 1rem; }
    .tabs .tab { font-size: 0.8rem; padding: 0.4rem 0; }
    .form-group { margin-bottom: 0.75rem; }
    textarea, input { padding: 0.6rem 0.7rem; font-size: 0.85rem; }
    .error-page h2 { font-size: 1rem; }
    .error-page p { font-size: 0.8rem; }
  }
  @media (min-width: 768px) and (max-width: 1024px) {
    .container { max-width: 480px; }
    .card { padding: 2.25rem 2rem; }
    textarea { min-height: 130px; }
  }
`;

function layout(title, bodyContent) {
  return '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n' +
    '<meta charset="UTF-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '<title>' + title + '</title>\n' +
    '<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; style-src \'unsafe-inline\' \'self\'; script-src \'unsafe-inline\' \'self\'; img-src \'self\' data:; font-src \'self\'; connect-src \'self\'; form-action \'self\'">\n' +
    '<script>(function(){var m=matchMedia(\'(prefers-color-scheme:dark)\');function apply(c){document.documentElement.className=c?\'dark\':\'\'}function label(){var e=document.getElementById(\'themeLabel\');if(!e)return;var t;try{t=localStorage.getItem(\'theme\')}catch(e){}if(!t||t===\'auto\')e.textContent=\'跟随系统\';else if(t===\'light\')e.textContent=\'浅色\';else e.textContent=\'深色\';}var t;try{t=localStorage.getItem(\'theme\')}catch(e){}if(!t||t===\'auto\'){apply(m.matches);m.addEventListener(\'change\',function(e){var s;try{s=localStorage.getItem(\'theme\')}catch(e){}if(!s||s===\'auto\')apply(e.matches);});}else apply(t===\'dark\');document.addEventListener(\'DOMContentLoaded\',label);})();function toggleTheme(){var t;try{t=localStorage.getItem(\'theme\')}catch(e){}var n;if(!t||t===\'auto\')n=\'light\';else if(t===\'light\')n=\'dark\';else n=\'auto\';var h=document.documentElement;if(n===\'dark\')h.className=\'dark\';else if(n===\'light\')h.className=\'\';else{h.className=matchMedia(\'(prefers-color-scheme:dark)\').matches?\'dark\':\'\';}try{localStorage.setItem(\'theme\',n)}catch(e){}var el=document.getElementById(\'themeLabel\');if(!el)return;if(n===\'auto\')el.textContent=\'跟随系统\';else if(n===\'light\')el.textContent=\'浅色\';else el.textContent=\'深色\';}<\/script>\n' +
    '<style>' + THEME + '</style>\n' +
    '</head>\n<body>' + bodyContent + '</body>\n</html>';
}

function homePage(env, origin) {
  const maxSize = env?.MAX_UPLOAD_SIZE_MB || '200';
  var html = '' +
    '<div class="container">' +
      '<div class="card">' +
        THEME_TOGGLE_POS + 
        '<div id="createForm">' +
        '<div class="tabs">' +
          '<div class="tab active" onclick="switchTab(\'text\')">分享文本</div>' +
          '<div class="tab" onclick="switchTab(\'file\')">分享文件</div>' +
        '</div>' +
        '<div id="text-mode">' +
          '<div class="form-group">' +
            '<label>文本内容</label>' +
            '<textarea id="textEditor" placeholder="粘贴或输入你想分享的内容..." oninput="updateCounter()"></textarea>' +
            '<div class="char-counter" id="charCounter">0 / 10,000</div>' +
          '</div>' +
        '</div>' +
        '<div id="file-mode" class="hidden">' +
          '<div class="form-group" style="flex:1">' +
            '<label>选择文件</label>' +
            '<div class="upload-area" id="dropzone">' +
              '<div class="icon">' + ICONS.upload + '</div>' +
              '<p>点击选择或拖拽文件</p>' +
              '<p class="hint">最多 5 个文件 · 单个最大 ' + maxSize + ' MB</p>' +
            '</div>' +
            '<div id="fileListContainer" class="file-list"></div>' +
            '<input type="file" id="fileInput" style="display:none" accept="*/*" multiple>' +
                      '</div>' +
        '</div>' +
        '<div class="form-group">' +
          '<label>有效期</label>' +
          '<div class="custom-select" id="expireDropdown">' +
            '<button type="button" class="select-trigger" onclick="toggleExpireMenu()">' +
              '<span id="expireLabel">30 分钟</span>' +
              '<svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 9l6 6 6-6"/></svg>' +
            '</button>' +
            '<div class="select-menu" id="expireMenu">' +
              '<div class="select-option active" data-value="30m" onclick="pickExpire(this)">30 分钟</div>' +
              '<div class="select-option" data-value="1h" onclick="pickExpire(this)">1 小时</div>' +
              '<div class="select-option" data-value="6h" onclick="pickExpire(this)">6 小时</div>' +
              '<div class="select-option" data-value="12h" onclick="pickExpire(this)">12 小时</div>' +
              '<div class="select-option" data-value="burn" onclick="pickExpire(this)">阅后即焚</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="form-group">' +
          '<label>访问密码 <span style="font-weight:400;text-transform:none;letter-spacing:0;color:var(--text-secondary)">(可选)</span></label>' +
          '<input type="password" id="password" placeholder="最多 6 位字符" autocomplete="off" maxlength="6" oninput="this.value=this.value.replace(/\D/g,\'\')">' +
        '</div>' +
        '<button class="btn" id="createBtn" onclick="handleCreate()">' +
          ICONS.share + '生成分享链接' +
        '</button>' +
        '<div class="progress-wrap" id="progressWrap"><div class="progress-bar" id="progressBar"></div></div>' +
      '</div>' +
      '<div id="resultArea" class="hidden"></div>' +
      '<button id="resetBtn" class="btn" style="display:none" onclick="resetCreate()">再创建一个</button>' +
      '</div>' +
    '</div>' +
    '<script>\n' +
    'var selectedFiles = [];\n' +
    'var currentTab = \'text\';\n' +
    'var MAX_CHARS = 10000;\n' +
    'var MAX_FILES = 5;\n' +
    'var MAX_FILE_SIZE = ' + (parseInt(maxSize) * 1024 * 1024) + ';\n' +
    'function switchTab(tab){currentTab=tab;document.querySelectorAll(\'.tab\').forEach(function(t){t.classList.remove(\'active\')});document.querySelector(\'.tab\'+(tab===\'text\'?\':first-child\':\':last-child\')).classList.add(\'active\');document.getElementById(\'text-mode\').classList.toggle(\'hidden\',tab!==\'text\');document.getElementById(\'file-mode\').classList.toggle(\'hidden\',tab!==\'file\');document.getElementById(\'resultArea\').classList.add(\'hidden\');document.getElementById(\'createForm\').style.display=\'\';}\n' +
    'function updateCounter(){var e=document.getElementById(\'textEditor\'),l=e.value.length,c=document.getElementById(\'charCounter\');c.textContent=l.toLocaleString()+\' / \'+MAX_CHARS.toLocaleString();c.classList.toggle(\'over\',l>MAX_CHARS);}\n' +
    'function addFilesWithLimit(n){var a=0;for(var i=0;i<n.length;i++){if(selectedFiles.length>=MAX_FILES)break;selectedFiles.push(n[i]);a++;}updateFileList();if(a<n.length)showToast(\'最多\'+MAX_FILES+\'个文件，已添加\'+a+\'/\'+n.length+\'个\');}\n' +
    'function showToast(m,c){var o=document.getElementById(\'fileToast\');if(o)o.remove();var d=document.createElement(\'div\');d.className=\'toast \'+(c||\'toast-warning\');d.id=\'fileToast\';var s=c===\'toast-success\'?\'<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>\':\'<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>\';d.innerHTML=s+\' \'+m;(document.getElementById(\'createForm\').style.display!==\'none\'?document.getElementById(\'createForm\'):document.querySelector(\'.card\')).insertBefore(d,(document.getElementById(\'createForm\').style.display!==\'none\'?document.getElementById(\'createBtn\'):document.getElementById(\'resetBtn\')));setTimeout(function(){if(d.parentNode)d.remove();},3000);}\n' +
    '(function(){document.getElementById(\'dropzone\').addEventListener(\'click\',function(){document.getElementById(\'fileInput\').click()});document.getElementById(\'fileInput\').addEventListener(\'change\',function(e){if(e.target.files.length){addFilesWithLimit(e.target.files);e.target.value=\'\';}});document.getElementById(\'dropzone\').addEventListener(\'dragover\',function(e){e.preventDefault();e.currentTarget.style.borderColor=\'var(--primary)\';});document.getElementById(\'dropzone\').addEventListener(\'dragleave\',function(e){e.currentTarget.style.borderColor=\'\';});document.getElementById(\'dropzone\').addEventListener(\'drop\',function(e){e.preventDefault();e.currentTarget.style.borderColor=\'\';if(e.dataTransfer.files.length)addFilesWithLimit(e.dataTransfer.files);});})();\n' +
    'function formatSize(b){if(!b)return\'0 B\';var u=[\'B\',\'KB\',\'MB\',\'GB\'],i=0,s=b;while(s>=1024&&i<3){s/=1024;i++;}return s.toFixed(i?1:0)+\' \'+u[i];}\n' +
    'function updateFileList(){var c=document.getElementById(\'fileListContainer\');if(selectedFiles.length===0){c.innerHTML=\'\';return;}c.innerHTML=selectedFiles.map(function(f,i){return\'<div class="file-item"><span class="file-item-name">\'+hE(f.name)+\'</span><span class="file-item-size">\'+formatSize(f.size)+\'</span><span class="file-item-remove" data-index="\'+i+\'">\\u00d7</span></div>\';}).join(\'\');c.querySelectorAll(\'.file-item-remove\').forEach(function(el){el.addEventListener(\'click\',function(){var idx=parseInt(el.dataset.index);selectedFiles.splice(idx,1);updateFileList();});});}\n' +
    'function uploadWithProgress(fd){return new Promise(function(resolve,reject){var x=new XMLHttpRequest(),pw=document.getElementById(\'progressWrap\'),pb=document.getElementById(\'progressBar\');x.upload.onprogress=function(e){if(e.lengthComputable)pb.style.width=Math.round(e.loaded/e.total*100)+\'%\';};x.onload=function(){pw.classList.remove(\'active\');try{var d=JSON.parse(x.responseText);x.status>=200&&x.status<300?resolve(d):reject(d);}catch(e){reject({error:\'Failed to parse response\'});}};x.onerror=function(){pw.classList.remove(\'active\');reject({error:\'Network error\'});};pw.classList.add(\'active\');pb.style.width=\'0%\';x.open(\'POST\',\'/api/share\');x.send(fd);});}\n' +
    'function toggleExpireMenu(){var m=document.getElementById(\'expireMenu\'),b=document.querySelector(\'.select-trigger\');m.classList.toggle(\'open\');b.classList.toggle(\'open\',m.classList.contains(\'open\'));}function pickExpire(el){document.querySelectorAll(\'#expireMenu .select-option\').forEach(function(o){o.classList.remove(\'active\')});el.classList.add(\'active\');document.getElementById(\'expireLabel\').textContent=el.textContent;document.getElementById(\'expireMenu\').classList.remove(\'open\');document.querySelector(\'.select-trigger\').classList.remove(\'open\');}document.addEventListener(\'click\',function(e){if(!e.target.closest(\'#expireDropdown\')){var m=document.getElementById(\'expireMenu\');if(m)m.classList.remove(\'open\');var b=document.querySelector(\'.select-trigger\');if(b)b.classList.remove(\'open\');}});\n' +
	'function resetCreate(){document.getElementById(\'createForm\').style.display=\'\';document.getElementById(\'resultArea\').classList.add(\'hidden\');document.getElementById(\'resetBtn\').style.display=\'none\';document.getElementById(\'textEditor\').value=\'\';document.getElementById(\'password\').value=\'\';selectedFiles=[];updateFileList();updateCounter();}\n' +
	    'async function handleCreate(){var btn=document.getElementById(\'createBtn\'),expire=document.querySelector(\'#expireMenu .select-option.active\').dataset.value,password=document.getElementById(\'password\').value||null;btn.disabled=true;btn.innerHTML=\'' + ICONS.share + '处理中...\';try{var data;if(currentTab===\'text\'){var content=document.getElementById(\'textEditor\').value;if(!content.trim()){showToast(\'请输入文本\');btn.disabled=false;btn.innerHTML=\'' + ICONS.share + '生成分享链接\';return;}if(content.length>MAX_CHARS){showToast(\'文本内容超出最大字符限制\');btn.disabled=false;btn.innerHTML=\'' + ICONS.share + '生成分享链接\';return;}var res=await fetch(\'/api/share\',{method:\'POST\',headers:{\'Content-Type\':\'application/json\'},body:JSON.stringify({type:\'text\',content,expire,password})});data=await res.json();if(!res.ok){showToast(data.error||\'错误\');btn.disabled=false;btn.innerHTML=\'' + ICONS.share + '生成分享链接\';return;}}else{if(selectedFiles.length===0){showToast(\'请选择至少一个文件\');btn.disabled=false;btn.innerHTML=\'' + ICONS.share + '生成分享链接\';return;}for(var i=0;i<selectedFiles.length;i++){if(selectedFiles[i].size>MAX_FILE_SIZE){showToast(\'文件 \'+selectedFiles[i].name+\' 超出大小限制\');btn.disabled=false;btn.innerHTML=\'' + ICONS.share + '生成分享链接\';return;}}var form=new FormData();form.append(\'type\',\'file\');for(var f of selectedFiles)form.append(\'file\',f);form.append(\'expire\',expire);if(password)form.append(\'password\',password);data=await uploadWithProgress(form);}document.getElementById(\'resultArea\').innerHTML=showResult(data);document.getElementById(\'resultArea\').classList.remove(\'hidden\');document.getElementById(\'createForm\').style.display=\'none\';document.getElementById(\'resetBtn\').style.display=\'\';}catch(e){showToast(\'错误: \'+(e.error||e.message));}btn.disabled=false;btn.innerHTML=\'' + ICONS.share + '生成分享链接\';}\n' +
    'function hE(s){return(s||\'\').replace(/&/g,\'&amp;\').replace(/</g,\'&lt;\').replace(/>/g,\'&gt;\').replace(/\"/g,\'&quot;\').replace(/\'/g,\'&#x27;\');}\n' +
    'function showResult(data){var pw=document.getElementById(\'password\').value;var pwText=pw?\'密码：\'+pw:\'无密码\';var expireMap={\'30m\':\'30 分钟后销毁\',\'1h\':\'1 小时后销毁\',\'6h\':\'6 小时后销毁\',\'12h\':\'12 小时后销毁\',\'burn\':\'阅后即焚\'};var expireText=expireMap[data.expire]||data.expire;var warnText=data.expire===\'burn\'?\'此链接被打开一次后将立即销毁\':\'此链接过期后将自动销毁，请及时分享给接收方\';return\'<div class="result-header"><div class="success-icon">' + ICONS.check + '</div><span class="success-title">\\u5206\\u4eab\\u94fe\\u63a5\\u5df2\\u521b\\u5efa</span></div><div class="link-box"><span class="link-text">\'+window.location.origin+\'/s/<strong>\'+hE(data.key)+\'</strong></span><svg class="copy-icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" onclick="copyLink(\\\'\'+hE(data.key)+\'\\\',this)"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg></div><div class="meta-row"><span class="tag">\'+pwText+\'</span><span class="tag">\'+(data.type===\'text\'?data.charCount+\' \\u5b57\\u7b26\':formatSize(data.size)+(data.fileCount?\' (\'+data.fileCount+\' \\u4e2a\\u6587\\u4ef6)\':\'\'))+\'</span><span class="tag">\'+expireText+\'</span></div><div class="warning-box">' + ICONS.warning + ' \'+warnText+\'</div>\';}\n' +
    'function copyLink(k,el){navigator.clipboard.writeText(window.location.origin+\'/s/\'+k).then(function(){el.style.color=\'#16A34A\';showToast(\'链接已复制\',\'toast-success\');setTimeout(function(){el.style.color=\'\';},1500);});}\n' +
    'updateCounter();setTimeout(function(){var t=document.getElementById(\'textEditor\'),c=document.getElementById(\'charCounter\'),u=document.querySelector(\'.upload-area\');if(t&&c&&u){var h=t.offsetHeight+c.offsetHeight;u.style.minHeight=h+\'px\';}},10);\n' +
    '<\/script>';
  return layout('shade', html);
}

function viewPage(share, origin) {
  if (share.hasPassword) {
    return passwordPromptPage(share.key, origin, share.expireLabel, share.expiresAt);
  }
  return renderShareContent(share, origin);
}

function passwordPromptPage(key, origin, expireLabel, expiresAt) {
  var html = '' +
    '<div class="container">' +
      '<div class="card" style="text-align:center">' +
        THEME_TOGGLE_POS + 
        '<div class="lock-icon-wrap">' +
          '<div class="lock-icon">' + ICONS.lock + '</div>' +
          '<h2 style="margin-top:0.75rem;font-size:1.1rem">此内容已加密</h2>' +
          '<p style="color:var(--text-secondary);font-size:0.85rem;margin-top:0.25rem">' + (expireLabel === 'burn' ? '输入密码查看，此链接仅可查看一次' : '输入密码访问，内容将在 <span id="pwCountdown"></span> 后自动销毁') + '</p>' +
        '</div>' +
        '<input type="password" id="passInput" placeholder="最多 6 位字符" autocomplete="off" maxlength="6" onkeydown="if(event.key===\'Enter\')submitPass()" oninput="this.value=this.value.replace(/\D/g,\'\')" style="margin-bottom:1rem">' +
        '<div class="pass-error" id="passError">' + ICONS.warning + '<span id="passErrorText"></span></div>' +
        '<button class="btn" id="submitBtn" onclick="submitPass()">' +
          ICONS.unlock + '解密查看' +
        '</button>' +
      '</div>' +
    '</div>' +
    '<script>\n' +
    'async function submitPass(){var p=document.getElementById(\'passInput\').value,btn=document.getElementById(\'submitBtn\'),err=document.getElementById(\'passError\');if(!p){var o=document.getElementById(\'fileToast\');if(o)o.remove();var t=document.createElement(\'div\');t.id=\'fileToast\';t.className=\'toast toast-warning\';t.style.margin=\'-0.5rem 0 0.5rem\';t.innerHTML=\'<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg> \\u8bf7\\u8f93\\u5165\\u5bc6\\u7801\';btn.parentNode.insertBefore(t,btn);setTimeout(function(){if(t.parentNode)t.remove();},2500);return;}btn.disabled=true;btn.innerHTML=\'' + ICONS.unlock + '验证中...\';try{var res=await fetch(\'/api/retrieve/' + key + '\',{method:\'POST\',headers:{\'Content-Type\':\'application/json\'},body:JSON.stringify({password:p})});if(!res.ok){var d=await res.json();document.getElementById(\'passErrorText\').textContent=d.error||\'密码错误\';err.classList.add(\'visible\');btn.disabled=false;btn.innerHTML=\'' + ICONS.unlock + '解密查看\';return;}var ct=res.headers.get(\'Content-Type\')||\'\';if(ct.includes(\'text/html\')){document.open();document.write(await res.text());document.close();}else{var blob=await res.blob(),fn=res.headers.get(\'X-Filename\')||\'download\',url=URL.createObjectURL(blob),a=document.createElement(\'a\');a.href=url;a.download=fn;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);err.style.color=\'#16A34A\';document.getElementById(\'passErrorText\').textContent=\'\\u2713 \\u4e0b\\u8f7d\\u5f00\\u59cb\';err.classList.add(\'visible\');btn.disabled=false;btn.innerHTML=\'' + ICONS.unlock + '解密查看\';}}catch(e){document.getElementById(\'passErrorText\').textContent=\'错误: \'+e.message;err.classList.add(\'visible\');btn.disabled=false;btn.innerHTML=\'' + ICONS.unlock + '解密查看\';}}\n' +
    (expireLabel !== 'burn' && expiresAt ? 'var ea=' + expiresAt + ';function pd(n){return n<10?\'0\'+n:\'\'+n;}function up(){var el=document.getElementById(\'pwCountdown\');if(!el)return;var s=Math.floor(ea-Date.now()/1000);if(s<=0){el.parentNode.innerHTML=\'此内容已自动销毁\';return;}var m=Math.floor(s/60),h=Math.floor(m/60),d=Math.floor(h/24);if(d>0)el.textContent=d+\' \'+(h%24)+\'小时\';else if(h>0)el.textContent=h+\'小时\'+pd(m%60)+\'分钟\';else if(m>0)el.textContent=m+\'分钟\'+pd(s%60)+\'秒\';else el.textContent=s+\'秒\';}up();setInterval(up,1000);' : '') + '\n' +
    '<\/script>';
  return layout(key, html);
}

function renderShareContent(share, origin) {
  var contentHtml;

  if (share.type === 'text') {
    var escaped = escapeHtml(share.content);
    contentHtml = '<div style="position:relative">' +
      '<div class="content-box">' + escaped + '</div>' +
      '<svg class="copy-icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" onclick="copyTextContent(this)" style="position:absolute;top:0.5rem;right:0.5rem;cursor:pointer;color:var(--text-secondary)"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>' +
    '</div>';
  } else {
    var files = getFileList(share);
    if (files.length > 1) {
      var items = files.map(function(f) {
        var dlUrl = '/api/retrieve/' + share.key + '?download&file=' + encodeURIComponent(f.name);
        var dlBtn = share.sessionToken
          ? '<form action="/api/retrieve/' + share.key + '" method="POST" enctype="multipart/form-data" class="file-dl-form"><input type="hidden" name="token" value="' + escapeHtml(share.sessionToken) + '"><input type="hidden" name="fileName" value="' + escapeHtml(f.name) + '"><button type="submit" class="btn btn-sm" style="display:inline-flex;align-items:center;gap:4px;padding:0.35rem 0.7rem;border-radius:6px">' + ICONS.download + '</button></form>'
          : '<a href="' + dlUrl + '" class="btn btn-sm" style="display:inline-flex;align-items:center;gap:4px;padding:0.35rem 0.7rem;border-radius:6px;text-decoration:none">' + ICONS.download + '</a>';
        return '<div class="file-item"><span class="file-item-name">' + escapeHtml(f.name) + '</span><span class="file-item-size">' + formatSize(f.size) + '</span><span class="file-item-action">' + dlBtn + '</span></div>';
      }).join('');
      contentHtml = '<div class="file-list">' + items + '</div>';
    } else if (files.length === 1) {
      var f = files[0];
      var dlUrl = share.sessionToken ? null : '/api/retrieve/' + share.key + '?download';
      contentHtml = '<div class="file-item" style="margin-bottom:0.75rem;padding:0.8rem 1rem">' +
        '<div style="display:flex;align-items:center;gap:12px;width:100%">' +
          '<div style="width:40px;height:40px;background:var(--primary-light);color:var(--primary);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0">' + ICONS.file + '</div>' +
          '<div style="flex:1;min-width:0">' +
            '<div style="font-weight:600;font-size:0.9rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escapeHtml(f.name) + '</div>' +
            '<div style="color:var(--text-secondary);font-size:0.8rem">' + formatSize(f.size) + '</div>' +
          '</div>' +
          (share.sessionToken
            ? '<form action="/api/retrieve/' + share.key + '" method="POST" enctype="multipart/form-data"><input type="hidden" name="token" value="' + escapeHtml(share.sessionToken) + '"><button type="submit" class="btn btn-sm" style="display:inline-flex;align-items:center;gap:4px;padding:0.5rem 1rem;font-size:0.85rem;font-weight:500">' + ICONS.download + ' 下载</button></form>'
            : '<a href="' + dlUrl + '" class="btn" style="display:inline-flex;align-items:center;gap:4px;padding:0.5rem 1rem;font-size:0.85rem;font-weight:500;width:auto;text-decoration:none">' + ICONS.download + ' 下载</a>'
          ) +
        '</div>' +
      '</div>';
    } else {
      contentHtml = '<div style="text-align:center;padding:20px;color:var(--text-secondary);font-size:0.9rem">未找到文件</div>';
    }
  }

  var totalSize = share.type === 'text'
    ? (share.content ? share.content.length : 0)
    : (share.fileSize || (share.files ? share.files.reduce(function(s, f) { return s + f.size; }, 0) : 0));

  var html = '' +
    '<div class="container">' +
      '<div class="card card-wide">' +
        THEME_TOGGLE_POS + 
                '<div class="meta-row">' +
          '<span class="tag">' + (share.type === 'text' ? '文本' : '文件') + '</span>' +
          '<span class="tag">' + (share.type === 'text' ? (share.content ? share.content.length : 0) + ' 字符' : formatSize(totalSize)) + '</span>' +
          '<span class="tag">' + ({'30m':'30 分钟后销毁','1h':'1 小时后销毁','6h':'6 小时后销毁','12h':'12 小时后销毁','burn':'阅后即焚'}[share.expireLabel] || share.expireLabel) + '</span>' +
        '</div>' +
        contentHtml +
        (share.expireLabel === 'burn'
          ? '<div class="warning-box" style="margin-top:0.5rem">' + ICONS.warning + ' 此链接仅可查看一次，已自动销毁</div>'
          : '<div class="warning-box" id="countdownBox" style="margin-top:0.5rem">' + ICONS.warning + ' 此链接将在 <span id="countdown"></span> 后自动销毁</div>') +
      '</div>' +
    '</div>' +
    '<script>\n' +
    'function copyTextContent(b){var t=b.parentNode.querySelector(\'.content-box\').textContent;navigator.clipboard.writeText(t).then(function(){b.style.color=\'#16A34A\';var o=document.getElementById(\'fileToast\');if(o)o.remove();var d=document.createElement(\'div\');d.id=\'fileToast\';d.className=\'toast toast-success\';d.innerHTML=\'<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> <span>\\u6587\\u672c\\u5df2\\u590d\\u5236</span>\';var wb=document.querySelector(\'.warning-box\');if(wb)wb.parentNode.insertBefore(d,wb.nextSibling);else b.parentNode.appendChild(d);setTimeout(function(){b.style.color=\'\';if(d.parentNode)d.remove();},2500);});}\n' +
    '(function(){var ea=' + (share.expiresAt || '0') + ';if(!ea)return;var el=document.getElementById(\'countdown\');if(!el)return;function update(){var s=Math.floor(ea-Date.now()/1000);if(s<=0){el.parentNode.innerHTML=\'' + ICONS.warning + ' 此链接已自动销毁\';return;}var m=Math.floor(s/60),h=Math.floor(m/60),d=Math.floor(h/24);if(d>0)el.textContent=d+\' \'+(h%24)+\'小时\';else if(h>0)el.textContent=h+\'小时\'+pad(m%60)+\'分钟\';else if(m>0)el.textContent=m+\'分钟\'+pad(s%60)+\'秒\';else el.textContent=s+\'秒\';}function pad(n){return n<10?\'0\'+n:\'\'+n;}update();setInterval(update,1000);})();\n' +
    '<\/script>';
  return layout(share.key, html);
}

function errorPage(title, message, origin) {
  var html = '' +
    '<div class="container">' +
      '<div class="card" style="text-align:center">' +
        THEME_TOGGLE_POS + 
        '<div class="error-page">' +
          '<h2>' + escapeHtml(title) + '</h2>' +
          (title === '404' ? '<div style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:0.5rem">Not Found</div>' : '') +
          '<div class="error-line"></div>' +
          '<p>' + escapeHtml(message) + '</p>' +
        '</div>' +
      '</div>' +
    '</div>';
  return layout('404', html);
}

function escapeHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}

function formatSize(bytes) {
  if (!bytes) return '0 B';
  var units = ['B', 'KB', 'MB', 'GB'];
  var i = 0;
  var size = bytes;
  while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
  return size.toFixed(i === 0 ? 0 : 1) + ' ' + units[i];
}

export { homePage, viewPage, renderShareContent, errorPage };
