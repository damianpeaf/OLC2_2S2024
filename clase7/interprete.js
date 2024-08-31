import { Entorno } from "./entorno.js";
import { BaseVisitor } from "./visitor.js";
import nodos, { Expresion } from './nodos.js'
import { BreakException, ContinueException, ReturnException } from "./transferencia.js";
import { Invocable } from "./invocable.js";
import { embebidas } from "./embebidas.js";
import { FuncionForanea } from "./foreanea.js";
import { Clase } from "./clase.js";
import { Instancia } from "./instancia.js";


export class InterpreterVisitor extends BaseVisitor {

    constructor() {
        super();
        this.entornoActual = new Entorno();

        // funciones embebidas
        Object.entries(embebidas).forEach(([nombre, funcion]) => {
            this.entornoActual.set(nombre, funcion);
        });


        this.salida = '';

        /**
         * @type {Expresion | null}
        */
        this.prevContinue = null;
    }

    interpretar(nodo) {
        return nodo.accept(this);
    }

    /**
      * @type {BaseVisitor['visitOperacionBinaria']}
      */
    visitOperacionBinaria(node) {
        const izq = node.izq.accept(this);
        const der = node.der.accept(this);

        switch (node.op) {
            case '+':
                return izq + der;
            case '-':
                return izq - der;
            case '*':
                return izq * der;
            case '/':
                return izq / der;
            case '<=':
                return izq <= der;
            case '==':
                return izq === der;
            default:
                throw new Error(`Operador no soportado: ${node.op}`);
        }
    }

    /**
      * @type {BaseVisitor['visitOperacionUnaria']}
      */
    visitOperacionUnaria(node) {
        const exp = node.exp.accept(this);

        switch (node.op) {
            case '-':
                return -exp;
            default:
                throw new Error(`Operador no soportado: ${node.op}`);
        }
    }

    /**
      * @type {BaseVisitor['visitAgrupacion']}
      */
    visitAgrupacion(node) {
        return node.exp.accept(this);
    }

    /**
      * @type {BaseVisitor['visitNumero']}
      */
    visitNumero(node) {
        return node.valor;
    }


    /**
     * @type {BaseVisitor['visitDeclaracionVariable']}
     */
    visitDeclaracionVariable(node) {
        const nombreVariable = node.id;
        const valorVariable = node.exp.accept(this);

        this.entornoActual.set(nombreVariable, valorVariable);
    }


    /**
      * @type {BaseVisitor['visitReferenciaVariable']}
      */
    visitReferenciaVariable(node) {
        const nombreVariable = node.id;
        return this.entornoActual.get(nombreVariable);
    }


    /**
      * @type {BaseVisitor['visitPrint']}
      */
    visitPrint(node) {
        const valor = node.exp.accept(this);
        this.salida += valor + '\n';
    }


    /**
      * @type {BaseVisitor['visitExpresionStmt']}
      */
    visitExpresionStmt(node) {
        node.exp.accept(this);
    }

    /**
     * @type {BaseVisitor['visitAsignacion']}
     */
    visitAsignacion(node) {
        // const valor = this.interpretar(node.asgn);
        const valor = node.asgn.accept(this);
        this.entornoActual.assign(node.id, valor);

        return valor;
    }

    /**
     * @type {BaseVisitor['visitBloque']}
     */
    visitBloque(node) {

        const entornoAnterior = this.entornoActual;
        this.entornoActual = new Entorno(entornoAnterior);

        node.dcls.forEach(dcl => dcl.accept(this));

        this.entornoActual = entornoAnterior;
    }

    /**
     * @type {BaseVisitor['visitIf']}
     */
    visitIf(node) {
        const cond = node.cond.accept(this);

        if (cond) {
            node.stmtTrue.accept(this);
            return;
        }

        if (node.stmtFalse) {
            node.stmtFalse.accept(this);
        }

    }

