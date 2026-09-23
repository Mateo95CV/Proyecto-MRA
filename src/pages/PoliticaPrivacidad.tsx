import { Shield, Lock, Eye, Trash2, Edit, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Section = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-primary-purple/10 rounded-xl flex items-center justify-center">
        <Icon size={20} className="text-primary-purple" />
      </div>
      <h2 className="text-lg font-bold text-primary-purple">{title}</h2>
    </div>
    <div className="text-gray-700 text-sm leading-relaxed space-y-2">{children}</div>
  </div>
);

const PoliticaPrivacidad = () => {
  return (
    <div className="min-h-screen bg-neutral-light py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">

        {/* Encabezado */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-purple rounded-2xl mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-purple mb-2">
            Política de Privacidad y Habeas Data
          </h1>
          <p className="text-gray-500 text-sm">
            Óptica MRA · Última actualización: mayo de 2026
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Ley 1581 de 2012 – Protección de Datos Personales (Colombia)
          </p>
        </div>

        {/* 1. Responsable */}
        <Section icon={Shield} title="1. Responsable del tratamiento de datos">
          <p>
            <strong>Óptica MRA</strong>, con domicilio en Calle 59 #47-42, Barrio Los Lagos,
            Rionegro, Antioquia, Colombia, es la empresa responsable del tratamiento de sus datos
            personales de conformidad con la Ley 1581 de 2012 y sus decretos reglamentarios.
          </p>
          <p>
            Para cualquier consulta o ejercicio de derechos puede contactarnos en:{' '}
            <a
              href="mailto:especialistaoptmra04@gmail.com"
              className="text-primary-purple font-medium hover:underline"
            >
              especialistaoptmra04@gmail.com
            </a>{' '}
            o al{' '}
            <a
              href="https://wa.me/+573146030432"
              className="text-primary-purple font-medium hover:underline"
            >
              +57 314 603 0432
            </a>
            .
          </p>
        </Section>

        {/* 2. Datos que recopilamos */}
        <Section icon={Eye} title="2. Datos personales que recopilamos">
          <p>Recopilamos únicamente los datos necesarios para prestar nuestros servicios:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>
              <strong>Registro y autenticación:</strong> nombre completo, correo electrónico y
              contraseña (almacenada cifrada mediante Supabase Auth).
            </li>
            <li>
              <strong>Perfil de usuario:</strong> nombre, correo y rol asignado dentro de la
              plataforma.
            </li>
            <li>
              <strong>Pedidos y checkout:</strong> dirección de envío y número de teléfono de
              contacto para la entrega.
            </li>
            <li>
              <strong>Citas:</strong> nombre, contacto y fecha/hora de la cita agendada.
            </li>
            <li>
              <strong>Visagismo virtual:</strong> la herramienta de análisis facial opera
              completamente en su dispositivo. <strong>No capturamos, almacenamos ni
              transmitimos ninguna foto ni imagen de su rostro.</strong> Cuando en el futuro
              se habilite la cámara, el procesamiento seguirá siendo local y sin retención
              de imágenes.
            </li>
          </ul>
        </Section>

        {/* 3. Finalidad */}
        <Section icon={Lock} title="3. Finalidades del tratamiento">
          <p>Sus datos son utilizados exclusivamente para:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Crear y gestionar su cuenta de usuario.</li>
            <li>Procesar pedidos, pagos y coordinar envíos.</li>
            <li>Agendar y confirmar citas ópticas.</li>
            <li>Enviar notificaciones transaccionales relacionadas con sus compras o citas.</li>
            <li>Mejorar la experiencia del servicio y la plataforma web.</li>
            <li>Cumplir obligaciones legales y contables vigentes en Colombia.</li>
          </ul>
          <p className="mt-2">
            <strong>No vendemos, alquilamos ni compartimos sus datos</strong> con terceros con
            fines comerciales o publicitarios.
          </p>
        </Section>

        {/* 4. Base legal */}
        <Section icon={Shield} title="4. Base legal del tratamiento">
          <p>
            El tratamiento de sus datos personales se fundamenta en su{' '}
            <strong>consentimiento libre, previo, expreso e informado</strong>, otorgado al
            momento de registrarse en la plataforma, conforme al artículo 9 de la Ley 1581 de
            2012. Usted puede revocar dicho consentimiento en cualquier momento sin efectos
            retroactivos.
          </p>
        </Section>

        {/* 5. Derechos ARCO */}
        <Section icon={Edit} title="5. Sus derechos como titular (Habeas Data)">
          <p>
            De acuerdo con la Ley 1581 de 2012, usted tiene los siguientes derechos sobre sus
            datos personales:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>
              <strong>Acceso:</strong> conocer qué datos personales tenemos sobre usted.
            </li>
            <li>
              <strong>Rectificación:</strong> solicitar la corrección de datos inexactos o
              incompletos.
            </li>
            <li>
              <strong>Cancelación / Supresión:</strong> pedir la eliminación de sus datos cuando
              no sean necesarios para los fines recogidos o cuando retire su consentimiento.
            </li>
            <li>
              <strong>Oposición:</strong> oponerse al tratamiento de sus datos en situaciones
              justificadas.
            </li>
            <li>
              <strong>Revocación del consentimiento:</strong> retirar en cualquier momento la
              autorización otorgada.
            </li>
            <li>
              <strong>Queja ante la SIC:</strong> presentar una reclamación ante la
              Superintendencia de Industria y Comercio si considera que sus derechos han sido
              vulnerados (
              <a
                href="https://www.sic.gov.co"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-purple hover:underline"
              >
                www.sic.gov.co
              </a>
              ).
            </li>
          </ul>
          <p className="mt-3 bg-primary-purple/5 border border-primary-purple/20 rounded-xl p-3">
            Para ejercer cualquiera de estos derechos, envíe su solicitud a{' '}
            <a
              href="mailto:especialistaoptmra04@gmail.com"
              className="text-primary-purple font-medium hover:underline"
            >
              especialistaoptmra04@gmail.com
            </a>{' '}
            indicando: nombre completo, copia de documento de identidad, descripción clara de su
            solicitud y datos de contacto. Atenderemos su solicitud en un plazo máximo de{' '}
            <strong>15 días hábiles</strong>.
          </p>
        </Section>

        {/* 6. Seguridad */}
        <Section icon={Lock} title="6. Seguridad de la información">
          <p>
            Implementamos medidas técnicas y organizativas apropiadas para proteger sus datos
            personales frente a accesos no autorizados, pérdida, alteración o divulgación. Entre
            ellas:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Autenticación gestionada mediante <strong>Supabase Auth</strong> con contraseñas cifradas.</li>
            <li>Comunicaciones bajo protocolo <strong>HTTPS</strong>.</li>
            <li>Acceso a datos restringido por roles (usuario / administrador).</li>
            <li>Sin almacenamiento de datos de tarjetas de crédito en nuestros servidores.</li>
          </ul>
        </Section>

        {/* 7. Retención */}
        <Section icon={Trash2} title="7. Tiempo de retención">
          <p>
            Conservamos sus datos personales mientras mantenga una cuenta activa en nuestra
            plataforma y durante el tiempo necesario para cumplir las finalidades descritas.
            Una vez solicitada la eliminación de su cuenta, sus datos serán suprimidos o
            anonimizados en un plazo máximo de <strong>30 días calendario</strong>, salvo que
            exista obligación legal de conservarlos por un período mayor (p. ej., registros
            contables).
          </p>
        </Section>

        {/* 8. Menores */}
        <Section icon={Shield} title="8. Datos de menores de edad">
          <p>
            Nuestra plataforma no está dirigida a menores de 18 años. No recopilamos
            intencionalmente datos de menores. Si usted es padre, madre o tutor y cree que un
            menor ha proporcionado sus datos sin autorización, contáctenos para proceder a su
            eliminación inmediata.
          </p>
        </Section>

        {/* 9. Cambios */}
        <Section icon={Eye} title="9. Cambios a esta política">
          <p>
            Podemos actualizar esta política ocasionalmente para reflejar cambios legales o en
            nuestros servicios. Le notificaremos cualquier cambio relevante mediante un aviso
            visible en la plataforma o por correo electrónico. Le recomendamos revisarla
            periódicamente.
          </p>
        </Section>

        {/* Contacto */}
        <div className="bg-primary-purple rounded-2xl p-6 text-white text-center">
          <h2 className="font-bold text-lg mb-2">¿Preguntas sobre sus datos?</h2>
          <p className="text-purple-200 text-sm mb-4">
            Estamos disponibles para atender cualquier consulta relacionada con el tratamiento
            de su información personal.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:especialistaoptmra04@gmail.com"
              className="flex items-center gap-2 bg-white/10 hover:bg-primary-gold hover:text-primary-purple px-5 py-2.5 rounded-xl text-sm font-medium transition"
            >
              <Mail size={16} />
              especialistaoptmra04@gmail.com
            </a>
            <a
              href="https://wa.me/+573146030432"
              className="flex items-center gap-2 bg-white/10 hover:bg-primary-gold hover:text-primary-purple px-5 py-2.5 rounded-xl text-sm font-medium transition"
            >
              <Phone size={16} />
              +57 314 603 0432
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          <Link to="/" className="hover:text-primary-purple transition">
            ← Volver al inicio
          </Link>
        </p>

      </div>
    </div>
  );
};

export default PoliticaPrivacidad;