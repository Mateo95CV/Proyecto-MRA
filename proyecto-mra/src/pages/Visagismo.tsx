const Visagismo = () => {
  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10">
      <h1 className="text-4xl font-bold text-primary-purple mb-8">Visagismo Virtual</h1>
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
        <p className="text-xl mb-6">Prueba virtual de gafas</p>
        <p className="text-gray-600">
          Aquí podrás subir tu foto o usar la cámara para probar diferentes modelos de gafas.
        </p>
        {/* Más adelante: integración con webcam o upload + superposición de imágenes */}
      </div>
    </div>
  );
};

export default Visagismo;