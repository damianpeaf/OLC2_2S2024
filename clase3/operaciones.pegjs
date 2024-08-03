
Expresion = Suma

// 1 + 2 + 3 + 4

// izq = { tipo: "numero", valor: 1 }
// expansion [ { tipo: "+", der: { tipo: "numero", valor: 2 } }, { tipo: "+", der: { tipo: "numero", valor: 3 } }, { tipo: "+", der: { tipo: "numero", valor: 4 } } ]

// izq = { tipo: "numero", valor: 1 }
// operacionActual1 = { tipo: "+", der: { tipo: "numero", valor: 2 } }
// nuevaOperacion1 = { tipo: "+", izq: { tipo: "numero", valor: 1 }, der: { tipo: "numero", valor: 2 } }

// operacionAnterior = { tipo: "+", izq: { tipo: "numero", valor: 1 }, der: { tipo: "numero", valor: 2 } }
// operacionActual2 = { tipo: "+", der: { tipo: "numero", valor: 3 } }
// nuevaOperacion2 = { tipo: "+", izq: { tipo: "+", izq: { tipo: "numero", valor: 1 }, der: { tipo: "numero", valor: 2 } }, der: { tipo: "numero", valor: 3 } }

// operacionAnterior = { tipo: "+", izq: { tipo: "+", izq: { tipo: "numero", valor: 1 }, der: { tipo: "numero", valor: 2 } }, der: { tipo: "numero", valor: 3 } }
// operacionActual3 = { tipo: "+", der: { tipo: "numero", valor: 4 } }
// nuevaOperacion3 = { tipo: "+", izq: { tipo: "+", izq: { tipo: "+", izq: { tipo: "numero", valor: 1 }, der: { tipo: "numero", valor: 2 } }, der: { tipo: "numero", valor: 3 } }, der: { tipo: "numero", valor: 4 } }

Suma = izq:Multiplicacion expansion:(
  op:("+" / "-") der:Multiplicacion { return { tipo: op, der } }
)* { 
  return expansion.reduce(
    (operacionAnterior, operacionActual) => {
      const { tipo, der } = operacionActual
      return { tipo, izq: operacionAnterior, der }
    },
    izq
  )
}

// ExpansionSuma = "+" der:Multiplicacion { return { tipo: "+", der } }

Multiplicacion = izq:Unaria expansion:(
  op:("*" / "/") der:Unaria { return { tipo: op, der } }
)* {
    return expansion.reduce(
      (operacionAnterior, operacionActual) => {
        const { tipo, der } = operacionActual
        return { tipo, izq: operacionAnterior, der }
      },
      izq
    )
}

// ExpansionMultiplicacion = "*" der:Numero { return { tipo: "*", der } }

Unaria = "-" num:Numero { return { tipo: "-", der: num } }
/ Numero


Numero = [0-9]+( "." [0-9]+ )? { return{ tipo: "numero", valor: parseFloat(text(), 10) } }
  / "(" exp:Expresion ")" { return { tipo: "parentesis", exp } }