// src/html.js
import { getFileList } from './lib.js';

const THEME = `
  @font-face {
    font-family: 'Sarasa Mono SC XLight';
    font-style: normal;
    font-weight: 200;
    src: url('/fonts/SarasaMonoSC-ExtraLightItalic.woff2') format('woff2');
    font-display: swap;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'SF Mono', 'Courier New', 'Consolas', 'Sarasa Mono SC XLight', 'Microsoft YaHei', 'PingFang SC', monospace;
    background: #fafafa;
    color: #333;
    font-size: 14px;
    line-height: 1.6;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .window {
    background: #fafafa;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    width: 100%;
    max-width: 640px;
    overflow: hidden;
  }
  .titlebar {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    border-bottom: 1px solid #e0e0e0;
    background: #f5f5f5;
    font-size: 13px;
    color: #888;
  }
  .dot { width: 10px; height: 10px; border-radius: 50%; }
  .dot.red { background: #ff5f57; }
  .dot.yellow { background: #ffbd2e; }
  .dot.green { background: #28c840; }
  .tabs {
    display: flex;
    border-bottom: 1px solid #e0e0e0;
    background: #fafafa;
  }
  .tab {
    padding: 8px 18px;
    font-size: 13px;
    color: #999;
    cursor: pointer;
    user-select: none;
  }
  .tab.active {
    border-bottom: 2px solid #333;
    color: #333;
    font-weight: 500;
  }
  .body-split {
    display: flex;
    min-height: 200px;
  }
  .panel {
    padding: 14px;
  }
  .panel-create { flex: 1; border-right: 1px solid #e8e8e8; }
  .panel-about { width: 170px; background: #f8f8f8; padding: 14px; }
  .panel-label {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
    font-size: 11px;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .panel-label .dot { width: 6px; height: 6px; }
  .editor-wrap {
    border: 1px solid #e8e8e8;
    border-radius: 2px;
    display: flex;
  }
  .editor {
    flex: 1;
    padding: 8px 10px;
    font-size: 13px;
    line-height: 1.6;
    background: #fff;
    min-height: 80px;
    max-height: 25vh;
    outline: none;
    font-family: 'SF Mono', 'Courier New', 'Consolas', 'Sarasa Mono SC XLight', 'Microsoft YaHei', 'PingFang SC', monospace;
    color: #333;
    overflow-y: auto;
    overflow-wrap: break-word;
    white-space: pre-wrap;
    resize: none;
    border: none;
  }
  .editor::placeholder { color: #bbb; }
  .editor::-webkit-scrollbar { width: 6px; }
  .editor::-webkit-scrollbar-track { background: transparent; }
  .editor::-webkit-scrollbar-thumb { background: #d0d0d0; border-radius: 3px; }
  .editor::-webkit-scrollbar-thumb:hover { background: #bbb; }
  .char-counter {
    text-align: right;
    font-size: 11px;
    color: #bbb;
    margin-top: 2px;
    padding-right: 2px;
  }
  .char-counter.over { color: #d32f2f; }
  #text-mode, #file-mode { min-height: 182px; }
  #text-mode { display: flex; flex-direction: column; }
  #file-mode { display: grid; grid-template-rows: 1fr auto; }
  #text-mode.hidden, #file-mode.hidden { display: none; }
  #file-mode .dropzone { min-height: 130px; }
  .editor { min-height: 100px; }
  #text-mode .editor-wrap { flex: 1; }
  .dropzone {
    border: 2px dashed #d0d0d0;
    border-radius: 4px;
    padding: 24px;
    text-align: center;
    background: #fff;
    cursor: pointer;
    color: #999;
    font-size: 13px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .dropzone:hover { border-color: #999; background: #fafafa; }
  .dropzone .icon { font-size: 24px; color: #ccc; margin-bottom: 4px; }
  .dropzone .hint { font-size: 11px; color: #ccc; margin-top: 4px; }
  .options-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 8px;
    margin-top: 8px;
    align-items: center;
  }
  .opt-label { color: #999; font-size: 11px; }
  .pill {
    padding: 2px 10px;
    border-radius: 2px;
    font-size: 11px;
    cursor: pointer;
    user-select: none;
  }
  .pill.active { background: #333; color: #fff; }
  .pill:not(.active) { color: #aaa; }
  .pill:not(.active):hover { color: #666; }
  .pass-input {
    border: 1px solid #ddd;
    padding: 3px 8px;
    border-radius: 2px;
    font-size: 13px;
    font-family: 'SF Mono', 'Courier New', 'Consolas', 'Sarasa Mono SC XLight', 'Microsoft YaHei', 'PingFang SC', monospace;
    -webkit-text-security: disc;
    color: #333;
    width: 70px;
  }
  .progress-wrap {
    margin-top: 8px;
    height: 3px;
    background: #e0e0e0;
    border-radius: 2px;
    overflow: hidden;
    display: none;
  }
  .progress-wrap.active { display: block; }
  .progress-bar {
    height: 100%;
    width: 0%;
    background: #0066b8;
    transition: width .15s ease;
    border-radius: 2px;
  }
  .btn {
    background: #333;
    color: #fff;
    padding: 6px 20px;
    border: none;
    border-radius: 3px;
    font-size: 12px;
    font-family: inherit;
    cursor: pointer;
    letter-spacing: 1px;
  }
  .btn:hover { background: #555; }
  a.btn { text-decoration: none; }
  .btn-sm { padding: 4px 14px; font-size: 11px; }
  .btn-green { background: #2e7d32; }
  .btn-green:hover { background: #388e3c; }
  .about-content { padding: 0; }
  .about-line { font-size: 11px; color: #999; padding: 1px 0; line-height: 1.7; }
  .about-sep { color: #ddd; }
  .about-ready { color: #2e7d32; }
  .statusbar {
    display: flex;
    justify-content: space-between;
    padding: 6px 14px;
    border-top: 1px solid #e0e0e0;
    background: #f5f5f5;
    font-size: 11px;
    color: #bbb;
  }
  .result-box {
    background: #f0f8f0;
    border: 1px solid #cfeacf;
    border-radius: 4px;
    padding: 10px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
  .result-link {
    font-size: 13px;
    color: #2e7d32;
    word-break: break-all;
  }
  .success-icon { color: #28c840; font-size: 18px; }
  .success-title { font-weight: 500; font-size: 14px; color: #2e7d32; }
  .meta-row { display: flex; gap: 20px; margin-top: 8px; font-size: 11px; color: #999; }
  .warning-box {
    margin-top: 10px;
    padding: 8px 10px;
    background: #fff8e1;
    border: 1px solid #ffe082;
    border-radius: 3px;
    font-size: 11px;
    color: #8d6e00;
  }
  .view-header {
    margin-bottom: 10px;
    font-size: 11px;
    color: #999;
    display: flex;
    gap: 12px;
  }
  .content-box {
    background: #fff;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    padding: 14px;
    font-size: 13px;
    color: #333;
    line-height: 1.7;
    font-family: 'SF Mono', 'Courier New', 'Consolas', 'Sarasa Mono SC XLight', 'Microsoft YaHei', 'PingFang SC', monospace;
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 60vh;
    overflow-y: auto;
  }
  .error-page { text-align: center; padding: 40px 20px; }
  .error-page h2 { font-size: 24px; color: #333; margin-bottom: 8px; }
  .error-page p { color: #999; font-size: 14px; }
  .hidden { display: none; }
  .mt-8 { margin-top: 8px; }
  .mt-12 { margin-top: 12px; }
  .flex { display: flex; }
  .gap-8 { gap: 8px; }
  .items-center { align-items: center; }
  .ml-auto { margin-left: auto; }
  .file-list:not(:empty) { margin-top: 8px; }
  .file-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    background: #fff;
    border: 1px solid #e8e8e8;
    border-radius: 3px;
    font-size: 12px;
    margin-bottom: 4px;
  }
  .file-item-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: 'SF Mono', 'Courier New', 'Consolas', 'Sarasa Mono SC XLight', 'Microsoft YaHei', 'PingFang SC', monospace; }
  .file-item-size { color: #888; white-space: nowrap; }
  .file-item-action { flex-shrink: 0; }
  .file-item-remove { cursor: pointer; color: #ccc; font-size: 14px; padding: 0 4px; }
  .file-item-remove:hover { color: #d32f2f; }
  .file-dl-form { display: inline; }
  .toast-warning {
    padding: 6px 10px;
    background: #fff8e1;
    border: 1px solid #ffe082;
    border-radius: 3px;
    font-size: 11px;
    color: #8d6e00;
    margin-top: 8px;
    animation: fadeIn 0.25s ease;
  }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

  .theme-toggle { cursor: pointer; user-select: none; }
  .theme-toggle:hover { color: #888; }
  .theme-toggle-light { display: inline; }
  .dark .theme-toggle-light { display: none; }
  .theme-toggle-dark { display: none; }
  .dark .theme-toggle-dark { display: inline; }

  /* Password page - command palette overlay */
  .lock-wrap {
    padding: 40px 20px;
    position: relative;
    background: #f5f5f5;
    min-height: 220px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .dark .lock-wrap { background: #1e1e1e; }
  .lock-fg-hint {
    position: absolute;
    top: 12px;
    left: 14px;
    font-size: 11px;
    color: #ccc;
    user-select: none;
    pointer-events: none;
  }
  .palette-card {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    width: 100%;
    max-width: 340px;
    overflow: hidden;
    position: relative;
    z-index: 1;
  }
  .dark .palette-card {
    background: #2d2d2d;
    border-color: #3c3c3c;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  }
  .palette-row {
    display: flex;
    align-items: center;
    padding: 12px 14px;
    border-bottom: 1px solid #e8e8e8;
    gap: 8px;
  }
  .dark .palette-row { border-bottom-color: #3c3c3c; }
  .palette-prompt { color: #888; font-size: 16px; font-weight: 600; flex-shrink: 0; }
  .palette-input {
    border: none; outline: none; flex: 1; font-size: 14px;
    font-family: inherit; background: transparent; color: #333;
    -webkit-text-security: disc;
  }
  .dark .palette-input { color: #d4d4d4; }
  .palette-footer {
    padding: 10px 14px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
  }
  .palette-hint-area {
    flex: 1;
    position: relative;
    min-height: 1.2em;
    font-size: 11px;
    color: #ccc;
  }
  .palette-hint-area .palette-error {
    position: absolute;
    inset: 0;
    font-size: 11px;
    display: flex;
    align-items: center;
    color: #d32f2f;
  }

  @media (max-width: 640px) {
    body { padding: 10px; }
    .body-split { flex-direction: column; }
    .panel-create { border-right: none; border-bottom: 1px solid #e8e8e8; }
    .panel-about { width: 100%; }
    .window { border-radius: 6px; }
    .tab { padding: 8px 14px; font-size: 12px; }
  }

  /* Dark mode */
  .dark body { background: #1e1e1e; color: #d4d4d4; }
  .dark .window { background: #252526; border-color: #3c3c3c; }
  .dark .titlebar { background: #2d2d2d; border-bottom-color: #3c3c3c; }
  .dark .tabs { background: #252526; border-bottom-color: #3c3c3c; }
  .dark .tab { color: #858585; }
  .dark .tab.active { border-bottom-color: #d4d4d4; color: #d4d4d4; }
  .dark .panel-create { border-right-color: #3c3c3c; border-bottom-color: #3c3c3c; }
  .dark .panel-about { background: #2d2d2d; }
  .dark .panel-label { color: #858585; }
  .dark .editor-wrap { border-color: #3c3c3c; }
  .dark .editor { background: #1e1e1e; color: #d4d4d4; }
  .dark .editor::placeholder { color: #858585; }
  .dark .editor::-webkit-scrollbar-thumb { background: #555; }
  .dark .editor::-webkit-scrollbar-thumb:hover { background: #777; }
  .dark .char-counter { color: #666; }
  .dark .char-counter.over { color: #ef5350; }
  .dark .dropzone { background: #1e1e1e; border-color: #3c3c3c; color: #858585; }
  .dark .dropzone:hover { border-color: #858585; background: #252526; }
  .dark .dropzone .icon { color: #555; }
  .dark .dropzone .hint { color: #555; }
  .dark .dropzone strong { color: #d4d4d4 !important; }
  .dark .file-item { background: #1e1e1e; border-color: #3c3c3c; color: #d4d4d4; }
  .dark .file-item-name { color: #d4d4d4; }
  .dark .file-item-size { color: #858585; }
  .dark .file-item-remove { color: #555; }
  .dark .file-item-remove:hover { color: #ef5350; }
  .dark .toast-warning { background: #3a3a1e; border-color: #5a5a2e; color: #d4d47a; }
  .dark .pill.active { background: #555; }
  .dark .pill:not(.active):hover { color: #aaa; }
  .dark .pass-input { background: #1e1e1e; border-color: #3c3c3c; color: #d4d4d4; }
  .dark .pass-input::placeholder { color: #666; }
  .dark .progress-wrap { background: #333; }
  .dark .progress-bar { background: #007acc; }
  .dark .btn { background: #3c3c3c; }
  .dark .btn:hover { background: #555; }
  .dark .btn-green { background: #1b5e20; }
  .dark .btn-green:hover { background: #2e7d32; }
  .dark .statusbar { background: #2d2d2d; border-top-color: #3c3c3c; color: #666; }
  .dark .result-box { background: #1e3a1e; border-color: #2e5a2e; }
  .dark .result-link { color: #6a9955; }
  .dark .success-icon { color: #6a9955; }
  .dark .success-title { color: #6a9955; }
  .dark .meta-row { color: #858585; }
  .dark .warning-box { background: #3a3a1e; border-color: #5a5a2e; color: #d4d47a; }
  .dark .view-header { color: #858585; }
  .dark .content-box { background: #1e1e1e; border-color: #3c3c3c; color: #d4d4d4; }
  .dark .error-page h2 { color: #d4d4d4; }
  .dark .error-page p { color: #858585; }
  .dark .error-page a { color: #d4d4d4 !important; }
  .dark .theme-toggle { color: #888; }
  .dark .theme-toggle:hover { color: #aaa; }
  .dark .about-line { color: #858585; }
  .dark .about-sep { color: #555; }
  .dark .about-ready { color: #6a9955; }

  /* Terminal overlay - floating window */
  @keyframes terminalIn {
    from { transform: translate(-50%, -50%) scale(0.85); opacity: 0; }
    to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  }
  #terminal-overlay {
    display: none;
    position: fixed;
    left: calc(50% + 20px);
    top: calc(50% + 10px);
    transform: translate(-50%, -50%);
    width: 520px;
    max-width: calc(100vw - 40px);
    height: 35vh;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    box-shadow: 0 12px 48px rgba(0,0,0,0.6);
    z-index: 9999;
    font-family: 'SF Mono', 'Courier New', 'Consolas', 'Sarasa Mono SC XLight', 'Microsoft YaHei', 'PingFang SC', monospace;
    font-size: 14px;
    color: #c7c7c7;
    overflow: hidden;
    flex-direction: column;
  }
  #terminal-overlay.open {
    display: flex;
    animation: terminalIn 0.2s ease-out;
  }
  .term-titlebar {
    display: flex;
    align-items: center;
    padding: 8px 14px;
    background: #222;
    border-bottom: 1px solid #333;
    cursor: move;
    user-select: none;
    -webkit-user-select: none;
  }
  .term-titlebar .term-dot {
    width: 10px; height: 10px; border-radius: 50%;
    margin-right: 6px;
  }
  .term-titlebar .term-dot.red { background: #ff5f56; }
  .term-titlebar .term-dot.yellow { background: #ffbd2e; }
  .term-titlebar .term-dot.green { background: #27c93f; }
  .term-titlebar .term-title {
    margin-left: 10px;
    font-size: 12px;
    color: #888;
  }
  #terminal-output {
    flex: 1;
    overflow-y: auto;
    white-space: pre-wrap;
    line-height: 1.5;
    padding: 14px;
    scrollbar-width: thin;
    scrollbar-color: #444 #111;
  }
  #terminal-output::-webkit-scrollbar { width: 6px; }
  #terminal-output::-webkit-scrollbar-track { background: #111; }
  #terminal-output::-webkit-scrollbar-thumb { background: #444; border-radius: 3px; }
  #terminal-output::-webkit-scrollbar-thumb:hover { background: #666; }
  #terminal-output .prompt { color: #33d16a; }
  #terminal-output .error { color: #ff4444; }
  #terminal-output .info { color: #888; }
  #terminal-input-line {
    display: flex;
    align-items: center;
    padding: 6px 14px;
    border-top: 1px solid #333;
    background: #111;
  }
  #terminal-input-line .prompt-label {
    color: #33d16a;
    margin-right: 8px;
    white-space: nowrap;
  }
  #terminal-input {
    background: transparent;
    border: none;
    outline: none;
    color: #c7c7c7;
    font-family: inherit;
    font-size: inherit;
    flex: 1;
    caret-color: #c7c7c7;
    ime-mode: disabled;
  }
  #terminal-password-input {
    background: transparent;
    border: none;
    outline: none;
    color: #c7c7c7;
    font-family: inherit;
    font-size: inherit;
    flex: 1;
    caret-color: #c7c7c7;
    ime-mode: disabled;
  }
`;

