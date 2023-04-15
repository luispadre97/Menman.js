class Observable {
    constructor(value) {
      // Almacena el valor actual y los suscriptores en un objeto Map
      this.value = value;
      this.subscribers = new Map();
    }
  
    subscribe(subscriber, filter, priority) {
      // Crea un nuevo Map para el nivel de prioridad si aún no existe
      if (!this.subscribers.has(priority)) {
        this.subscribers.set(priority, new Map());
      }
      // Obtiene el Map de suscriptores para la prioridad dada
      const priorityMap = this.subscribers.get(priority);
      // Almacena el suscriptor y el filtro (si se proporciona) en el Map de prioridad
      priorityMap.set(subscriber, filter);
  
      // Devuelve una función que eliminará la suscripción
      return () => {
        // Elimina el suscriptor del Map de prioridad
        priorityMap.delete(subscriber);
        // Si el Map de prioridad está vacío, elimina el nivel de prioridad del objeto Map principal
        if (priorityMap.size === 0) {
          this.subscribers.delete(priority);
        }
      };
    }
  
    notify(newValue) {
      // Actualiza el valor actual
      this.value = newValue;
      // Recorre todos los Map de prioridades en orden descendente
      for (const [, priorityMap] of [...this.subscribers].sort((a, b) => b[0] - a[0])) {
        // Recorre todos los suscriptores en el Map de prioridad
        for (const [subscriber, filter] of priorityMap) {
          // Si no hay filtro o el filtro devuelve verdadero, llama al suscriptor con el nuevo valor
          if (!filter || filter(newValue)) {
            subscriber(newValue);
          }
        }
      }
    }
  
    cache() {
      // Almacena el valor actual
      let cachedValue = this.value;
      // Registra un suscriptor que actualiza el valor almacenado
      const subscription = this.subscribe(newValue => {
        cachedValue = newValue;
      });
      // Devuelve una función que elimina la suscripción y devuelve el valor almacenado
      return () => {
        subscription();
        return cachedValue;
      };
    }
  
    retry(maxRetries = 3, delay = 1000) {
      // Contador de reintentos
      let retries = 0;
      // Función que devuelve una nueva suscripción con reintentos
      const subscription = subscriber => {
        // Función que llama al suscriptor y maneja los errores
        const attempt = () => {
          try {
            subscriber(this.value);
          } catch (error) {
            // Incrementa el contador de reintentos y establece un temporizador para reintentar la suscripción
            retries++;
            if (retries <= maxRetries) {
              setTimeout(attempt, delay);
            } else {
              // Si se alcanza el número máximo de reintentos, arroja un error con el mensaje original
              throw new Error(`Failed after ${maxRetries} retries: ${error.message}`);
            }
          }
        };
        // Devuelve una suscripción normal, pero envuelve el suscriptor en la función de reintentos
        return this.subscribe(attempt);
      };
      // Devuelve una función que toma el suscriptor y devuelve la suscripción con reintentos
      return subscriber => subscription(subscriber);
    }
  }
  
  export default Observable;
  