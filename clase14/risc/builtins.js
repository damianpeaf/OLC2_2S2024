import { registers as r, floatRegisters as f } from "./constantes.js"
import { Generador } from "./generador.js"

/**
 * @param {Generador} code
 */
export const concatString = (code) => {
    // A0 -> dirección en heap de la primera cadena
    // A1 -> dirección en heap de la segunda cadena
    // result -> push en el stack la dirección en heap de la cadena concatenada

    code.comment('Guardando en el stack la dirección en heap de la cadena concatenada')
    code.push(r.HP);

    code.comment('Copiando la 1er cadena en el heap')
    const end1 = code.getLabel()
    const loop1 = code.addLabel()

    code.lb(r.T1, r.A0)
    code.beq(r.T1, r.ZERO, end1)
    code.sb(r.T1, r.HP)
    code.addi(r.HP, r.HP, 1)
    code.addi(r.A0, r.A0, 1)
    code.j(loop1)
    code.addLabel(end1)

    code.comment('Copiando la 2da cadena en el heap')
    const end2 = code.getLabel()
    const loop2 = code.addLabel()

    code.lb(r.T1, r.A1)
    code.beq(r.T1, r.ZERO, end2)
    code.sb(r.T1, r.HP)
    code.addi(r.HP, r.HP, 1)
    code.addi(r.A1, r.A1, 1)
    code.j(loop2)
    code.addLabel(end2)

    code.comment('Agregando el caracter nulo al final')
    code.sb(r.ZERO, r.HP)
    code.addi(r.HP, r.HP, 1)
}


/**
 * 
 * @param {Generador} code 
 */
export const lessOrEqual = (code) => {
    // t1: left operand
    // t0 -> right operand

    /*
    if (left <= right) {
        t0 = 1
        push t0
    } else {
        t0 = 0
        push t0
    }
    */
    const trueLabel = code.getLabel()
    const endLabel = code.getLabel()

    code.bge(r.T0, r.T1, trueLabel) // der >= izq
    code.li(r.T0, 0)
    code.push(r.T0)
    code.j(endLabel)
    code.addLabel(trueLabel)
    code.li(r.T0, 1)
    code.push(r.T0)
    code.addLabel(endLabel)
}

/**
 * 
 * @param {Generador} code 
 */
export const equal = (code) => {

    // t1: left operand
    // t0 -> right operand

    /*
    if (left == right) {
        t0 = 1
        push t0
    } else {
        t0 = 0
        push t0
    }
    */
    const trueLabel = code.getLabel()
    const endLabel = code.getLabel()

    code.beq(r.T0, r.T1, trueLabel) // der == izq
    code.li(r.T0, 0)
    code.push(r.T0)
    code.j(endLabel)
    code.addLabel(trueLabel)
    code.li(r.T0, 1)
    code.push(r.T0)
    code.addLabel(endLabel)

}

// * AQUI PONER FUNCIONES EMBEBIDAS

/**
 * 
 * @param {Generador} code 
 */
export const parseInt = (code) => {

    // A0 -> dirección en heap de la cadena

    code.comment('Buscando el inicio de la parte entera')
    code.add(r.T1, r.A0, r.ZERO)
    code.li(r.T2, 46) // ascii de "."

    const end = code.getLabel()
    const loop = code.addLabel()

    code.lb(r.T0, r.T1)
    code.beq(r.T0, r.ZERO, end) // Fin de la cadena
    code.beq(r.T0, r.T2, end) // Se encontró el punto
    code.addi(r.T1, r.T1, 1)
    code.j(loop)
    code.addLabel(end)

    code.addi(r.T1, r.T1, -1) // Retroceder para no incluir el punto o el fin de la cadena
    code.li(r.T0, 0) // Inicializar el resultado en 0
    code.li(r.T2, 1) // Inicializar el multiplicador en 1 (UNIDADES)

    const convert = code.getLabel()
    const endConvert = code.getLabel()
    const error = code.getLabel()

    code.li(r.T4, 9) // el digito máximo que se puede tener
    code.li(r.T5, 10) // base 10

    code.comment('Convirtiendo la parte entera')
    code.addLabel(convert)
    code.blt(r.T1, r.A0, endConvert) // Se terminó de convertir la parte entera
    code.lb(r.T3, r.T1)
    code.addi(r.T3, r.T3, -48) // Convertir de ascii a entero

    code.blt(r.T3, r.ZERO, error) // No es un dígito
    code.blt(r.T4, r.T3, error) // Es un dígito mayor a 9; 9 < t3

    code.mul(r.T3, r.T3, r.T5) // t0 = t0 * 10
    code.add(r.T0, r.T0, r.T3) // t0 = t0 + t3
    code.mul(r.T2, r.T2, r.T5) // t2 = t2 * 10
    code.addi(r.T1, r.T1, -1)
    code.j(convert)

    const endBuiltin = code.getLabel()

    code.addLabel(endConvert)
    code.push(r.T0)
    code.j(endBuiltin)

    code.addLabel(error)
    code.li(r.T0, 0) // NULL    
    code.push(r.T0)
    code.printStringLiteral("ERROR: No se pudo convertir a entero")

    code.addLabel(endBuiltin)
}


