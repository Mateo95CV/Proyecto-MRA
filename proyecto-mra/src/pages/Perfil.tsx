const Perfil = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10">
      <h1 className="text-4xl font-bold text-primary-purple mb-8">Mi Perfil</h1>
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <p className="text-xl">Aquí irán tus datos personales, historial de compras, direcciones, etc.</p>
        {/* Más adelante agregamos formulario de edición, pedidos, etc. */}
      </div>
    </div>
  );
};

export default Perfil;