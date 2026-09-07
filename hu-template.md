# Historias de Usuario y Criterios de Aceptación
# Proyecto Tienda Bicicletas #


## Historia de usuario HU-1: Registro de cliente
**Como** Cliente  
**Quiero** registrar una cuenta con mis datos personales y de contacto  
**Para** acceder a los servicios de la tienda de forma personalizada

## Criterios de aceptación
- [ ] **Escenario 1: Registro exitoso**
```gherkin
Dado que soy un visitante no registrado en el formulario de registro
Cuando ingreso nombre, correo válido, contraseña segura y datos de contacto
Y confirmo el registro
Entonces el sistema crea mi cuenta y muestra un mensaje de confirmación
```
- [ ] **Escenario 2: Correo ya registrado**
```gherkin
Dado que ingreso un correo ya asociado a una cuenta existente
Cuando intento registrarme
Entonces el sistema no crea la cuenta y muestra el mensaje "el correo ya está registrado"
```
- [ ] **Escenario 3: Datos obligatorios incompletos**
```gherkin
Dado que dejo vacío un campo obligatorio
Cuando intento registrarme
Entonces el sistema no crea la cuenta e indica los campos faltantes
```

## Historia de usuario HU-2: Registro de visitante
**Como** Cliente  
**Quiero** registrar mis datos mínimos como visitante  
**Para** poder comprar sin crear una cuenta completa

## Criterios de aceptación
- [ ] **Escenario 1: Compra como visitante con datos mínimos**
```gherkin
Dado que no deseo crear una cuenta
Cuando ingreso mi nombre y un medio de contacto (correo o teléfono)
Entonces el sistema me permite continuar con la compra como visitante
```
- [ ] **Escenario 2: Falta un medio de contacto**
```gherkin
Dado que no ingreso correo ni teléfono
Cuando intento continuar como visitante
Entonces el sistema no me deja avanzar e indica que debo ingresar un medio de contacto
```

## Historia de usuario HU-3: Actualizar perfil de usuario
**Como** Cliente  
**Quiero** actualizar los datos de mi perfil  
**Para** mantener mi información al día

## Criterios de aceptación
- [ ] **Escenario 1: Actualización exitosa**
```gherkin
Dado que soy un cliente autenticado en mi perfil
Cuando modifico mis datos y guardo
Entonces el sistema valida y refleja los cambios de inmediato
```
- [ ] **Escenario 2: Dato con formato inválido**
```gherkin
Dado que ingreso un correo o teléfono con formato inválido
Cuando intento guardar
Entonces el sistema muestra el error y no guarda los cambios
```

## Historia de usuario HU-4: Recuperar contraseña
**Como** Cliente  
**Quiero** recuperar mi contraseña mediante un enlace enviado a mi correo  
**Para** recuperar el acceso a mi cuenta

## Criterios de aceptación
- [ ] **Escenario 1: Correo registrado**
```gherkin
Dado que solicito recuperar mi contraseña con un correo registrado
Cuando envío la solicitud
Entonces el sistema envía a mi correo un enlace de restablecimiento con vencimiento
```
- [ ] **Escenario 2: Correo no registrado**
```gherkin
Dado que ingreso un correo que no está registrado
Cuando envío la solicitud
Entonces el sistema muestra el mismo mensaje genérico sin revelar si el correo existe
```
- [ ] **Escenario 3: Enlace vencido o ya utilizado**
```gherkin
Dado que el enlace de restablecimiento ya fue usado o expiró
Cuando intento acceder a él
Entonces el sistema lo rechaza y ofrece solicitar uno nuevo
```

## Historia de usuario HU-5: Desactivar cuenta
**Como** Administrador  
**Quiero** desactivar cuentas de cliente  
**Para** controlar el acceso al sistema

## Criterios de aceptación
- [ ] **Escenario 1: Desactivación exitosa**
```gherkin
Dado que soy administrador en el panel de gestión
Cuando desactivo la cuenta de un cliente
Entonces la cuenta queda desactivada, conserva sus datos y la acción queda registrada
```
- [ ] **Escenario 2: Inicio de sesión con cuenta desactivada**
```gherkin
Dado que una cuenta está desactivada
Cuando el cliente intenta iniciar sesión
Entonces el sistema le niega el acceso e informa que la cuenta está desactivada
```

