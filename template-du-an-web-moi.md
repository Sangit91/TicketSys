# Template — Dựng dự án Web chuẩn BVĐK (AI Agents Ready)

> **Mục đích:** Bản mô tả + checklist để xây dựng **1 dự án web mới** đạt chuẩn như BVĐK Website (có hệ thống AI agents: OpenCode + AGENTS.md + memory + OpenBrain).
> **Cách dùng:** Copy cấu trúc bên dưới vào dự án mới, điền thông tin cụ thể theo từng mục. Tài liệu kỹ thuật chi tiết xem `ai-agents-spec.md`.
> **Chú ý:** File này là khung tối thiểu "đủ để chạy"; đừng copy nguyên trạng dữ liệu BVĐK (tên bệnh viện, port, spec) — phải thay bằng dữ liệu dự án mới.

---

## 1. Sơ đồ tổng thể mục tiêu

```text
Dự án web mới/
├── AGENTS.md                  ← INDEX quy tắc (đọc mỗi session) — NGẮN, ~3KB
├── memory.md                  ← Trạng thái hiện tại (đọc mỗi session, TRONG git)
├── memory/
│   ├── phase-history.md       ← Lịch sử Phase (append-only)
│   └── bugs-fixed.md          ← Danh sách bug đã sửa
├── agents/
│   ├── 01-getting-started.md  ← Bắt buộc mỗi session
│   ├── 02-architecture.md     ← Port/Docker/State
│   ├── 03-ui-design-system.md ← Design tokens
│   ├── 04-components.md       ← Component/reusable/accessibility
│   ├── 05-project-ux.md       ← UX theo domain (BVĐK: hospital-ux)
│   ├── 06-server-api.md       ← API/DB governance
│   ├── 07-self-review.md      ← Review bắt buộc
│   ├── 08-memory-management.md← Memory safety + phase numbering
│   └── 09-ops.md              ← Backup/Git/OpenBrain
├── opencode.json              ← Plugin OpenBrain + provider
├── openbrain/                 ← Plugin OpenBrain (clone, KHÔNG commit)
├── .env.example               ← Khai báo biến môi trường
├── dactaupdate.md             ← Buffer nâng version spec (nếu có spec docx)
└── src/                       ← Code thật (frontend)
    ├── App.tsx                    ← Shell: auth/session + routing; views nhận dữ liệu từ data layer
    ├── data/useDataStore.ts      ← DATA LAYER: toàn bộ state + CRUD + audit (nối backend chỉ sửa file này)
    ├── hooks/                    ← usePagedRows, useTrapFocus, usePrefersReducedMotion…
    └── components/              ← Views code-split (React.lazy) + ErrorBoundary + Pagination
```
> `server/ + tests/` tuỳ chọn (mỗi dự án quyết định có backend hay frontend-first).

---

## 2. AGENTS.md — viết như thế nào

### Nguyên tắc
- **Là INDEX, không phải encyclopedia.** Mục tiêu < 4KB. Chi tiết nằm ở `agents/0X-*.md`.
- Agent chỉ đọc file cần thiết theo task (lazy loading) → tiết kiệm token.

### Cấu trúc AGENTS.md

```markdown
# AGENTS.md - <Tên dự án>

> Đã tách module (ngày). Nội dung chi tiết trong agents/01-09*.md.
> Bắt buộc mỗi session: đọc agents/01-getting-started.md + memory.md trước khi code.

## 📚 Mục lục quick-ref
| # | File | Nhóm quy tắc | Khi nào đọc |
|---|------|---------------|-------------|
| 01 | agents/01-getting-started.md | Mục tiêu + bắt đầu session + nguyên tắc vàng | Mỗi session bắt buộc |
| 02 | agents/02-architecture.md | Port/Docker/State | Sửa cấu trúc/Docker |
| ... | ... | ... | ... |

## 🚦 Quick Start — Agent mới vào dự án
1. Đọc memory.md → trạng thái + pending tasks
2. Đọc agents/01-getting-started.md → quy tắc bắt buộc
3. Tra cứu OpenBrain: search_memories --query "TênTrang|TênComponent" --limit 10
4. Kiểm tra git status + git log --oneline -5
5. Tùy task, đọc file agents/0X liên quan

## 📌 Ghi chú tách file (nếu cần)
- Lý do tách, cách đồng bộ, quy tắc không tạo file mới tùy tiện.
```

