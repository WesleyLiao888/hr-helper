# hr-helper

## 🚀 快速開始 (Run Locally)

**環境要求:** Node.js 18+

1. **安裝套件**:
   ```bash
   npm install
   ```

2. **設定環境變數**:
   複製 `.env.example` 為 `.env.local` 並填入對應的 API Key (例如：`GEMINI_API_KEY`)。

3. **啟動開發伺服器**:
   ```bash
   npm run dev
   ```

## 📦 部署 (Deployment)

本專案已設定 GitHub Actions。

- 只要將程式碼 push 到 `main` 或 `master` 分支，會自動觸發 `.github/workflows/deploy.yml` 工作流程。
- 自動進行建置 (build) 並發布至 **GitHub Pages**。

> **提示：** 請至 GitHub 儲存庫的 **Settings > Pages > Build and deployment** 裡，將 Source 設定為 `GitHub Actions`，確保 GitHub Pages 成功啟用。
