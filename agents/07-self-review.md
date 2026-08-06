# 07 — Self-Review (bắt buộc trước khi kết thúc task)

> Đọc khi hoàn thành task. KHÔNG kết thúc khi chưa qua review.

## Checklist bắt buộc trước khi xong task

- [ ] **Quality Gate:** chạy `npm run lint` (`tsc --noEmit`) + `npm run build` — phải PASS 100%.
- [ ] **Type an toàn:** không còn `any` mới do task này thêm (nếu vô tình thêm, phải loại bỏ).
- [ ] **Không technical debt:** không copy-paste, không hardcode giá trị đáng ra ở mockData/types.
- [ ] **Cả 2 theme hoạt động:** component mới render đúng ở dark + light (`.theme-light`).
- [ ] **Audit log đầy đủ:** mọi mutation data có audit log tương ứng.
- [ ] **RBAC đúng:** tính năng mới chỉ hiển thị cho role được phép (`ROLE_PERMISSIONS`).
- [ ] **Memory đồng bộ:** `memory.md` (trạng thái) + `memory/phase-history.md` (log) đã ghi đúng.
- [ ] **OpenBrain:** pattern/decision đáng nhớ đã `create_skill` hoặc `add_memory` (nếu cần).
- [ ] **Giữ AGENTS.md ngắn:** không phình file index; quy tắc mới chỉ thêm vào file `agents/0X` có sẵn.

## Quy trình

1. Chạy review theo checklist trên.
2. Nếu lỗi → sửa, chạy lại lint/build.
3. Ghi kết quả vào `memory/phase-history.md` (mục PHASE hiện tại).
4. Nếu chưa chắc chắn → xin user xác nhận trước khi kết thúc.
