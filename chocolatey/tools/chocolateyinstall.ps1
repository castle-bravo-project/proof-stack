$ErrorActionPreference = 'Stop'

$packageName = 'proofstack'
$toolsDir = "$(Split-Path -parent $MyInvocation.MyCommand.Definition)"
$url64 = 'https://github.com/castle-bravo-project/proof-stack/releases/download/v1.1.0/ProofStack%20Legal%20Compliance%20Tool%20Setup%201.1.0.exe'
$checksum64 = 'REPLACE_WITH_ACTUAL_CHECKSUM'
$checksumType64 = 'sha256'

$packageArgs = @{
  packageName   = $packageName
  unzipLocation = $toolsDir
  fileType      = 'EXE'
  url64bit      = $url64
  softwareName  = 'ProofStack Legal Compliance Tool*'
  checksum64    = $checksum64
  checksumType64= $checksumType64
  silentArgs    = '/S'
  validExitCodes= @(0)
}

Install-ChocolateyPackage @packageArgs
