function executeAsWorker(func, ...args){
	const funcText = func.toString();
	const bodyText = funcText.match(/\{[\s\S]*\}/)[0];
	const argsText = funcText.match(/\(.*\)|[\s\S]*?(?=\=\>)/)[0];
	const workerBody = `
		self.addEventListener('message', function(e){
			const wrappedFunc = ${argsText} => ${bodyText};
			const result = wrappedFunc(...e.data);
			self.postMessage(result);
			self.close();
		});
	`;
	return new Promise((resolve, reject) => {
		const workerUrl = URL.createObjectURL(new Blob([workerBody], { type : "text/javascript" }));
		const worker = new Worker(workerUrl);
		worker.postMessage(args);
		worker.onmessage = (e) => resolve(e.data);
	});
}



function memo(func) {
    const memory = new Map();
    return function(...args){
        const argHash = JSON.stringify([...args]);
        if(memory.has(argHash)){
            return memory.get(argHash)
        } else {
            const result = func(...args);
            memory.set(argHash, result);
            return result;
        }
    }
}

