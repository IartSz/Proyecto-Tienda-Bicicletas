package cl.ridertapia.reportesservice.service;

import cl.ridertapia.reportesservice.dto.DetallePedidoDto;
import cl.ridertapia.reportesservice.dto.PedidoDto;
import cl.ridertapia.reportesservice.dto.DocumentoDto;
import cl.ridertapia.reportesservice.exception.ApiException;
import cl.ridertapia.reportesservice.model.DatosFactura;
import cl.ridertapia.reportesservice.model.DetalleDocumento;
import cl.ridertapia.reportesservice.model.DocumentoVenta;
import cl.ridertapia.reportesservice.repository.DatosFacturaRepository;
import cl.ridertapia.reportesservice.repository.DetalleDocumentoRepository;
import cl.ridertapia.reportesservice.repository.DocumentoVentaRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DocumentoVentaService {


    private static final double FACTOR_IVA = 1.19;

    private final DocumentoVentaRepository documentoRepository;
    private final DetalleDocumentoRepository detalleRepository;
    private final DatosFacturaRepository datosFacturaRepository;
    private final PedidoRemotoService pedidoRemoto;
    private final CriterioVenta criterioVenta;

    @Transactional
    public DocumentoDto.Detalle emitirBoleta(DocumentoDto.EmitirBoleta request) {
        return emitir(DocumentoVenta.Tipo.BOLETA, request.idPedido(), null);
    }

    @Transactional
    public DocumentoDto.Detalle emitirFactura(DocumentoDto.EmitirFactura request) {
        if (!esRutValido(request.rutEmpresa().trim().toUpperCase())) {
            throw ApiException.solicitudInvalida("El RUT de la empresa no es válido");
        }
        return emitir(DocumentoVenta.Tipo.FACTURA, request.idPedido(), request);
    }

    @Transactional(readOnly = true)
    public List<DocumentoDto.Resumen> listarDocumentos(DocumentoVenta.Tipo tipo) {
        List<DocumentoVenta> documentos = tipo == null
                ? documentoRepository.findAll()
                : documentoRepository.findByTipo(tipo);
        return documentos.stream().map(DocumentoDto.Resumen::desde).toList();
    }

    @Transactional(readOnly = true)
    public DocumentoDto.Detalle findById(Long idDocumento) {
        DocumentoVenta documento = documentoRepository.findById(idDocumento)
                .orElseThrow(() -> ApiException.noEncontrado("No existe el documento " + idDocumento));
        return armarDetalle(documento);
    }

    @Transactional(readOnly = true)
    public DocumentoDto.Detalle findByPedido(Long idPedido) {
        DocumentoVenta documento = documentoRepository.findByIdPedido(idPedido)
                .orElseThrow(() -> ApiException.noEncontrado("El pedido " + idPedido + " no tiene documento emitido"));
        return armarDetalle(documento);
    }

    @Transactional(readOnly = true)
    public DocumentoDto.Detalle findByNumero(DocumentoVenta.Tipo tipo, Long numero) {
        DocumentoVenta documento = documentoRepository.findByTipoAndNumero(tipo, numero)
                .orElseThrow(() -> ApiException.noEncontrado("No existe la " + tipo + " número " + numero));
        return armarDetalle(documento);
    }

    @Transactional(readOnly = true)
    public List<DocumentoDto.Resumen> findByRutCliente(String rutCliente) {
        return documentoRepository.findByRutCliente(rutCliente)
                .stream().map(DocumentoDto.Resumen::desde).toList();
    }

    private DocumentoDto.Detalle emitir(DocumentoVenta.Tipo tipo, Long idPedido,
                                        DocumentoDto.EmitirFactura datosEmpresa) {
        if (documentoRepository.existsByIdPedido(idPedido)) {
            throw ApiException.conflicto("El pedido " + idPedido + " ya tiene un documento emitido");
        }

        PedidoDto pedido = pedidoRemoto.obtenerPedido(idPedido);
        if (!criterioVenta.esVenta(pedido.estado())) {
            throw ApiException.solicitudInvalida("Solo se emiten documentos de pedidos pagados. "
                    + "Estado actual del pedido: " + pedido.estado());
        }
        if (pedido.total() == null || pedido.total() <= 0) {
            throw ApiException.solicitudInvalida("El pedido no tiene un total válido");
        }

        List<DetallePedidoDto> detallesPedido = pedidoRemoto.listarDetallesPorPedido(idPedido);
        if (detallesPedido.isEmpty()) {
            throw ApiException.solicitudInvalida("El pedido no tiene productos");
        }

        int total = pedido.total();
        int neto = (int) Math.round(total / FACTOR_IVA);
        int iva = total - neto;
        long numero = documentoRepository.findTopByTipoOrderByNumeroDesc(tipo)
                .map(d -> d.getNumero() + 1)
                .orElse(1L);

        DocumentoVenta documento = documentoRepository.save(DocumentoVenta.builder()
                .numero(numero)
                .tipo(tipo)
                .idPedido(idPedido)
                .rutCliente(pedido.rutCliente())
                .fechaEmision(LocalDateTime.now())
                .neto(neto)
                .iva(iva)
                .total(total)
                .build());

        List<DetalleDocumento> lineas = new ArrayList<>();
        for (DetallePedidoDto d : detallesPedido) {
            lineas.add(DetalleDocumento.builder()
                    .idDocumento(documento.getIdDocumento())
                    .idVariante(d.idVariante())
                    .descripcion("Variante " + d.idVariante())
                    .cantidad(entero(d.cantidad()))
                    .precioUnitario(entero(d.precioUnitario()))
                    .subtotal(entero(d.subtotal()))
                    .build());
        }
        // El descuento va como línea negativa para que las líneas sumen el total del documento
        int descuento = entero(pedido.descuento());
        if (descuento > 0) {
            lineas.add(DetalleDocumento.builder()
                    .idDocumento(documento.getIdDocumento())
                    .descripcion("Descuento aplicado")
                    .cantidad(1)
                    .precioUnitario(-descuento)
                    .subtotal(-descuento)
                    .build());
        }
        List<DetalleDocumento> lineasGuardadas = detalleRepository.saveAll(lineas);

        DatosFactura datosGuardados = null;
        if (datosEmpresa != null) {
            datosGuardados = datosFacturaRepository.save(DatosFactura.builder()
                    .idDocumento(documento.getIdDocumento())
                    .rutEmpresa(datosEmpresa.rutEmpresa().trim().toUpperCase())
                    .razonSocial(datosEmpresa.razonSocial().trim())
                    .giro(datosEmpresa.giro().trim())
                    .direccionEmpresa(datosEmpresa.direccionEmpresa().trim())
                    .build());
        }

        return new DocumentoDto.Detalle(
                DocumentoDto.Resumen.desde(documento),
                lineasGuardadas.stream().map(DocumentoDto.Linea::desde).toList(),
                datosGuardados == null ? null : DocumentoDto.DatosEmpresa.desde(datosGuardados));
    }

    private DocumentoDto.Detalle armarDetalle(DocumentoVenta documento) {
        List<DocumentoDto.Linea> lineas = detalleRepository.findByIdDocumento(documento.getIdDocumento())
                .stream().map(DocumentoDto.Linea::desde).toList();
        DocumentoDto.DatosEmpresa empresa = datosFacturaRepository.findByIdDocumento(documento.getIdDocumento())
                .map(DocumentoDto.DatosEmpresa::desde)
                .orElse(null);
        return new DocumentoDto.Detalle(DocumentoDto.Resumen.desde(documento), lineas, empresa);
    }

    private int entero(Integer numero) {
        return numero == null ? 0 : numero;
    }

    /** Valida el dígito verificador de un RUT con formato 76123456-0 (módulo 11). */
    private static boolean esRutValido(String rut) {
        if (rut == null || !rut.matches("^\\d{7,8}-[\\dkK]$")) {
            return false;
        }
        String[] partes = rut.split("-");
        String cuerpo = partes[0];
        char dvIngresado = Character.toUpperCase(partes[1].charAt(0));
        int suma = 0;
        int multiplicador = 2;
        for (int i = cuerpo.length() - 1; i >= 0; i--) {
            suma += Character.getNumericValue(cuerpo.charAt(i)) * multiplicador;
            multiplicador = (multiplicador == 7) ? 2 : multiplicador + 1;
        }
        int resto = 11 - (suma % 11);
        char dvEsperado = (resto == 11) ? '0' : (resto == 10) ? 'K' : (char) ('0' + resto);
        return dvIngresado == dvEsperado;
    }
}
