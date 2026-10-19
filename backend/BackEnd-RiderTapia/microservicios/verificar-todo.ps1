# Revisa que cada microservicio responda directo y a través del gateway.

function Test-Puerto([int]$puerto) {
    [bool](Get-NetTCPConnection -LocalPort $puerto -State Listen -ErrorAction SilentlyContinue)
}

function Get-Codigo([string]$url) {
    try {
        (Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10).StatusCode
    } catch {
        if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 0 }
    }
}

# El gateway puede estar en el 9000 o en el 9090
$gateway = $null
foreach ($p in 9000, 9090) {
    $c = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($c -and (Get-Process -Id $c.OwningProcess -ErrorAction SilentlyContinue).ProcessName -eq 'java') {
        $gateway = "http://localhost:$p"
        break
    }
}

$servicios = @(
    @{ Nombre = 'ms-usuario';          Puerto = 9001; Ruta = '/api/v1/usuarios'; Directa = '/api/usuarios' },
    @{ Nombre = 'ms-cliente';          Puerto = 9002; Ruta = '/api/v1/clientes'; Directa = '/api/clientes' },
    @{ Nombre = 'ms-soporte';          Puerto = 9003; Ruta = '/api/v1/contactos' },
    @{ Nombre = 'ms-reportes';         Puerto = 9004; Ruta = '/api/v1/reportes' },
    @{ Nombre = 'ms-productos';        Puerto = 9005; Ruta = '/api/v1/productos' },
    @{ Nombre = 'ms-pedidos';          Puerto = 9006; Ruta = '/api/v1/pedidos' },
    @{ Nombre = 'ms-pagos';            Puerto = 9007; Ruta = '/api/v1/pagos-webpay' },
    @{ Nombre = 'ms-inventario';       Puerto = 9008; Ruta = '/api/v1/items-inventario' },
    @{ Nombre = 'ms-carrito';          Puerto = 9009; Ruta = '/api/v1/carritos' },
    @{ Nombre = 'ms-servicio-tecnico'; Puerto = 9015; Ruta = '/api/v1/ordenes-trabajo' },
    @{ Nombre = 'ms-proveedores';      Puerto = 9011; Ruta = '/api/v1/proveedores' }
)

Write-Host ''
if (Test-Puerto 3306) {
    Write-Host 'MySQL (3306)      OK' -ForegroundColor Green
} else {
    Write-Host 'MySQL (3306)      APAGADO' -ForegroundColor Red
}
if ($gateway) {
    Write-Host "Gateway           OK en $gateway" -ForegroundColor Green
} else {
    Write-Host 'Gateway           APAGADO (no hay un servicio Java en el 9000 ni en el 9090)' -ForegroundColor Red
}
Write-Host ''
Write-Host ('{0,-20} {1,-7} {2,-9} {3,-9} {4}' -f 'Servicio', 'Puerto', 'Directo', 'Gateway', 'Estado')
Write-Host ('-' * 66)

$malos = 0
foreach ($s in $servicios) {
    if (-not (Test-Puerto $s.Puerto)) {
        Write-Host ('{0,-20} {1,-7} {2,-9} {3,-9} {4}' -f $s.Nombre, $s.Puerto, '-', '-', 'APAGADO') -ForegroundColor Red
        $malos++
        continue
    }
    $rutaDirecta = if ($s.Directa) { $s.Directa } else { $s.Ruta }
    $directo = Get-Codigo "http://localhost:$($s.Puerto)$rutaDirecta"
    $porGateway = if ($gateway) { Get-Codigo "$gateway$($s.Ruta)" } else { '-' }

    if ($directo -eq 200 -and $porGateway -eq 200) {
        $estado = 'OK'; $color = 'Green'
    } elseif ($directo -eq 200) {
        $estado = 'Responde, pero no por el gateway'; $color = 'Yellow'; $malos++
    } else {
        $estado = 'ERROR (revisa su ventana)'; $color = 'Red'; $malos++
    }
    Write-Host ('{0,-20} {1,-7} {2,-9} {3,-9} {4}' -f $s.Nombre, $s.Puerto, $directo, $porGateway, $estado) -ForegroundColor $color
}

Write-Host ''
if ($malos -eq 0 -and $gateway) {
    Write-Host 'Todo está funcionando.' -ForegroundColor Green
} else {
    Write-Host "Hay $malos servicio(s) con problemas." -ForegroundColor Yellow
}
