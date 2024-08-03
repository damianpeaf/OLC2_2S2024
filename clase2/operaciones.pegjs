
Expresion = Suma

Suma
  = num1:Multiplicacion "+" num2:Suma { return { tipo: "suma", num1, num2 } }
  / Multiplicacion

Multiplicacion
    = num1:Numero "*" num2:Multiplicacion { return { tipo: "multiplicacion", num1, num2 } }
    / Numero

Numero
= [0-9]+( "." [0-9]+ )? { return{ tipo: "numero", valor: parseFloat(text(), 10) } }
    // = [0-9]+ { return { tipo: "numero", valor: parseInt(text(), 10) } }



// 1 + 2 * 3 + 4
//             |

// Expresion -> Suma1

// Suma1 -> Multiplicacion1 "+" Suma2
// Multiplicacion1 -> Numero1
// Numero1 -> 1

// Suma1 -> 1 "+" Suma2

// Suma2 -> Multiplicacion2 "+" Suma3
// Multiplicacion2 -> Numero2 "*" Multiplicacion3
// Numero2 -> 2
// "*"
// Multiplicacion3 -> Numero3
// Numero3 -> 3

// Suma2 -> 2 * 3 "+" Suma3

// Suma3 -> Numero4
// Numero4 -> 4

// Suma2 -> 2 * 3 + 4

// Suma1 -> 1 + 2 * 3 + 4

// Expresion -> 1 + 2 * 3 + 4