## Historia de usuario HU-8: Iniciar sesión
**Como** Cliente  
**Quiero** iniciar sesión con mi correo y contraseña  
**Para** acceder a mi cuenta, mis pedidos y mis datos guardados

## Criterios de aceptación
- [ ] **Escenario 1: Credenciales correctas**
```gherkin
Dado que soy un cliente registrado
Cuando ingreso mi correo y contraseña correctos
Entonces el sistema me da acceso a mi cuenta, pedidos y datos guardados
```
- [ ] **Escenario 2: Credenciales incorrectas**
```gherkin
Dado que ingreso un correo o contraseña incorrectos
Cuando intento iniciar sesión
Entonces el sistema muestra un mensaje de error y ofrece la opción de recuperar contraseña
```

## Historia de usuario HU-9: Iniciar sesión (staff)
**Como** Administrador  
**Quiero** iniciar sesión de forma diferenciada según mi rol de staff  
**Para** acceder a las funciones internas correspondientes a mi rol

## Criterios de aceptación
- [ ] **Escenario 1: Acceso según rol**
```gherkin
Dado que soy un usuario del staff con un rol asignado
Cuando inicio sesión con credenciales correctas
Entonces el sistema habilita solo las funciones correspondientes a mi rol
```
- [ ] **Escenario 2: Credenciales incorrectas**
```gherkin
Dado que ingreso credenciales incorrectas
Cuando intento iniciar sesión
Entonces el sistema muestra un mensaje de error y no concede acceso
```

## Historia de usuario HU-12: Agregar productos al carrito
**Como** Cliente  
**Quiero** agregar productos al carrito  
**Para** preparar mi compra

## Criterios de aceptación
- [ ] **Escenario 1: Producto disponible**
```gherkin
Dado que estoy viendo un producto con stock disponible
Cuando lo agrego al carrito
Entonces el producto aparece en el carrito con la cantidad seleccionada
Y el total del carrito se actualiza
```
- [ ] **Escenario 2: Producto sin stock**
```gherkin
Dado que un producto no tiene stock disponible
Cuando intento agregarlo al carrito
Entonces el sistema me informa y no lo agrega
```

## Historia de usuario HU-13: Actualizar carrito
**Como** Cliente  
**Quiero** modificar las cantidades de los productos del carrito  
**Para** ajustar mi compra antes de pagar

## Criterios de aceptación
- [ ] **Escenario 1: Cambiar cantidad**
```gherkin
Dado que tengo productos en el carrito
Cuando aumento o disminuyo la cantidad de un producto
Entonces el subtotal y el total se recalculan automáticamente
```
- [ ] **Escenario 2: Cantidad supera el stock**
```gherkin
Dado que intento fijar una cantidad mayor al stock disponible
Cuando actualizo el carrito
Entonces el sistema no lo permite e indica el stock máximo disponible
```
- [ ] **Escenario 3: Eliminar producto**
```gherkin
Dado que tengo un producto en el carrito
Cuando lo elimino
Entonces el producto desaparece del carrito y el total se recalcula
```

## Historia de usuario HU-14: Ver detalle del carrito
**Como** Cliente  
**Quiero** visualizar los productos, cantidades y precios del carrito  
**Para** revisar mi compra antes de confirmarla

## Criterios de aceptación
- [ ] **Escenario 1: Carrito con productos**
```gherkin
Dado que tengo productos en el carrito
Cuando abro el detalle del carrito
Entonces veo cada producto con imagen, nombre, cantidad, precio unitario y subtotal
Y veo el total general
```
- [ ] **Escenario 2: Carrito vacío**
```gherkin
Dado que no tengo productos en el carrito
Cuando abro el detalle del carrito
Entonces el sistema indica que está vacío y ofrece volver al catálogo
```

## Historia de usuario HU-15: Aplicar cupones de descuento
**Como** Cliente  
**Quiero** aplicar cupones o descuentos en el carrito  
**Para** obtener rebajas en mi compra