const TERMINAL_OVERLAY = `
    <div id="terminal-overlay">
      <div class="term-titlebar">
        <span class="term-dot red"></span>
        <span class="term-dot yellow"></span>
        <span class="term-dot green"></span>
        <span class="term-title">~/terminal</span>
      </div>
      <div id="terminal-output"></div>
      <div id="terminal-input-line">
        <span class="prompt-label" id="terminal-prompt"></span>
        <input type="text" id="terminal-input" autocomplete="off" spellcheck="false" />
        <input type="password" id="terminal-password-input" style="display:none" autocomplete="off" />
      </div>
    </div>`;

const TERMINAL_SCRIPT = `
<script>
(function() {
    var term={overlay:null,output:null,input:null,pwInput:null,promptEl:null,
      token:null,state:'idle',cmdHistory:[],keys:[],historyIdx:-1,
      drag:false,dragX:0,dragY:0,ps1:'guest@hub ~ %'};
    function init(){
      term.overlay=document.getElementById('terminal-overlay');
      term.output=document.getElementById('terminal-output');
      term.input=document.getElementById('terminal-input');
      term.pwInput=document.getElementById('terminal-password-input');
      term.promptEl=document.getElementById('terminal-prompt');
      term.input.addEventListener('keydown',onKey);
      term.input.addEventListener('input',function(){this.value=this.value.replace(/[^ -~]/g,'');});
      term.pwInput.addEventListener('keydown',onKey);
      term.pwInput.addEventListener('input',function(){this.value=this.value.replace(/[^ -~]/g,'');});
      initDrag();
    }
    function initDrag(){
      var titleBar=term.overlay.querySelector('.term-titlebar');
      if(!titleBar)return;
      titleBar.addEventListener('mousedown',function(e){
        if(e.button!==0)return;
        var rect=term.overlay.getBoundingClientRect();
        term.dragX=e.clientX-rect.left;
        term.dragY=e.clientY-rect.top;
        term.drag=true;
        e.preventDefault();
      });
    }
    document.addEventListener('mousemove',function(e){
      if(!term.drag)return;
      var left=e.clientX-term.dragX, top=e.clientY-term.dragY;
      var width=term.overlay.offsetWidth;
      left=Math.max(50-width, Math.min(left, window.innerWidth-50));
      top=Math.max(20, Math.min(top, window.innerHeight-50));
      term.overlay.style.left=left+'px';
      term.overlay.style.top=top+'px';
      term.overlay.style.transform='none';
    });
    document.addEventListener('mouseup',function(){
      term.drag=false;
    });
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape'){if(term.state!=='idle'){closeTerm();}return;}
      var tag=e.target.tagName;if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT')return;
      if(e.key==='~'||e.key==='Dead'||e.keyCode===192){
        if(term.state!=='idle')return;
        if(window.matchMedia('(pointer:coarse)').matches)return;
        var now=Date.now(); term.keys.push(now);
        term.keys=term.keys.filter(function(ts){return now-ts<500;});
        if(term.keys.length>=5){term.keys=[];e.preventDefault();openTerm();}
      }
    });
    function openTerm(){
      term.overlay.classList.add('open');
      term.overlay.style.left='';term.overlay.style.top='';term.overlay.style.transform='';
      term.output.innerHTML='';term.token=null;term.state='command';
      writeLine('  '+location.host+'  v1.0.0','info');
      writeLine('  share text & files','info');
      writeLine('  ---------------------','info');
      writeLine('  '+new Date().toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'})+'','info');writeLine('');
      term.input.style.display='block';
      term.pwInput.style.display='none';term.input.value='';term.input.focus();
      showPrompt();
    }
    function closeTerm(){
      term.overlay.classList.remove('open');term.token=null;term.state='idle';
    }
    function onKey(e){
      if(e.key==='Enter'){
        if(term.state==='password'){submitPass();return;}
        if(term.state==='command'){var val=term.input.value.trim();
          if(val)term.cmdHistory.push(val);term.historyIdx=term.cmdHistory.length;handleCommand(val);
        }
      }else if(e.key==='ArrowUp'){
        if(term.historyIdx>0)term.historyIdx--;
        term.input.value=term.cmdHistory[term.historyIdx]||'';e.preventDefault();
      }else if(e.key==='ArrowDown'){
        if(term.historyIdx<term.cmdHistory.length-1)term.historyIdx++;
        else term.historyIdx=term.cmdHistory.length;
        term.input.value=term.cmdHistory[term.historyIdx]||'';e.preventDefault();
      }else if(e.key==='Escape'){closeTerm();}
    }
    function submitPass(){
      var password=term.pwInput.value;writeLine('Password: '+password.replace(/./g,'*'));
      fetch('/api/terminal/auth',{method:'POST',
        headers:{'Content-Type':'application/json'},body:JSON.stringify({password:password})
      }).then(function(r){
        if(!r.ok)return r.json().then(function(d){throw new Error(d.error||'Login incorrect');});
        return r.json();
      }).then(function(d){
        term.token=d.token;term.state='command';term.ps1='root@hub ~ %';
        writeLine('');writeLine('Login successful','info');writeLine('');
        term.input.style.display='block';term.pwInput.style.display='none';
        term.input.value='';term.input.focus();showPrompt();
      }).catch(function(e){
        writeLine(e.message||'Login incorrect','error');term.pwInput.value='';
        term.pwInput.style.display='none';term.input.style.display='block';
        term.state='command';term.input.value='';term.input.focus();showPrompt();
      });
    }
    function handleCommand(cmd){
      var spaceIdx=cmd.indexOf(' '),cmdName=(spaceIdx<0?cmd:cmd.slice(0,spaceIdx)).toLowerCase();
      writeLine(term.ps1+' '+cmd,'prompt');
      if(!cmdName){showPrompt();return;}
      switch(cmdName){
        case'help':writeLine('');writeLine('Commands:','info');
          writeLine('  help     - This message');
          writeLine('  login    - Authenticate for admin commands');
          writeLine('  stats    - Usage stats (auth required)');
          writeLine('  clean    - Clean expired (auth required)');
          writeLine('  clear    - Clear screen');
          writeLine('  exit     - Close terminal');writeLine('');break;
        case'login':
          if(term.token){writeLine('Already logged in.','info');break;}
          term.state='password';term.input.style.display='none';
          term.pwInput.style.display='block';term.pwInput.value='';
          term.promptEl.textContent='Password: ';term.pwInput.focus();
          return;
        case'clear':term.output.innerHTML='';break;
        case'exit':closeTerm();return;
        case'stats':if(!term.token){writeLine('Not authenticated. Type login first.','error');}else{fetchStats();return;}break;
        case'clean':if(!term.token){writeLine('Not authenticated. Type login first.','error');}else{fetchClean();return;}break;
        default:writeLine('Not found: '+cmdName+'. Type help.','error');
      }showPrompt();
    }
    function showPrompt(){term.promptEl.textContent=term.ps1+' ';term.input.value='';term.input.focus();}
    function fetchStats(){
      writeLine('Fetching...','info');
      fetch('/api/terminal/stats',{headers:{'Authorization':'Bearer '+term.token}})
      .then(function(r){if(r.status===401){term.token=null;throw Error('Session expired, login again');}if(!r.ok)throw Error('Request failed');return r.json();})
      .then(function(d){if(typeof d.textShares!=='number')throw Error('Unexpected response');writeLine('');writeLine('  Text:  '+d.textShares);writeLine('  Files: '+d.fileShares);writeLine('  Size:  '+formatBytes(d.totalSizeBytes));writeLine('  Dead:  '+d.expiredShares);writeLine('');showPrompt();})
      .catch(function(e){writeLine(e.message,'error');showPrompt();});
    }
    function fetchClean(){
      writeLine('Cleaning...','info');
      fetch('/api/terminal/cleanup',{method:'POST',headers:{'Authorization':'Bearer '+term.token}})
      .then(function(r){if(r.status===401){term.token=null;throw Error('Session expired, login again');}if(!r.ok)throw Error('Request failed');return r.json();})
      .then(function(d){if(typeof d.cleaned!=='number')throw Error('Unexpected response');writeLine('');writeLine('  Cleaned: '+d.cleaned+' shares');writeLine('  Freed:   '+formatBytes(d.freedBytes));writeLine('');showPrompt();})
      .catch(function(e){writeLine(e.message,'error');showPrompt();});
    }
    function writeLine(txt,cls){var el=document.createElement('div');if(cls)el.className=cls;el.textContent=txt||'';term.output.appendChild(el);term.output.scrollTop=term.output.scrollHeight;}
    function formatBytes(b){if(!b)return'0 B';var units=['B','KB','MB','GB'],unitIdx=0,size=b;while(size>=1024&&unitIdx<3){size/=1024;unitIdx++;}return size.toFixed(unitIdx?1:0)+' '+units[unitIdx];}
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  })();
<\/script>`;

