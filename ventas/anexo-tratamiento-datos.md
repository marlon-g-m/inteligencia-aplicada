# Anexo 2 · Tratamiento de datos personales

> **Borrador para revisión de un abogado** (idealmente uno que asesore en la Ley N° 21.719). Se firma junto al contrato de servicios cuando el Prestador trate datos personales por cuenta del Cliente: por ejemplo, conversaciones de WhatsApp, fichas o agenda de pacientes, bases de clientes.

---

Este anexo forma parte del contrato de prestación de servicios entre **[RAZÓN SOCIAL DEL CLIENTE]** ("el Responsable") e **Inteligencia Aplicada SpA** ("el Encargado"), de fecha [fecha], y regula el tratamiento de datos personales que el Encargado realiza por cuenta del Responsable, conforme a la Ley N° 19.628 sobre protección de la vida privada, modificada por la Ley N° 21.719.

## 1. Descripción del tratamiento

| | |
|---|---|
| **Finalidad** | [Ej.: responder consultas, agendar y confirmar horas por WhatsApp; derivar conversaciones a la recepción.] |
| **Titulares** | [Ej.: pacientes y personas que escriben al WhatsApp del Responsable.] |
| **Tipos de datos** | [Ej.: nombre, teléfono, RUT, horas agendadas, contenido de los mensajes.] |
| **Datos sensibles** | [Ej.: datos de salud que el paciente mencione (motivo de consulta). Si no aplica, escribir "No se tratan".] |
| **Operaciones** | Recolección por los canales del Responsable, registro, almacenamiento, consulta, envío de recordatorios y eliminación. |
| **Duración** | Mientras esté vigente el contrato, más el plazo de devolución o eliminación del punto 9. |
| **Dónde se almacenan** | En cuentas a nombre del Responsable: [proveedor de nube y región, ej.: Google Cloud, región São Paulo]. |

## 2. Instrucciones del Responsable

El Encargado tratará los datos solo según las instrucciones documentadas del Responsable (este anexo, el contrato y las que se den por escrito después) y solo para la finalidad descrita. Si el Encargado considera que una instrucción infringe la ley, avisará al Responsable antes de cumplirla.

El Encargado no usará los datos para fines propios, no los venderá ni cederá, y **no los usará para entrenar modelos de inteligencia artificial**.

## 3. Confidencialidad

El Encargado mantendrá los datos en reserva, incluso después de terminado el contrato, y se asegurará de que toda persona que acceda a ellos esté obligada a la misma reserva.

## 4. Medidas de seguridad

El Encargado aplicará, como mínimo, las siguientes medidas:

- Cuentas y datos alojados a nombre del Responsable; el Encargado accede con permisos delegados y revocables.
- Verificación en dos pasos en todas las cuentas con acceso a datos.
- Acceso solo para las personas que lo necesitan para el servicio, con usuarios individuales.
- Cifrado de las comunicaciones (HTTPS) y de los datos almacenados cuando el proveedor lo permita.
- Contraseñas y llaves de API guardadas en un gestor seguro, nunca en el código ni en mensajes.
- Respaldos periódicos [diarios / semanales] con prueba de restauración.
- Registro de accesos y cambios en los sistemas que lo permitan.
- Datos mínimos: solo se recolecta lo necesario para la finalidad.
- Datos de prueba ficticios durante el desarrollo; nunca datos reales en equipos personales.

## 5. Subencargados

El Responsable autoriza el uso de los siguientes proveedores, que pueden tratar datos fuera de Chile:

| Proveedor | Para qué | Ubicación |
|---|---|---|
| Meta Platforms (WhatsApp Business Platform) | Canal de mensajería | [Estados Unidos / otros] |
| [Anthropic (API de Claude)] | Generar las respuestas del asistente | [Estados Unidos] |
| [Google Cloud / AWS / otro] | Servidor y base de datos | [Región] |
| [Google Calendar] | Agenda | [Estados Unidos / otros] |

El Encargado avisará al Responsable con 15 días de anticipación antes de agregar o cambiar un subencargado; el Responsable puede oponerse con causa justificada. El Encargado elegirá proveedores que ofrezcan garantías de seguridad adecuadas y que, según sus condiciones, no usen los datos para entrenar sus modelos.

## 6. Derechos de los titulares

Si un titular ejerce ante el Encargado sus derechos de acceso, rectificación, supresión, oposición, portabilidad o bloqueo, el Encargado lo remitirá al Responsable dentro de 2 días hábiles. El Encargado ayudará al Responsable a responder dentro de los plazos legales, por ejemplo extrayendo o eliminando los datos pedidos.

## 7. Incidentes de seguridad

Si el Encargado conoce un incidente que afecte los datos (acceso no autorizado, pérdida, filtración), avisará al Responsable **sin demora y dentro de 24 horas**, indicando qué ocurrió, qué datos y titulares se ven afectados, las medidas tomadas y un contacto. Colaborará con el Responsable en las notificaciones que exija la ley a la Agencia de Protección de Datos Personales y a los titulares.

## 8. Auditoría

El Encargado pondrá a disposición del Responsable la información necesaria para demostrar el cumplimiento de este anexo y permitirá revisiones, con aviso de al menos 10 días hábiles, en horario hábil y sin acceso a información de otros clientes.

## 9. Término

Al terminar el contrato, el Responsable conserva sus cuentas y datos. Dentro de 15 días hábiles, el Encargado:

1. retirará todos sus accesos a las cuentas del Responsable;
2. entregará al Responsable cualquier dato que tenga fuera de sus cuentas, en un formato ordenado, y luego lo eliminará, incluidas las copias y respaldos; y
3. confirmará la eliminación por escrito.

El Encargado solo conservará lo que la ley le obligue a guardar, manteniendo la reserva.

## 10. Responsabilidad

Cada parte responde por los incumplimientos de la ley y de este anexo que le sean imputables. Si el Encargado trata los datos para fines propios o contra las instrucciones del Responsable, responderá como responsable de ese tratamiento.

---

| Por el Responsable | Por el Encargado |
|---|---|
| [Nombre, cargo] | [Nombre], representante legal, Inteligencia Aplicada SpA |
| Firma: ____________ | Firma: ____________ |