## Criterios de aceptación
- [ ] **Escenario 1: Cupón válido**
```gherkin
Dado que tengo productos en el carrito
Cuando ingreso un cupón válido y vigente
Entonces el sistema aplica el descuento y lo muestra desglosado en el total
```
- [ ] **Escenario 2: Cupón inválido o vencido**
```gherkin
Dado que ingreso un cupón inexistente o vencido
Cuando lo aplico
Entonces el sistema no aplica el descuento y muestra el motivo
```

## Historia de usuario HU-17: Crear pedido
**Como** Cliente  
**Quiero** crear un pedido a partir del carrito  
**Para** iniciar el proceso de compra

## Criterios de aceptación
- [ ] **Escenario 1: Carrito con stock**
```gherkin
Dado que tengo al menos un producto con stock en el carrito
Cuando creo el pedido
Entonces el sistema genera un pedido en estado inicial con los productos, cantidades y precios del carrito
```
- [ ] **Escenario 2: Carrito vacío**
```gherkin
Dado que el carrito está vacío
Cuando intento crear el pedido
Entonces el sistema no lo permite e indica que agregue productos
```

## Historia de usuario HU-18: Confirmar pedido
**Como** Cliente  
**Quiero** confirmar el pedido visualizando el total  
**Para** validar mi compra antes de pagar

## Criterios de aceptación
- [ ] **Escenario 1: Confirmación del pedido**
```gherkin
Dado que revisé el resumen del pedido con su total
Cuando confirmo el pedido
Entonces el sistema avanza al pago
```
- [ ] **Escenario 2: Volver a modificar el carrito**
```gherkin
Dado que estoy en el resumen del pedido
Cuando decido volver atrás
Entonces el sistema me devuelve al carrito para modificarlo
```

## Historia de usuario HU-19: Realizar pago en línea
**Como** Cliente  
**Quiero** procesar el pago mediante WebPay  
**Para** pagar mi pedido de forma segura en línea

## Criterios de aceptación
- [ ] **Escenario 1: Pago aprobado**
```gherkin
Dado que confirmé el pedido y fui redirigido a WebPay
Cuando el pago es aprobado
Entonces el pedido pasa a estado pagado y se muestra el comprobante
```
- [ ] **Escenario 2: Pago rechazado o cancelado**
```gherkin
Dado que fui redirigido a WebPay
Cuando el pago es rechazado o lo cancelo
Entonces el pedido queda pendiente de pago y el sistema me informa
```

## Historia de usuario HU-20: Generar boleta
**Como** Cliente  
**Quiero** generar el documento tributario del pedido  
**Para** contar con el comprobante de mi compra

## Criterios de aceptación
- [ ] **Escenario 1: Boleta tras pago aprobado**
```gherkin
Dado que el pago del pedido fue aprobado
Cuando el sistema genera la boleta
Entonces la boleta con el detalle y el total queda disponible para descargar o enviar al correo
```
- [ ] **Escenario 2: Pedido sin pago aprobado**
```gherkin
Dado que el pedido aún no ha sido pagado
Cuando reviso el pedido
Entonces el sistema no genera boleta hasta que el pago sea aprobado
```

## Historia de usuario HU-21: Consultar historial de pedidos
**Como** Cliente  
**Quiero** consultar el historial de mis pedidos  
**Para** hacer seguimiento a mis compras

## Criterios de aceptación
- [ ] **Escenario 1: Ver historial**
```gherkin
Dado que soy un cliente autenticado
Cuando abro mi historial de pedidos
Entonces veo mis pedidos con número, fecha, estado y total, del más reciente al más antiguo
```
- [ ] **Escenario 2: Ver detalle de un pedido**
```gherkin
Dado que estoy en mi historial de pedidos
Cuando selecciono un pedido
Entonces el sistema muestra el detalle de ese pedido
```
- [ ] **Escenario 3: Sin pedidos registrados**
```gherkin
Dado que no tengo pedidos registrados
Cuando abro mi historial
Entonces el sistema indica que aún no tengo pedidos
```

## Historia de usuario HU-22: Cancelar pedido
**Como** Cliente  
**Quiero** cancelar mi pedido  
**Para** anular una compra cuando lo necesite