function layout(title, bodyContent) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<link href="/fonts/SarasaMonoSC-ExtraLightItalic.woff2" rel="preload" as="font" type="font/woff2" crossorigin>
<script>(function(){var t;try{t=localStorage.getItem('theme')}catch(e){}if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.className='dark'})();function toggleTheme(){var h=document.documentElement;h.className=h.className==='dark'?'':'dark';try{localStorage.setItem('theme',h.className||'light')}catch(e){}}</script>
<style>${THEME}</style>
</head>
<body>${bodyContent}</body>
</html>`;
}

function homePage(env, origin) {
  const maxSize = env?.MAX_UPLOAD_SIZE_MB || '50';
  return layout('~/share', `
    <div class="window">
      <div class="titlebar">
        <span class="dot red"></span>
        <span class="dot yellow"></span>
        <span class="dot green"></span>
        <span style="margin-left:10px">~/share</span>
      </div>
      <div class="tabs">
        <span class="tab active" data-tab="text" onclick="switchTab('text')">text.log</span>
        <span class="tab" data-tab="file" onclick="switchTab('file')">file.bin</span>
      </div>
      <div class="body-split">
        <div class="panel panel-create">
          <div class="panel-label">
            <span class="dot green"></span>
            <span>create</span>
          </div>
          <!-- Text mode -->
          <div id="text-mode">
            <div class="editor-wrap">
              <textarea class="editor" id="textEditor" placeholder="在此粘贴文本或开始输入..." oninput="updateCounter()"></textarea>
            </div>
            <div class="char-counter" id="charCounter">0 / 10,000</div>
          </div>
          <!-- File mode (hidden) -->
          <div id="file-mode" class="hidden">
            <div class="dropzone" id="dropzone">
              <div class="icon">↑</div>
              <div>拖拽文件到此处，或 <strong style="color:#333;cursor:pointer">点击选择</strong></div>
              <div class="hint">最多 5 个文件 · 单个最大 ${maxSize} MB</div>
            </div>
            <div id="fileListContainer" class="file-list"></div>
            <input type="file" id="fileInput" style="display:none" accept="*/*" multiple>
          </div>
          <!-- Options -->
          <div class="options-row">
            <span class="opt-label">--expire</span>
            <span class="pill active" data-expire="30m" onclick="selectExpire(this)">30m</span>
            <span class="pill" data-expire="1h" onclick="selectExpire(this)">1h</span>
            <span class="pill" data-expire="6h" onclick="selectExpire(this)">6h</span>
            <span class="pill" data-expire="12h" onclick="selectExpire(this)">12h</span>
          </div>
          <div class="flex items-center gap-8 mt-8">
            <span class="opt-label">--pass</span>
            <input class="pass-input" type="text" id="password" placeholder="······" autocomplete="off" maxlength="20" oninput="this.value=this.value.replace(/[^\x20-\x7E]/g,'')">
            <span class="btn ml-auto" id="createBtn" onclick="handleCreate()">CREATE</span>
          </div>
          <!-- Progress bar -->
          <div class="progress-wrap" id="progressWrap"><div class="progress-bar" id="progressBar"></div></div>
          <!-- Result (hidden) -->
          <div id="resultArea" class="hidden mt-12"></div>
        </div>
        <div class="panel panel-about">
          <div class="panel-label">
            <span class="dot yellow"></span>
            <span>[启动]</span>
          </div>
          <div class="about-content">
            <div class="about-line">&gt; 临时文本文件分享</div>
            <div class="about-line">&gt; 版本: v1.0.0</div>
            <div class="about-line about-sep">&gt;────────────────</div>
            <div class="about-line">&gt; 单文件上限: ${maxSize}MB</div>
            <div class="about-line">&gt; 单次最多: 5 个文件</div>
            <div class="about-line">&gt; 有效期: 30m ~ 12h</div>
            <div class="about-line about-sep">&gt;────────────────</div>
            <div class="about-line">&gt; 到期自动销毁</div>
            <div class="about-line">&gt; 无需注册</div>
            <div class="about-line">&gt; 即用即走</div>
            <div class="about-line about-ready">&gt; 就绪.</div>
          </div>
        </div>
      </div>
      <div class="statusbar">
        <span>${origin}</span>
        <span><span class="theme-toggle" onclick="toggleTheme()"><span class="theme-toggle-dark">dark</span><span class="theme-toggle-light">light</span></span> · v1.0.0 · UTF-8</span>
      </div>
    </div>
    <script>
    let selectedFiles = [];
    let currentTab = 'text';

    function switchTab(tab) {
      currentTab = tab;
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelector(\`.tab[data-tab="\${tab}"]\`).classList.add('active');
      document.getElementById('text-mode').classList.toggle('hidden', tab !== 'text');
      document.getElementById('file-mode').classList.toggle('hidden', tab !== 'file');
      document.getElementById('resultArea').classList.add('hidden');
    }

    const MAX_CHARS = 10000;

    function updateCounter() {
      const editor = document.getElementById("textEditor");
      const len = editor.value.length;
      const counter = document.getElementById("charCounter");
      counter.textContent = len.toLocaleString() + " / " + MAX_CHARS.toLocaleString();
      counter.classList.toggle("over", len > MAX_CHARS);
    }

    function selectExpire(el) {
      document.querySelectorAll('.pill[data-expire]').forEach(p => p.classList.remove('active'));
      el.classList.add('active');
    }

    const MAX_FILES = 5;

    function addFilesWithLimit(newFiles) {
      let added = 0;
      for (const f of newFiles) {
        if (selectedFiles.length >= MAX_FILES) break;
        selectedFiles.push(f);
        added++;
      }
      updateFileList();
      if (added < newFiles.length) {
        showToast('最多' + MAX_FILES + '个文件，已添加' + added + '/' + newFiles.length + '个');
      }
    }

    function showToast(msg) {
      const old = document.getElementById('fileToast');
      if (old) old.remove();
      const div = document.createElement('div');
      div.id = 'fileToast';
      div.className = 'toast-warning';
      div.textContent = msg;
      const anchor = document.getElementById('resultArea');
      anchor.parentNode.insertBefore(div, anchor);
      setTimeout(() => { if (div.parentNode) div.remove(); }, 3000);
    }

    function dropBorder(dark) { return dark ? '#3c3c3c' : '#d0d0d0'; }
    document.getElementById('dropzone').addEventListener('click', () => document.getElementById('fileInput').click());
    document.getElementById('fileInput').addEventListener('change', (e) => {
      if (e.target.files.length) {
        addFilesWithLimit(e.target.files);
        e.target.value = '';
      }
    });
    document.getElementById('dropzone').addEventListener('dragover', (e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#333'; });
    document.getElementById('dropzone').addEventListener('dragleave', (e) => { e.currentTarget.style.borderColor = dropBorder(document.documentElement.className==='dark'); });
    document.getElementById('dropzone').addEventListener('drop', (e) => {
      e.preventDefault();
      e.currentTarget.style.borderColor = dropBorder(document.documentElement.className==='dark');
      if (e.dataTransfer.files.length) {
        addFilesWithLimit(e.dataTransfer.files);
      }
    });

    function formatSize(bytes) {
      if (!bytes) return '0 B';
      const units = ['B', 'KB', 'MB', 'GB'];
      let i = 0;
      let size = bytes;
      while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
      return size.toFixed(i === 0 ? 0 : 1) + ' ' + units[i];
    }

    function updateFileList() {
      const container = document.getElementById('fileListContainer');
      if (selectedFiles.length === 0) {
        container.innerHTML = '';
        return;
      }
      container.innerHTML = selectedFiles.map((f, i) =>
        \`<div class="file-item">
          <span class="file-item-name">\${hE(f.name)}</span>
          <span class="file-item-size">\${formatSize(f.size)}</span>
          <span class="file-item-remove" data-index="\${i}">✕</span>
        </div>\`
      ).join('');
      container.querySelectorAll('.file-item-remove').forEach(el => {
        el.addEventListener('click', () => {
          const idx = parseInt(el.dataset.index);
          selectedFiles.splice(idx, 1);
          updateFileList();
        });
      });
    }

    function uploadWithProgress(formData) {
      return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        var pw = document.getElementById('progressWrap');
        var pb = document.getElementById('progressBar');
        xhr.upload.onprogress = function(e) {
          if (e.lengthComputable) {
            var pct = Math.round(e.loaded / e.total * 100);
            pb.style.width = pct + '%';
          }
        };
        xhr.onload = function() {
          pw.classList.remove('active');
          try {
            var d = JSON.parse(xhr.responseText);
            xhr.status >= 200 && xhr.status < 300 ? resolve(d) : reject(d);
          } catch(e) { reject({ error: 'Failed to parse response' }); }
        };
        xhr.onerror = function() { pw.classList.remove('active'); reject({ error: 'Network error' }); };
        pw.classList.add('active');
        pb.style.width = '0%';
        xhr.open('POST', '/api/share');
        xhr.send(formData);
      });
    }

    async function handleCreate() {
      const btn = document.getElementById('createBtn');
      btn.textContent = '...';
      btn.style.opacity = '0.6';

      const expire = document.querySelector('.pill.active[data-expire]').dataset.expire;
      const password = document.getElementById('password').value || null;

      try {
        var data;

        if (currentTab === 'text') {
          const content = document.getElementById('textEditor').value;
          if (!content.trim()) { showToast('请输入文本'); btn.textContent = 'CREATE'; btn.style.opacity = '1'; return; }
          if (content.length > MAX_CHARS) { showToast('文本内容超出最大字符限制'); btn.textContent = 'CREATE'; btn.style.opacity = '1'; return; }
          var res = await fetch('/api/share', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'text', content, expire, password })
          });
          data = await res.json();
          if (!res.ok) { showToast(data.error || '错误'); btn.textContent = 'CREATE'; btn.style.opacity = '1'; return; }
        } else {
          if (selectedFiles.length === 0) { showToast('请选择至少一个文件'); btn.textContent = 'CREATE'; btn.style.opacity = '1'; return; }
          const form = new FormData();
          form.append('type', 'file');
          for (const f of selectedFiles) form.append('file', f);
          form.append('expire', expire);
          if (password) form.append('password', password);
          data = await uploadWithProgress(form);
        }

        document.getElementById('resultArea').innerHTML = showResult(data);
        document.getElementById('resultArea').classList.remove('hidden');
      } catch(e) {
        showToast('错误: ' + (e.error || e.message));
      }
      btn.textContent = 'CREATE';
      btn.style.opacity = '1';
    }

    function hE(str) {
      return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
    }

    function showResult(data) {
      return \`
        <div class="flex items-center gap-8" style="margin-bottom:12px">
          <span class="success-icon">✓</span>
          <span class="success-title">分享链接已创建</span>
        </div>
        <div class="result-box">
          <span class="result-link">\${window.location.origin}/s/<strong>\${hE(data.key)}</strong></span>
          <button class="btn btn-sm btn-green" onclick="copyLink('\${hE(data.key)}', this)">copy</button>
        </div>
        <div class="meta-row">
          <span>\${(function(){var p=document.getElementById('password').value;return p?'密码:'+hE(p):'无密码';})()} · \${data.type === 'text' ? data.charCount + ' 字符' : formatSize(data.size) + (data.fileCount ? ' (' + data.fileCount + ' 个文件)' : '')} · 过期: \${data.expire}</span>
        </div>
        <div class="warning-box">! 此链接过期将自动销毁</div>
      \`;
    }

    function copyLink(key, el) {
      navigator.clipboard.writeText(window.location.origin + '/s/' + key).then(() => {
        el.textContent = 'copied!';
        setTimeout(() => el.textContent = 'copy', 1500);
      });
    }

    updateCounter();
    </script>
  ${TERMINAL_OVERLAY}${TERMINAL_SCRIPT}`);
}

