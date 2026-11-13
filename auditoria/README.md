# Auditoría web para prospectos

Herramienta de prospección de Inteligencia Aplicada. Revisa la página de inicio de una empresa y genera:

1. **Un informe de una página** (HTML listo para imprimir o guardar como PDF), con puntaje, las 3 oportunidades principales y una invitación a conversar.
2. **Un borrador del primer mensaje** (correo o LinkedIn), personalizado con los 2 hallazgos más importantes. Va dirigido a la clínica, así que trata siempre de "ustedes".
3. Con una lista de sitios: **un resumen en CSV ordenado por oportunidad**. Los de menor puntaje son a los que conviene escribir primero.

Es gratis: no usa servicios pagados.

## Qué revisa

| Revisión | Peso | Servicio que vendemos |
|---|---|---|
| Conexión segura (HTTPS) y redirección desde http | 15 | Web |
| Adaptado a celular | 15 | Web |
| Velocidad (Google PageSpeed en celular, o tiempo de respuesta) | 15 | Web |
| Botón o enlace de WhatsApp | 15 | Asistente de WhatsApp |
| Reserva de horas en línea | 10 | Asistente de WhatsApp |
| Teléfono que se marca con un toque | 5 | Web |
| Formulario de contacto | 5 | Automatización |
| Título y descripción para Google | 5 | Web |
| Datos de negocio local (schema.org) | 5 | Web |
| Vista previa al compartir (Open Graph) | 5 | Web |
| Política de privacidad (Ley 21.719) | 5 | Datos personales |

"Bien" suma el peso completo, "Mejorable" la mitad y "Falta" nada. El total se lleva a una escala de 0 a 100.

## Uso

```bash
cd auditoria
```

```bash
node src/auditar.ts https://www.clinica-ejemplo.cl
```

Con la velocidad real en celular medida por Google:

```bash
node src/auditar.ts https://www.clinica-ejemplo.cl --psi
```

Con varios sitios, uno por línea (las líneas que empiezan con `#` se ignoran):

```bash
node src/auditar.ts --lista prospectos.txt --psi
```

Para guardar además cada informe como PDF, agrega `--pdf`:

```bash
node src/auditar.ts https://www.clinica-ejemplo.cl --pdf
```

Los archivos quedan en `reportes/`, que no se sube a GitHub:
- `AAAA-MM-DD-dominio.html`: el informe. Cabe en una hoja A4.
- `AAAA-MM-DD-dominio.pdf`: solo con `--pdf`. Usa el Chrome o Edge que ya tienes instalado. Sin `--pdf`, abre el informe en el navegador y usa **Imprimir → Guardar como PDF**.
- `AAAA-MM-DD-dominio-mensaje.txt`: el borrador del mensaje.
- `resumen-AAAA-MM-DD.csv`: solo con `--lista`, y se abre en Excel.

Variables opcionales:
- `AUDIT_FIRMA`: el nombre que firma el mensaje (por defecto, Marlon).
- `AUDIT_NAVEGADOR`: ruta de Chrome o Edge para `--pdf`, si la herramienta no lo encuentra sola.
- `PSI_API_KEY`: clave gratuita de Google PageSpeed Insights. Sin clave, Google a veces rechaza los pedidos por falta de cupo; en ese caso el informe usa el tiempo de respuesta y la herramienta te avisa. Se crea en Google Cloud Console → APIs → "PageSpeed Insights API" → Credenciales.

Para correr las pruebas:

```bash
npm test
```

## Cómo usarla en la prospección

1. Arma una lista de 20 a 30 sitios de clínicas con señales de necesidad. Ver `docs/plan-implementacion.md`, sección 2.2.
2. Corre la lista y abre el CSV: parte por los de menor puntaje.
3. **Revisa cada informe antes de enviarlo.** Es una revisión automática y puede equivocarse. Por ejemplo, algunos sitios muestran el WhatsApp de una forma que la herramienta no detecta.
4. Personaliza el mensaje: el nombre de la persona y un detalle que hayas visto tú.
5. Envía de 10 a 15 por día, uno por uno, por correo o LinkedIn. **Nunca envíes en masa ni por WhatsApp a quien no te escribió.**
6. Registra cada envío en el CRM.

## Límites y buenas prácticas

- Solo revisa la **página de inicio**, con un pedido más para comprobar la redirección a https. En sitios armados con JavaScript también lee hasta 3 scripts del mismo dominio. No recorre el sitio ni guarda datos personales.
- Se identifica con un User-Agent que apunta a nuestra web y espera 1,5 segundos entre un sitio y otro.
- No acepta direcciones locales ni de redes privadas.
- Las detecciones son heurísticas: sirven para abrir una conversación, no reemplazan una revisión humana.