## Criterios de aceptación
- [ ] **Escenario 1: Cancelación permitida**
```gherkin
Dado que tengo un pedido que no ha sido despachado ni retirado
Cuando lo cancelo
Entonces el pedido cambia a estado cancelado
Y, si corresponde, se inicia la reversa del pago
```
- [ ] **Escenario 2: Cancelación no permitida**
```gherkin
Dado que un pedido ya fue retirado
Cuando intento cancelarlo
Entonces el sistema no lo permite e informa el motivo
```

## Historia de usuario HU-23: Actualizar estado del pedido
**Como** Vendedor  
**Quiero** actualizar el estado del pedido (listo para retirar y post retiro)  
**Para** mantener informado al cliente sobre su pedido

## Criterios de aceptación
- [ ] **Escenario 1: Cambio de estado**
```gherkin
Dado que soy vendedor y tengo un pedido asignado
Cuando cambio su estado (por ejemplo, a "listo para retirar")
Entonces el sistema registra el cambio con fecha y usuario
Y notifica al cliente del estado relevante
```
- [ ] **Escenario 2: Trazabilidad de estados**
```gherkin
Dado que un pedido ha tenido varios cambios de estado
Cuando reviso el pedido
Entonces veo el historial de estados con su fecha y responsable
```

## Historia de usuario HU-27: Buscar y filtrar productos
**Como** Visitante  
**Quiero** buscar y filtrar productos por categoría (indumentaria, accesorios, componentes, neumáticos, suspensiones, mantenimiento)  
**Para** encontrar rápidamente el repuesto o accesorio que necesito

## Criterios de aceptación
- [ ] **Escenario 1: Búsqueda por palabra clave**
```gherkin
Dado que estoy en el catálogo
Cuando busco por una palabra clave
Entonces el sistema muestra resultados relevantes a esa palabra
```
- [ ] **Escenario 2: Aplicar filtros**
```gherkin
Dado que veo un listado de productos
Cuando aplico filtros por categoría, marca o precio
Entonces el listado se actualiza sin recargar la página
```
- [ ] **Escenario 3: Búsqueda sin resultados**
```gherkin
Dado que busco un término sin coincidencias
Cuando ejecuto la búsqueda
Entonces el sistema indica que no se encontraron productos
```

## Historia de usuario HU-28: Ver ficha de producto
**Como** Visitante  
**Quiero** ver la ficha de un producto con imágenes, descripción y precio en pesos chilenos  
**Para** conocer el detalle del producto antes de comprarlo

## Criterios de aceptación
- [ ] **Escenario 1: Ficha completa**
```gherkin
Dado que selecciono un producto del catálogo
Cuando abro su ficha
Entonces veo galería de imágenes, nombre, precio, stock disponible y el botón "Agregar al carrito"
```
- [ ] **Escenario 2: Producto en oferta**
```gherkin
Dado que un producto está en oferta
Cuando abro su ficha
Entonces se muestra el precio rebajado con el precio original tachado
```

## Historia de usuario HU-29: Ver ofertas y promociones
**Como** Visitante  
**Quiero** ver una sección de ofertas y promociones destacadas  
**Para** aprovechar los descuentos vigentes

## Criterios de aceptación
- [ ] **Escenario 1: Ofertas vigentes**
```gherkin
Dado que existen ofertas vigentes
Cuando ingreso a la página de inicio
Entonces se muestra un banner o sección con las ofertas y su precio rebajado
```
- [ ] **Escenario 2: Sin ofertas vigentes**
```gherkin
Dado que no hay ofertas vigentes
Cuando ingreso a la página de inicio
Entonces la sección de ofertas no se muestra o indica que no hay promociones
```

## Historia de usuario HU-30: Registrar y actualizar stock
**Como** Administrador  
**Quiero** registrar y actualizar el stock disponible de cada producto  
**Para** mantener el catálogo con información de inventario real

## Criterios de aceptación
- [ ] **Escenario 1: Actualizar stock**
```gherkin
Dado que soy administrador
Cuando edito la cantidad de stock de un producto
Entonces el sistema guarda el cambio y el catálogo lo refleja
```
- [ ] **Escenario 2: Stock en cero**
```gherkin
Dado que el stock de un producto llega a cero
Cuando un cliente lo ve en el catálogo
Entonces el producto se muestra como "sin stock"
```

