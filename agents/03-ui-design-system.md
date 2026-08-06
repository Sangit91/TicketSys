# 03 — UI Design System

> Đọc khi sửa UI / thêm component visual. Token khai báo trong `src/index.css` (@theme).

## 1. Theme chính: "Cyber Ops" (dark, mặc định)

```text
--color-space-bg:      #030014   ← nền tổng (deep space navy)
--color-card-bg:       #333333   ← card / panel
--color-acid-lime:     #CCFF00   ← accent chính (hover, active, highlight)
--color-neon-red:      #FF3366   ← nguy cấp / critical / danger
--color-line-energy:   #88AAFF   ← phụ trợ / energy lines / link
```

- Font: `--font-display`/`--font-sans` = **Be Vietnam Pro**; `--font-mono` = **IBM Plex Mono**.
- Selection: `#CCFF00` nền + text đen.

## 2. Theme phụ: "9Router Grid Warm Light" (light)

- Toggle ở `App.tsx` (`theme` state, persist localStorage `app-theme`).
- Override toàn bộ bằng CSS attribute selectors trong block `.theme-light` của `index.css`.
- **QUY TẮC BẮT BUỘC:** khi thêm UI mới phải đảm bảo light theme render đúng (nền `#FAF8F6`, accent terracotta `#E05D38`, text `#0F172A`).

### Mapping accent dark → light
| Dark | Light |
|------|-------|
| `#CCFF00` (lime) | `#E05D38` (terracotta) |
| `#88AAFF` | `#2563EB` |
| `#00F0FF` | `#0284C7` |
| `#FF3366` | `#DC2626` |
| `#030014` nền | `#FAF8F6` |
| `#333333` card | `#FFFFFF` |

## 3. Quy tắc styling

1. **Dùng Tailwind utility classes trực tiếp** — KHÔNG tạo class custom ngoài `index.css` trừ khi bắt buộc.
2. Màu chủ đạo thường dùng dạng hex: `bg-[#CCFF00]`, `text-[#FF3366]`, `border-[#CCFF00]/40`... Cập nhật mapping light theme nếu thêm màu mới.
3. Hiệu ứng chuẩn: `backdrop-blur`, glass card (`bg-white/5`), border glow nhẹ, `animate-pulse` cho trạng thái "live".
4. Animation: dùng **motion** (framer-motion) — `AnimatePresence mode="wait"` + transition `[0.16, 1, 0.3, 1]` cho tab switching.
5. Text hero: uppercase + `tracking-widest` + `font-black/font-extrabold`; có thể dùng `ScrambleText` / `TypewriterText` cho hiệu ứng chữ.
6. ReactFlow (AssetFlowMap): style theo block `.react-flow__*` trong `index.css`.

## 4. Accessibility (a11y)

- Đủ contrast giữa text và nền ở cả 2 theme.
- Nút/button cần state hover/focus rõ ràng.
- Table cần header th; interactive element cần `aria-label` hoặc text rõ ràng.
