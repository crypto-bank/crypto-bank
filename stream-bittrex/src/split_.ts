/**
 * Splits 
 */

import * as os from 'os';
import * as cluster from 'cluster';

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;

  for (let i = 0; i < numCPUs; i++) {
    console.log(i)
    const worker = cluster.fork();
    worker.on('online', () => {
      worker.send('hello world');
    });
  }

} else {
  process.on('message', (msg) => {
    console.log(msg)
  });
}