function viewPage(share, origin) {
  if (share.hasPassword) {
    return passwordPromptPage(share.key, origin);
  }
  return renderShareContent(share, origin);
}

function passwordPromptPage(key, origin) {
  return layout('~/share/' + key, `
    <div class="window" style="max-width:420px">
      <div class="titlebar">
        <span class="dot red"></span>
        <span class="dot yellow"></span>
        <span class="dot green"></span>
        <span style="margin-left:10px">~/share/${key}</span>
      </div>
      <div class="lock-wrap">
        <div class="lock-fg-hint">~/.lock</div>
        <div class="palette-card">
          <div class="palette-row">
            <span class="palette-prompt">❯</span>
            <input class="palette-input" type="text" id="passInput" placeholder="输入密码" autocomplete="off" maxlength="20" onkeydown="if(event.key==='Enter')submitPass()" oninput="this.value=this.value.replace(/[^\\x20-\\x7E]/g,'')">
          </div>
          <div class="palette-footer">
            <div class="palette-hint-area">
              <div class="palette-error hidden" id="passError"></div>
              <span id="enterHint">[enter]</span>
            </div>
            <button class="btn btn-sm" onclick="submitPass()">DECRYPT ❯</button>
          </div>
        </div>
      </div>
      <div class="statusbar"><span>${origin}/s/${key}</span><span class="theme-toggle" onclick="toggleTheme()"><span class="theme-toggle-dark">dark</span><span class="theme-toggle-light">light</span></span></div>
    </div>
    <script>
    async function submitPass() {
      const pass = document.getElementById('passInput').value;
      const btn = document.querySelector('.palette-card .btn');
      const err = document.getElementById('passError');
      const hint = document.getElementById('enterHint');
      btn.textContent = '...'; btn.style.opacity = '0.6';
      try {
        const res = await fetch('/api/retrieve/${key}', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pass })
        });
        if (!res.ok) {
          const data = await res.json();
          err.textContent = data.error || '密码错误';
          err.classList.remove('hidden');
          hint.style.display = 'none';
          btn.textContent = 'DECRYPT ❯'; btn.style.opacity = '1';
          return;
        }
        const ct = res.headers.get('Content-Type') || '';
        if (ct.includes('text/html')) {
          document.open(); document.write(await res.text()); document.close();
        } else {
          const blob = await res.blob();
          const filename = res.headers.get('X-Filename') || 'download';
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = filename;
          document.body.appendChild(a); a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          err.style.color = '#2e7d32';
          err.textContent = '✓ 下载开始';
          err.classList.remove('hidden');
          hint.style.display = 'none';
          btn.textContent = 'DECRYPT ❯'; btn.style.opacity = '1';
        }
      } catch(e) {
        err.textContent = '错误: ' + e.message;
        err.classList.remove('hidden');
        hint.style.display = 'none';
        btn.textContent = 'DECRYPT ❯'; btn.style.opacity = '1';
      }
    }
    </script>
  `);
}

