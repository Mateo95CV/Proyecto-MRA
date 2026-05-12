const WhatsAppButton = () => {
  const phone = '573146030432';
  const message = encodeURIComponent('Hola, me gustaría obtener más información sobre Óptica MRA 👓');
  const url = `https://wa.me/${phone}?text=${message}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-[100] flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#1ebe5d] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
    >
      {/* Ícono SVG oficial de WhatsApp */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width="30"
        height="30"
        fill="white"
      >
        <path d="M16 0C7.164 0 0 7.163 0 16c0 2.822.737 5.469 2.028 7.773L0 32l8.468-2.002A15.934 15.934 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 0 1-6.754-1.843l-.484-.287-5.026 1.187 1.23-4.896-.316-.502A13.245 13.245 0 0 1 2.667 16C2.667 8.637 8.637 2.667 16 2.667S29.333 8.637 29.333 16 23.363 29.333 16 29.333zm7.27-9.878c-.397-.199-2.349-1.158-2.714-1.29-.364-.132-.63-.198-.895.199-.265.397-1.026 1.29-1.258 1.555-.231.265-.463.298-.86.1-.397-.199-1.676-.618-3.192-1.97-1.18-1.052-1.977-2.35-2.208-2.748-.231-.397-.025-.612.174-.81.178-.177.397-.463.596-.695.199-.231.265-.397.397-.662.133-.265.067-.497-.033-.695-.1-.199-.895-2.157-1.226-2.953-.322-.775-.65-.67-.895-.683l-.762-.013c-.265 0-.695.1-1.059.497-.364.397-1.39 1.358-1.39 3.316s1.423 3.847 1.621 4.112c.199.265 2.8 4.274 6.784 5.993.948.41 1.688.654 2.265.837.952.302 1.818.26 2.502.158.763-.114 2.349-.96 2.68-1.888.332-.928.332-1.724.232-1.888-.099-.165-.364-.265-.762-.463z" />
      </svg>

      {/* Tooltip */}
      <span className="absolute right-16 bg-gray-800 text-white text-xs font-medium px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        ¡Escríbenos!
      </span>
    </a>
  );
};

export default WhatsAppButton;