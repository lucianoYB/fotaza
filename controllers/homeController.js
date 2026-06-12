const Imagen = require('../models/imagenModel');

exports.home = async (req, res) => {
  const imagenes = await Imagen.getHomeImages(20);
  const destacadas = imagenes.filter(img => img.valoracion_promedio >= 4 && img.total_valoraciones >= 10);
  const otras = imagenes.filter(img => !(img.valoracion_promedio >= 4 && img.total_valoraciones >= 10));
  console.log('[home] total:', imagenes.length, 'destacadas:', destacadas.length, 'otras:', otras.length);
  if (imagenes.length && process.env.NODE_ENV !== 'production') {
    console.log('[home] sample:', imagenes.slice(0,5).map(i => ({id:i.id, ruta:i.ruta_archivo, valoracion:i.valoracion_promedio, total:i.total_valoraciones}))); 
  }
  res.render('index', { destacadas, otras });
};