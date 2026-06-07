[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$content = Get-Content -Raw 'c:\Users\MicaForever\Desktop\dreamcraftastraneweb-fix-sales-overview-reactivity\docs\API\项目管理\api.json'
$json = $content | ConvertFrom-Json
$json.components.schemas.PSObject.Properties | Where-Object { $_.Name -eq 'ProjectVO' } | ForEach-Object {
    Write-Host $_.Name
    $_.Value | ConvertTo-Json -Depth 10
}
