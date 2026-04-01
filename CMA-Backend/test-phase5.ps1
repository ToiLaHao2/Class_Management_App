$ErrorActionPreference = "Stop"

# Register teacher
try { curl.exe -s -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"email":"giaosu1@test.com","password":"Password123","username":"Giao Su","role":"teacher"}' | Out-Null } catch {}

$loginT = curl.exe -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"giaosu1@test.com","password":"Password123"}'
$tokenT = ($loginT | ConvertFrom-Json).accessToken

curl.exe -s -X PUT http://localhost:3000/api/profiles/me -H "Authorization: Bearer $tokenT" -H "Content-Type: application/json" -d '{"bio":"Giao su"}' | Out-Null
$ownerId = (curl.exe -s -X GET http://localhost:3000/api/profiles/me -H "Authorization: Bearer $tokenT" | ConvertFrom-Json).id

# Create class
$cBody = "{`"owner_id`":`"$ownerId`",`"name`":`"Lop Toan`"}"
$classId = (curl.exe -s -X POST http://localhost:3000/api/classes -H "Authorization: Bearer $tokenT" -H "Content-Type: application/json" -d $cBody | ConvertFrom-Json).id

# Create schedule
$schBody = '{"title":"Buoi 1","date":"2026-04-05T10:00:00Z","start_time":"10:00","end_time":"11:30","room":"Zoom"}'
$schRes = curl.exe -s -X POST "http://localhost:3000/api/classes/$classId/schedules" -H "Authorization: Bearer $tokenT" -H "Content-Type: application/json" -d $schBody
$scheduleId = ($schRes | ConvertFrom-Json).id

Write-Host "Schedule created: $scheduleId"

# Register student
try { curl.exe -s -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"email":"hs1@test.com","password":"Password123","username":"Hoc Sinh","role":"student"}' | Out-Null } catch {}

$loginS = curl.exe -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"hs1@test.com","password":"Password123"}'
$tokenS = ($loginS | ConvertFrom-Json).accessToken
curl.exe -s -X PUT http://localhost:3000/api/profiles/me -H "Authorization: Bearer $tokenS" -H "Content-Type: application/json" -d '{"school":"Truong XYZ"}' | Out-Null
$stuId = (curl.exe -s -X GET http://localhost:3000/api/profiles/me -H "Authorization: Bearer $tokenS" | ConvertFrom-Json).id

# Mark Bulk Attendance
$bulkBody = "{`"logs`":[{`"student_id`":`"$stuId`",`"attendance_status`":true,`"student_comment`":`"Hoan Hao`"}]}"
$bulkRes = curl.exe -s -X POST "http://localhost:3000/api/schedules/$scheduleId/attendance/bulk" -H "Authorization: Bearer $tokenT" -H "Content-Type: application/json" -d $bulkBody
Write-Host "Bulk Attend: $bulkRes"

# Attachment
$attBody = "{`"ref_type`":`"schedule`",`"ref_id`":`"$scheduleId`",`"file_url`":`"https://cdn.example.com/bai.pdf`",`"file_name`":`"bai.pdf`",`"file_type`":`"pdf`"}"
$attRes = curl.exe -s -X POST "http://localhost:3000/api/attachments" -H "Authorization: Bearer $tokenT" -H "Content-Type: application/json" -d $attBody
Write-Host "Attachment: $attRes"
