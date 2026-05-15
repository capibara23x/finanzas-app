import { useEffect, useMemo, useState } from "react";

const categorias = [
  "Comida",
  "Transporte",
  "Compras",
  "Ocio",
  "Servicios",
  "Ahorro",
];

const filtrosReporte = {
  dia: "Dia",
  semana: "Semana",
  mes: "Mes",
};

const formatearDinero = (valor) => `S/ ${valor.toFixed(2)}`;

const obtenerFechaMovimiento = (movimiento) => {
  const fecha = new Date(movimiento.fechaISO || movimiento.fecha);

  return Number.isNaN(fecha.getTime()) ? new Date() : fecha;
};

const inicioDelDia = (fecha) => {
  const nuevaFecha = new Date(fecha);
  nuevaFecha.setHours(0, 0, 0, 0);
  return nuevaFecha;
};

const inicioDeSemana = (fecha) => {
  const nuevaFecha = inicioDelDia(fecha);
  const dia = nuevaFecha.getDay();
  const ajuste = dia === 0 ? 6 : dia - 1;
  nuevaFecha.setDate(nuevaFecha.getDate() - ajuste);
  return nuevaFecha;
};

const inicioDeMes = (fecha) => new Date(fecha.getFullYear(), fecha.getMonth(), 1);

const obtenerInicioPeriodo = (filtro, fechaBase = new Date()) => {
  if (filtro === "semana") return inicioDeSemana(fechaBase);
  if (filtro === "mes") return inicioDeMes(fechaBase);
  return inicioDelDia(fechaBase);
};

