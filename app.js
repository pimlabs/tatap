(function(){
  "use strict";

  var STORE_KEY = "tatap:state";
  var LIB_STORE_KEY = "tatap:library";
  var CALIB_TEXT = "Pagi ini langit terlihat cerah dengan sedikit awan putih yang bergerak pelan. Aku menyiapkan secangkir kopi hangat sambil mendengarkan suara burung di luar jendela. Hari ini ada beberapa hal yang ingin aku selesaikan, tapi aku mencoba untuk tidak terburu-buru. Kadang hal-hal terbaik datang ketika kita memberi diri sendiri sedikit ruang untuk bernapas dan berpikir jernih sebelum melangkah.";

  var defaults = {
    script: "",
    size: 48,
    margin: 10,
    speed: 70,
    bg: "#0E0F11",
    text: "#F2EFE9",
    mirror: false,
    countdown: true,
    focusLine: true,
    highlight: true,
    autoPause: false,
    activeLibId: null,
    remoteEnabled: false
  };

  function loadState(){
    try{
      var raw = localStorage.getItem(STORE_KEY);
      if(!raw) return Object.assign({}, defaults);
      var parsed = JSON.parse(raw);
      return Object.assign({}, defaults, parsed);
    }catch(e){
      return Object.assign({}, defaults);
    }
  }
  function saveState(){
    try{ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }catch(e){}
  }

  var state = loadState();

  // ---------- Naskah library (multi-script, localStorage) ----------
  function loadLibrary(){
    try{
      var raw = localStorage.getItem(LIB_STORE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    }catch(e){
      return [];
    }
  }
  function saveLibrary(){
    try{ localStorage.setItem(LIB_STORE_KEY, JSON.stringify(library)); }catch(e){}
  }
  function genLibId(){
    return "n" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
  function firstLineSnippet(text){
    var lines = (text || "").split("\n");
    for(var i = 0; i < lines.length; i++){
      var t = lines[i].trim();
      if(t && t !== "---") return t.length > 40 ? t.slice(0, 40) + "…" : t;
    }
    return "Naskah tanpa judul";
  }

  var library = loadLibrary();

  // ---------- Element refs ----------
  var el = {
    script: document.getElementById("script"),
    importMdBtn: document.getElementById("importMdBtn"),
    importMdInput: document.getElementById("importMdInput"),
    libSaveBtn: document.getElementById("libSaveBtn"),
    libSaveBtnLabel: document.getElementById("libSaveBtnLabel"),
    libOpenBtn: document.getElementById("libOpenBtn"),
    libCloseBtn: document.getElementById("libCloseBtn"),
    libCount: document.getElementById("libCount"),
    libModal: document.getElementById("libModal"),
    libList: document.getElementById("libList"),
    libEmptyHint: document.getElementById("libEmptyHint"),
    sizeRange: document.getElementById("sizeRange"),
    sizeVal: document.getElementById("sizeVal"),
    marginRange: document.getElementById("marginRange"),
    marginVal: document.getElementById("marginVal"),
    speedRange: document.getElementById("speedRange"),
    speedVal: document.getElementById("speedVal"),
    bgColor: document.getElementById("bgColor"),
    textColor: document.getElementById("textColor"),
    presetDark: document.getElementById("presetDark"),
    presetLight: document.getElementById("presetLight"),
    mirrorToggle: document.getElementById("mirrorToggle"),
    countdownToggle: document.getElementById("countdownToggle"),
    focusLineToggle: document.getElementById("focusLineToggle"),
    highlightToggle: document.getElementById("highlightToggle"),
    autoPauseToggle: document.getElementById("autoPauseToggle"),
    remoteToggle: document.getElementById("remoteToggle"),
    becomeRemoteBtn: document.getElementById("becomeRemoteBtn"),
    remoteBadgeSep: document.getElementById("remoteBadgeSep"),
    remoteBadge: document.getElementById("remoteBadge"),
    remoteBadgeText: document.getElementById("remoteBadgeText"),
    remoteView: document.getElementById("remoteView"),
    remoteConnect: document.getElementById("remoteConnect"),
    remotePad: document.getElementById("remotePad"),
    remoteCodeInput: document.getElementById("remoteCodeInput"),
    remoteConnectBtn: document.getElementById("remoteConnectBtn"),
    remoteError: document.getElementById("remoteError"),
    remoteBackBtn: document.getElementById("remoteBackBtn"),
    remoteStatus: document.getElementById("remoteStatus"),
    remoteBtnPlayPause: document.getElementById("remoteBtnPlayPause"),
    remoteBtnPlayPauseIcon: document.querySelector("#remoteBtnPlayPause use"),
    remoteBtnSpeedDown: document.getElementById("remoteBtnSpeedDown"),
    remoteSpeedLabel: document.getElementById("remoteSpeedLabel"),
    remoteBtnSpeedUp: document.getElementById("remoteBtnSpeedUp"),
    remoteBtnPrev: document.getElementById("remoteBtnPrev"),
    remoteBtnNext: document.getElementById("remoteBtnNext"),
    remoteBtnRestart: document.getElementById("remoteBtnRestart"),
    remoteBtnExit: document.getElementById("remoteBtnExit"),
    remoteDisconnectBtn: document.getElementById("remoteDisconnectBtn"),
    estimateInfo: document.getElementById("estimateInfo"),
    calibBtn: document.getElementById("calibBtn"),
    startBtn: document.getElementById("startBtn"),

    panelNaskah: document.getElementById("panelNaskah"),
    panelSetting: document.getElementById("panelSetting"),
    panelPreview: document.getElementById("panelPreview"),
    tabBtnNaskah: document.getElementById("tabBtnNaskah"),
    tabBtnSetting: document.getElementById("tabBtnSetting"),
    tabBtnPreview: document.getElementById("tabBtnPreview"),
    previewBox: document.getElementById("previewBox"),
    previewInner: document.getElementById("previewInner"),
    previewFocusLine: document.getElementById("previewFocusLine"),
    previewFade: document.getElementById("previewFade"),

    calibModal: document.getElementById("calibModal"),
    calibSample: document.getElementById("calibSample"),
    calibTimerLabel: document.getElementById("calibTimerLabel"),
    calibStartBtn: document.getElementById("calibStartBtn"),
    calibCancelBtn: document.getElementById("calibCancelBtn"),

    setup: document.getElementById("setup"),
    stage: document.getElementById("stage"),
    stageInner: document.getElementById("stageInner"),
    stageMirror: document.getElementById("stageMirror"),
    stageText: document.getElementById("stageText"),
    measurer: document.getElementById("measurer"),
    focusLineEl: document.getElementById("focusLine"),
    stageProgress: document.getElementById("stageProgress"),
    countdownOverlay: document.getElementById("countdownOverlay"),
    countdownNum: document.getElementById("countdownNum"),

    sectionPanel: document.getElementById("sectionPanel"),
    sectionList: document.getElementById("sectionList"),
    closeSectionPanel: document.getElementById("closeSectionPanel"),

    controlBar: document.getElementById("controlBar"),
    btnRestart: document.getElementById("btnRestart"),
    btnSections: document.getElementById("btnSections"),
    btnSpeedToggle: document.getElementById("btnSpeedToggle"),
    speedPopover: document.getElementById("speedPopover"),
    btnSpeedDown: document.getElementById("btnSpeedDown"),
    btnSpeedUp: document.getElementById("btnSpeedUp"),
    barSpeedLabel: document.getElementById("barSpeedLabel"),
    btnPlayPause: document.getElementById("btnPlayPause"),
    btnPlayPauseIcon: document.querySelector("#btnPlayPause use"),
    btnExit: document.getElementById("btnExit")
  };

  function applyStateToForm(){
    el.script.value = state.script;
    el.sizeRange.value = state.size;
    el.sizeVal.textContent = state.size + "px";
    el.marginRange.value = state.margin;
    el.marginVal.textContent = state.margin + "%";
    el.speedRange.value = state.speed;
    el.speedVal.textContent = state.speed + " px/dtk";
    el.bgColor.value = state.bg;
    el.textColor.value = state.text;
    el.mirrorToggle.checked = !!state.mirror;
    el.countdownToggle.checked = !!state.countdown;
    el.focusLineToggle.checked = !!state.focusLine;
    el.highlightToggle.checked = !!state.highlight;
    el.autoPauseToggle.checked = !!state.autoPause;
    el.remoteToggle.checked = !!state.remoteEnabled;
  }
  applyStateToForm();

  // ---------- Setup screen tabs (mobile only — desktop shows all 3 via CSS) ----------
  var tabPanels = { naskah: el.panelNaskah, setting: el.panelSetting, preview: el.panelPreview };
  var tabBtns = { naskah: el.tabBtnNaskah, setting: el.tabBtnSetting, preview: el.tabBtnPreview };
  function setActiveTab(name){
    Object.keys(tabPanels).forEach(function(key){
      tabPanels[key].classList.toggle("active", key === name);
      tabBtns[key].classList.toggle("active", key === name);
    });
    if(name === "preview") updatePreviewBox();
  }
  el.tabBtnNaskah.addEventListener("click", function(){ setActiveTab("naskah"); });
  el.tabBtnSetting.addEventListener("click", function(){ setActiveTab("setting"); });
  el.tabBtnPreview.addEventListener("click", function(){ setActiveTab("preview"); });

  var saveTimer = null;
  function scheduleSave(){
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveState, 300);
  }

  // ---------- Tokenizer (shared by stage render + measurer) ----------
  // Lines: type 'content' | 'blank' | 'pause'
  // '---' on its own line marks a section break before the next line.
  // '[pause]' on its own line marks a manual auto-pause point.
  function tokenizeScript(raw){
    var rawLines = (raw || "").split("\n");
    var lines = [];
    var sectionStartIndices = [];
    var pendingBreak = false;
    for(var i = 0; i < rawLines.length; i++){
      var t = rawLines[i].trim();
      if(t === "---"){ pendingBreak = true; continue; }
      var type = "content";
      if(t === "") type = "blank";
      else if(t === "[pause]") type = "pause";
      if(pendingBreak){ sectionStartIndices.push(lines.length); pendingBreak = false; }
      lines.push({ type: type, text: (type === "content") ? rawLines[i] : "" });
    }
    return { lines: lines, sectionStartIndices: sectionStartIndices };
  }

  // ---------- Markdown import (strip syntax before tokenizeScript sees it) ----------
  // Runs on raw text BEFORE tokenizeScript. Lines that are exactly "---" are left
  // untouched so the section-break convention above keeps working.
  var EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu;
  var HEADING_RE = /^\s{0,3}#{1,6}\s+\S/;
  var SECTION_HEADING_RE = /^\s{0,3}#{1,2}\s+\S/;
  function stripMarkdownLine(line){
    if(line.trim() === "---") return line;
    var out = line.replace(/^\s{0,3}#{1,6}\s+/, "");
    out = out.replace(/\*\*([^*]+)\*\*/g, "$1");
    out = out.replace(/\*([^*\s][^*]*)\*/g, "$1");
    out = out.replace(/_([^_\s][^_]*)_/g, "$1");
    out = out.replace(EMOJI_RE, "");
    return out;
  }
  // Insert a "---" section break before H1/H2 headings so the resulting section
  // label (first content line after the break) is automatically the heading text.
  // Must run BEFORE stripMarkdownLine removes the "#" marker, since that's the
  // only place we can still tell a line was a heading.
  function autoSectionizeMarkdown(text){
    var rawLines = (text || "").split("\n");
    var out = [];
    var sawContent = false;
    for(var i = 0; i < rawLines.length; i++){
      var line = rawLines[i];
      if(SECTION_HEADING_RE.test(line) && sawContent && out[out.length - 1].trim() !== "---"){
        out.push("---");
      }
      out.push(line);
      if(line.trim() !== "") sawContent = true;
    }
    return out.join("\n");
  }
  function stripMarkdown(text){
    return autoSectionizeMarkdown(text || "").split("\n").map(stripMarkdownLine).join("\n");
  }
  function looksLikeMarkdown(text){
    var lines = (text || "").split("\n");
    for(var i = 0; i < lines.length; i++){
      var t = lines[i];
      if(t.trim() === "---") continue;
      if(HEADING_RE.test(t)) return true;
      if(/\*\*[^*]+\*\*/.test(t)) return true;
      if(/(^|\s)\*[^*\s][^*]*\*(?=$|\s)/.test(t)) return true;
      if(EMOJI_RE.test(t)) return true;
    }
    return false;
  }

  function renderLinesInto(container, tokenized){
    container.innerHTML = "";
    var lineEls = [];
    var sectionAnchorsLocal = [];
    var wordCount = 0;
    for(var i = 0; i < tokenized.lines.length; i++){
      var item = tokenized.lines[i];
      var div = document.createElement("div");
      div.className = "line";
      if(item.type === "content"){
        div.textContent = item.text;
        var words = item.text.trim().split(/\s+/).filter(Boolean);
        wordCount += words.length;
      } else if(item.type === "blank"){
        div.className += " line-blank";
        div.innerHTML = "&nbsp;";
      } else if(item.type === "pause"){
        div.className += " line-pausemark";
        div.dataset.pause = "1";
      }
      if(tokenized.sectionStartIndices.indexOf(i) !== -1){
        sectionAnchorsLocal.push({ el: div, lineIndex: i });
      }
      container.appendChild(div);
      lineEls.push(div);
    }
    return { lineEls: lineEls, sectionAnchors: sectionAnchorsLocal, wordCount: wordCount };
  }

  function measureScript(text, fontSize, marginPercent){
    var w = window.innerWidth * (100 - marginPercent * 2) / 100;
    el.measurer.style.width = Math.max(80, w) + "px";
    el.measurer.style.fontSize = fontSize + "px";
    var tokenized = tokenizeScript(text);
    var result = renderLinesInto(el.measurer, tokenized);
    var height = el.measurer.scrollHeight;
    return { height: height, wordCount: result.wordCount, sectionCount: result.sectionAnchors.length + 1 };
  }

  // ---------- Live estimate ----------
  var estimateTimer = null;
  function scheduleEstimate(){
    clearTimeout(estimateTimer);
    estimateTimer = setTimeout(function(){ updateEstimate(); updatePreviewBox(); }, 150);
  }
  function updateEstimate(){
    var m = measureScript(state.script, state.size, state.margin);
    var seconds = state.speed > 0 ? m.height / state.speed : 0;
    var mins = Math.floor(seconds / 60);
    var secs = Math.round(seconds % 60);
    el.estimateInfo.innerHTML =
      "≈ <b>" + mins + "m " + secs + "d</b> &middot; <b>" + m.wordCount + "</b> kata &middot; <b>" + m.sectionCount + "</b> bagian";
  }
  updateEstimate();

  // ---------- Preview panel (render mini naskah pakai setting asli) ----------
  function updatePreviewBox(){
    var tokenized = tokenizeScript(state.script);
    el.previewBox.style.background = state.bg;
    el.previewFade.style.background = "linear-gradient(to top, " + state.bg + ", transparent)";
    el.previewInner.style.color = state.text;
    el.previewInner.style.fontSize = state.size + "px";
    el.previewInner.style.maxWidth = (100 - state.margin * 2) + "%";
    el.previewFocusLine.style.display = state.focusLine ? "block" : "none";
    renderLinesInto(el.previewInner, tokenized);
  }
  updatePreviewBox();

  // ---------- Form wiring ----------
  function applyScriptText(text){
    el.script.value = text;
    state.script = text;
    scheduleSave();
    scheduleEstimate();
  }
  el.script.addEventListener("input", function(){
    state.script = el.script.value;
    scheduleSave();
    scheduleEstimate();
  });
  el.script.addEventListener("paste", function(e){
    var text = e.clipboardData && e.clipboardData.getData("text/plain");
    if(text == null || !looksLikeMarkdown(text)) return;
    e.preventDefault();
    var cleaned = stripMarkdown(text);
    var start = el.script.selectionStart;
    var end = el.script.selectionEnd;
    var value = el.script.value;
    applyScriptText(value.slice(0, start) + cleaned + value.slice(end));
    var newPos = start + cleaned.length;
    el.script.selectionStart = el.script.selectionEnd = newPos;
  });
  el.importMdBtn.addEventListener("click", function(){
    el.importMdInput.click();
  });
  el.importMdInput.addEventListener("change", function(){
    var file = el.importMdInput.files && el.importMdInput.files[0];
    if(!file) return;
    var reader = new FileReader();
    reader.onload = function(){
      state.activeLibId = null;
      applyScriptText(stripMarkdown(String(reader.result)));
    };
    reader.readAsText(file);
    el.importMdInput.value = "";
  });

  // ---------- Library wiring ----------
  function updateLibCount(){
    el.libCount.textContent = library.length;
  }
  updateLibCount();

  function renderLibList(){
    el.libList.innerHTML = "";
    var sorted = library.slice().sort(function(a, b){ return b.updatedAt - a.updatedAt; });
    el.libEmptyHint.style.display = sorted.length ? "none" : "block";
    sorted.forEach(function(entry){
      var row = document.createElement("div");
      row.className = "libItem";

      var info = document.createElement("div");
      info.className = "libInfo";
      var title = document.createElement("div");
      title.className = "libTitle";
      title.textContent = entry.title;
      var meta = document.createElement("div");
      meta.className = "libMeta";
      meta.textContent = new Date(entry.updatedAt).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
      info.appendChild(title);
      info.appendChild(meta);

      var loadBtn = document.createElement("button");
      loadBtn.type = "button";
      loadBtn.textContent = "Muat";
      loadBtn.addEventListener("click", function(){
        state.activeLibId = entry.id;
        applyScriptText(entry.script);
        scheduleSave();
        el.libModal.hidden = true;
      });

      var delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "libDelete";
      delBtn.textContent = "Hapus";
      delBtn.addEventListener("click", function(){
        if(!confirm('Hapus naskah "' + entry.title + '"?')) return;
        library = library.filter(function(x){ return x.id !== entry.id; });
        saveLibrary();
        if(state.activeLibId === entry.id){ state.activeLibId = null; scheduleSave(); }
        updateLibCount();
        renderLibList();
      });

      row.appendChild(info);
      row.appendChild(loadBtn);
      row.appendChild(delBtn);
      el.libList.appendChild(row);
    });
  }

  el.libSaveBtn.addEventListener("click", function(){
    if(!state.script || !state.script.trim()){ el.script.focus(); return; }
    var existing = state.activeLibId && library.filter(function(x){ return x.id === state.activeLibId; })[0];
    if(existing){
      existing.script = state.script;
      existing.updatedAt = Date.now();
    } else {
      var title = prompt("Nama naskah:", firstLineSnippet(state.script));
      if(title === null) return;
      title = title.trim() || "Naskah tanpa judul";
      var entry = { id: genLibId(), title: title, script: state.script, updatedAt: Date.now() };
      library.push(entry);
      state.activeLibId = entry.id;
      scheduleSave();
    }
    saveLibrary();
    updateLibCount();
    var original = el.libSaveBtnLabel.textContent;
    el.libSaveBtnLabel.textContent = "Tersimpan!";
    setTimeout(function(){ el.libSaveBtnLabel.textContent = original; }, 1200);
  });

  el.libOpenBtn.addEventListener("click", function(){
    renderLibList();
    el.libModal.hidden = false;
  });
  el.libCloseBtn.addEventListener("click", function(){ el.libModal.hidden = true; });
  el.sizeRange.addEventListener("input", function(){
    state.size = parseInt(el.sizeRange.value, 10);
    el.sizeVal.textContent = state.size + "px";
    scheduleSave();
    scheduleEstimate();
  });
  el.marginRange.addEventListener("input", function(){
    state.margin = parseInt(el.marginRange.value, 10);
    el.marginVal.textContent = state.margin + "%";
    scheduleSave();
    scheduleEstimate();
  });
  el.speedRange.addEventListener("input", function(){
    state.speed = parseInt(el.speedRange.value, 10);
    el.speedVal.textContent = state.speed + " px/dtk";
    scheduleSave();
    scheduleEstimate();
  });
  el.bgColor.addEventListener("input", function(){ state.bg = el.bgColor.value; scheduleSave(); scheduleEstimate(); });
  el.textColor.addEventListener("input", function(){ state.text = el.textColor.value; scheduleSave(); scheduleEstimate(); });
  el.mirrorToggle.addEventListener("change", function(){ state.mirror = el.mirrorToggle.checked; scheduleSave(); });
  el.countdownToggle.addEventListener("change", function(){ state.countdown = el.countdownToggle.checked; scheduleSave(); });
  el.focusLineToggle.addEventListener("change", function(){ state.focusLine = el.focusLineToggle.checked; scheduleSave(); scheduleEstimate(); });
  el.highlightToggle.addEventListener("change", function(){ state.highlight = el.highlightToggle.checked; scheduleSave(); });
  el.autoPauseToggle.addEventListener("change", function(){ state.autoPause = el.autoPauseToggle.checked; scheduleSave(); });
  el.remoteToggle.addEventListener("change", function(){ state.remoteEnabled = el.remoteToggle.checked; scheduleSave(); });

  el.presetDark.addEventListener("click", function(){
    state.bg = "#0E0F11"; state.text = "#F2EFE9";
    el.bgColor.value = state.bg; el.textColor.value = state.text;
    scheduleSave(); scheduleEstimate();
  });
  el.presetLight.addEventListener("click", function(){
    state.bg = "#FFFFFF"; state.text = "#111111";
    el.bgColor.value = state.bg; el.textColor.value = state.text;
    scheduleSave(); scheduleEstimate();
  });

  // ---------- Calibration ----------
  var calibTimer = null, calibStart = null, calibRunning = false;

  el.calibBtn.addEventListener("click", function(){
    el.calibSample.textContent = CALIB_TEXT;
    el.calibTimerLabel.textContent = "0.0 detik";
    el.calibStartBtn.textContent = "▶ Mulai baca";
    calibRunning = false;
    el.calibModal.hidden = false;
  });
  function closeCalibModal(){
    if(calibTimer) clearInterval(calibTimer);
    el.calibModal.hidden = true;
  }
  el.calibCancelBtn.addEventListener("click", closeCalibModal);
  el.calibStartBtn.addEventListener("click", function(){
    if(!calibRunning){
      calibRunning = true;
      calibStart = Date.now();
      el.calibStartBtn.textContent = "⏹ Selesai";
      calibTimer = setInterval(function(){
        var sec = (Date.now() - calibStart) / 1000;
        el.calibTimerLabel.textContent = sec.toFixed(1) + " detik";
      }, 100);
    } else {
      clearInterval(calibTimer);
      var elapsed = (Date.now() - calibStart) / 1000;
      calibRunning = false;
      if(elapsed < 3){
        el.calibTimerLabel.textContent = "Kecepetan, coba lagi ya (minimal 3 detik)";
        el.calibStartBtn.textContent = "▶ Mulai baca";
        return;
      }
      var m = measureScript(CALIB_TEXT, state.size, state.margin);
      var newSpeed = Math.round(m.height / elapsed);
      newSpeed = Math.max(20, Math.min(600, newSpeed));
      if(newSpeed > parseInt(el.speedRange.max, 10)){
        el.speedRange.max = newSpeed + 20;
      }
      state.speed = newSpeed;
      el.speedRange.value = newSpeed;
      el.speedVal.textContent = newSpeed + " px/dtk";
      scheduleSave();
      updateEstimate();
      closeCalibModal();
    }
  });

  // ---------- Prompter engine ----------
  var anim = { raf: null, lastTs: 0, pos: 0, textHeight: 0, playing: false, countdownTimer: null };
  var lineElements = [];
  var sectionAnchors = [];
  var ptr = 0;

  function clearAllHighlights(){
    for(var i = 0; i < lineElements.length; i++) lineElements[i].classList.remove("line-active");
  }
  function setHighlight(i){
    clearAllHighlights();
    if(lineElements[i]) lineElements[i].classList.add("line-active");
  }

  function buildStageContent(){
    var tokenized = tokenizeScript(state.script);
    el.stageText.style.fontSize = state.size + "px";
    el.stageText.style.color = state.text;
    el.stageText.style.maxWidth = (100 - state.margin * 2) + "%";
    var result = renderLinesInto(el.stageText, tokenized);
    lineElements = result.lineEls;
    sectionAnchors = result.sectionAnchors;
    el.stage.style.background = state.bg;
    el.stageMirror.style.transform = state.mirror ? "scaleX(-1)" : "scaleX(1)";
    el.focusLineEl.style.display = state.focusLine ? "block" : "none";
    buildSectionList(tokenized);
  }

  function buildSectionList(tokenized){
    el.sectionList.innerHTML = "";
    function snippetFrom(startIdx){
      for(var i = startIdx; i < tokenized.lines.length; i++){
        if(tokenized.lines[i].type === "content"){
          var t = tokenized.lines[i].text.trim();
          if(!t) continue;
          return t.length > 42 ? t.slice(0, 42) + "…" : t;
        }
      }
      return "(kosong)";
    }
    var sections = [{ snippet: snippetFrom(0) }];
    for(var i = 0; i < tokenized.sectionStartIndices.length; i++){
      sections.push({ snippet: snippetFrom(tokenized.sectionStartIndices[i]) });
    }
    sections.forEach(function(s, idx){
      var div = document.createElement("div");
      div.className = "sectionItem";
      var num = document.createElement("span");
      num.className = "num";
      num.textContent = (idx + 1) + ".";
      div.appendChild(num);
      div.appendChild(document.createTextNode(s.snippet));
      div.addEventListener("click", function(){ jumpToSection(idx); });
      el.sectionList.appendChild(div);
    });
  }

  function resetPosition(){
    anim.pos = 0;
    el.stageInner.style.transform = "translateY(0px)";
    requestAnimationFrame(function(){
      anim.textHeight = el.stageText.scrollHeight;
      el.stageProgress.style.width = "0%";
    });
    ptr = 0;
    if(state.highlight) setHighlight(0); else clearAllHighlights();
  }

  function updateProgressBarFromPos(){
    var progress = Math.min(1, Math.max(0, (-anim.pos) / (anim.textHeight || 1)));
    el.stageProgress.style.width = (progress * 100) + "%";
  }

  function updatePointerDuringPlay(){
    if(!state.highlight && !state.autoPause) return;
    if(!lineElements.length) return;
    var focusY = el.focusLineEl.getBoundingClientRect().top;
    var guard = 0;
    while(ptr < lineElements.length - 1 && lineElements[ptr].getBoundingClientRect().bottom < focusY && guard < 50){
      ptr++; guard++;
      if(state.highlight) setHighlight(ptr);
      if(state.autoPause && lineElements[ptr].dataset.pause === "1"){
        pause();
        break;
      }
    }
  }

  function resyncPointerFromPos(){
    var focusY = el.focusLineEl.getBoundingClientRect().top;
    var found = 0;
    for(var i = 0; i < lineElements.length; i++){
      if(lineElements[i].getBoundingClientRect().bottom >= focusY){ found = i; break; }
      found = i;
    }
    ptr = found;
    if(state.highlight) setHighlight(ptr);
  }

  function step(ts){
    if(!anim.playing) return;
    if(!anim.lastTs) anim.lastTs = ts;
    var dt = (ts - anim.lastTs) / 1000;
    anim.lastTs = ts;
    anim.pos -= state.speed * dt;
    var limit = -(anim.textHeight);
    if(anim.pos <= limit){
      anim.pos = limit;
      el.stageInner.style.transform = "translateY(" + anim.pos + "px)";
      pause();
      return;
    }
    el.stageInner.style.transform = "translateY(" + anim.pos + "px)";
    updateProgressBarFromPos();
    updatePointerDuringPlay();
    if(anim.playing){
      anim.raf = requestAnimationFrame(step);
    }
  }

  function play(){
    if(anim.playing) return;
    anim.playing = true;
    anim.lastTs = 0;
    el.btnPlayPauseIcon.setAttribute("href", "#i-pause");
    anim.raf = requestAnimationFrame(step);
    sendRemoteState();
  }
  function pause(){
    anim.playing = false;
    if(anim.raf) cancelAnimationFrame(anim.raf);
    el.btnPlayPauseIcon.setAttribute("href", "#i-play");
    sendRemoteState();
  }
  function togglePlayPause(){ if(anim.playing) pause(); else play(); }
  function restart(){ pause(); resetPosition(); }

  function changeSpeed(delta){
    state.speed = Math.max(20, Math.min(parseInt(el.speedRange.max, 10), state.speed + delta));
    el.speedRange.value = state.speed;
    el.speedVal.textContent = state.speed + " px/dtk";
    el.barSpeedLabel.textContent = state.speed;
    scheduleSave();
    sendRemoteState();
  }

  function jumpToSection(idx){
    var targetEl, targetLineIndex;
    if(idx <= 0){
      targetEl = lineElements[0];
      targetLineIndex = 0;
    } else {
      var anchor = sectionAnchors[idx - 1];
      if(!anchor) return;
      targetEl = anchor.el;
      targetLineIndex = anchor.lineIndex;
    }
    if(!targetEl) return;
    var rect = targetEl.getBoundingClientRect();
    var focusY = el.focusLineEl.getBoundingClientRect().top;
    var offsetWithinInner = rect.top - anim.pos;
    anim.pos = focusY - offsetWithinInner;
    var limit = -(anim.textHeight);
    if(anim.pos < limit) anim.pos = limit;
    if(anim.pos > 0) anim.pos = 0;
    el.stageInner.style.transform = "translateY(" + anim.pos + "px)";
    updateProgressBarFromPos();
    resyncPointerFromPos();
    pause();
    el.sectionPanel.hidden = true;
  }

  function currentSectionIndex(){
    var idx = 0;
    for(var i = 0; i < sectionAnchors.length; i++){
      if(sectionAnchors[i].lineIndex <= ptr) idx = i + 1; else break;
    }
    return idx;
  }
  function jumpRelativeSection(delta){
    var cur = currentSectionIndex();
    var target = Math.max(0, Math.min(sectionAnchors.length, cur + delta));
    jumpToSection(target);
  }

  function runCountdown(cb){
    if(!state.countdown){ cb(); return; }
    el.countdownOverlay.style.display = "flex";
    var n = 3;
    el.countdownNum.textContent = n;
    anim.countdownTimer = setInterval(function(){
      n -= 1;
      if(n <= 0){
        clearInterval(anim.countdownTimer);
        el.countdownOverlay.style.display = "none";
        cb();
      } else {
        el.countdownNum.textContent = n;
      }
    }, 800);
  }

  var idleTimer = null;
  function showControls(){
    el.controlBar.classList.remove("idle");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function(){ el.controlBar.classList.add("idle"); }, 2800);
  }

  function enterStage(){
    buildStageContent();
    el.stage.classList.add("active");
    el.setup.style.display = "none";
    el.barSpeedLabel.textContent = state.speed;
    el.speedPopover.hidden = true;
    el.btnSpeedToggle.classList.remove("active");
    resetPosition();
    showControls();
    if(state.remoteEnabled) startRemoteHost();
    try{
      if(document.documentElement.requestFullscreen){
        document.documentElement.requestFullscreen().catch(function(){});
      }
    }catch(e){}
    runCountdown(function(){ play(); });
  }

  function exitStage(){
    pause();
    stopRemoteHost();
    if(anim.countdownTimer) clearInterval(anim.countdownTimer);
    el.countdownOverlay.style.display = "none";
    el.sectionPanel.hidden = true;
    el.speedPopover.hidden = true;
    el.btnSpeedToggle.classList.remove("active");
    el.stage.classList.remove("active");
    el.setup.style.display = "flex";
    try{
      if(document.fullscreenElement && document.exitFullscreen){
        document.exitFullscreen().catch(function(){});
      }
    }catch(e){}
  }

  document.addEventListener("fullscreenchange", function(){
    if(!document.fullscreenElement && el.stage.classList.contains("active")){
      exitStage();
    }
  });

  // ---------- Wiring: stage ----------
  el.startBtn.addEventListener("click", function(){
    if(!state.script || !state.script.trim()){ el.script.focus(); return; }
    enterStage();
  });

  el.stage.addEventListener("mousemove", showControls);
  el.stage.addEventListener("click", function(e){
    if(e.target.closest("#controlBar") || e.target.closest("#sectionPanel")) return;
    togglePlayPause();
    showControls();
  });

  el.btnPlayPause.addEventListener("click", togglePlayPause);
  el.btnRestart.addEventListener("click", restart);
  el.btnExit.addEventListener("click", exitStage);
  el.btnSpeedDown.addEventListener("click", function(){ changeSpeed(-10); });
  el.btnSpeedUp.addEventListener("click", function(){ changeSpeed(10); });
  el.btnSpeedToggle.addEventListener("click", function(){
    var opening = el.speedPopover.hidden;
    if(opening){
      // Posisi ngambang di atas bar dihitung dari tinggi bar ASLI (getBoundingClientRect),
      // bukan angka fixed — soalnya #controlBar bisa wrap jadi 2 baris di layar sempit,
      // jadi tingginya gak selalu sama.
      var barRect = el.controlBar.getBoundingClientRect();
      el.speedPopover.style.bottom = (window.innerHeight - barRect.top + 10) + "px";
    }
    el.speedPopover.hidden = !opening;
    el.btnSpeedToggle.classList.toggle("active", opening);
    el.sectionPanel.hidden = true;
    showControls();
  });
  el.btnSections.addEventListener("click", function(){
    el.sectionPanel.hidden = !el.sectionPanel.hidden;
    el.speedPopover.hidden = true;
    el.btnSpeedToggle.classList.remove("active");
    showControls();
  });
  el.closeSectionPanel.addEventListener("click", function(){ el.sectionPanel.hidden = true; });

  window.addEventListener("keydown", function(e){
    if(!el.stage.classList.contains("active")) return;
    if(e.code === "Space"){
      e.preventDefault(); togglePlayPause(); showControls();
    } else if(e.code === "ArrowUp"){
      e.preventDefault(); changeSpeed(10); showControls();
    } else if(e.code === "ArrowDown"){
      e.preventDefault(); changeSpeed(-10); showControls();
    } else if(e.code === "Escape"){
      exitStage();
    } else if(e.key === "r" || e.key === "R"){
      restart();
    } else if(e.key === "["){
      jumpRelativeSection(-1);
    } else if(e.key === "]"){
      jumpRelativeSection(1);
    }
  });

  // ---------- Remote HP (P2P via PeerJS) ----------
  // "Host" = device yang lagi jalanin prompter (buildStageContent dkk). "Client" = HP yang
  // dipakai buat kontrol dari jauh (mode "Jadi remote control"). Satu tab browser cuma
  // jalanin salah satu peran dalam satu waktu.
  var REMOTE_ID_PREFIX = "tatap-";
  var hostPeer = null, hostConn = null, hostCode = null;
  var clientPeer = null, clientConn = null;

  function updateRemoteBadge(text, connected){
    var show = !!state.remoteEnabled;
    el.remoteBadgeSep.hidden = !show;
    el.remoteBadge.hidden = !show;
    if(show){
      el.remoteBadgeText.textContent = text;
      el.remoteBadge.classList.toggle("connected", !!connected);
    }
  }

  function startRemoteHost(attempt){
    attempt = attempt || 0;
    if(typeof Peer === "undefined"){
      updateRemoteBadge("remote gak bisa dimuat", false);
      return;
    }
    if(attempt >= 5){
      updateRemoteBadge("gagal bikin kode, coba lagi", false);
      return;
    }
    var code = String(Math.floor(1000 + Math.random() * 9000));
    // Assign ke hostPeer SEKARANG (bukan di dalam callback "open") supaya stopRemoteHost()
    // selalu punya referensi buat destroy, meski dipanggil sebelum peer selesai connect ke
    // signaling server (mis. user exit stage super cepat).
    hostPeer = new Peer(REMOTE_ID_PREFIX + code);
    hostPeer.on("open", function(){
      hostCode = code;
      updateRemoteBadge(code, false);
    });
    hostPeer.on("connection", function(conn){
      if(hostConn){ conn.close(); return; }
      hostConn = conn;
      conn.on("open", function(){
        updateRemoteBadge(hostCode + " ✓", true);
        sendRemoteState();
      });
      conn.on("data", function(msg){ handleRemoteCommand(msg); });
      conn.on("close", function(){
        hostConn = null;
        updateRemoteBadge(hostCode, false);
      });
    });
    hostPeer.on("error", function(err){
      if(err && err.type === "unavailable-id"){
        stopRemoteHost();
        startRemoteHost(attempt + 1);
      } else {
        updateRemoteBadge("gagal, coba lagi", false);
      }
    });
  }

  function stopRemoteHost(){
    if(hostConn){ try{ hostConn.close(); }catch(e){} hostConn = null; }
    if(hostPeer){ try{ hostPeer.destroy(); }catch(e){} hostPeer = null; }
    hostCode = null;
    updateRemoteBadge("", false);
  }

  function sendRemoteState(){
    if(hostConn && hostConn.open){
      hostConn.send({ type: "state", playing: anim.playing, speed: state.speed });
    }
  }

  function handleRemoteCommand(msg){
    if(!msg || typeof msg !== "object") return;
    if(msg.cmd === "toggle") togglePlayPause();
    else if(msg.cmd === "speed") changeSpeed(msg.delta || 0);
    else if(msg.cmd === "restart") restart();
    else if(msg.cmd === "section") jumpRelativeSection(msg.delta || 0);
    else if(msg.cmd === "exit") exitStage();
  }

  // ---------- Remote HP: client side (device yang "jadi remote") ----------
  function disconnectRemoteClient(){
    if(clientConn){ try{ clientConn.close(); }catch(e){} clientConn = null; }
    if(clientPeer){ try{ clientPeer.destroy(); }catch(e){} clientPeer = null; }
  }
  function showRemoteConnectForm(){
    el.remotePad.hidden = true;
    el.remoteConnect.hidden = false;
    el.remoteConnectBtn.disabled = false;
  }
  function applyRemoteState(msg){
    if(!msg || msg.type !== "state") return;
    el.remoteBtnPlayPauseIcon.setAttribute("href", msg.playing ? "#i-pause" : "#i-play");
    el.remoteSpeedLabel.textContent = msg.speed;
  }
  function sendRemoteCmd(cmd, extra){
    if(!clientConn || !clientConn.open) return;
    var msg = Object.assign({ cmd: cmd }, extra || {});
    clientConn.send(msg);
  }

  el.becomeRemoteBtn.addEventListener("click", function(){
    el.setup.style.display = "none";
    el.remoteView.hidden = false;
    el.remoteCodeInput.value = "";
    el.remoteError.textContent = "";
    showRemoteConnectForm();
    el.remoteCodeInput.focus();
  });
  el.remoteBackBtn.addEventListener("click", function(){
    disconnectRemoteClient();
    el.remoteView.hidden = true;
    el.setup.style.display = "flex";
  });
  el.remoteDisconnectBtn.addEventListener("click", function(){
    disconnectRemoteClient();
    showRemoteConnectForm();
  });
  el.remoteConnectBtn.addEventListener("click", function(){
    var code = el.remoteCodeInput.value.trim();
    if(!/^\d{4}$/.test(code)){
      el.remoteError.textContent = "Kode harus 4 digit angka.";
      return;
    }
    if(typeof Peer === "undefined"){
      el.remoteError.textContent = "Gagal load library remote (cek koneksi internet).";
      return;
    }
    disconnectRemoteClient();
    el.remoteError.textContent = "Menyambungkan...";
    el.remoteConnectBtn.disabled = true;
    clientPeer = new Peer();
    clientPeer.on("open", function(){
      clientConn = clientPeer.connect(REMOTE_ID_PREFIX + code, { reliable: true });
      clientConn.on("open", function(){
        el.remoteError.textContent = "";
        el.remoteConnectBtn.disabled = false;
        el.remotePad.hidden = false;
        el.remoteConnect.hidden = true;
      });
      clientConn.on("data", function(msg){ applyRemoteState(msg); });
      clientConn.on("close", function(){
        clientConn = null;
        el.remoteError.textContent = "Koneksi terputus.";
        showRemoteConnectForm();
      });
      clientConn.on("error", function(){
        el.remoteError.textContent = "Gagal sambung. Cek kode & coba lagi.";
        el.remoteConnectBtn.disabled = false;
      });
    });
    clientPeer.on("error", function(){
      el.remoteError.textContent = "Gagal sambung. Cek kode & coba lagi.";
      el.remoteConnectBtn.disabled = false;
    });
  });

  el.remoteBtnPlayPause.addEventListener("click", function(){ sendRemoteCmd("toggle"); });
  el.remoteBtnSpeedDown.addEventListener("click", function(){ sendRemoteCmd("speed", { delta: -10 }); });
  el.remoteBtnSpeedUp.addEventListener("click", function(){ sendRemoteCmd("speed", { delta: 10 }); });
  el.remoteBtnPrev.addEventListener("click", function(){ sendRemoteCmd("section", { delta: -1 }); });
  el.remoteBtnNext.addEventListener("click", function(){ sendRemoteCmd("section", { delta: 1 }); });
  el.remoteBtnRestart.addEventListener("click", function(){ sendRemoteCmd("restart"); });
  el.remoteBtnExit.addEventListener("click", function(){ sendRemoteCmd("exit"); });

  // ---------- PWA ----------
  if("serviceWorker" in navigator){
    window.addEventListener("load", function(){
      navigator.serviceWorker.register("sw.js").catch(function(){});
    });
  }

})();
