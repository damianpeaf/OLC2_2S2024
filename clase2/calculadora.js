import { parse } from './operaciones.js'

const editor = document.getElementById('editor')
const btn = document.getElementById('btn')
const ast = document.getElementById('ast')
const salida = document.getElementById('salida')

const recorrer = (nodo) => {
    if (nodo.tipo === 'numero') return nodo.valor

    const num1 = recorrer(nodo.num1)
    const num2 = recorrer(nodo.num2)

    switch (nodo.tipo) {
        case "suma":
            return num1 + num2
        case "multiplicacion":
            return num1 * num2

    }
}

btn.addEventListener('click', () => {
    const codigoFuente = editor.value
    const arbol = parse(codigoFuente)
    ast.innerHTML = JSON.stringify(arbol, null, 2)
    const resultado = recorrer(arbol)
    salida.innerHTML = resultado
})