## Historia de usuario HU-31: Gestión de categorías
**Como** Administrador  
**Quiero** crear, modificar y eliminar categorías  
**Para** mantener organizado el catálogo de productos

## Criterios de aceptación
- [ ] **Escenario 1: Crear o editar categoría**
```gherkin
Dado que soy administrador
Cuando creo o edito una categoría
Entonces el cambio se guarda y se refleja en los filtros del catálogo
```
- [ ] **Escenario 2: Eliminar categoría con productos**
```gherkin
Dado que una categoría tiene productos asociados
Cuando intento eliminarla
Entonces el sistema no lo permite hasta reasignar esos productos
```

## Historia de usuario HU-33: Consultar stock desde mostrador
**Como** Vendedor  
**Quiero** consultar el stock disponible de un producto desde el mostrador  
**Para** informar a un cliente presencial si hay unidades disponibles

## Criterios de aceptación
- [ ] **Escenario 1: Consulta en tiempo real**
```gherkin
Dado que soy vendedor en el mostrador
Cuando busco un producto por nombre o código
Entonces veo su stock disponible en tiempo real, sin permisos de administrador
```
- [ ] **Escenario 2: Producto sin stock**
```gherkin
Dado que un producto no tiene unidades
Cuando lo consulto
Entonces el sistema indica que no hay stock disponible
```

## Historia de usuario HU-34: Agregar producto al inventario
**Como** Administrador  
**Quiero** agregar productos al inventario  
**Para** mantener actualizado el inventario

## Criterios de aceptación
- [ ] **Escenario 1: Alta exitosa**
```gherkin
Dado que soy administrador
Cuando registro un producto con nombre, categoría, precio, stock e imágenes
Entonces el sistema valida los campos y el producto queda disponible en inventario y catálogo
```
- [ ] **Escenario 2: Campos obligatorios faltantes**
```gherkin
Dado que dejo campos obligatorios vacíos
Cuando intento guardar el producto
Entonces el sistema no lo registra e indica los campos faltantes
```

## Historia de usuario HU-35: Eliminar producto del inventario
**Como** Administrador  
**Quiero** eliminar productos del inventario  
**Para** mantener actualizado el inventario

## Criterios de aceptación
- [ ] **Escenario 1: Eliminación con confirmación**
```gherkin
Dado que soy administrador
Cuando elimino un producto y confirmo la acción
Entonces el producto deja de mostrarse en el catálogo
```
- [ ] **Escenario 2: Producto con pedidos en curso**
```gherkin
Dado que un producto tiene pedidos en curso
Cuando intento eliminarlo
Entonces el sistema lo da de baja en lugar de eliminarlo
```

## Historia de usuario HU-36: Gestionar stock
**Como** Administrador  
**Quiero** gestionar el stock disponible  
**Para** mantener control sobre las existencias

## Criterios de aceptación
- [ ] **Escenario 1: Ajuste de stock**
```gherkin
Dado que soy administrador
Cuando ajusto la cantidad de stock de un producto
Entonces el cambio queda registrado
```
- [ ] **Escenario 2: Stock en cero**
```gherkin
Dado que el stock de un producto llega a cero
Cuando reviso el catálogo
Entonces el producto se marca como "sin stock"
```

## Historia de usuario HU-37: Alerta de stock bajo
**Como** Administrador  
**Quiero** generar una alerta cuando el stock de un producto esté bajo un mínimo definido  
**Para** reponer a tiempo y no perder ventas por quiebre de stock

## Criterios de aceptación
- [ ] **Escenario 1: Stock bajo el umbral**
```gherkin
Dado que el stock de un producto cae bajo el mínimo configurado
Cuando se registra ese descuento de stock
Entonces el sistema genera una alerta (correo o panel) indicando el proveedor asociado
```
- [ ] **Escenario 2: Stock sobre el umbral**
```gherkin
Dado que el stock está sobre el mínimo configurado
Cuando se actualiza el stock
Entonces el sistema no genera alerta
```

## Historia de usuario HU-39: Seleccionar tipo de servicio
**Como** Cliente  
**Quiero** seleccionar el tipo de servicio (mantenimiento básico, mediano o full)  
**Para** solicitar la mantención que necesito

