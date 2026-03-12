$projectRoot = Split-Path -Parent $PSScriptRoot
$targetPort = 19000

$existingExpo = Get-CimInstance Win32_Process | Where-Object {
  $_.CommandLine -like '*expo start*' -and $_.CommandLine -like '*sainat-mobile*'
}

if ($existingExpo) {
  Write-Output 'Expo dev server is already running for this project.'
  $existingExpo | Select-Object ProcessId, Name, CommandLine | Format-List
  exit 0
}

$portInUse = netstat -ano | Select-String ":$targetPort"
if ($portInUse) {
  Write-Output "Port $targetPort is already in use. Attempting to free it."
  $processIds = $portInUse | ForEach-Object {
    ($_ -split '\s+')[-1]
  } | Where-Object { $_ -match '^\d+$' } | Select-Object -Unique

  foreach ($processId in $processIds) {
    try {
      Stop-Process -Id ([int]$processId) -Force -ErrorAction Stop
      Write-Output ("Stopped process on port {0}: {1}" -f $targetPort, $processId)
    } catch {
      Write-Output "Could not stop process $processId"
    }
  }
}

Write-Output 'Starting Expo on localhost:19000'
Start-Process powershell -ArgumentList '-NoExit', '-Command', "npm run start:local" -WorkingDirectory $projectRoot