    /**
     * @type {BaseVisitor['visitWhile']}
     */
    visitWhile(node) {
        const entornoConElQueEmpezo = this.entornoActual;

        try {
            while (node.cond.accept(this)) {
                node.stmt.accept(this);
            }
        } catch (error) {
            this.entornoActual = entornoConElQueEmpezo;

            if (error instanceof BreakException) {
                console.log('break');
                return
            }

            if (error instanceof ContinueException) {
                return this.visitWhile(node);
            }

            throw error;

        }
    }

    /**
     * @type {BaseVisitor['visitFor']}
     */
    visitFor(node) {
        // this.prevContinue = node.inc;
        const incrementoAnterior = this.prevContinue;
        this.prevContinue = node.inc;

        const forTraducido = new nodos.Bloque({
            dcls: [
                node.init,
                new nodos.While({
                    cond: node.cond,
                    stmt: new nodos.Bloque({
                        dcls: [
                            node.stmt,
                            node.inc
                        ]
                    })
                })
            ]
        })

        forTraducido.accept(this);

        this.prevContinue = incrementoAnterior;
    }

    /**
     * @type {BaseVisitor['visitBreak']}
     */
    visitBreak(node) {
        throw new BreakException();
    }

    /**
     * @type {BaseVisitor['visitContinue']}
     */
    visitContinue(node) {

        if (this.prevContinue) {
            this.prevContinue.accept(this);
        }

        throw new ContinueException();
    }

    /**
     * @type {BaseVisitor['visitReturn']}
     */
    visitReturn(node) {
        let valor = null
        if (node.exp) {
            valor = node.exp.accept(this);
        }
        throw new ReturnException(valor);
    }

    /**
    * @type {BaseVisitor['visitLlamada']}
    */
    visitLlamada(node) {
        const funcion = node.callee.accept(this);

        const argumentos = node.args.map(arg => arg.accept(this));

        if (!(funcion instanceof Invocable)) {
            throw new Error('No es invocable');
            // 1() "sdalsk"()
        }

        if (funcion.aridad() !== argumentos.length) {
            throw new Error('Aridad incorrecta');
        }

        return funcion.invocar(this, argumentos);
    }

    /**
    * @type {BaseVisitor['visitFuncDcl']}
    */
    visitFuncDcl(node) {
        const funcion = new FuncionForanea(node, this.entornoActual);
        this.entornoActual.set(node.id, funcion);
    }


    /**
    * @type {BaseVisitor['visitClassDcl']}
    */
    visitClassDcl(node) {

        const metodos = {}
        const propiedades = {}

        node.dcls.forEach(dcl => {
            if (dcl instanceof nodos.FuncDcl) {
                metodos[dcl.id] = new FuncionForanea(dcl, this.entornoActual);
            } else if (dcl instanceof nodos.DeclaracionVariable) {
                propiedades[dcl.id] = dcl.exp
            }
        });

        const clase = new Clase(node.id, propiedades, metodos);

        this.entornoActual.set(node.id, clase);

    }

    /**
    * @type {BaseVisitor['visitInstancia']}
    */
    visitInstancia(node) {

        const clase = this.entornoActual.get(node.id);

        const argumentos = node.args.map(arg => arg.accept(this));


        if (!(clase instanceof Clase)) {
            throw new Error('No es posible instanciar algo que no es una clase');
        }



        return clase.invocar(this, argumentos);
    }


    /**
    * @type {BaseVisitor['visitGet']}
    */
    visitGet(node) {

        // var a = new Clase();
        // a.propiedad
        const instancia = node.objetivo.accept(this);

        if (!(instancia instanceof Instancia)) {
            console.log(instancia);
            throw new Error('No es posible obtener una propiedad de algo que no es una instancia');
        }

        return instancia.get(node.propiedad);
    }

    /**
    * @type {BaseVisitor['visitSet']}
    */
    visitSet(node) {
        const instancia = node.objetivo.accept(this);

        if (!(instancia instanceof Instancia)) {
            throw new Error('No es posible asignar una propiedad de algo que no es una instancia');
        }

        const valor = node.valor.accept(this);

        instancia.set(node.propiedad, valor);

        return valor;
    }
}