## Criterios de aceptación
- [ ] **Escenario 1: Selección de servicio**
```gherkin
Dado que quiero solicitar una mantención
Cuando selecciono el tipo (básico, mediano o full)
Entonces el sistema muestra qué incluye la opción elegida antes de continuar
```
- [ ] **Escenario 2: Continuar sin seleccionar**
```gherkin
Dado que no he seleccionado un tipo de servicio
Cuando intento continuar
Entonces el sistema me pide seleccionar uno
```

## Historia de usuario HU-40: Describir el problema
**Como** Cliente  
**Quiero** describir la falla y adjuntar fotos si lo deseo  
**Para** dar a conocer el problema de mi bicicleta

## Criterios de aceptación
- [ ] **Escenario 1: Descripción con fotos**
```gherkin
Dado que estoy describiendo la falla
Cuando escribo la descripción y adjunto fotos válidas
Entonces el sistema asocia la descripción e imágenes a la solicitud
```
- [ ] **Escenario 2: Imagen con formato o tamaño inválido**
```gherkin
Dado que adjunto una imagen con formato o tamaño no permitido
Cuando intento adjuntarla
Entonces el sistema la rechaza e indica los requisitos
```

## Historia de usuario HU-41: Registrar ingreso de bicicleta
**Como** Mecánico  
**Quiero** registrar el ingreso de una bicicleta indicando su mantención y fecha estimada de entrega  
**Para** dejar registro de la orden y su plazo de entrega

## Criterios de aceptación
- [ ] **Escenario 1: Ingreso registrado**
```gherkin
Dado que soy mecánico recepcionando una bicicleta
Cuando registro sus datos, el servicio solicitado y la fecha estimada de entrega
Entonces el sistema crea la orden de trabajo con esos datos
```
- [ ] **Escenario 2: Datos incompletos**
```gherkin
Dado que faltan datos obligatorios de la orden
Cuando intento registrar el ingreso
Entonces el sistema no la crea e indica los datos faltantes
```

## Historia de usuario HU-42: Crear orden de trabajo
**Como** Mecánico  
**Quiero** recepcionar la bicicleta y generar una orden de trabajo  
**Para** formalizar el servicio a realizar

## Criterios de aceptación
- [ ] **Escenario 1: Orden generada**
```gherkin
Dado que recepcioné la bicicleta
Cuando genero la orden de trabajo
Entonces el sistema le asigna un identificador único y la deja en estado inicial
```
- [ ] **Escenario 2: Datos asociados a la orden**
```gherkin
Dado que la orden incluye datos del cliente, la bicicleta y el servicio
Cuando la creo
Entonces esos datos quedan asociados a la orden
```

## Historia de usuario HU-43: Actualizar estado de la reparación
**Como** Mecánico  
**Quiero** actualizar el estado de la reparación (recibida, en reparación, lista, entregada)  
**Para** llevar el seguimiento del servicio

## Criterios de aceptación
- [ ] **Escenario 1: Cambio de estado**
```gherkin
Dado que soy mecánico con una orden en curso
Cuando cambio su estado (recibida, en reparación, lista, entregada)
Entonces el sistema registra el cambio con fecha
```
- [ ] **Escenario 2: Seguimiento del cliente**
```gherkin
Dado que el estado de una orden cambió
Cuando el cliente consulta el seguimiento
Entonces ve el estado actualizado
```

## Historia de usuario HU-44: Registrar repuestos utilizados
**Como** Mecánico  
**Quiero** registrar los repuestos usados en la orden de trabajo y descontarlos del inventario  
**Para** mantener el inventario y el costo del servicio actualizados

## Criterios de aceptación
- [ ] **Escenario 1: Registro con stock suficiente**
```gherkin
Dado que hay stock suficiente de un repuesto
Cuando lo registro en la orden con su cantidad
Entonces el sistema descuenta esas unidades del inventario
```
- [ ] **Escenario 2: Stock insuficiente**
```gherkin
Dado que intento registrar más unidades de las disponibles
Cuando guardo
Entonces el sistema no lo permite e indica el stock disponible
```

## Historia de usuario HU-45: Notificar bicicleta lista
**Como** Mecánico  
**Quiero** notificar al cliente cuando su bicicleta esté lista para retiro  
**Para** avisar al cliente que puede retirar su bicicleta