### Nội dung bắt buộc trong `agents/01-getting-started.md`
1. **Mục tiêu agent** (Senior Architect, UX reviewer...).
2. **Nguồn tham chiếu chính** — spec docx + `dactaupdate.md` (nếu có) / README.
3. **Quy trình bắt đầu session** (các lệnh bắt buộc: đọc memory, git status...).
4. **Nguyên tắc vàng**:
   - Trả lời bằng ngôn ngữ dự án (VD tiếng Việt).
   - Đọc memory.md trước khi code.
   - Cập nhật memory.md sau mọi thay đổi.
   - Không tạo technical debt (no copy-paste, no hardcode, no duplicate).
   - TypeScript Strict, Zero Any.
   - Quality Gate: `npm run lint && npm run build`.
   - **Bắt buộc cài `@types/react` + `@types/react-dom`** (dev) — thiếu là TS coi React là `any`, che giấu lỗi type thật.
   - Luật restart container sau khi sửa frontend (nếu dùng Docker).

---

## 3. memory.md — viết như thế nào

### Nguyên tắc
- memory.md = **trạng thái HIỆN TẠI** (không phải log). Log ở `memory/phase-history.md`.
- Chỉ giữ thứ agent tra cứu thường xuyên: kiến trúc, quy tắc chốt, pending, backup.

### Cấu trúc memory.md (mẫu)

```markdown
# Memory — <Tên dự án>

> Lịch sử chi tiết: memory/phase-history.md · Bug đã sửa: memory/bugs-fixed.md

## 📌 Thông tin dự án
- Tên đầy đủ, địa chỉ/domain, các thông tin định danh quan trọng.

## 🎯 Tầm nhìn kiến trúc
- Nguyên tắc (Reusable First • Mobile First • Accessibility First...)
- Technical (TypeScript Strict, Zero Any, Feature Based...)

## 🏗️ Cấu trúc dự án hiện tại
- Cây thư mục src/, server/, các folder chính.

## 🚧 Backup gần nhất
- Danh sách backup (đường dẫn + thời điểm + nội dung).

## ⚠️ Quy tắc môi trường BẮT BUỘC NHỚ
- Docker port policy, HMR, luật restart.

## 🔍 Quality Gate
- Lệnh lint/build bắt buộc.

## 📊 Trạng thái hiện tại
| Module | Status |
|--------|--------|

## 🔎 Audit / Pending Tasks
- Các issue còn mở (kèm file + trạng thái).
- Pending tasks theo Phase.

## 📌 Ghi chú quan trọng
- Các quyết định/kinh nghiệm không thuộc Phase (đánh số).
```

### Cấu trúc `memory/phase-history.md`

```markdown
## PHASE <n> — <Tên phase> ([YYYY-MM-DD])

### [Tên thay đổi] ([YYYY-MM-DD])
- Mô tả
- Files affected
- Commands
```

> **Số Phase:** `grep -oE "^## PHASE [0-9]+" memory/phase-history.md | grep -oE "[0-9]+" | sort -n | tail -1` + 1.

---

## 4. Kết nối OpenBrain — làm như thế nào

### 4.1 Clone plugin (1 lần)
```bash
# Trong thư mục dự án mới
git clone https://github.com/CodebyKDvn/openbrain.git ./openbrain
cd openbrain && npm install
```

### 4.2 Khai báo plugin trong `opencode.json`
```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["./openbrain"]
}
```

### 4.3 Cấu hình provider (model)
```json
{
  "plugin": ["./openbrain"],
  "provider": {
    "<provider-name>": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Tên hiển thị",
      "options": { "baseURL": "http://localhost:PORT/v1" },
      "models": { "<model-id>": { "name": "Tên model" } }
    }
  }
}
```

### 4.4 File `.env` của plugin (KHÔNG commit)
```bash
# openbrain/.env
GEMINI_API_KEY=your_key_here
```

### 4.5 Verify kết nối hoạt động
```bash
# Sau khi mở session: 3 tool OpenBrain phải có sẵn
search_memories --query "test" --limit 5    # trả kết quả
list_skills                                  # danh sách skill
```

### 4.6 ⚠️ Project-aware (TỪ v2.0.0 đã patch)
- Plugin đã hỗ trợ **tách memory theo project** (cột `project` = đường dẫn thư mục dự án).
- Mỗi dự án chạy OpenCode sẽ tự gắn project path → memory không lẫn giữa các dự án.
- **DB dùng chung toàn user:** `~/.opencode/openbrain/openbrain.db`. Backup riêng nếu quan trọng.
- Nếu muốn mỗi dự án 1 DB riêng → cần sửa plugin (env `OPENBRAIN_DB_PATH`).

---

## 5. Quy tắc dùng memory.md vs OpenBrain

