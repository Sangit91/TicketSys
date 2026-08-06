# 08 — Memory Management

> Đọc khi cập nhật memory. Đảm bảo memory an toàn + phase numbering chuẩn.

## 1. Vai trò các file

| File | Vai trò | Ghi khi nào |
|------|---------|-------------|
| `memory.md` | Trạng thái HIỆN TẠI (kiến trúc, pending, backup) | Mọi session, khi có thay đổi |
| `memory/phase-history.md` | Log lịch sử Phase (append-only) | Cuối mỗi phase / thay đổi lớn |
| `memory/bugs-fixed.md` | Bug đã sửa | Khi sửa xong bug |

## 2. Memory safety — CẤM TUYỆT ĐỐI

- KHÔNG ghi **PHI / dữ liệu nhạy cảm** (tên bệnh nhân thật, hồ sơ bệnh án, thông tin cá nhân staff thật) vào memory.md hoặc OpenBrain.
- Chỉ dùng **synthetic data** (tên giả, mô tả chung).
- Password/secret: KHÔNG ghi; chỉ ghi tên biến env cần thiết.

## 3. Phase numbering

Lấy số phase mới:

```bash
grep -oE "^## PHASE [0-9]+" memory/phase-history.md | grep -oE "[0-9]+" | sort -n | tail -1
```

Phase mới = kết quả + 1. Format:

```markdown
## PHASE <n> — <Tên phase> ([YYYY-MM-DD])

### [Tên thay đổi] ([YYYY-MM-DD])
- Mô tả
- Files affected
- Commands
```

## 4. Quy tắc đồng bộ

1. Sửa code xong → **ngay lập tức** cập nhật `memory.md` (trạng thái) trước khi chuyển task.
2. Thay đổi lớn → thêm mục mới vào `memory/phase-history.md`.
3. Sửa bug → thêm vào `memory/bugs-fixed.md`.
4. Đừng để "code đã xong nhưng memory chưa cập nhật" — đó là nguồn gốc sai lệch session sau.