## Criterios de aceptación
- [ ] **Escenario 1: Notificación al estar lista**
```gherkin
Dado que una orden pasa a estado "lista"
Cuando se guarda ese cambio de estado
Entonces el sistema envía una notificación al cliente indicando que puede retirar su bicicleta
```
- [ ] **Escenario 2: Sin notificación en estados intermedios**
```gherkin
Dado que la orden aún no está en estado "lista"
Cuando se actualiza a un estado intermedio
Entonces el sistema no envía la notificación de retiro
```

## Historia de usuario HU-46: Calificar el servicio de taller
**Como** Cliente  
**Quiero** calificar el servicio recibido en el taller  
**Para** entregar mi opinión sobre la atención

## Criterios de aceptación
- [ ] **Escenario 1: Calificación tras entrega**
```gherkin
Dado que mi servicio de taller fue entregado
Cuando lo califico con una puntuación y un comentario opcional
Entonces el sistema guarda la calificación
```
- [ ] **Escenario 2: Servicio no entregado o ya calificado**
```gherkin
Dado que el servicio no fue entregado o ya lo califiqué
Cuando intento calificarlo
Entonces el sistema no lo permite
```

## Historia de usuario HU-52: Dejar reseña y calificación
**Como** Cliente  
**Quiero** evaluar los productos comprados mediante reseñas y calificaciones  
**Para** compartir mi experiencia con otros compradores

## Criterios de aceptación
- [ ] **Escenario 1: Reseña de producto comprado**
```gherkin
Dado que compré un producto
Cuando dejo una calificación y una reseña
Entonces la reseña queda visible en la ficha del producto
```
- [ ] **Escenario 2: Producto no comprado o ya reseñado**
```gherkin
Dado que no compré el producto o ya lo reseñé
Cuando intento dejar una reseña
Entonces el sistema no lo permite
```

## Historia de usuario HU-53: Solicitar devolución o garantía
**Como** Cliente  
**Quiero** registrar una devolución seleccionando el pedido, el motivo y la evidencia  
**Para** gestionar la devolución o garantía de un producto

## Criterios de aceptación
- [ ] **Escenario 1: Solicitud dentro de plazo**
```gherkin
Dado que tengo un pedido dentro del plazo de devolución
Cuando selecciono el pedido, indico el motivo y adjunto evidencia
Entonces el sistema crea la solicitud en estado pendiente
```
- [ ] **Escenario 2: Solicitud fuera de plazo**
```gherkin
Dado que el pedido está fuera del plazo de devolución
Cuando intento solicitarla
Entonces el sistema no lo permite e informa el motivo
```

## Historia de usuario HU-54: Resolver devolución
**Como** Soporte  
**Quiero** resolver la devolución como cambio de producto, reembolso o rechazo  
**Para** dar una respuesta a la solicitud del cliente

## Criterios de aceptación
- [ ] **Escenario 1: Resolución de la solicitud**
```gherkin
Dado que soy soporte revisando una solicitud pendiente
Cuando la resuelvo como cambio, reembolso o rechazo, con un comentario
Entonces el sistema actualiza el estado de la solicitud
```
- [ ] **Escenario 2: Notificación al cliente**
```gherkin
Dado que resolví una solicitud de devolución
Cuando guardo la resolución
Entonces el cliente recibe una notificación con el resultado
```

## Historia de usuario HU-55: Revisar políticas del sitio
**Como** Visitante  
**Quiero** revisar las políticas de privacidad, envío y reembolso desde cualquier página  
**Para** conocer mis derechos y condiciones antes de comprar

## Criterios de aceptación
- [ ] **Escenario 1: Enlaces visibles en el pie de página**
```gherkin
Dado que estoy en cualquier página del sitio
Cuando reviso el pie de página
Entonces los enlaces a privacidad, términos, reembolso y envío están visibles
```
- [ ] **Escenario 2: Abrir un documento de política**
```gherkin
Dado que veo los enlaces del pie de página
Cuando abro uno de ellos
Entonces el sistema abre el documento correspondiente
```

## Historia de usuario HU-56: Contactar por WhatsApp
**Como** Visitante/Cliente  
**Quiero** contactar a la tienda por WhatsApp desde el sitio  
**Para** resolver dudas rápidamente antes o después de comprar