/**
 * 
 * @param {Generador} code 
 */
export const parseFloat = (code) => {

    code.push(r.A0)
    parseInt(code)
    code.pop(r.T0) // Parte entera
    code.pop(r.A0) // Dirección de la cadena

    code.comment('Buscando el inicio de la parte decimal')

    code.add(r.T1, r.A0, r.ZERO)
    code.lb(r.T2, r.T1) // T2 = a un caracter de la cadena
    code.li(r.T3, 46) // ascii de "."

    const initFindLabel = code.getLabel()
    const endFindLabel = code.getLabel()

    code.addLabel(initFindLabel)
    code.beq(r.T2, r.ZERO, endFindLabel) // Fin de la cadena
    code.beq(r.T2, r.T3, endFindLabel) // Se encontró el punto
    code.addi(r.T1, r.T1, 1)
    code.lb(r.T2, r.T1)
    code.j(initFindLabel)
    code.addLabel(endFindLabel)

    code.addi(r.T1, r.T1, 1) // Retroceder para no incluir el punto o el fin de la cadena
    code.add(r.A0, r.T1, r.ZERO) // A0 = Dirección de la parte decimal

    code.push(r.T0) // Guardar la parte entera
    code.push(r.T1) // Guardar la dirección de la parte decimal
    parseInt(code)
    code.pop(r.T2) // Parte decimal en formato entero
    code.pop(r.T1) // Dirección de la parte decimal
    code.pop(r.T0) // Parte entera


    code.comment('Buscando el final de la cadena')
    code.add(r.T3, r.A0, r.ZERO)

    const findEndOfString = code.getLabel()
    const endFindEndOfString = code.getLabel()

    code.lb(r.T4, r.T3)
    code.addLabel(findEndOfString)
    code.beq(r.T4, r.ZERO, endFindEndOfString) // Fin de la cadena
    code.addi(r.T3, r.T3, 1)
    code.lb(r.T4, r.T3)
    code.j(findEndOfString)
    code.addLabel(endFindEndOfString)

    // T0 = Parte entera
    // T1 = Dirección de inicio de la parte decimal
    // T2 = Parte decimal en formato entero
    // T3 = Dirección de fin de la cadena

    code.comment('Calculando la parte decimal')
    code.sub(r.T4, r.T3, r.T1) // T4 = Longitud de la parte decimal. Cuantos decimales tiene
    code.li(r.A0, 1)
    code.li(r.A1, 0)
    code.li(r.A2, 10)

    const encontrarDivisorInicio = code.getLabel()
    const encontrarDivisorFin = code.getLabel()

    code.addLabel(encontrarDivisorInicio)
    code.bge(r.A1, r.T4, encontrarDivisorFin) // Ya se encontró el divisor
    code.mul(r.A0, r.A0, r.A2)
    code.addi(r.A1, r.A1, 1)
    code.j(encontrarDivisorInicio)
    code.addLabel(encontrarDivisorFin)

    code.fcvtsw(f.FA1, r.T2) // Convertir la parte decimal a float
    code.fcvtsw(f.FA2, r.A0) // Convertir el divisor a float
    code.fdiv(f.FA1, f.FA1, f.FA2) // FA1 = FA1 / FA2

    code.fcvtsw(f.FA0, r.T0) // Convertir la parte entera a float

    code.fadd(f.FA0, f.FA0, f.FA1) // FA0 = FA0 + FA1

    code.pushFloat(f.FA0)


}

export const builtins = {
    concatString,
    lessOrEqual,
    equal,
    parseInt,
    parseFloat
}