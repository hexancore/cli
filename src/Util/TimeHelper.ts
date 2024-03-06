import { performance } from 'perf_hooks';

export async function measureExecutionTime(id: string, fn: () => Promise<void>): Promise<void> {
  const start = performance.now();
  await fn();
  const end = performance.now();
  console.log(`Time taken to execute ${id} is ${end - start}ms.`);
}