## Criterios de aceptación
- [ ] **Escenario 1: Abrir conversación**
```gherkin
Dado que estoy en el sitio
Cuando presiono el botón "Escríbenos por WhatsApp"
Entonces se abre una conversación directa con el número de contacto de la tienda
```
- [ ] **Escenario 2: Acceso desde móvil**
```gherkin
Dado que ingreso al sitio desde un dispositivo móvil
Cuando presiono el botón de WhatsApp
Entonces se abre la aplicación de WhatsApp con la conversación iniciada
```

## Historia de usuario HU-57: Consultar estado de reparación
**Como** Cliente  
**Quiero** consultar el estado de la reparación de mi bicicleta con mi número de teléfono  
**Para** saber cuándo puedo retirarla, sin necesidad de tener una cuenta

## Criterios de aceptación
- [ ] **Escenario 1: Consulta con teléfono válido**
```gherkin
Dado que no tengo cuenta pero tengo una orden asociada a mi teléfono
Cuando ingreso mi número de teléfono
Entonces el sistema muestra el estado actual de la reparación (en revisión, en reparación o lista para retiro)
```
- [ ] **Escenario 2: Teléfono sin órdenes asociadas**
```gherkin
Dado que ingreso un teléfono sin órdenes asociadas
Cuando consulto el estado
Entonces el sistema indica que no se encontraron reparaciones
```

## Historia de usuario HU-58: Aviso de pedido listo para retiro
**Como** Cliente  
**Quiero** recibir un aviso cuando mi pedido esté listo para retirar  
**Para** no ir a la tienda innecesariamente

## Criterios de aceptación
- [ ] **Escenario 1: Notificación de retiro**
```gherkin
Dado que un pedido cambia a estado "listo para retiro"
Cuando se guarda ese cambio
Entonces el sistema envía un correo al cliente con la dirección y el horario de retiro
```
- [ ] **Escenario 2: Contenido del aviso**
```gherkin
Dado que recibo el aviso de pedido listo para retiro
Cuando abro el correo
Entonces contiene la dirección y el horario de retiro
```

## Historia de usuario HU-62: Reporte de ventas por período
**Como** Administrador  
**Quiero** ver un reporte de ventas por período (día, semana, mes)  
**Para** evaluar el desempeño comercial de la tienda

## Criterios de aceptación
- [ ] **Escenario 1: Reporte por rango de fechas**
```gherkin
Dado que soy administrador
Cuando genero el reporte de ventas para un rango de fechas
Entonces el panel muestra ventas totales, número de pedidos y ticket promedio
```
- [ ] **Escenario 2: Período sin ventas**
```gherkin
Dado que en el rango elegido no hay ventas
Cuando genero el reporte
Entonces el sistema muestra el reporte con valores en cero
```

## Historia de usuario HU-63: Reporte de productos más vendidos
**Como** Administrador  
**Quiero** ver un reporte de los productos más vendidos por categoría  
**Para** decidir qué productos reponer o promocionar

## Criterios de aceptación
- [ ] **Escenario 1: Ranking de productos**
```gherkin
Dado que soy administrador
Cuando genero el reporte de productos más vendidos
Entonces veo los productos ordenados por cantidad o ingresos
```
- [ ] **Escenario 2: Filtrar por categoría**
```gherkin
Dado que veo el reporte de más vendidos
Cuando filtro por una categoría
Entonces el reporte muestra solo los productos de esa categoría
```

## Historia de usuario HU-64: Exportar reportes
**Como** Administrador  
**Quiero** exportar los reportes de ventas e inventario en un archivo Excel o PDF  
**Para** compartir la información con el equipo o contabilidad

## Criterios de aceptación
- [ ] **Escenario 1: Exportar a Excel o PDF**
```gherkin
Dado que estoy viendo un reporte con filtros aplicados
Cuando lo exporto en formato .xlsx o .pdf
Entonces el sistema descarga el archivo con los mismos datos y filtros de pantalla
```
- [ ] **Escenario 2: Exportación sin datos**
```gherkin
Dado que el reporte en pantalla no tiene datos
Cuando intento exportarlo
Entonces el sistema informa que no hay datos para exportar
```
