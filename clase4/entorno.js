

export class Entorno {
    constructor() {
        this.valores = {};
    }

    /**
     * @param {string} nombre
     * @param {any} valor
     */
    setVariable(nombre, valor) {
        this.valores[nombre] = valor;
    }

    /**
     * @param {string} nombre
     */
    getVariable(nombre) {
        return this.valores[nombre];
    }
}