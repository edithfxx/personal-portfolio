# Frontend Developer Portfolio

> 好的程式，不只解決今天的問題，而是能被未來工程師理解與維護。

這份作品集整理我在前端開發上的學習成果與實作能力，內容涵蓋靜態切版、RWD、CSS 動畫、JavaScript 互動、Vue 資料驅動開發，以及 localStorage、ARIA 等前端常見實務。

我目前聚焦於前端工程師職務，重視的不是把畫面做出來而已，而是能不能把需求拆解清楚、把結構寫穩、把互動流程想完整，並讓後續維護者看得懂、接得下去。

## 作品

### 1. 主題收藏展示館

- 類型：Vue 3 / 資料管理
- 作品連結：[Live Demo](https://edithfxx.github.io/personal-portfolio/collect/index.html)
- 專案重點：
  - 以超自然主題打造資料驅動介面，支援新增、篩選、展開與統計
  - 使用 `localStorage` 保存使用者新增資料
  - 規劃表單驗證、字數提示、星等操作與分類結構
  - 納入 `WCAG A / AA` 基本觀念，處理 `label`、`aria-invalid`、`aria-describedby` 與鍵盤操作
- 展現能力：
  - Vue 狀態管理與資料綁定
  - 表單互動與資料持久化
  - 可及性基礎實作
  - 主題式 UI 與資訊結構設計

### 2. 色弱遊戲

- 類型：JavaScript 互動 / 小遊戲
- 作品連結：[Live Demo](https://edithfxx.github.io/personal-portfolio/color-blindness/index.html)
- 專案重點：
  - 設計 60 秒限時挑戰流程，包含倒數、分數、結算與評語系統
  - 以 JavaScript 動態產生題目，並隨關卡提高方塊數與顏色相近程度
  - 使用 `DOM` 操作與事件控制答題流程
  - 使用 `Web Audio API` 製作答對、答錯、倒數與結束音效
- 展現能力：
  - 遊戲邏輯與狀態管理
  - 即時互動回饋設計
  - 原生 JavaScript 實作能力
  - 使用者體驗節奏掌握

### 3.Microsoft 仿切

- 類型：靜態切版 / RWD
- 作品連結：[Live Demo](https://edithfxx.github.io/personal-portfolio/microsoft-cut/index.html)
- 重點：練習大型企業網站的導覽列、卡片式排版、Footer 與響應式版面規劃

### 4.九星連線

- 類型：CSS 動畫 / 視覺特效
- 作品連結：[Live Demo](https://edithfxx.github.io/personal-portfolio/nine-stars/index.html)
- 重點：使用 `HTML` 與 `CSS Animation` 製作宇宙主題的星體排列與連線視覺

### 5.行星繞日

- 類型：CSS 動畫 / 軌道模擬
- 作品連結：[Live Demo](https://edithfxx.github.io/personal-portfolio/planets-orbiting-the-sun/index.html)
- 重點：以 `CSS keyframes`、定位與動畫節奏控制完成行星繞日效果

## 我在作品中想呈現的能力

- 不只完成畫面，而是能把需求轉成清楚的結構與互動流程
- 面對不同題型，能切換靜態切版、互動功能與資料驅動的實作方式
- 願意處理使用體驗細節，例如搜尋、表單回饋、音效節奏、RWD 與基本無障礙
- 能與 AI 協作進行需求討論、規格檢查與 code review，但保留最終判斷與實作責任

## 專案結構

```text
personal-portfolio-main
├── collect/                    # 主題收藏展示館：Vue 3 資料管理與 localStorage 練習
├── color-blindness/           # 色弱遊戲：JavaScript 互動邏輯與遊戲流程實作
├── microsoft-cut/             # Microsoft 仿切：企業官網切版與 RWD 練習
├── nine-stars/                # 九星連線：CSS 動畫與宇宙主題視覺特效
└── planets-orbiting-the-sun/  # 行星繞日：CSS 軌道動畫與定位控制
```


## 補充說明

這個 repository 收錄的是我目前的前端作品練習，每個資料夾都是一個可獨立開啟與展示的作品。