function renderShareContent(share, origin) {
  let contentHtml;

  if (share.type === 'text') {
    contentHtml = `<div class="content-box">${escapeHtml(share.content)}</div>`;
  } else {
    const files = getFileList(share);
    if (files.length > 1) {
      const items = files.map(f => {
        const dlUrl = `/api/retrieve/${share.key}?download&file=${encodeURIComponent(f.name)}`;
        const dlBtn = share.sessionToken
          ? `<form action="/api/retrieve/${share.key}" method="POST" enctype="multipart/form-data" class="file-dl-form">
               <input type="hidden" name="token" value="${escapeHtml(share.sessionToken)}">
               <input type="hidden" name="fileName" value="${escapeHtml(f.name)}">
               <button type="submit" class="btn btn-sm">⇩</button>
             </form>`
          : `<a href="${dlUrl}" class="btn btn-sm">⇩</a>`;
        return `<div class="file-item">
          <span class="file-item-name">${escapeHtml(f.name)}</span>
          <span class="file-item-size">${formatSize(f.size)}</span>
          <span class="file-item-action">${dlBtn}</span>
        </div>`;
      }).join('');
      contentHtml = `<div class="file-list">${items}</div>`;
    } else if (files.length === 1) {
      const f = files[0];
      const dlUrl = share.sessionToken ? null : `/api/retrieve/${share.key}?download`;
      contentHtml = `<div style="text-align:center;padding:20px">
        <div style="margin-bottom:12px;color:#888">${escapeHtml(f.name)} (${formatSize(f.size)})</div>
        ${share.sessionToken
          ? `<form action="/api/retrieve/${share.key}" method="POST" enctype="multipart/form-data">
               <input type="hidden" name="token" value="${escapeHtml(share.sessionToken)}">
               <button type="submit" class="btn">⇩ Download</button>
             </form>`
          : `<a href="${dlUrl}" class="btn">⇩ Download</a>`
        }
      </div>`;
    } else {
      contentHtml = '<div style="text-align:center;padding:20px;color:#888">未找到文件</div>';
    }
  }

  const totalSize = share.type === 'text'
    ? (share.content?.length || 0)
    : (share.fileSize || (share.files ? share.files.reduce((s, f) => s + f.size, 0) : 0));

  return layout('~/share/' + share.key, `
    <div class="window">
      <div class="titlebar">
        <span class="dot red"></span>
        <span class="dot yellow"></span>
        <span class="dot green"></span>
        <span style="margin-left:10px">~/share/${share.key}</span>
      </div>
      <div style="padding:16px">
        <div class="view-header">
          <span>类型: ${share.type}</span>
          <span>${share.type === 'text' ? '字符: ' + (share.content?.length || 0) : '大小: ' + formatSize(totalSize)}</span>
          <span>过期: ${share.expireLabel}</span>
        </div>
        ${contentHtml}
        <div class="warning-box" id="countdownBox">! 此链接将在 <span id="countdown"></span> 后自动销毁</div>
      </div>
      <div class="statusbar"><span>${origin}/s/${share.key}</span><span class="theme-toggle" onclick="toggleTheme()"><span class="theme-toggle-dark">dark</span><span class="theme-toggle-light">light</span></span></div>
    </div>
    <script>
    (function(){
      var expiresAt = ${share.expiresAt};
      if (!expiresAt) return;
      var el = document.getElementById('countdown');
      if (!el) return;
      function pad(n) { return n < 10 ? '0' + n : '' + n; }
      function update() {
        var s = Math.floor(expiresAt - Date.now() / 1000);
        if (s <= 0) { el.parentNode.innerHTML = '! 此链接已自动销毁'; return; }
        var m = Math.floor(s / 60);
        var h = Math.floor(m / 60);
        var d = Math.floor(h / 24);
        if (d > 0) el.textContent = d + 'd ' + (h % 24) + 'h';
        else if (h > 0) el.textContent = h + 'h ' + pad(m % 60) + 'm';
        else if (m > 0) el.textContent = m + 'm ' + pad(s % 60) + 's';
        else el.textContent = s + 's';
      }
      update();
      setInterval(update, 1000);
    })();
    <\/script>
  `);
}

function errorPage(title, message, origin) {
  return layout('~/error', `
    <div class="window" style="max-width:420px">
      <div class="titlebar">
        <span class="dot red"></span>
        <span class="dot yellow"></span>
        <span class="dot green"></span>
        <span style="margin-left:10px">~/error</span>
      </div>
      <div class="error-page">
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(message)}</p>
        <div class="mt-12"><a href="/" style="color:#333;text-decoration:underline;font-size:13px">❮ 返回首页</a></div>
      </div>
      <div class="statusbar"><span>${origin}</span><span class="theme-toggle" onclick="toggleTheme()"><span class="theme-toggle-dark">dark</span><span class="theme-toggle-light">light</span></span></div>
    </div>
  `);
}

function escapeHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}

function formatSize(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
  return size.toFixed(i === 0 ? 0 : 1) + ' ' + units[i];
}

export { homePage, viewPage, renderShareContent, errorPage };
