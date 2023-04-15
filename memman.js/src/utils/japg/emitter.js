export default class MemmanEmitter {
    constructor() {
        // Un objeto que mantiene un seguimiento de los eventos y sus suscriptores
        this.events = {};
      }
    
      // Método para suscribirse a un evento
      on(event, callback) {
        if (!(event in this.events)) {
          this.events[event] = [];
        }
        this.events[event].push(callback);
      }
    
      // Método para cancelar la suscripción a un evento
      off(event, callback) {
        if (event in this.events) {
          this.events[event] = this.events[event].filter((c) => c !== callback);
        }
      }
    
      // Método para emitir un evento
      emit(event, ...args) {
        if (event in this.events) {
          this.events[event].forEach(callback => callback(...args));
        }
      }
      //Metodo para ver si existe un evento 
      hasEmit(event) {
        return event in this.events && this.events[event].length > 0;
      }
}
