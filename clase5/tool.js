/**
 * DISCLAIMER:
 * Este código fue desarrollado con fines puramente didácticos.
 * Su objetivo principal es demostrar la implementación del patrón de diseño Visitor 
 * utilizando peggy.js como generador de analizadores y agregando anotaciones JSDoc 
 * para mejorar la comprensión y la documentación del código.
 * 
 * La estructura y los conceptos presentados en este archivo tienen la intención de 
 * facilitar el aprendizaje y la enseñanza de patrones de diseño y documentación en 
 * JavaScript. No se recomienda su uso en entornos de producción.
 * 
 * @autor: @damianpeaf
 * 
 */


// import fs from 'fs';
const fs = require('fs')

const types = [
    `
/**
 * @typedef {Object} Location
 * @property {Object} start
 * @property {number} start.offset
 * @property {number} start.line
 * @property {number} start.column
 * @property {Object} end
 * @property {number} end.offset
 * @property {number} end.line
 * @property {number} end.column
*/
    `
]

const configuracionNodos = [
    // Configuracion del nodo inicial
    {
        name: 'Expresion',
        base: true,
        props: [
            {
                name: 'location',
                type: 'Location|null',
                description: 'Ubicacion del nodo en el codigo fuente',
                default: 'null'
            }
        ]
    },
    // Configuracion de los nodos secundarios
    {
        name: 'OperacionBinaria',
        extends: 'Expresion',
        props: [
            {
                name: 'izq',
                type: 'Expresion',
                description: 'Expresion izquierda de la operacion'
            },
            {
                name: 'der',
                type: 'Expresion',
                description: 'Expresion derecha de la operacion'
            },
            {
                name: 'op',
                type: 'string',
                description: 'Operador de la operacion'
            }
        ]
    },
    {
        name: 'OperacionUnaria',
        extends: 'Expresion',
        props: [
            {
                name: 'exp',
                type: 'Expresion',
                description: 'Expresion de la operacion'
            },
            {
                name: 'op',
                type: 'string',
                description: 'Operador de la operacion'
            }
        ]
    },
    {
        name: 'Agrupacion',
        extends: 'Expresion',
        props: [
            {
                name: 'exp',
                type: 'Expresion',
                description: 'Expresion agrupada'
            }
        ]
    },
    {
        name: 'Numero',
        extends: 'Expresion',
        props: [
            {
                name: 'valor',
                type: 'number',
                description: 'Valor del numero'
            }
        ]
    },
    //     DeclaracionVariable
    {
        name: 'DeclaracionVariable',
        extends: 'Expresion',
        props: [
            {
                name: 'id',
                type: 'string',
                description: 'Identificador de la variable'
            },
            {
                name: 'exp',
                type: 'Expresion',
                description: 'Expresion de la variable'
            }
        ]
    },
    // ReferenciaVariable
    {
        name: 'ReferenciaVariable',
        extends: 'Expresion',
        props: [
            {
                name: 'id',
                type: 'string',
                description: 'Identificador de la variable'
            }
        ]
    },
    // Print
    {
        name: 'Print',
        extends: 'Expresion',
        props: [
            {
                name: 'exp',
                type: 'Expresion',
                description: 'Expresion a imprimir'
            }
        ]
    },
    // ExpresionStmt 1+2;
    {
        name: 'ExpresionStmt',
        extends: 'Expresion',
        props: [
            {
                name: 'exp',
                type: 'Expresion',
                description: 'Expresion a evaluar'
            }
        ]
    },
    // Asignacion
    {
        name: 'Asignacion',
        extends: 'Expresion',
        props: [
            {
                name: 'id',
                type: 'string',
                description: 'Identificador de la variable'
            },
            {
                name: 'asgn',
                type: 'Expresion',
                description: 'Expresion a asignar'
            }
        ]
    },
    // Bloque
    {
        name: 'Bloque',
        extends: 'Expresion',
        props: [
            {
                name: 'dcls',
                type: 'Expresion[]',
                description: 'Sentencias del bloque'
            }
        ]
    },
    {
        name: 'If',
        extends: 'Expresion',
        props: [
            {
                name: 'cond',
                type: 'Expresion',
                description: 'Condicion del if'
            },
            {
                name: 'stmtTrue',
                type: 'Expresion',
                description: 'Cuerpo del if'
            },
            {
                name: 'stmtFalse',
                type: 'Expresion|undefined',
                description: 'Cuerpo del else'
            }
        ]
    },
    // While
    {
        name: 'While',
        extends: 'Expresion',
        props: [
            {
                name: 'cond',
                type: 'Expresion',
                description: 'Condicion del while'
            },
            {
                name: 'stmt',
                type: 'Expresion',
                description: 'Cuerpo del while'
            }
        ]
    }
]

let code = ''

// Tipos base
types.forEach(type => {
    code += type + '\n'
})


// // Tipos de nodos
// configuracionNodos.forEach(nodo => {
//     code += `
// /**
//  * @typedef {Object} ${nodo.name}
//  * ${nodo.props.map(prop => `@property {${prop.type}} ${prop.name} ${prop.description}`).join('\n * ')}
// */
//     `
// })

// Tipos del visitor
code += `
/**
 * @typedef {import('./visitor').BaseVisitor} BaseVisitor
 */
`

const baseClass = configuracionNodos.find(nodo => nodo.base)

configuracionNodos.forEach(nodo => {


    code += `
export class ${nodo.name} ${baseClass && nodo.extends ? `extends ${nodo.extends}` : ''} {

    /**
    * @param {Object} options
    * ${nodo.props.map(prop => `@param {${prop.type}} options.${prop.name} ${prop.description}`).join('\n * ')}
    */
    constructor(${!nodo.base && `{ ${nodo.props.map(prop => `${prop.name}`).join(', ')} }` || ''}) {
        ${baseClass && nodo.extends ? `super();` : ''}
        ${nodo.props.map(prop => `
        /**
         * ${prop.description}
         * @type {${prop.type}}
        */
        this.${prop.name} = ${prop.default || `${prop.name}`};
`).join('\n')}
    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visit${nodo.name}(this);
    }
}
    `
})

code += `
export default { ${configuracionNodos.map(nodo => nodo.name).join(', ')} }
`


fs.writeFileSync('./nodos.js', code)
console.log('Archivo de clases de nodo generado correctamente')


// Visitor
// @typedef {import('./nodos').Expresion} Expresion
code = `
/**
${configuracionNodos.map(nodo => `
 * @typedef {import('./nodos').${nodo.name}} ${nodo.name}
`).join('\n')}
 */
`

code += `

/**
 * Clase base para los visitantes
 * @abstract
 */
export class BaseVisitor {

    ${configuracionNodos.map(nodo => `
    /**
     * @param {${nodo.name}} node
     * @returns {any}
     */
    visit${nodo.name}(node) {
        throw new Error('Metodo visit${nodo.name} no implementado');
    }
    `).join('\n')
    }
}
`

fs.writeFileSync('./visitor.js', code)
console.log('Archivo de visitor generado correctamente')