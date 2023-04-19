import createWebWorkersPool from "./createWebWorkersPool";

function createWebWorkersLibrary(workerUrl, options = {}) {
    const {
        errorHandler,
        autoDetectWorkers = true,
        onEvent,
        onWorkerError,
    } = options;

    let numWorkers = autoDetectWorkers ? navigator.hardwareConcurrency || 1 : 1;
    const workersPool = createWebWorkersPool(workerUrl, numWorkers, {
        onWorkerError,
    });

    const groups = {};
    // Ejecuta una tarea en un worker disponible del grupo y maneja los errores.
    function runTask(task, transferList) {
        return workersPool.runTask(task, transferList).catch((error) => {
            if (errorHandler) {
                errorHandler(error);
            } else {
                console.error('Error processing task:', error);
            }
            return Promise.reject(error);
        });
    }
    // Crea un nuevo worker en el grupo.

    function createWorker(customCode) {
        return workersPool.createWorker(customCode);
    }
    // Destruye un worker específico del grupo.

    function destroyWorker(workerId) {
        workersPool.destroyWorker(workerId);
    }
    // Establece el número de workers en el grupo.

    function setNumWorkers(num) {
        numWorkers = num;
        workersPool.setNumWorkers(numWorkers);
    }
    // Reutiliza workers para ejecutar múltiples tareas.

    function reuseWorkers(taskGenerator, transferList) {
        return workersPool.reuseWorkers(taskGenerator, transferList).catch((error) => {
            if (errorHandler) {
                errorHandler(error);
            } else {
                console.error('Error processing tasks:', error);
            }
            return Promise.reject(error);
        });
    }
    // Crea un nuevo grupo de workers.

    function createGroup(name, numWorkers) {
        const group = createWebWorkersPool(workerUrl, numWorkers, {
            onWorkerError,
        });
        groups[name] = group;
        return group;
    }
    // Obtiene un grupo de workers existente por nombre.

    function getGroup(name) {
        return groups[name];
    }
    // Destruye un grupo de workers por nombre.

    function destroyGroup(name) {
        groups[name].destroy();
        delete groups[name];
    }
    // Convierte un valor en un objeto transferible para enviar a un worker.

    function toTransferable(value) {
        if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
            return value;
        }
        return null;
    }
    // Ejecuta una tarea periódicamente en un worker.

    function runTaskPeriodically(task, interval, transferList) {
        const taskWrapper = () => {
            runTask(task, transferList)
                .catch((error) => console.error('Error running periodic task:', error));
        };
        const intervalId = setInterval(taskWrapper, interval);
        return intervalId;
    }
    // Detiene la ejecución periódica de una tarea.

    function stopTaskPeriodically(intervalId) {
        clearInterval(intervalId);
    }
    // Envía un mensaje a un worker específico.

    function postMessageToWorker(workerId, message) {
        workersPool.postMessageToWorker(workerId, message);
    }
    // Registra un evento de escucha en un worker específico.

    function registerWorkerEventListener(workerId, event, listener) {
        workersPool.registerWorkerEventListener(workerId, event, listener);
    }
    // Cancela el registro de un evento de escucha en un worker específico.

    function unregisterWorkerEventListener(workerId, event, listener) {
        workersPool.unregisterWorkerEventListener(workerId, event, listener);
    }
    // Limpia los workers no utilizados en el grupo.

    function cleanUpUnusedWorkers() {
        workersPool.cleanUpUnusedWorkers();
    }
    // Obtiene el estado de un worker específico.

    function getWorkerState(workerId) {
        return workersPool.getWorkerState(workerId);
    }
    // Carga un módulo en un worker.

    function loadModule(moduleUrl) {
        const moduleBlob = new Blob([`
          importScripts('${moduleUrl}');
      
          self.onmessage = (event) => {
            const { functionName, args, transferList } = event.data;
            const result = self[functionName](...args);
            self.postMessage(result, transferList);
          };
        `], { type: 'text/javascript' });
        const moduleUrlObject = URL.createObjectURL(moduleBlob);

        return {
            createWorker(customCode) {
                return new Worker(customCode ? URL.createObjectURL(new Blob([customCode], { type: 'text/javascript' })) : moduleUrlObject);
            },
        };
    }
    // Establece el manejador de errores para las tareas en los workers.

    function setTaskErrorHandler(errorHandler) {
        workersPool.setTaskErrorHandler(errorHandler);
    }

    return {
        runTask,
        createWorker,
        destroyWorker,
        setNumWorkers,
        reuseWorkers,
        createGroup,
        getGroup,
        destroyGroup,
        toTransferable,
        runTaskPeriodically,
        stopTaskPeriodically,
        postMessageToWorker,
        registerWorkerEventListener,
        unregisterWorkerEventListener,
        cleanUpUnusedWorkers,
        getWorkerState,
        loadModule,
        setTaskErrorHandler,
    };

}
export default createWebWorkersLibrary
