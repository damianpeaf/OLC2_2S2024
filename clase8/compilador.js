import { registers as r } from "./risc/constantes.js";
import { Generador } from "./risc/generador.js";
import { BaseVisitor } from "./visitor.js";


export class CompilerVisitor extends BaseVisitor {

    constructor() {
        super();
        this.code = new Generador();
    }

    /**
     * @type {BaseVisitor['visitExpresionStmt']}
     */
    visitExpresionStmt(node) {
        node.exp.accept(this);
    }

    /**
     * @type {BaseVisitor['visitNumero']}
     */
    visitNumero(node) {
        this.code.li(r.T0, node.valor);
        // this.code.push(r.T0)
        this.code.push()
    }

    /**
     * @type {BaseVisitor['visitOperacionBinaria']}
     */
    visitOperacionBinaria(node) {
        node.izq.accept(this);
        node.der.accept(this);

        this.code.pop(r.T0);
        this.code.pop(r.T1);

        switch (node.op) {
            case '+':
                this.code.add(r.T0, r.T0, r.T1);
                this.code.push(r.T0);
                break;
            case '-':
                this.code.sub(r.T0, r.T0, r.T1);
                this.code.push(r.T0);
                break;
            case '*':
                this.code.mul(r.T0, r.T0, r.T1);
                this.code.push(r.T0);
                break;
            case '/':
                this.code.div(r.T0, r.T1, r.T2);
                break;
        }
    }

    /**
     * @type {BaseVisitor['visitOperacionUnaria']}
     */
    visitOperacionUnaria(node) {
        node.exp.accept(this);

        this.code.pop(r.T0);

        switch (node.op) {
            case '-':
                this.code.li(r.T1, 0);
                this.code.sub(r.T0, r.T1, r.T0);
                this.code.push(r.T0);
                break;
        }

    }

    /**
     * @type {BaseVisitor['visitAgrupacion']}
     */
    visitAgrupacion(node) {
        return node.exp.accept(this);
    }

    visitPrint(node) {
        node.exp.accept(this);
        this.code.pop(r.A0);
        this.code.printInt();
    }

}