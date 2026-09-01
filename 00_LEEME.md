# ⚽ El Embajador — las apuestas de Seba

App web para que Sebastián lleve el orden de sus apuestas en **BetPlay** (Colombia),
con la caja real en **pesos y euros**, y las métricas que la plataforma no muestra.

**🔗 Link para el celular: https://langab.github.io/embajador/** — abrirlo, tocar
Compartir → «Agregar a pantalla de inicio» y queda como una app.

---

## Por qué existe

BetPlay muestra qué apuestas ganaste y cuáles perdiste, pero no cuánto depositaste,
cuánto retiraste ni si en total vas ganando o perdiendo. Esta app cierra ese hueco:
registra cada boleto, lleva la caja aparte y calcula el resultado de verdad.

Y como Seba vive en Malta y BetPlay funciona en pesos colombianos, **cada cifra sale
en las dos monedas**. La tasa se baja sola de internet y **cada boleto congela la del
día en que se anotó**, así que un boleto de marzo sigue valiendo los euros de marzo
aunque hoy el cambio esté en otra parte.

## Las cuatro pantallas

| Pantalla | Qué hay |
|---|---|
| **Hoy** | La ganancia real acumulada en pesos y euros, la curva de la caja, y avisos que dicen si lo que ve es habilidad o azar. |
| **Boletos** | El historial completo, con filtros por mes, resultado, liga y formato. Cada boleto se dibuja como un cupón; tocarlo lo edita. |
| **Análisis** | Once bloques de métricas: el veredicto con su margen de error, qué le cuesta cada costumbre, rendimiento por cuota, simples contra combinadas, por liga y mercado, disciplina, rachas, mes a mes y a qué horas juega. |
| **Caja** | El conversor euro–peso, depósitos y retiros, el saldo que debería tener en BetPlay, la retención colombiana y la conexión con la planilla. |

El botón dorado del centro (**Apostar**) abre el formulario para anotar un boleto.

## Anotar un boleto

El formulario se adapta al mercado: si eliges «Total de goles» aparece el campo de la
línea; si eliges «Resultado Final» aparecen los tres botones (local, empate,
visitante) con los nombres reales de los equipos.

Se registra: fecha y hora, liga, los dos equipos, tipo de apuesta, a qué le apostó,
línea, cuota, inversión (en pesos o en euros), formato (sencilla, combinada o
sistema), si fue en vivo, si fue apuesta gratuita, el resultado y notas.

Los nombres de los mercados son **los mismos que muestra BetPlay**: «Resultado Final»,
«Doble Oportunidad», «Total de Tiros de Esquina», «Resultado Correcto», «Cobro
anticipado». Anotar es copiar lo que dice la pantalla, sin traducir nada.

**Resultados posibles:** Pendiente · Ganada · Perdida · Nula · Cobro anticipado ·
Ganada parcial · Perdida parcial. Las dos últimas salen con hándicap asiático de
cuarto (−1,75), donde la apuesta se parte en dos mitades y una se reintegra.

Mientras escribe, la app le va diciendo cuánto se lleva si gana, en las dos monedas,
y **qué porcentaje de veces tiene que acertar a esa cuota solo para no perder plata**.

## Cómo lee las métricas

Dos reglas gobiernan toda la pantalla de Análisis:

1. **Ninguna rentabilidad se muestra sin su número de boletos y su margen de error.**
   Con menos de 15 boletos no se muestra: sería inventar. Entre 15 y 30 sale con
   advertencia.
2. **Cada mal hábito se traduce a pesos.** «Las combinadas te costaron $402.160»
   mueve más que cualquier gráfico.

La app también simula su mismo historial **suponiendo que no tiene ninguna ventaja**,
para responder la única pregunta que importa: *lo que estoy viendo, ¿es habilidad o es
suerte?* Si su curva cae dentro de la banda del azar, se lo dice sin adornos.

Y contextualiza las malas rachas: *«con tu tasa de acierto y 126 boletos, lo esperable
por puro azar era una racha de 12 derrotas seguidas; la tuya fue de 9»*. Perder varias
seguidas casi nunca significa que algo esté roto.

## Escudos

