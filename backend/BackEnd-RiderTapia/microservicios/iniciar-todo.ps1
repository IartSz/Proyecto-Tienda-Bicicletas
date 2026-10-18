# Levanta los microservicios y el gateway en orden, cada uno en su propia ventana.
# Uso: .\iniciar-todo.ps1 [-PuertoGateway 9090] [-DbUser root] [-DbPassword clave]

param(
    [int]$PuertoGateway = 9000,
    [int]$SegundosEspera = 180,
    [string]$DbUser,
    [string]$DbPassword
)

$raiz = $PSScriptRoot

if ($DbUser) { $env:DB_USER = $DbUser }
if ($DbPassword) { $env:DB_PASSWORD = $DbPassword }

# Versión principal de un JDK según su archivo 'release'
function Get-VersionJdk([string]$ruta) {
    $release = Join-Path $ruta 'release'
    if (-not (Test-Path (Join-Path $ruta 'bin\java.exe')) -or -not (Test-Path $release)) { return 0 }
    $linea = Select-String -Path $release -Pattern '^JAVA_VERSION="(\d+)' | Select-Object -First 1
    if ($linea) { [int]$linea.Matches[0].Groups[1].Value } else { 0 }
}

# Busca un JDK instalado de alguna de las versiones indicadas (o usa la variable de entorno si existe)
function Find-Jdk([int[]]$versiones, [string]$variable) {
    $forzado = [Environment]::GetEnvironmentVariable($variable)
    if ($forzado) { return $forzado }

    $candidatos = @()
    if ($env:JAVA_HOME) { $candidatos += $env:JAVA_HOME }
    $raices = @("$env:ProgramFiles\Java", "$env:ProgramFiles\Eclipse Adoptium", "$env:ProgramFiles\Microsoft",
                "$env:ProgramFiles\Zulu", "$env:ProgramFiles\Amazon Corretto", "$env:ProgramFiles\BellSoft",
                "$env:ProgramFiles\OpenJDK", "$env:USERPROFILE\.jdks")
    foreach ($r in $raices) {
        if (Test-Path $r) { $candidatos += (Get-ChildItem $r -Directory -ErrorAction SilentlyContinue).FullName }
    }
    foreach ($v in $versiones) {
        foreach ($c in $candidatos) {
            if ((Get-VersionJdk $c) -eq $v) { return $c }
        }
    }
    return $null
}

$jdk25 = Find-Jdk @(25) 'JDK_25'
$jdk21 = Find-Jdk @(21, 17) 'JDK_21'

if (-not $jdk25) {
    Write-Host 'No se encontró JDK 25. Instálalo desde https://adoptium.net o define la variable JDK_25 con su ruta.' -ForegroundColor Red
    exit 1
}
if (-not $jdk21) {
    Write-Host 'No se encontró JDK 21 (o 17). Instálalo desde https://adoptium.net o define la variable JDK_21 con su ruta.' -ForegroundColor Red
    exit 1
}

function Test-Puerto([int]$puerto) {
    [bool](Get-NetTCPConnection -LocalPort $puerto -State Listen -ErrorAction SilentlyContinue)
}

if (-not (Test-Puerto 3306)) {
    Write-Host 'MySQL no está encendido en el puerto 3306.' -ForegroundColor Red
    exit 1
}

if (Test-Puerto $PuertoGateway) {
    $dueno = Get-NetTCPConnection -LocalPort $PuertoGateway -State Listen | Select-Object -First 1
    $proceso = (Get-Process -Id $dueno.OwningProcess -ErrorAction SilentlyContinue).ProcessName
    Write-Host "El puerto $PuertoGateway está ocupado por '$proceso'. El gateway usará el 9090." -ForegroundColor Yellow
    $PuertoGateway = 9090
}

$servicios = @(
    @{ Nombre = 'ms-usuario';          Puerto = 9001; Jdk = $jdk21 },
    @{ Nombre = 'ms-cliente';          Puerto = 9002; Jdk = $jdk21 },
    @{ Nombre = 'ms-productos';        Puerto = 9005; Jdk = $jdk25 },
    @{ Nombre = 'ms-inventario';       Puerto = 9008; Jdk = $jdk25 },
    @{ Nombre = 'ms-pedidos';          Puerto = 9006; Jdk = $jdk25 },
    @{ Nombre = 'ms-pagos';            Puerto = 9007; Jdk = $jdk25 },
    @{ Nombre = 'ms-carrito';          Puerto = 9009; Jdk = $jdk25 },
    @{ Nombre = 'ms-proveedores';      Puerto = 9011; Jdk = $jdk25 },
    @{ Nombre = 'ms-servicio-tecnico'; Puerto = 9015; Jdk = $jdk25 },
    @{ Nombre = 'ms-soporte';          Puerto = 9003; Jdk = $jdk21 },
    @{ Nombre = 'ms-reportes';         Puerto = 9004; Jdk = $jdk21 },
    @{ Nombre = 'ms-gateway';          Puerto = $PuertoGateway; Jdk = $jdk25 }
)

$yaCorriendo = 0
foreach ($s in $servicios) {
    if (Test-Puerto $s.Puerto) {
        Write-Host ("{0,-20} ya está corriendo en el puerto {1}" -f $s.Nombre, $s.Puerto) -ForegroundColor DarkGray
        $yaCorriendo++
        continue
    }

    $argumentos = ''
    if ($s.Nombre -eq 'ms-gateway' -and $s.Puerto -ne 9000) {
        $argumentos = " '-Dspring-boot.run.arguments=--server.port=$($s.Puerto)'"
    }

    $comando = "`$Host.UI.RawUI.WindowTitle = '$($s.Nombre) :$($s.Puerto)'; " +
               "`$env:JAVA_HOME = '$($s.Jdk)'; " +
               ".\mvnw.cmd spring-boot:run$argumentos"

    Write-Host ("{0,-20} iniciando en el puerto {1}..." -f $s.Nombre, $s.Puerto) -NoNewline
    Start-Process powershell -WorkingDirectory (Join-Path $raiz $s.Nombre) `
        -ArgumentList '-NoExit', '-ExecutionPolicy', 'Bypass', '-Command', $comando

    $limite = (Get-Date).AddSeconds($SegundosEspera)
    while (-not (Test-Puerto $s.Puerto) -and (Get-Date) -lt $limite) {
        Start-Sleep -Seconds 2
    }

    if (Test-Puerto $s.Puerto) {
        Write-Host ' listo' -ForegroundColor Green
    } else {
        Write-Host " no respondió en $SegundosEspera s. Revisa su ventana." -ForegroundColor Red
    }
}

if ($yaCorriendo -eq $servicios.Count) {
    Write-Host ''
    ##uwu 
    Write-Host 'Los servicios ya estaban encendidos. Para reiniciarlos, ejecuta primero detener-todo.' -ForegroundColor Yellow
}

Write-Host ''
Write-Host "Gateway: http://localhost:$PuertoGateway" -ForegroundColor Cyan