| Tình huống | Dùng |
|-----------|------|
| Trạng thái kiến trúc hiện tại / pending tasks | `memory.md` |
| Backup gần nhất / Phase history | `memory/` |
| Bug đã fix / decision / pattern từng gặp | OpenBrain `search_memories` |
| Workflow lặp ≥3 lần | OpenBrain `create_skill` |
| Đọc mỗi session (bắt buộc) | `memory.md` + `agents/01` |

---

## 6. Checklist dựng dự án mới (đánh dấu khi xong)

```text
[ ] 1. Khởi tạo git repo + cấu trúc thư mục (src/ server/ tests/ memory/ agents/)
[ ] 2. Viết AGENTS.md (index ngắn) + agents/01-09*.md
[ ] 3. Viết memory.md + memory/phase-history.md + memory/bugs-fixed.md (rỗng)
[ ] 4. Clone OpenBrain: git clone ... ./openbrain && npm install
[ ] 5. Tạo opencode.json (plugin ./openbrain + provider)
[ ] 6. Tạo openbrain/.env (GEMINI_API_KEY) — nhớ gitignore
[ ] 7. Cập nhật .gitignore: openbrain/, .env, certs/, dist/, node_modules/
[ ] 8. Viết .env.example (đầy đủ biến, không secret thật)
[ ] 9. Thiết lập môi trường dev (Docker/npm), healthcheck
[ ] 10. Viết spec sản phẩm + dactaupdate.md (nếu có docx)
[ ] 11. Verify OpenBrain hoạt động (search_memories trả kết quả)
[ ] 12. Chạy thử 1 session agent hoàn chỉnh → confirm memory.md được ghi + OpenBrain ghi episodic
[ ] 13. Cài `@types/react` + `@types/react-dom` (dev) — tránh TS coi React là `any`
[ ] 14. Tách data-access layer (`useDataStore`) + code-split view + ErrorBoundary + phân trang bảng
[ ] 15. Commit + push
```

---

## 7. Những sai lầm thường gặp (tránh)

1. **AGENTS.md quá dài** (>30KB) → agent tốn token mỗi session. Phải tách module.
2. **memory.md ghi log thay vì trạng thái** → file phình, khó đọc. Log phải ở phase-history.
3. **Quên cập nhật memory cùng session** → code lệch memory, agent hành động sai.
4. **Quên gitignore openbrain/.env** → lộ GEMINI_API_KEY.
5. **Không kiểm tra OpenBrain sau clone** → tưởng đã nối nhưng plugin chưa load.
6. **PHI/dữ liệu nhạy cảm ghi vào memory** → cấm tuyệt đối (dùng synthetic data).
7. **Tạo file agents mới tùy tiện** → chỉ mở rộng file 0X có sẵn.
8. **Không đồng bộ spec** → code lệch docx, phải ghi dactaupdate.md cùng session.

---

## 8. Kiến trúc & hiệu năng frontend — bài học rút ra (PHASE 3)

> Kinh nghiệm có được từ việc chuẩn bị cho **~1000 người dùng**. Áp dụng làm chuẩn cho dự án mới.

1. **Data-access layer tách riêng** — gom toàn bộ state + CRUD + audit vào `src/data/useDataStore.ts`. Component/App chỉ consume. Khi nối backend: **chỉ sửa 1 file**, không phải đụng UI.
2. **App shell mỏng** — App chỉ giữ auth/session + UI state; dữ liệu hiển thị **derive từ data layer** (1 nguồn sự thật, không snapshot trùng → hết stale state).
3. **Code-split view** — mỗi view = `React.lazy` + `Suspense` + `LoadingSkeleton`; thành phần nặng (Three.js/ReactFlow) tách chunk riêng, chỉ tải khi cần. Giảm bundle khởi tạo /2.
4. **ErrorBoundary** (class component) bọc cấp cao + quanh vùng có rủi ro → lỗi render không làm trắng ứng dụng.
5. **Bảng lớn → phân trang** (`usePagedRows` + `Pagination`) thay vì render toàn bộ `.map()`; auto reset trang khi đổi filter.
6. **Design tokens**: Tailwind v4 `@theme` (đặt tên màu/thứ — VD `acid-lime`, `line-energy`) thay vì hex rải rác; kèm hệ override theme light.
7. **A11y**: `prefers-reduced-motion` (tắt particle/text hiệu ứng nặng), focus trap cho modal, role/aria dialog.
8. **`@types/react` bắt buộc** — thiếu ⇒ TS nhìn React là `any`, âm thầm che 20+ lỗi type thật.

---

*Tham khảo: `ai-agents-spec.md` (đặc tả hệ thống), `AGENTS.md`, `agents/01-09*.md`, `memory.md` của dự án BVĐK Website.*