Los escudos de los 184 equipos de las nueve ligas (las cinco grandes de Europa más
Brasil, Colombia, Argentina y Turquía) se piden a una CDN pública. Si alguno no carga,
la app **dibuja un escudo con las iniciales sobre los colores del club**, así que nunca
se ve una imagen rota. Los equipos que no estén en el catálogo también funcionan: se
escriben a mano y se les dibuja su escudo.

## Sincronización con Google Sheets

Igual que la app de la casa: los datos viven en el teléfono y se espejan en una hoja de
cálculo. Configuración de una sola vez (instrucciones completas dentro de
`_sistema/google_sheets_sync.gs`):

1. Crear una hoja de Google llamada «Apuestas Seba».
2. **Extensiones → Apps Script**, pegar el contenido de `_sistema/google_sheets_sync.gs`.
3. **Implementar → Nueva implementación → Aplicación web** (ejecutar como: yo; acceso:
   cualquier persona) → autorizar → copiar la URL que termina en `/exec`.
4. Pegar esa URL en **Caja → Planilla de Google**, en los dos teléfonos.

Gana siempre el registro editado más tarde, así que los dos pueden anotar sin pisarse.
Sin planilla la app funciona igual, solo que los datos quedan en ese teléfono; para
mover datos de un lado a otro está **Bajar respaldo** / **Restaurar desde un respaldo**.

> Si quieres que solo ustedes puedan escribir en la planilla, en Apps Script:
> Configuración del proyecto → Propiedades del script → agregar `TOKEN` con el valor que
> quieras, y poner ese mismo valor en Caja → Clave. Sin esa propiedad, no se pide clave.

## Dos cosas que conviene saber

**La retención colombiana.** Los premios de juegos de azar pagan 20% de retención en la
fuente cuando el pago supera 48 UVT ($2.513.952 en 2026). BetPlay lo avisa en la
pantalla de retiro. La app lo calcula sobre los retiros y lo muestra en Caja. Es el
impuesto colombiano; lo que Seba deba declarar en Malta por residir allá es otra cosa.

**Apostar desde fuera de Colombia.** Al investigar la plataforma apareció algo que vale
la pena que sepan: BetPlay exige domicilio registrado en Colombia y cédula colombiana o
de extranjería, los retiros van a medios colombianos (Nequi, Daviplata, PSE,
Bancolombia, puntos físicos con documento), y el cliente trae mensajes de bloqueo por
ubicación. La web se puede navegar desde Europa, pero **apostar y sobre todo retirar
desde Malta no es un caso que la plataforma contemple**. Esta app no toca la cuenta de
BetPlay: es un registro manual, así que sirve igual — pero mejor saberlo antes de que
lo sorprenda un retiro bloqueado.

## Cómo está ordenada la carpeta

| Archivo | Qué es |
|---|---|
| `index.html` | La app |
| `assets/estilo.css` | Colores, tipografía y el diseño del boleto |
| `assets/datos.js` | Ligas y tipos de apuesta de BetPlay |
| `assets/equipos.js` | Los 184 equipos con su escudo y sus colores |
| `assets/escudos.js` | Dibuja los escudos, con respaldo si la imagen falla |
| `assets/calculos.js` | La matemática del boleto, la moneda y la retención |
| `assets/analisis.js` | El motor de métricas |
| `assets/graficos.js` | Los gráficos, en SVG puro |
| `assets/app.js` | Estado, sincronización y pantallas |
| `assets/formularios.js` | El formulario de boleto y el de caja |
| `_sistema/google_sheets_sync.gs` | El script de la planilla |
| `_dev/sembrar.html` | Datos de prueba, solo para desarrollo. **No abrir en el teléfono de Seba: reemplaza lo guardado.** |

## Publicar cambios

La carpeta es el repositorio. Al tocar algo:

```bash
git add -A && git commit -m "qué cambió" && git push
```

GitHub Pages republica solo en un minuto.

## Diseño

Los colores salen del azul chambray de **Millonarios** (`#2F4B8D`) con la bandera de
Colombia como capa de significado: oro para lo que pide atención, rojo para lo que se
perdió. El fondo es siempre azul y las tarjetas son papel — que es, literalmente, el
uniforme del Embajador. Cada boleto se dibuja como un cupón de verdad, con su
perforación, sus muescas y el resultado estampado como sello de goma.

La paleta de los gráficos pasó los seis chequeos de contraste y daltonismo en modo
claro y oscuro. Los números van en cifras tabulares para que las columnas de plata
cuadren.
