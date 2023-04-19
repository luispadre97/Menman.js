function createWebWorkersPool(workerUrl, numWorkers, options = {}) {
    console.log(workerUrl,'workerUrl')
    const { onWorkerError } = options;
    const workers = [];

    for (let i = 0; i < numWorkers; i++) {
        const worker = new Worker(workerUrl);
        worker.onmessage = (event) => {
            if (onWorkerError && event.data.error) {
                onWorkerError(event.data.error);
            }
        };
        workers.push(worker);
    }

    function runTask(task, transferList) {
        return new Promise((resolve, reject) => {
            const worker = workers.shift();
            if (!worker) {
                reject(new Error('No hay workers disponibles'));
                return;
            }

            worker.onmessage = (event) => {
                workers.push(worker);
                resolve(event.data);
            };

            worker.onerror = (error) => {
                workers.push(worker);
                if (onWorkerError) {
                    onWorkerError(error);
                } else {
                    console.error('Error processing task:', error);
                }
                reject(error);
            };

            worker.postMessage(task, transferList);
        });
    }

    function setNumWorkers(newNumWorkers) {
        while (workers.length < newNumWorkers) {
            const worker = new Worker(workerUrl);
            workers.push(worker);
        }

        while (workers.length > newNumWorkers) {
            const worker = workers.pop();
            worker.terminate();
        }
    }

    return {
        runTask,
        setNumWorkers,
    };
}

export default createWebWorkersPool