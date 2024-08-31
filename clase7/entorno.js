

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
    set(nombre, valor) {
        // TODO: si algo ya está definido, lanzar error
        this.valores[nombre] = valor;
    }

    /**
     * @param {string} nombre
     */
    get(nombre) {
        const valorActual = this.valores[nombre];

        if (valorActual !== undefined) return valorActual;

        if (!valorActual && this.padre) {
            return this.padre.get(nombre);
        }

        throw new Error(`Variable ${nombre} no definida`);
    }

    /**
   * @param {string} nombre
   * @param {any} valor
   */
    assign(nombre, valor) {
        const valorActual = this.valores[nombre];

        if (valorActual !== undefined) {
            this.valores[nombre] = valor;
            return;
        }

        if (!valorActual && this.padre) {
            this.padre.assign(nombre, valor);
            return;
        }

        throw new Error(`Variable ${nombre} no definida`);
    }
}