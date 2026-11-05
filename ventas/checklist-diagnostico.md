# Checklist del diagnóstico de 30 minutos

**Objetivo:** entender un problema concreto del negocio, medir cuánto le cuesta y salir con lo necesario para enviar una propuesta en menos de 48 horas. No es una reunión de venta: escucha el 80 % del tiempo.

---

## Antes de la reunión (10 minutos)

- [ ] Corre la auditoría de su web: `node auditoria/src/auditar.ts <url>`
- [ ] Revisa sus reseñas en Google Maps: busca "no contestan", "difícil conseguir hora", "nunca responden".
- [ ] Escríbele a su WhatsApp o prueba su formulario: ¿cuánto tarda en responder?
- [ ] Revisa su Instagram o Facebook: ¿cuántos comentarios quedan sin respuesta?
- [ ] Anota en el CRM: rubro, tamaño aproximado, quién agendó y qué dijo al agendar.
- [ ] Ten listo el demo del rubro para mostrarlo si el problema calza.

## Guion

### 1. Apertura (2 min)

> "Gracias por el tiempo. La idea es entender cómo funciona hoy [el negocio] y ver si hay algo que valga la pena automatizar. Si no hay nada, te lo digo igual. ¿Te parece?"

### 2. El negocio (5 min)

- [ ] ¿A qué se dedican y quiénes son sus clientes?
- [ ] ¿Cuántas personas trabajan? ¿Quién hace qué?
- [ ] ¿Qué herramientas usan hoy? (WhatsApp, planillas, software del rubro, correo, agenda)

### 3. El dolor (10 min) — lo más importante

- [ ] ¿Qué tarea repetitiva les quita más tiempo a la semana?
- [ ] ¿Qué se les escapa? (mensajes sin responder, horas no confirmadas, cotizaciones que no se envían, cobros atrasados)
- [ ] ¿Cuántas veces al día o a la semana pasa? → **cuantifica**
- [ ] ¿Quién lo hace y cuánto tiempo le toma? → **horas al mes**
- [ ] ¿Qué pasa cuando sale mal? ¿Han perdido clientes o plata por eso? → **costo**
- [ ] ¿Ya intentaron resolverlo? ¿Qué pasó?

### 4. Lo que quieren lograr (5 min)

- [ ] Si esto estuviera resuelto en 3 meses, ¿cómo se vería?
- [ ] ¿Qué sería un buen resultado para ti? (en sus palabras: anótalas tal cual)

### 5. Datos y accesos (3 min)

- [ ] ¿El WhatsApp es un número personal, WhatsApp Business o ya usan la API?
- [ ] ¿Qué datos personales manejan? (salud, RUT, datos financieros → ojo con la Ley 21.719)
- [ ] ¿Quién administra las cuentas (dominio, Google, Meta)? ¿Están a nombre de la empresa?

### 6. Decisión y cierre (5 min)

- [ ] ¿Quién más participa en la decisión?
- [ ] ¿Tienen un presupuesto en mente o un rango? (si no responde, da el rango "desde" del paquete)
- [ ] ¿Para cuándo lo necesitan? ¿Hay alguna fecha que empuje? (temporada alta, Ley 21.719 desde el 1 de diciembre de 2026)
- [ ] Si calza, muestra el demo en 3 minutos.

> "Con lo que me contaste te envío una propuesta con alcance, plazos y precio cerrado antes del [día]. ¿A quién se la mando?"

## Qué observar

| Señal | Qué significa |
|---|---|
| Responde rápido y con números | Conoce su problema: buen prospecto |
| "Hay que verlo con mi socio" | Pide reunión con ambos antes de proponer |
| Habla de precio antes que del problema | Muestra el valor del ahorro antes de dar cifras |
| No logra describir una tarea concreta | Aún no está listo: déjalo en seguimiento |
| El dolor cuesta menos que la solución | Dilo con honestidad y no propongas |

## Plantilla de resumen (llénala justo después)

```
Empresa:            [nombre] · [rubro] · [N] personas
Contacto:           [nombre, cargo, teléfono, correo]
Decide:             [quién] · Presupuesto: [rango o "no dijo"] · Plazo: [fecha]

Proceso actual:     [cómo lo hacen hoy]
Dolor principal:    [qué se les escapa]
Cuantificación:     [N veces por semana] × [N minutos] = [N horas al mes]
Costo estimado:     [horas × valor hora, o clientes perdidos × ticket promedio]
Lo que quieren:     "[sus palabras]"

Herramientas:       [WhatsApp tipo, agenda, software]
Datos sensibles:    [sí/no, cuáles]
Cuentas a nombre:   [empresa / persona / no saben]

Solución propuesta: [paquete + módulos]
Precio estimado:    [UF implementación] + [UF mensualidad]
Riesgos o dudas:    [lo que falta confirmar]
Próximo paso:       Propuesta antes del [fecha] · Seguimiento el [fecha]
```

Copia el resumen al CRM y mueve el prospecto a la etapa "Diagnóstico hecho".
