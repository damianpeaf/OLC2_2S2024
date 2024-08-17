

export class Entorno {

    /**
        * @param {Entorno} padre
     */
    constructor(padre = undefined) {
        this.valores = {};
        this.padre = padre;
    }

    /**
     * @param {string} nombre
     * @param {any} valor
     */
    setVariable(nombre, valor) {
        // TODO: si algo ya está definido, lanzar error
        this.valores[nombre] = valor;
    }

    /**
     * @param {string} nombre
     */
    getVariable(nombre) {
        const valorActual = this.valores[nombre];

        if (valorActual) return valorActual;

        if (!valorActual && this.padre) {
            return this.padre.getVariable(nombre);
        }

        throw new Error(`Variable ${nombre} no definida`);
    }

    /**
   * @param {string} nombre
   * @param {any} valor
   */
    assignVariable(nombre, valor) {
        const valorActual = this.valores[nombre];

        if (valorActual) {
            this.valores[nombre] = valor;
            return;
        }

        if (!valorActual && this.padre) {
            this.padre.assignVariable(nombre, valor);
            return;
        }

        throw new Error(`Variable ${nombre} no definida`);
    }
}