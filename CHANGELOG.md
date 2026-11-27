# Registro de cambios

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## Sin publicar

### Agregado
- Gráficos dinámicos en el tablero que reemplazan los textos de análisis: ahora los resultados, tendencias y comparaciones se muestran visualmente y cambian con el año, el mes, la semana y la especie elegidos.
- Tema visual nuevo (colores, tipografía, espaciado, imágenes incrustadas e impresión), organizado en archivos propios de la interfaz.
- Cabeceras de seguridad en todas las respuestas del servicio: política de seguridad de contenido (CSP) con scripts en línea autorizados por hash, protección contra incrustación en otros sitios, HSTS, política de permisos y de referencia, y caché adecuado para la API.
- Pruebas automáticas de las cabeceras y de que la CSP autoriza cada script en línea.
- `SECURITY.md` (modelo de amenazas, rotación de la palabra clave, lista de verificación), este registro de cambios y una guía ampliada en el README (arquitectura, estructura de carpetas, cómo agregar gráficos o indicadores, flujo con git).

### Cambiado
- Las escrituras exigen `Sec-Fetch-Site: same-origin` (antes solo se bloqueaba `cross-site`); la palabra clave se compara en tiempo constante.
- La carga de Excel verifica la firma del archivo (.xlsx) además de la extensión y el tamaño; la restauración rechaza cuerpos demasiado grandes antes de leerlos.
- La página responde 405 a métodos distintos de GET y HEAD.
- Ampliado `.gitignore` para secretos, claves, Excel y copias de datos.

### Corregido
- La prueba automática ya no cierra la base temporal antes de las pruebas del modo palabra clave.
