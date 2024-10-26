import * as monaco from 'https://cdn.jsdelivr.net/npm/monaco-editor@0.50.0/+esm'

import { parse } from './analizador.js'
import { CompilerVisitor } from './compilador.js'


// const editor = document.getElementById('editor')
const btn = document.getElementById('btn')
const ast = document.getElementById('ast')
const salida = document.getElementById('salida')


const editor = monaco.editor.create(
    document.getElementById('editor'), {
    value: '',
    language: 'java',
    theme: 'vs-dark'
});

const content = localStorage.getItem('content')
editor.setValue(content || "")

// save content in local storage
editor.onDidChangeModelContent(() => {
    localStorage.setItem('content', editor.getValue())
})

btn.addEventListener('click', () => {
    const codigoFuente = editor.getValue()
    try {


        const sentencias = parse(codigoFuente)
        // ast.innerHTML = JSON.stringify(sentencias, null, 2)

        const interprete = new CompilerVisitor()

        // for (const sentencia of sentencias) {
        //     sentencia.accept(interprete)
        // }
        console.log({ sentencias })
        sentencias.forEach(sentencia => sentencia.accept(interprete))

        salida.innerHTML = interprete.code.toString().replace(/\n/g, '<br>')

    } catch (error) {
        console.log(error)
        // console.log(JSON.stringify(error, null, 2))
        salida.innerHTML = error.message + ' at line ' + error.location.start.line + ' column ' + error.location.start.column
    }
})