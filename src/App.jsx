import { useEffect, useMemo, useState } from "react";

const categoriasIniciales = [
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

const obtenerFechaInput = (movimiento) => {
  const fecha = obtenerFechaMovimiento(movimiento);
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const crearResumenCategorias = (movimientos) => {
  const gastosPorCategoria = movimientos.reduce((acc, mov) => {
    acc[mov.categoria] = (acc[mov.categoria] || 0) + mov.monto;
    return acc;
  }, {});

  return Object.entries(gastosPorCategoria)
    .map(([nombre, total]) => ({ nombre, total }))
    .sort((a, b) => b.total - a.total);
};

function App() {
  const [movimientos, setMovimientos] = useState(() => {
    const datosGuardados = localStorage.getItem("movimientos");

    return datosGuardados ? JSON.parse(datosGuardados) : [];
  });

  const [categorias, setCategorias] = useState(() => {
    const categoriasGuardadas = localStorage.getItem("categorias");

    return categoriasGuardadas ? JSON.parse(categoriasGuardadas) : categoriasIniciales;
  });

  const [metas, setMetas] = useState(() => {
    const metasGuardadas = localStorage.getItem("metasAhorro");

    return metasGuardadas ? JSON.parse(metasGuardadas) : [];
  });

  const [pestanaActiva, setPestanaActiva] = useState("inicio");
  const [filtroReporte, setFiltroReporte] = useState("dia");
  const [tipo, setTipo] = useState("gasto");
  const [monto, setMonto] = useState("");
  const [categoria, setCategoria] = useState("");
  const [cuenta, setCuenta] = useState("efectivo");
  const [nota, setNota] = useState("");
  const [movimientoEditandoId, setMovimientoEditandoId] = useState(null);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroCuenta, setFiltroCuenta] = useState("todas");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [nombreMeta, setNombreMeta] = useState("");
  const [objetivoMeta, setObjetivoMeta] = useState("");
  const [metaSeleccionadaId, setMetaSeleccionadaId] = useState("");
  const [montoAhorro, setMontoAhorro] = useState("");

  useEffect(() => {
    localStorage.setItem("movimientos", JSON.stringify(movimientos));
  }, [movimientos]);

  useEffect(() => {
    localStorage.setItem("categorias", JSON.stringify(categorias));
  }, [categorias]);

  useEffect(() => {
    localStorage.setItem("metasAhorro", JSON.stringify(metas));
  }, [metas]);

  const limpiarFormulario = () => {
    setTipo("gasto");
    setMonto("");
    setCategoria("");
    setCuenta("efectivo");
    setNota("");
    setMovimientoEditandoId(null);
  };

  const guardarMovimiento = () => {
    if (!monto || !categoria) return;

    if (movimientoEditandoId) {
      setMovimientos((movimientosActuales) =>
        movimientosActuales.map((mov) =>
          mov.id === movimientoEditandoId
            ? {
                ...mov,
                tipo,
                monto: Number(monto),
                categoria,
                nota,
                cuenta,
              }
            : mov,
        ),
      );
      limpiarFormulario();
      return;
    }

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
    limpiarFormulario();
  };

  const editarMovimiento = (movimiento) => {
    setMovimientoEditandoId(movimiento.id);
    setTipo(movimiento.tipo);
    setMonto(String(movimiento.monto));
    setCategoria(movimiento.categoria);
    setCuenta(movimiento.cuenta);
    setNota(movimiento.nota || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminarMovimiento = (id) => {
    setMovimientos((movimientosActuales) => movimientosActuales.filter((mov) => mov.id !== id));

    if (movimientoEditandoId === id) {
      limpiarFormulario();
    }
  };

  const agregarCategoria = () => {
    const nombre = nuevaCategoria.trim();
    if (!nombre) return;

    const yaExiste = categorias.some((cat) => cat.toLowerCase() === nombre.toLowerCase());
    if (yaExiste) {
      setNuevaCategoria("");
      return;
    }

    setCategorias([...categorias, nombre]);
    setCategoria(nombre);
    setNuevaCategoria("");
  };

  const eliminarCategoria = (nombre) => {
    setCategorias((categoriasActuales) => categoriasActuales.filter((cat) => cat !== nombre));

    if (categoria === nombre) setCategoria("");
    if (filtroCategoria === nombre) setFiltroCategoria("todas");
  };

  const limpiarFiltrosHistorial = () => {
    setFiltroCategoria("todas");
    setFiltroCuenta("todas");
    setFiltroTipo("todos");
    setFiltroFecha("");
  };

  const agregarMeta = () => {
    if (!nombreMeta.trim() || !objetivoMeta || Number(objetivoMeta) <= 0) return;

    const nuevaMeta = {
      id: Date.now(),
      nombre: nombreMeta.trim(),
      objetivo: Number(objetivoMeta),
      ahorrado: 0,
      fecha: new Date().toLocaleDateString(),
    };

    setMetas([nuevaMeta, ...metas]);
    setNombreMeta("");
    setObjetivoMeta("");
    setMetaSeleccionadaId(String(nuevaMeta.id));
  };

  const registrarAhorro = () => {
    if (!metaSeleccionadaId || !montoAhorro) return;

    setMetas((metasActuales) =>
      metasActuales.map((meta) =>
        meta.id === Number(metaSeleccionadaId)
          ? { ...meta, ahorrado: meta.ahorrado + Number(montoAhorro) }
          : meta,
      ),
    );
    setMontoAhorro("");
  };

  const eliminarMeta = (id) => {
    setMetas((metasActuales) => metasActuales.filter((meta) => meta.id !== id));

    if (metaSeleccionadaId === String(id)) {
      setMetaSeleccionadaId("");
    }
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

  const movimientosFiltrados = useMemo(
    () =>
      movimientos.filter((mov) => {
        const coincideCategoria = filtroCategoria === "todas" || mov.categoria === filtroCategoria;
        const coincideCuenta = filtroCuenta === "todas" || mov.cuenta === filtroCuenta;
        const coincideTipo = filtroTipo === "todos" || mov.tipo === filtroTipo;
        const coincideFecha = !filtroFecha || obtenerFechaInput(mov) === filtroFecha;

        return coincideCategoria && coincideCuenta && coincideTipo && coincideFecha;
      }),
    [movimientos, filtroCategoria, filtroCuenta, filtroTipo, filtroFecha],
  );

  const reporte = useMemo(() => {
    const ahora = new Date();
    const inicioPeriodo = obtenerInicioPeriodo(filtroReporte, ahora);
    const inicioHoy = inicioDelDia(ahora);
    const inicioMes = inicioDeMes(ahora);
    const inicioSemanaActual = inicioDeSemana(ahora);
    const inicioSemanaAnterior = new Date(inicioSemanaActual);
    inicioSemanaAnterior.setDate(inicioSemanaAnterior.getDate() - 7);

    const gastosDelPeriodo = movimientos.filter((mov) => {
      const fecha = obtenerFechaMovimiento(mov);
      return mov.tipo === "gasto" && fecha >= inicioPeriodo && fecha <= ahora;
    });

    const gastosDeHoy = movimientos.filter((mov) => {
      const fecha = obtenerFechaMovimiento(mov);
      return mov.tipo === "gasto" && fecha >= inicioHoy && fecha <= ahora;
    });

    const gastosDelMes = movimientos.filter((mov) => {
      const fecha = obtenerFechaMovimiento(mov);
      return mov.tipo === "gasto" && fecha >= inicioMes && fecha <= ahora;
    });

    const gastosSemanaActual = movimientos.filter((mov) => {
      const fecha = obtenerFechaMovimiento(mov);
      return mov.tipo === "gasto" && fecha >= inicioSemanaActual && fecha <= ahora;
    });

    const gastosSemanaAnterior = movimientos.filter((mov) => {
      const fecha = obtenerFechaMovimiento(mov);
      return mov.tipo === "gasto" && fecha >= inicioSemanaAnterior && fecha < inicioSemanaActual;
    });

    const totalPeriodo = gastosDelPeriodo.reduce((acc, mov) => acc + mov.monto, 0);
    const totalHoy = gastosDeHoy.reduce((acc, mov) => acc + mov.monto, 0);
    const totalMes = gastosDelMes.reduce((acc, mov) => acc + mov.monto, 0);
    const totalSemanaActual = gastosSemanaActual.reduce((acc, mov) => acc + mov.monto, 0);
    const totalSemanaAnterior = gastosSemanaAnterior.reduce((acc, mov) => acc + mov.monto, 0);
    const diferenciaSemanal = totalSemanaActual - totalSemanaAnterior;
    const categoriasOrdenadas = crearResumenCategorias(gastosDelPeriodo);
    const categoriasDelMes = crearResumenCategorias(gastosDelMes);

    return {
      movimientos: gastosDelPeriodo,
      totalPeriodo,
      totalHoy,
      totalMes,
      diferenciaSemanal,
      categoriaPrincipal: categoriasOrdenadas[0],
      categoriaPrincipalMes: categoriasDelMes[0],
      categoriasOrdenadas,
    };
  }, [movimientos, filtroReporte]);

  return (
    <div className="min-h-screen bg-black p-4 text-white">
      <div className="max-w-md mx-auto pb-8">
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-2 shadow-lg mb-5 grid grid-cols-3 gap-2">
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

          <button
            onClick={() => setPestanaActiva("metas")}
            className={`py-3 rounded-2xl font-semibold transition ${
              pestanaActiva === "metas" ? "bg-white text-black" : "bg-zinc-900 text-gray-300"
            }`}
          >
            Metas
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
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-xl font-bold">
                  {movimientoEditandoId ? "Editar movimiento" : "Nuevo movimiento"}
                </h2>

                {movimientoEditandoId && (
                  <button
                    onClick={limpiarFormulario}
                    className="bg-zinc-800 border border-zinc-700 text-gray-200 px-3 py-2 rounded-xl text-sm"
                  >
                    Cancelar
                  </button>
                )}
              </div>

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

              <div className="grid grid-cols-[1fr_auto] gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Nueva categoria"
                  value={nuevaCategoria}
                  onChange={(e) => setNuevaCategoria(e.target.value)}
                  className="min-w-0 bg-zinc-800 border border-zinc-700 text-white p-3 rounded-xl"
                />
                <button
                  onClick={agregarCategoria}
                  className="bg-zinc-950 border border-zinc-700 text-white px-4 rounded-xl font-semibold"
                >
                  Agregar
                </button>
              </div>

              <textarea
                placeholder="Nota opcional"
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white p-3 rounded-xl mb-3"
              />

              <button
                onClick={guardarMovimiento}
                className="w-full bg-white text-black py-4 rounded-2xl font-semibold"
              >
                {movimientoEditandoId ? "Guardar cambios" : "Guardar movimiento"}
              </button>
            </div>

            <div className="bg-zinc-900 rounded-3xl p-5 shadow-lg mt-5 border border-zinc-800">
              <h2 className="text-xl font-bold mb-4">Categorias</h2>

              <div className="flex flex-wrap gap-2">
                {categorias.map((cat) => (
                  <div
                    key={cat}
                    className="bg-zinc-950 border border-zinc-800 rounded-full pl-4 pr-2 py-2 flex items-center gap-2"
                  >
                    <span className="text-sm">{cat}</span>
                    <button
                      onClick={() => eliminarCategoria(cat)}
                      className="bg-zinc-800 text-gray-300 rounded-full px-2 text-sm"
                      aria-label={`Eliminar ${cat}`}
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h2 className="text-xl font-bold">Historial</h2>
                <button
                  onClick={limpiarFiltrosHistorial}
                  className="bg-zinc-900 border border-zinc-800 text-gray-300 rounded-xl px-3 py-2 text-sm"
                >
                  Limpiar
                </button>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 mb-4 grid grid-cols-2 gap-3">
                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 text-white p-3 rounded-xl"
                >
                  <option value="todas">Categoria</option>
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <select
                  value={filtroCuenta}
                  onChange={(e) => setFiltroCuenta(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 text-white p-3 rounded-xl"
                >
                  <option value="todas">Cuenta</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                </select>

                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 text-white p-3 rounded-xl"
                >
                  <option value="todos">Tipo</option>
                  <option value="gasto">Gasto</option>
                  <option value="ingreso">Ingreso</option>
                </select>

                <input
                  type="date"
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 text-white p-3 rounded-xl"
                />
              </div>

              <div className="space-y-3">
                {movimientosFiltrados.length === 0 ? (
                  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-gray-400">
                    No hay movimientos con esos filtros.
                  </div>
                ) : (
                  movimientosFiltrados.map((mov) => (
                    <div
                      key={mov.id}
                      className="bg-zinc-900 p-4 rounded-2xl shadow-lg border border-zinc-800"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <p className="font-bold">{mov.categoria}</p>
                          <p className="text-gray-400 text-sm">{mov.nota || mov.cuenta}</p>
                          <p className="text-gray-500 text-xs mt-1">{mov.fecha}</p>
                        </div>

                        <p
                          className={`font-bold whitespace-nowrap ${
                            mov.tipo === "ingreso" ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {mov.tipo === "ingreso" ? "+" : "-"} {formatearDinero(mov.monto)}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <button
                          onClick={() => editarMovimiento(mov)}
                          className="bg-zinc-800 border border-zinc-700 text-white py-2 rounded-xl font-semibold"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => eliminarMovimiento(mov.id)}
                          className="bg-red-500/10 border border-red-500/30 text-red-300 py-2 rounded-xl font-semibold"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        ) : pestanaActiva === "reportes" ? (
          <div className="space-y-5">
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-lg">
              <p className="text-gray-400 text-sm">Reporte de gastos</p>
              <h1 className="text-3xl font-bold mt-2">{formatearDinero(reporte.totalPeriodo)}</h1>
              <p className="text-gray-400 mt-1">Total gastado segun el filtro seleccionado</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Resumen del mes</h2>

              <div className="space-y-3">
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
                  <p className="text-gray-400 text-sm">Este mes gastaste</p>
                  <p className="text-2xl font-bold text-red-400 mt-1">
                    {formatearDinero(reporte.totalMes)}
                  </p>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
                  <p className="text-gray-400 text-sm">Tu mayor gasto fue</p>
                  <p className="text-2xl font-bold mt-1">
                    {reporte.categoriaPrincipalMes?.nombre || "Sin gastos"}
                  </p>
                  <p className="text-red-400 font-semibold mt-1">
                    {formatearDinero(reporte.categoriaPrincipalMes?.total || 0)}
                  </p>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
                  <p className="text-gray-400 text-sm">
                    {reporte.diferenciaSemanal >= 0
                      ? "Gastaste mas que la semana pasada"
                      : "Gastaste menos que la semana pasada"}
                  </p>
                  <p
                    className={`text-2xl font-bold mt-1 ${
                      reporte.diferenciaSemanal >= 0 ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    {formatearDinero(Math.abs(reporte.diferenciaSemanal))}
                  </p>
                </div>
              </div>
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
        ) : (
          <div className="space-y-5">
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-lg">
              <p className="text-gray-400 text-sm">Metas de ahorro</p>
              <h1 className="text-3xl font-bold mt-2">
                {formatearDinero(metas.reduce((acc, meta) => acc + meta.ahorrado, 0))}
              </h1>
              <p className="text-gray-400 mt-1">Total acumulado entre todas tus metas</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Nueva meta</h2>

              <input
                type="text"
                placeholder="Nombre de la meta"
                value={nombreMeta}
                onChange={(e) => setNombreMeta(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white p-3 rounded-xl mb-3"
              />

              <input
                type="number"
                placeholder="Monto objetivo"
                value={objetivoMeta}
                onChange={(e) => setObjetivoMeta(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white p-3 rounded-xl mb-3"
              />

              <button
                onClick={agregarMeta}
                className="w-full bg-white text-black py-4 rounded-2xl font-semibold"
              >
                Crear meta
              </button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Registrar ahorro</h2>

              <select
                value={metaSeleccionadaId}
                onChange={(e) => setMetaSeleccionadaId(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white p-3 rounded-xl mb-3"
              >
                <option value="">Seleccionar meta</option>
                {metas.map((meta) => (
                  <option key={meta.id} value={meta.id}>
                    {meta.nombre}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Monto ahorrado"
                value={montoAhorro}
                onChange={(e) => setMontoAhorro(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white p-3 rounded-xl mb-3"
              />

              <button
                onClick={registrarAhorro}
                className="w-full bg-zinc-950 border border-zinc-700 text-white py-4 rounded-2xl font-semibold"
              >
                Sumar ahorro
              </button>
            </div>

            <div className="space-y-3">
              {metas.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl text-gray-400">
                  Todavia no tienes metas de ahorro.
                </div>
              ) : (
                metas.map((meta) => {
                  const porcentaje =
                    meta.objetivo > 0 ? Math.min((meta.ahorrado / meta.objetivo) * 100, 100) : 0;
                  const faltante = Math.max(meta.objetivo - meta.ahorrado, 0);

                  return (
                    <div
                      key={meta.id}
                      className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-lg"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <p className="text-xl font-bold">{meta.nombre}</p>
                          <p className="text-gray-400 text-sm mt-1">
                            Creada el {meta.fecha}
                          </p>
                        </div>

                        <button
                          onClick={() => eliminarMeta(meta.id)}
                          className="bg-red-500/10 border border-red-500/30 text-red-300 px-3 py-2 rounded-xl text-sm font-semibold"
                        >
                          Eliminar
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-5">
                        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3">
                          <p className="text-gray-400 text-sm">Ahorrado</p>
                          <p className="text-green-400 font-bold mt-1">
                            {formatearDinero(meta.ahorrado)}
                          </p>
                        </div>

                        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3">
                          <p className="text-gray-400 text-sm">Objetivo</p>
                          <p className="font-bold mt-1">{formatearDinero(meta.objetivo)}</p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-300">{porcentaje.toFixed(0)}%</span>
                          <span className={faltante === 0 ? "text-green-400" : "text-gray-300"}>
                            {faltante === 0
                              ? "Meta completada"
                              : `Faltan ${formatearDinero(faltante)}`}
                          </span>
                        </div>

                        <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${porcentaje}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