function App() {
  const [movimientos, setMovimientos] = useState(() => {
    const datosGuardados = localStorage.getItem("movimientos");

    return datosGuardados ? JSON.parse(datosGuardados) : [];
  });

  const [pestanaActiva, setPestanaActiva] = useState("inicio");
  const [filtroReporte, setFiltroReporte] = useState("dia");
  const [tipo, setTipo] = useState("gasto");
  const [monto, setMonto] = useState("");
  const [categoria, setCategoria] = useState("");
  const [cuenta, setCuenta] = useState("efectivo");
  const [nota, setNota] = useState("");

  useEffect(() => {
    localStorage.setItem("movimientos", JSON.stringify(movimientos));
  }, [movimientos]);

  const agregarMovimiento = () => {
    if (!monto || !categoria) return;

    const fecha = new Date();
    const nuevoMovimiento = {
      id: Date.now(),
      tipo,
      monto: Number(monto),
      categoria,
      nota,
      cuenta,
      fecha: fecha.toLocaleString(),
      fechaISO: fecha.toISOString(),
    };

    setMovimientos([nuevoMovimiento, ...movimientos]);
    setMonto("");
    setCategoria("");
    setNota("");
  };

  const ingresos = movimientos
    .filter((m) => m.tipo === "ingreso")
    .reduce((acc, mov) => acc + mov.monto, 0);

  const gastos = movimientos
    .filter((m) => m.tipo === "gasto")
    .reduce((acc, mov) => acc + mov.monto, 0);

  const saldo = ingresos - gastos;

  const saldoEfectivo = movimientos
    .filter((m) => m.cuenta === "efectivo")
    .reduce((acc, mov) => (mov.tipo === "ingreso" ? acc + mov.monto : acc - mov.monto), 0);

  const saldoTarjeta = movimientos
    .filter((m) => m.cuenta === "tarjeta")
    .reduce((acc, mov) => (mov.tipo === "ingreso" ? acc + mov.monto : acc - mov.monto), 0);

  const reporte = useMemo(() => {
    const ahora = new Date();
    const inicioPeriodo = obtenerInicioPeriodo(filtroReporte, ahora);
    const inicioHoy = inicioDelDia(ahora);
    const gastosDelPeriodo = movimientos.filter((mov) => {
      const fecha = obtenerFechaMovimiento(mov);
      return mov.tipo === "gasto" && fecha >= inicioPeriodo && fecha <= ahora;
    });

    const gastosDeHoy = movimientos.filter((mov) => {
      const fecha = obtenerFechaMovimiento(mov);
      return mov.tipo === "gasto" && fecha >= inicioHoy && fecha <= ahora;
    });

    const totalPeriodo = gastosDelPeriodo.reduce((acc, mov) => acc + mov.monto, 0);
    const totalHoy = gastosDeHoy.reduce((acc, mov) => acc + mov.monto, 0);

    const gastosPorCategoria = gastosDelPeriodo.reduce((acc, mov) => {
      acc[mov.categoria] = (acc[mov.categoria] || 0) + mov.monto;
      return acc;
    }, {});

    const categoriasOrdenadas = Object.entries(gastosPorCategoria)
      .map(([nombre, total]) => ({ nombre, total }))
      .sort((a, b) => b.total - a.total);

    return {
      movimientos: gastosDelPeriodo,
      totalPeriodo,
      totalHoy,
      categoriaPrincipal: categoriasOrdenadas[0],
      categoriasOrdenadas,
    };
  }, [movimientos, filtroReporte]);

  return (
    <div className="min-h-screen bg-black p-4 text-white">
      <div className="max-w-md mx-auto pb-8">
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-2 shadow-lg mb-5 grid grid-cols-2 gap-2">
          <button
            onClick={() => setPestanaActiva("inicio")}
            className={`py-3 rounded-2xl font-semibold transition ${
              pestanaActiva === "inicio" ? "bg-white text-black" : "bg-zinc-900 text-gray-300"
            }`}
          >
            Inicio
          </button>

          <button
            onClick={() => setPestanaActiva("reportes")}
            className={`py-3 rounded-2xl font-semibold transition ${
              pestanaActiva === "reportes" ? "bg-white text-black" : "bg-zinc-900 text-gray-300"
            }`}
          >
            Reportes
          </button>
        </div>

        {pestanaActiva === "inicio" ? (
          <>
            <div className="bg-zinc-950 border border-zinc-800 text-white rounded-3xl p-6 shadow-lg">
              <p className="text-gray-300">Saldo actual</p>

              <h1 className="text-4xl font-bold mt-2">{formatearDinero(saldo)}</h1>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="bg-zinc-900 rounded-2xl p-3 border border-zinc-800">
                  <p className="text-gray-400 text-sm">Efectivo</p>
                  <p className="font-bold">{formatearDinero(saldoEfectivo)}</p>
                </div>

                <div className="bg-zinc-900 rounded-2xl p-3 border border-zinc-800">
                  <p className="text-gray-400 text-sm">Tarjeta</p>
                  <p className="font-bold">{formatearDinero(saldoTarjeta)}</p>
                </div>

                <div className="bg-zinc-900 rounded-2xl p-3 border border-zinc-800">
                  <p className="text-gray-400 text-sm">Ingresos</p>
                  <p className="text-green-400 font-bold">+ {formatearDinero(ingresos)}</p>
                </div>

                <div className="bg-zinc-900 rounded-2xl p-3 border border-zinc-800">
                  <p className="text-gray-400 text-sm">Gastos</p>
                  <p className="text-red-400 font-bold">- {formatearDinero(gastos)}</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-3xl p-5 shadow-lg mt-5 border border-zinc-800">
              <h2 className="text-xl font-bold mb-4">Nuevo movimiento</h2>

              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white p-3 rounded-xl mb-3"
              >
                <option value="gasto">Gasto</option>
                <option value="ingreso">Ingreso</option>
              </select>

              <select
                value={cuenta}
                onChange={(e) => setCuenta(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white p-3 rounded-xl mb-3"
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
              </select>

              <input
                type="number"
                placeholder="Monto"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white p-3 rounded-xl mb-3"
              />

              <div className="grid grid-cols-2 gap-2 mb-3">
                {categorias.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoria(cat)}
                    className={`p-3 rounded-xl border text-sm font-medium transition ${
                      categoria === cat
                        ? "bg-white text-black border-white"
                        : "bg-zinc-950 border-zinc-700 text-gray-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <textarea
                placeholder="Nota opcional"
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white p-3 rounded-xl mb-3"
              />

              <button
                onClick={agregarMovimiento}
                className="w-full bg-white text-black py-4 rounded-2xl font-semibold"
              >
                Guardar movimiento
              </button>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-bold mb-3">Historial</h2>

              <div className="space-y-3">
                {movimientos.length === 0 ? (
                  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-gray-400">
                    Todavia no hay movimientos.
                  </div>
                ) : (
                  movimientos.map((mov) => (
                    <div
                      key={mov.id}
                      className="bg-zinc-900 p-4 rounded-2xl shadow-lg flex justify-between items-center border border-zinc-800"
                    >
                      <div>
                        <p className="font-bold">{mov.categoria}</p>
                        <p className="text-gray-400 text-sm">{mov.nota || mov.cuenta}</p>
                        <p className="text-gray-500 text-xs mt-1">{mov.fecha}</p>
                      </div>

                      <p
                        className={`font-bold ${
                          mov.tipo === "ingreso" ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {mov.tipo === "ingreso" ? "+" : "-"} {formatearDinero(mov.monto)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-5">
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-lg">
              <p className="text-gray-400 text-sm">Reporte de gastos</p>
              <h1 className="text-3xl font-bold mt-2">{formatearDinero(reporte.totalPeriodo)}</h1>
              <p className="text-gray-400 mt-1">Total gastado segun el filtro seleccionado</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Filtrar por</h2>

              <div className="grid grid-cols-3 gap-2">
                {Object.entries(filtrosReporte).map(([valor, etiqueta]) => (
                  <button
                    key={valor}
                    onClick={() => setFiltroReporte(valor)}
                    className={`py-3 rounded-2xl font-semibold transition ${
                      filtroReporte === valor
                        ? "bg-white text-black"
                        : "bg-zinc-800 text-gray-300 border border-zinc-700"
                    }`}
                  >
                    {etiqueta}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-lg">
                <p className="text-gray-400 text-sm">Gasto de hoy</p>
                <p className="text-2xl font-bold mt-2 text-red-400">
                  {formatearDinero(reporte.totalHoy)}
                </p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-lg">
                <p className="text-gray-400 text-sm">En que gastaste mas</p>
                <p className="text-2xl font-bold mt-2">
                  {reporte.categoriaPrincipal?.nombre || "Sin gastos"}
                </p>
                <p className="text-red-400 font-semibold mt-1">
                  {formatearDinero(reporte.categoriaPrincipal?.total || 0)}
                </p>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Gastos por categoria</h2>

              <div className="space-y-3">
                {reporte.categoriasOrdenadas.length === 0 ? (
                  <p className="text-gray-400">No hay gastos en este periodo.</p>
                ) : (
                  reporte.categoriasOrdenadas.map((cat) => {
                    const porcentaje =
                      reporte.totalPeriodo > 0 ? (cat.total / reporte.totalPeriodo) * 100 : 0;

                    return (
                      <div key={cat.nombre}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-semibold">{cat.nombre}</span>
                          <span className="text-gray-300">{formatearDinero(cat.total)}</span>
                        </div>
                        <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500 rounded-full"
                            style={{ width: `${porcentaje}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Movimientos del reporte</h2>

              <div className="space-y-3">
                {reporte.movimientos.length === 0 ? (
                  <p className="text-gray-400">No hay movimientos para mostrar.</p>
                ) : (
                  reporte.movimientos.map((mov) => (
                    <div
                      key={mov.id}
                      className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex justify-between gap-3"
                    >
                      <div>
                        <p className="font-bold">{mov.categoria}</p>
                        <p className="text-gray-400 text-sm">{mov.nota || mov.cuenta}</p>
                      </div>
                      <p className="text-red-400 font-bold whitespace-nowrap">
                        - {formatearDinero(mov.monto)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
