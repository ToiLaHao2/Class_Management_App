$ErrorActionPreference = "Stop"

$regBody = @{ email = "t2@t.com"; password = "Password123"; username = "T2"; role = "teacher" } | ConvertTo-Json
curl.exe -s -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d $regBody | Out-Null

$logRes = curl.exe -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"t2@t.com","password":"Password123"}'
$tokenT = ($logRes | ConvertFrom-Json).accessToken

curl.exe -s -X PUT http://localhost:3000/api/profiles/me -H "Authorization: Bearer $tokenT" -H "Content-Type: application/json" -d '{"bio":"Bio"}' | Out-Null

$qBody = @{ question_text = "Test Q"; correct_answer = "B" } | ConvertTo-Json
$qRes = curl.exe -s -X POST http://localhost:3000/api/questions -H "Authorization: Bearer $tokenT" -H "Content-Type: application/json" -d $qBody
$qId = ($qRes | ConvertFrom-Json).id
Write-Host "Q ID: $qId"

$cBody = @{ name = "Class 1"; owner_id = ($curl = curl.exe -s -X GET http://localhost:3000/api/profiles/me -H "Authorization: Bearer $tokenT" | ConvertFrom-Json).id } | ConvertTo-Json
$cRes = curl.exe -s -X POST http://localhost:3000/api/classes -H "Authorization: Bearer $tokenT" -H "Content-Type: application/json" -d $cBody
$cId = ($cRes | ConvertFrom-Json).id

$aBody = @{ title = "Assign 1" } | ConvertTo-Json
$aRes = curl.exe -s -X POST "http://localhost:3000/api/classes/$cId/assignments" -H "Authorization: Bearer $tokenT" -H "Content-Type: application/json" -d $aBody
$aId = ($aRes | ConvertFrom-Json).id
Write-Host "A ID: $aId"

$lBody = @{ question_id = $qId; order_index = 1 } | ConvertTo-Json
curl.exe -s -X POST "http://localhost:3000/api/assignments/$aId/questions" -H "Authorization: Bearer $tokenT" -H "Content-Type: application/json" -d $lBody | Out-Null

curl.exe -s -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"email":"s2@t.com","password":"Password123","username":"S2","role":"student"}' | Out-Null
$logS = curl.exe -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"s2@t.com","password":"Password123"}'
$tokenS = ($logS | ConvertFrom-Json).accessToken
curl.exe -s -X PUT http://localhost:3000/api/profiles/me -H "Authorization: Bearer $tokenS" -H "Content-Type: application/json" -d '{"school":"Trang"}' | Out-Null

$subBody = '{"submission_data": {"ans":"B"}}'
$sRes = curl.exe -s -X POST "http://localhost:3000/api/assignments/$aId/submissions" -H "Authorization: Bearer $tokenS" -H "Content-Type: application/json" -d $subBody
$sId = ($sRes | ConvertFrom-Json).id
Write-Host "Sub ID: $sId"

$gBody = @{ grade = 9.5 } | ConvertTo-Json
$gRes = curl.exe -s -X PUT "http://localhost:3000/api/submissions/$sId/grade" -H "Authorization: Bearer $tokenT" -H "Content-Type: application/json" -d $gBody
Write-Host "Grade: $(($gRes | ConvertFrom-Json).grade)"
