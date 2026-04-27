// src/pages/Admin/AdminDashboard.tsx
import { useEffect, useState } from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Package, ShoppingCart, DollarSign, Users, TrendingUp, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Area,
} from 'recharts';

// Tipos
interface Stats {
  productos: number;
  pedidosHoy: number;
  ventasMes: number;
  usuariosActivos: number;
  otsPendientes: number;
}

interface VentasMes {
  mes: string;
  ventas: number;
  pedidos: number;
}

// Tooltip personalizado para el grafico
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-4 text-sm">
      <p className="font-semibold text-primary-purple mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="mb-1">
          {p.dataKey === 'ventas'
            ? `Ventas: $${Number(p.value).toLocaleString('es-CO')}`
            : `Pedidos: ${p.value}`}
        </p>
      ))}
    </div>
  );
};

// Componente principal 
const AdminDashboard = () => {
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [ventas,  setVentas]  = useState<VentasMes[]>([]);
  const [loading, setLoading] = useState(true);
  const [year,    setYear]    = useState(new Date().getFullYear());

  const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        // Stats en paralelo
        const [
          { count: productos },
          { count: usuariosActivos },
          { data: pedidosHoy },
          { data: ventasMesData },
          { data: ordersYear },
          { data: consultasMesData },
          { data: consultasYear }
        ] = await Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }).eq('active', true),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('active', true),
          supabase
            .from('orders')
            .select('id')
            .gte('created_at', new Date().toISOString().split('T')[0]),
          supabase
            .from('orders')
            .select('total')
            .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
            .neq('status', 'Cancelado'),
          supabase
            .from('orders')
            .select('created_at, total, status')
            .gte('created_at', `${year}-01-01`)
            .lte('created_at', `${year}-12-31`)
            .neq('status', 'Cancelado'),
            // Consultas/OT del mes actual (no canceladas)
          supabase
            .from('consultas')
            .select('precio_total')
            .gte('fecha_consulta', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
            .neq('status', 'cancelada'),
          // Consultas/OT del año para el gráfico
          supabase
            .from('consultas')
            .select('fecha_consulta, precio_total, status')
            .gte('fecha_consulta', `${year}-01-01`)
            .lte('fecha_consulta', `${year}-12-31`)
            .neq('status', 'cancelada'),
        ]);

        const ventasOnline = ventasMesData?.reduce((acc, o) => acc + (o.total ?? 0), 0) ?? 0;
        const ventasOT     = consultasMesData?.reduce((acc, c) => acc + (c.precio_total ?? 0), 0) ?? 0;
        
        setStats({
          productos:       productos ?? 0,
          pedidosHoy:      pedidosHoy?.length ?? 0,
          ventasMes:       ventasOnline + ventasOT,
          usuariosActivos: usuariosActivos ?? 0,
          otsPendientes:   consultasYear?.filter(c => c.status === 'pendiente').length ?? 0,
        });

        // Agrupar ventas por mes
        const porMes: Record<number, { ventas: number; pedidos: number }> = {};
        for (let i = 0; i < 12; i++) porMes[i] = { ventas: 0, pedidos: 0 };

        (ordersYear ?? []).forEach((o: any) => {
          const mes = new Date(o.created_at).getMonth();
          porMes[mes].ventas  += o.total ?? 0;
          porMes[mes].pedidos += 1;
        });

        (consultasYear ?? []).forEach((c: any) => {
          // fecha_consulta es 'YYYY-MM-DD', no timestamp
          const mes = new Date(c.fecha_consulta + 'T12:00:00').getMonth();
          porMes[mes].ventas += c.precio_total ?? 0;
          porMes[mes].pedidos += 1;
        });

        setVentas(
          MESES.map((mes, i) => ({
            mes,
            ventas:  Math.round(porMes[i].ventas),
            pedidos: porMes[i].pedidos,
          }))
        );
      } catch (e) {
        console.error('Error cargando dashboard:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [year]);

  const statCards = stats
    ? [
        {
          label: 'Productos activos',
          value: stats.productos,
          icon: <Package size={38} className="text-primary-gold opacity-70" />,
          format: (v: number) => v.toString(),
        },
        {
          label: 'Pedidos hoy',
          value: stats.pedidosHoy,
          icon: <ShoppingCart size={38} className="text-primary-gold opacity-70" />,
          format: (v: number) => v.toString(),
        },
        {
          label: 'Ventas este mes',
          value: stats.ventasMes,
          icon: <DollarSign size={38} className="text-primary-gold opacity-70" />,
          format: (v: number) => `$${v.toLocaleString('es-CO')}`,
        },
        {
          label: 'Usuarios activos',
          value: stats.usuariosActivos,
          icon: <Users size={38} className="text-primary-gold opacity-70" />,
          format: (v: number) => v.toString(),
        },
        {
          label: 'OTs pendientes',
          value: stats.otsPendientes,
          icon: <Eye size={38} className="text-primary-gold opacity-70" />,
          format: (v: number) => v.toString(),
        },
      ]
    : [];

  return (
    <AdminLayout>
      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-lg animate-pulse h-28" />
            ))
          : statCards.map((card) => (
              <div key={card.label} className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                    <p className="text-2xl font-bold text-primary-purple">
                      {card.format(card.value)}
                    </p>
                  </div>
                  {card.icon}
                </div>
              </div>
            ))}
      </div>

      {/* ── Gráfico ventas por mes ── */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp size={24} className="text-primary-purple" />
            <h2 className="text-xl font-bold text-primary-purple">Ventas por mes</h2>
          </div>

          {/* Selector de año */}
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary-gold bg-white text-gray-700"
          >
            {[2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Leyenda */}
        <div className="flex gap-6 mb-4 text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#6B21A8' }} />
            Ventas (COP)
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#D4AF37' }} />
            Pedidos
          </span>
        </div>

        {loading ? (
          <div className="h-72 animate-pulse bg-gray-100 rounded-xl" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={ventas} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="mes"
                tick={{ fontSize: 12, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="ventas"
                orientation="left"
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v =>
                  v >= 1_000_000
                    ? `$${(v / 1_000_000).toFixed(1)}M`
                    : v >= 1_000
                    ? `$${(v / 1_000).toFixed(0)}k`
                    : `$${v}`
                }
              />
              <YAxis
                yAxisId="pedidos"
                orientation="right"
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                yAxisId="ventas"
                dataKey="ventas"
                fill="#6B21A8"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
              <Area
                yAxisId="pedidos"
                type="monotone"
                dataKey="pedidos"
                fill="#D4AF3722"
                stroke="#D4AF37"
                strokeWidth={2}
                dot={{ fill: '#D4AF37', r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {/* Resumen del año */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-400 mb-1">Total ventas {year}</p>
              <p className="text-lg font-bold text-primary-purple">
                ${ventas.reduce((a, m) => a + m.ventas, 0).toLocaleString('es-CO')}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Total pedidos {year}</p>
              <p className="text-lg font-bold text-primary-purple">
                {ventas.reduce((a, m) => a + m.pedidos, 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Ticket promedio</p>
              <p className="text-lg font-bold text-primary-purple">
                {(() => {
                  const totalPedidos = ventas.reduce((a, m) => a + m.pedidos, 0);
                  const totalVentas  = ventas.reduce((a, m) => a + m.ventas, 0);
                  return totalPedidos > 0
                    ? `$${Math.round(totalVentas / totalPedidos).toLocaleString('es-CO')}`
                    : '$0';
                })()}
              </p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;