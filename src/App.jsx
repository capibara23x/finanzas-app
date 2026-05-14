import { useEffect, useState } from "react";

function App() {

  const [movimientos, setMovimientos] = useState(() => {
    const datosGuardados = localStorage.getItem("movimientos");

    return datosGuardados
      ? JSON.parse(datosGuardados)
      : [];
  });

  const [tipo, setTipo] = useState("gasto");
  const [monto, setMonto] = useState("");
  const [categoria, setCategoria] = useState("");
  const [cuenta, setCuenta] = useState("efectivo");
  const [nota, setNota] = useState("");

  useEffect(() => {
    localStorage.setItem(
      "movimientos",
      JSON.stringify(movimientos)
    );
  }, [movimientos]);

  const agregarMovimiento = () => {

    if (!monto || !categoria) return;

    const nuevoMovimiento = {
      id: Date.now(),
      tipo,
      monto: Number(monto),
      categoria,
      nota,
      cuenta,
      fecha: new Date().toLocaleString()  
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
  .reduce((acc, mov) => {
    return mov.tipo === "ingreso"
      ? acc + mov.monto
      : acc - mov.monto;
  }, 0);

  const saldoTarjeta = movimientos
  .filter((m) => m.cuenta === "tarjeta")
  .reduce((acc, mov) => {
    return mov.tipo === "ingreso"
      ? acc + mov.monto
      : acc - mov.monto;
  }, 0);

  return (
    <div className="min-h-screen bg-black p-4 text-white">

      <div className="max-w-md mx-auto">

        {/* Header */}
        <div className="bg-black text-white rounded-3xl p-6 shadow-lg">

          <p className="text-gray-300">
            Saldo actual
          </p>

          <h1 className="text-4xl font-bold mt-2">
            S/ {saldo}
          </h1>

          <div className="flex justify-between mt-6">

          <div className="mt-4 space-y-1">

          <p className="text-sm text-gray-300">
          💵 Efectivo: S/ {saldoEfectivo}
          </p>

          <p className="text-sm text-gray-300">
          💳 Tarjeta: S/ {saldoTarjeta}
          </p>

          </div>

            <div>
              <p className="text-gray-400 text-sm">
                Ingresos
              </p>

              <p className="text-green-400 font-bold">
                + S/ {ingresos}
              </p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">
                Gastos
              </p>

              <p className="text-red-400 font-bold">
                - S/ {gastos}
              </p>
            </div>

          </div>

        </div>

        {/* Formulario */}
        <div className="bg-zinc-900 rounded-3xl p-5 shadow-lg mt-5">

          <h2 className="text-xl font-bold mb-4">
            Nuevo movimiento
          </h2>

          {/* Tipo */}
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
  <option value="efectivo">
    💵 Efectivo
  </option>

  <option value="tarjeta">
    💳 Tarjeta
  </option>
</select>

          {/* Monto */}
          <input
            type="number"
            placeholder="Monto"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 text-white p-3 rounded-xl mb-3"
          />

          {/* Categoría */}
          <div className="grid grid-cols-2 gap-2 mb-3">

  {[
    "🍔 Comida",
    "🚕 Transporte",
    "🛒 Compras",
    "🎮 Ocio",
    "💡 Servicios",
    "💰 Ahorro"
  ].map((cat) => (

    <button
      key={cat}
      onClick={() => setCategoria(cat)}
      className={`p-3 rounded-xl border text-sm font-medium ${
        categoria === cat
          ? "bg-black text-white"
          : "bg-zinc-900"
      }`}
    >
      {cat}
    </button>

  ))}

</div>

          {/* Nota */}
          <textarea
            placeholder="Nota opcional"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 text-white p-3 rounded-xl mb-3"
          />

          <button
            onClick={agregarMovimiento}
            className="w-full bg-black text-white py-4 rounded-2xl font-semibold"
          >
            Guardar movimiento
          </button>

        </div>

        {/* Historial */}
        <div className="mt-6">

          <h2 className="text-xl font-bold mb-3">
            Historial
          </h2>

          <div className="space-y-3">

            {movimientos.map((mov) => (

              <div
                key={mov.id}
                className="bg-zinc-900 p-4 rounded-2xl shadow-lg flex justify-between items-center"
              >

                <div>
                  <p className="font-bold">
                    {mov.categoria}
                  </p>

                  <p className="text-gray-400 text-sm">
                    {mov.nota}
                  </p>
                </div>

                <p
                  className={`font-bold ${
                    mov.tipo === "ingreso"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {mov.tipo === "ingreso" ? "+" : "-"} S/ {mov.monto}
                </p>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}

export default App;