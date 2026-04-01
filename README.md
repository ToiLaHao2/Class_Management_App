# Class Management App (CMA) — Backend System

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)
![Architecture](https://img.shields.io/badge/Architecture-Modular_Monolith-orange)

## 📖 Overview (Tổng Quan)

**Class Management App (CMA)** là project backend mà tôi làm để học hỏi dựa trên các keywork và gợi ý qua trao đổi với AI từ Antigravity IDE và tìm hiểu thông tin trên mạng.

Project backend này dđược thiết kế để quản lý các nghiệp vụ lớp học, học viên, khóa học và các tài nguyên liên quan.

Bộ mã nguồn này không chỉ phục vụ cho dự án CMA mà còn là một bộ khung tôi muốn tự làm và tìm hiểu nhằm nhận sự góp ý từ cộng đồng và đồng thời cung cấp một nền tảng chuẩn mực, an toàn và dễ tái sử dụng cho bất kỳ dự án Node.js nào đang cần sự tổ chức nghiêm ngặt nhưng không muốn gánh vác sự cồng kềnh của NestJS.

---

## 🎯 Mục Đích Phát Triển

Dự án được xây dựng dựa trên triết lý **"Điểm cân bằng hoàn hảo"**:

1. **Developer Experience (DX):** Viết code nhanh như Express thuần, nhưng có Type-Safety của TypeScript bắt lỗi tận răng.
2. **Auto-Documentation:** Không bao giờ phải viết tài liệu API bằng tay. Định nghĩa TypeScript Types = Swagger Docs.
3. **Decoupling (Giảm Lệ Thuộc):** Mọi Service, Repository, Database không gọi trực tiếp lẫn nhau mà giao tiếp thông qua Dependency Injection (DI) Container, giúp dễ dàng unit test và thay thế công nghệ (VD: Đổi từ Firebase sang PostgreSQL cực kỳ dễ dàng).
4. **Scalability:** Có sẵn kiến trúc Queue (Worker) cho các tác vụ nặng và Socket cho realtime, có thể scale độc lập từng phần.

---

## 🛠 Tech Stack (Công Nghệ Sử Dụng)

- **Ngôn ngữ:** [TypeScript](https://www.typescriptlang.org/) (Strict mode)
- **Web Framework:** [Express.js](https://expressjs.com/)
- **Dependency Injection (DI):** [Awilix](https://github.com/jeffijoe/awilix)
- **Auto Routing & API Docs:** [tsoa](https://tsoa-community.github.io/docs/) + [Swagger UI](https://swagger.io/tools/swagger-ui/)
- **Cơ sở dữ liệu (Database):** [PostgreSQL](https://www.postgresql.org/) (Sử dụng `pg` driver với mô hình Relational)
- **Caching & Message Queue:** [Redis](https://redis.io/) + [BullMQ](https://docs.bullmq.io/)
- **Data Validation & Config:** [Zod](https://zod.dev/)
- **Quản lý Monorepo:** NPM Workspaces (`npm -w`)

---

## 🏗 Kiến Trúc (Architecture)

Hệ thống sử dụng mô hình **Modular Monolithic** kết hợp **Monorepo** qua NPM Workspaces. Kiến trúc chia làm 2 ranh giới rõ ràng:

- `apps/`: Các điểm khởi chạy ứng dụng (Entry points).
- `libs/`: Nơi chứa toàn bộ cốt lõi hệ thống và logic nghiệp vụ.

### 🗂 Cấu Trúc Thư Mục Chi Tiết & Hướng Dẫn Tùy Chỉnh

Hệ thống được thiết kế theo tư duy **Domain-Driven Design (DDD)** kết hợp **Clean Architecture** thu gọn. Dưới đây là phân tích ý nghĩa của từng thư mục và cách bạn có thể can thiệp tùy chỉnh chúng:

#### 1. `apps/` (Lớp Giao Tiếp Mạng - Network Layer)
Đây là nơi chứa các ứng dụng/services có thể chạy độc lập. Chúng đóng vai trò là "cổng vào" tiếp nhận kết nối từ thế giới bên ngoài.
- **`api-gateway/`**: Chứa REST API server chính (Express). 
  - *Tùy chỉnh:* Thêm các Global Middleware (CORS, Helmet, Rate Limit). Đổi port, đổi engine nếu cần.
- **`socket/`**: Chứa server xử lý kết nối Websocket (hiện dùng Socket.io). 
  - *Tùy chỉnh:* Thêm các namespaces, định nghĩa các event realtime (Chat, Thông báo).
- **`worker/`**: Chứa tiến trình chạy ngầm xử lý hàng đợi (BullMQ). 
  - *Tùy chỉnh:* Thêm các Job Processors tải nền (vd: cronjob điểm danh, gửi email hàng loạt).

#### 2. `libs/core/` (Lớp Nền Tảng Lõi - Core Infrastructure)
Nơi chứa toàn bộ công cụ nền tảng. Code ở đây **tuyệt đối không được chứa logic nghiệp vụ (business logic)**. Mọi thứ ở đây được tái sử dụng khắp nơi.
- **`config/`**: Nơi `Zod` đọc và validate biến môi trường `.env`. 
  - *Tùy chỉnh:* Khi bạn khai báo thêm biến mới trong `.env`, bắt buộc phải khai báo cả luật kiểm tra vào `env.validation.ts` ở đây.
- **`container/`**: Nơi khơi tạo Dependency Injection Container (Awilix). 
  - *Tùy chỉnh:* Khi viết xong một tiện ích Core mới (vd: `SmtpEmailService`), bạn phải import và đăng ký (`container.register`) vào đây để các module khác có thể lấy ra dùng.
- **`database/`**: Nơi khởi tạo kết nối DB (hiện tại là Firebase Firestore). 
  - *Tùy chỉnh:* Nếu dự án muốn đổi sang MongoDB, PostgresSQL... bạn chỉ việc sửa logic khởi tạo ở thư mục này. Khái niệm Repository ở các module sẽ không bị ảnh hưởng.
- **`http/`**, **`logger/`**, **`cache/`**: Các chức năng hệ thống độc lập.

#### 3. `libs/modules/` (Lớp Nghiệp Vụ - Business Logic Layer)
Đây là không gian bạn làm việc 90% thời gian. Mỗi thư mục bên trong đại diện cho một "Miền nghiệp vụ" độc lập (Feature).
- **`users/`, `courses/`...**: Mỗi feature module sẽ tự bao đóng (encapsulate) MVC của riêng nó.
  - *Tùy chỉnh & Mở rộng:* Giả sử cần làm tính năng "Thanh toán", bạn tạo mới `libs/modules/payments/`. Cấu trúc bên trong sẽ là:
    - `payments.model.ts`: Khai báo Interface, DTO request/response.
    - `payments.service.ts`: Xử lý logic gọi cổng VNPay/Momo.
    - `payments.controller.ts`: Định nghĩa REST API `@Get`, `@Post` qua tsoa decorators.
    - `index.ts`: File entry point để "nhúng" (export IAppModule) service thanh toán vào hệ thống DI chung.

#### 4. Cấu hình cấp cao (Root Configurations)
- **`tsoa.json`**: Cấu hình công cụ sinh API. 
  - *Tùy chỉnh:* Đổi tên, version của trang API Docs, hoặc định tuyến lại nơi lưu trữ thư mục `generated`.
- **`package.json`**: File quản trị dự án Monorepo. 
  - *Tùy chỉnh:* Thêm scripts chạy tự động hoặc quản lý version của các thư viện xuyên suốt dự án.

---

## 🔄 Lịch Sử Cập Nhật & Migration (Chuyển Đổi Sang PostgreSQL)

Dự án ban đầu được thiết kế chạy trên Firebase Firestore nhưng đã thực hiện **chuyển đổi toàn diện sang PostgreSQL** theo kiến trúc Modular DB. Các giai đoạn đã hoàn thiện:

### ✅ Phase 1: Foundation (Nền Móng)
- Chuyển đổi Database Layer sang cấu trúc RDBMS sử dụng `pg` connection pool có tích hợp **Auto-migration** (tự động tạo bảng & seed admin khi boot).
- Tái cấu trúc module `users` sử dụng **UUID**, thêm trường dữ liệu `date_of_birth` thay vì Firebase Document ID. Tách riêng thông tin liên lạc thành bảng `contacts`.
- Giới thiệu module `categories` đóng vai trò là Global Lookup Table chứa hằng số (constants) toàn hệ thống.

### ✅ Phase 2: Role-based Profiles (Hồ Sơ Theo Vai Trò)
- Tạo riêng rẽ 3 bảng định danh độc lập: `teacher_profiles`, `student_profiles`, `parent_profiles`.
- Áp dụng logic **UPSERT** thông minh: Hệ thống tự động nhận diện `Role` từ JWT Token và xử lý bảng profile tương ứng thông qua API gộp (Unified API) `/api/profiles/me`.

### ✅ Phase 3: Core Business - Classes & Lessons (Lớp Học & Nội Dung)
- Thiết lập Core module gánh vác 4 bảng cốt lõi: `classes`, `teachers_classes` (danh sách giáo viên đứng lớp), `classes_students` (danh sách học sinh ghi danh), và `lessons` (bài giảng).
- Áp dụng tiền tệ `DECIMAL(12,2)` cho học phí (price) và ràng buộc Foreign Keys nghiêm ngặt, tự động nhận dạng owner của lớp học từ thẻ ID của JWT.

### ⏳ Upcoming Phases (Sắp Tới)
- **Phase 4:** `assignments` (Quản lý Bài tập, Ngân hàng câu hỏi và Chấm điểm nộp bài).
- **Phase 5:** `schedules` & `lesson_logs` (Quản lý Lịch học và Nhật ký điểm danh).
- **Phase 6:** `notifications` (Hệ thống Thông báo nội bộ đa vai trò).

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án

### Yêu cầu hệ thống:

- Node.js >= 18.x
- NPM >= 9.x
- Redis Server (Local hoặc Upstash)
- Firebase Service Account (JSON credential)

### Bước 1: Clone và Cài đặt

*Lưu ý: Bắt buộc chạy lệnh ở thư mục ROOT (`CMA-Backend`), NPM sẽ tự động cài và liên kết (hoist) các thư viện cho tất cả các workspaces con.*

```bash
git clone <repository-url>
cd CMA-Backend
npm install
```

### Bước 2: Thiết lập biến môi trường

Copy file `.env.example` thành `.env` và điền các thông tin cần thiết:

```bash
cp .env.example .env
```

Các thông tin quan trọng nhất cần điền: 
- **PostgreSQL Database:** `PG_USER`, `PG_PASSWORD`, `PG_HOST`, `PG_PORT`, `PG_DATABASE`.
- **Hệ thống chung:** `REDIS_HOST`, `REDIS_PASSWORD`, `JWT_SECRET`, và `ADMIN_EMAIL` / `ADMIN_DEFAULT_PASSWORD`.

### Bước 3: Khởi động hệ thống (Dev Mode)

Lệnh này sẽ tự động chạy 2 quy trình:

1. `tsoa:gen` sinh ra các file routing và swagger.json.
2. Dùng `concurrently` để chạy song song 3 app: Gateway, Worker, Socket.

```bash
npm run dev
```

### Bước 4: Tương tác với API

Mở trình duyệt và truy cập:

- **Health Check:** `http://localhost:3000/health`
- **Swagger UI API Docs:** `http://localhost:3000/docs`

---

## ⚠️ Những Lưu Ý Quan Trọng (Must Read)

1. **Thay đổi API / Controller:**
   Nếu bạn thêm mới một Route, đổi tên field trong TypeScript model, hay thêm/bớt parameter... bạn **bắt buộc phải chạy lệnh `npm run tsoa:gen`** (hoặc restart lại `npm run dev`) để hệ thống re-compile lại file route và cập nhật tài liệu Swagger.
2. **Quản lý Dependencies:**

   - **Không bao giờ** `cd apps/api-gateway` rồi chạy `npm install`.
   - Để cài thư viện dùng chung cho toàn dự án: Chạy `npm install <package>` từ ROOT.
   - Để cài thư viện cho riêng một module: Chạy `npm install <package> -w <đường/dẫn/đến/workspace>` (VD: `npm install stripe -w libs/modules/payments`).
3. **Lấy dependency từ DI Container:**
   Mọi class Service chỉ nên nhận dependency thông qua `constructor`. Awilix sẽ dựa vào tên tham số để "tiêm" dịch vụ tương ứng.
   *Ví dụ: `constructor(private db: FirebaseGateway, private logger: LoggerService) {}`*
4. **Sử dụng tsoa cho Controller:**
   Luôn import các decorator (`@Route`, `@Get`...) từ `@tsoa/runtime` thay vì `tsoa` để tránh lỗi ESM/CJS interop khi dùng chung với `tsx`.

---

## 💼 Use Cases Của Hệ Thống

Dự án này được tối ưu cho các Use Case như:

- **EdTech Platform / LMS (Learning Management System):** Nền tảng học tập trực tuyến quản lý hàng ngàn học sinh, phân quyền phức tạp (Admin, Teacher, Student).
- **Hệ thống xử lý bất đồng bộ (Background processing):** Nhờ cơ chế Worker với BullMQ, hệ thống đặc biệt phù hợp để sinh bảng điểm định kỳ, gửi email tự động hàng loạt, hoặc xử lý video bài giảng phía sau.
- **Tương tác Real-time:** Nhờ Socket server được tách riêng và kết nối qua Redis Pub/Sub, ứng dụng dễ dàng xây dựng tính năng Nhắn tin nhóm, Thông báo đẩy (Push Notifications) dạng realtime, hay Điểm danh trực tiếp trong lớp học ảo.
- **Boilerplate cho Microservices tương lai:** Nhờ cấu trúc phân chia rõ ràng ranh giới `apps` và `libs`, hệ thống dễ dàng được xé lẻ thành các Microservices (Gateway riêng, Auth Service riêng biệt) nếu kích thước dự án phình to.
