# Detiene los procesos Java que escuchan en los puertos de los microservicios (9000-9009, 9011, 9015) y 9090.

$puertos = @(9000..9009) + 9011 + 9015 + 9090
$conexiones = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
    Where-Object { $puertos -contains $_.LocalPort }

$detenidos = 0
foreach ($c in $conexiones) {
    $proceso = Get-Process -Id $c.OwningProcess -ErrorAction SilentlyContinue
    if ($proceso -and $proceso.ProcessName -eq 'java') {
        Write-Host "Deteniendo puerto $($c.LocalPort) (pid $($proceso.Id))"
        Stop-Process -Id $proceso.Id -Force -ErrorAction SilentlyContinue
        $detenidos++
    }
}

if ($detenidos -eq 0) {
    Write-Host 'No había microservicios corriendo.'
} else {
    Write-Host "$detenidos servicio(s) detenido(s)." -ForegroundColor Green
}
