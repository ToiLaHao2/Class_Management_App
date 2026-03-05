# 🦴 Hướng Dẫn Sử Dụng & Phát Triển Bộ Khung "CMA Bone"

Bộ khung (Boilerplate) này là sự kết hợp tối ưu giữa **Express (nhẹ, thư viện phong phú)**, **TypeScript (Type-safety)**, **Awilix (Dependency Injection)**, và **tsoa (Auto-gen Swagger Docs)**. 

Tài liệu này hướng dẫn bạn cách tái sử dụng bộ khung này cho các dự án mới, cũng như cách làm việc hàng ngày (thêm tính năng, cài thư viện) một cách chuẩn chỉ.

---

## 🎯 Phần 1: Cách "Bế" Bộ Khung Sang Dự Án Mới

Thay vì copy toàn bộ code cũ (chứa lẫn lộn code nghiệp vụ của dự án cũ), bạn cần trích xuất phần "Lõi" ra.

**Bước 1: Copy các thành phần cốt lõi**
Tạo một thư mục dự án mới, sau đó copy toàn bộ các file/thư mục này từ dự án cũ sang:
- Thư mục `apps/` (giữ nguyên cấu trúc gateway, worker, socket)
- Thư mục `libs/core/` (giữ nguyên toàn bộ các core modules: db, cache, logger, container, config...)
- Các file ở thư mục gốc: `package.json`, `tsconfig.json`, `tsoa.json`, `nodemon.json`, `.env.example`

**Bước 2: Xóa code nghiệp vụ (Business Logic) cũ**
- Xóa toàn bộ biến môi trường không cần thiết trong `.env`.
- Xóa thư mục `libs/modules/` cũ (không copy phần này).
- Trong `libs/core/shared/src/module-loader.ts` hoặc `apps/api-gateway/src/server.ts`, xóa các dòng import cứng liên quan đến code cũ (nếu có).

**Bước 3: Đổi tên dự án**
Mở file `package.json` ở thư mục gốc và đổi tên:
```json
{
  "name": "my-new-awesome-project",
  "version": "1.0.0"
}
```

**Bước 4: Cài đặt lại từ đầu**
Mở terminal tại thư mục gốc dự án mới và chạy:
```bash
npm install
```
Lệnh này sẽ quét toàn bộ NPM Workspaces và tự động liên kết các `@core/*` lại với nhau.

---

## 🧩 Phần 2: Workflow Làm Việc (Thêm Module Mới)

Giả sử bạn cần tạo một tính năng mới: `courses` (Khóa học).

**1. Khởi tạo Workspace cho Module:**
Tạo cấu trúc thư mục `libs/modules/courses`:
```
libs/modules/courses/
├── src/
│   ├── index.ts              # Entry point đăng ký DI Container
│   ├── courses.controller.ts # Route & Swagger Endpoint
│   ├── courses.model.ts      # TypeScript Interfaces & DTOs
│   └── courses.service.ts    # Logic nghiệp vụ
├── package.json              # { "name": "@modules/courses", "private": true, "main": "src/index.ts" }
```

**2. Khai báo Interface & DTO (`courses.model.ts`):**
Mọi model, payload nhận/trả đều cần định nghĩa Interface/Type rõ ràng. `tsoa` sẽ dùng cái này để sinh Swagger.

**3. Viết Service với Dependency Injection (`courses.service.ts`):**
Cần dùng thư viện hay core module nào (Db, Cache, Logger)? Cứ khai báo tên biến trong `constructor`, Awilix sẽ tự "tiêm" vào.
```typescript
export class CoursesService {
    constructor(private readonly db: any, private readonly logger: any) {}
    
    // ... logic
}
```

**4. Viết Controller với tsoa (`courses.controller.ts`):**
```typescript
import { Controller, Get, Route, Tags } from '@tsoa/runtime';

@Route('courses')
@Tags('Courses')
export class CoursesController extends Controller {
    @Get('/')
    public async getCourses() {
        return []; // Gọi service tương ứng
    }
}
```

**5. Đăng ký Module với hệ thống (`index.ts`):**
```typescript
import { AwilixContainer, asClass } from 'awilix';
import type { IAppModule } from '@core/shared';
// import { CoursesService } from './courses.service';

export const coursesModule: IAppModule = {
    name: 'courses',
    register: (container: AwilixContainer) => {
        // container.register({
        //     coursesService: asClass(CoursesService).singleton(),
        // });
        console.log('📦 Module registered: [courses]');
    }
};

export default coursesModule;
```

**6. Cập nhật Routing & Docs:**
Chạy lệnh từ thư mục gốc:
```bash
npm run tsoa:gen
```
Tất cả endpoints của `CoursesModule` sẽ tự động hiển thị trong Swagger UI (`http://localhost:3000/docs`).

---

## 📦 Phần 3: Cách Cài Thêm Thư Viện (NPM Packages)

Vì đây là kiến trúc Monorepo (NPM Workspaces), bạn **không bao giờ sử dụng lệnh `cd` vào thư mục con rồi chạy `npm install`**. Mọi lệnh `npm install` đều phải chạy từ thư mục Root.

Có 2 kịch bản cài đặt:

### Kịch bản 1: Cài thư viện dùng chung cho toàn dự án (Root)
Ví dụ bạn muốn cài `lodash`, `zod`, hoặc `moment` để dùng trong bất kỳ file nào (từ core đến modules, từ gateway đến worker).
👉 Mở terminal ở **thư mục Root** và chạy thẳng lệnh cài:
```bash
npm install lodash
npm install -D @types/lodash
```

### Kịch bản 2: Cài thư viện riêng cho 1 Workspace cụ thể (Khuyên dùng)
Ví dụ, bạn đang làm module thanh toán (`libs/modules/payments`) và chỉ module này mới cần cài `stripe`. Code của `api-gateway` hay `worker` không cần biết gì về `stripe`.
👉 Sử dụng cờ `-w` (workspace):
```bash
# Lệnh: npm install <tên-thư-viện> -w <đường-dẫn-workspace-hoặc-tên>
npm install stripe -w libs/modules/payments
```
*Bạn kiểm tra file `package.json` bên trong `libs/modules/payments` sẽ thấy thư viện `stripe` được thêm vào đúng chỗ đó.*

---

## ⚠️ Những Lưu Ý Xương Máu

1. **Lỗi `Controller extends undefined`:**
   Nếu bạn viết Controller mới và dính lỗi này lúc khởi động, hãy đảm bảo rằng file Controller sử dụng **`import { Controller, Get... } from '@tsoa/runtime'`** chứ KHÔNG PHẢI import từ `tsoa`. (`tsoa` không tương thích tốt với `tsx watch`).
   
2. **Quên chạy `tsoa:gen`:**
   Mỗi khi sửa đổi API (thêm/sửa/xóa endpoint, thay đổi kiểu dữ liệu DTO/Interface trả về). Swagger UI và file routes KHÔNG TỰ ĐỘNG thay đổi. Bạn bắt buộc phải chạy `npm run tsoa:gen` (hoặc `npm run dev` sẽ tự chạy một lần lúc khởi động) để sinh lại mã nguồn.

3. **Luôn chạy dự án bằng lệnh của Root:**
   Đừng chạy Node thủ công từng file. Dùng `npm run dev` ở Root để khởi động đồng loạt Gateway, Socket, Worker siêu mượt mà nhờ `concurrently`. Theo dõi cổng `3000` cho Gateway và API Docs.
