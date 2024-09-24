
/*
entrada: 'abc'
salida: [6513249]

'a' -> 97 -> 01100001
'b' -> 98 -> 01100010
= 01100001 01100010

*/

export const stringTo32BitsArray = (str) => {
    const resultado = []
    let elementIndex = 0
    let intRepresentation = 0;
    let shift = 0;

    while (elementIndex < str.length) {
        intRepresentation = intRepresentation | (str.charCodeAt(elementIndex) << shift)
        shift += 8
        if (shift >= 32) {
            resultado.push(intRepresentation)
            intRepresentation = 0
            shift = 0
        }
        elementIndex++
    }

    if (shift > 0) {
        resultado.push(intRepresentation);
    } else {
        resultado.push(0);
    }

    return resultado;
}