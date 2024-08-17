import * as monaco from 'https://cdn.jsdelivr.net/npm/monaco-editor@0.50.0/+esm'

import { parse } from './analizador.js'
import { InterpreterVisitor } from './interprete.js'


// const editor = document.getElementById('editor')
const btn = document.getElementById('btn')
const ast = document.getElementById('ast')
const salida = document.getElementById('salida')


const editor = monaco.editor.create(
    document.getElementById('editor'), {
    value: '',
    language: 'java',
    theme: 'vs-dark'
},
);

btn.addEventListener('click', () => {
    const codigoFuente = editor.getValue()
    const sentencias = parse(codigoFuente)
    // ast.innerHTML = JSON.stringify(sentencias, null, 2)

    const interprete = new InterpreterVisitor()

    // for (const sentencia of sentencias) {
    //     sentencia.accept(interprete)
    // }
    console.log({ sentencias })
    sentencias.forEach(sentencia => sentencia.accept(interprete))

    salida.innerHTML = interprete.salida
})