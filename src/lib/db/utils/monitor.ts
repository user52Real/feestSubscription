import mongoose from 'mongoose';
import { analyzeQueryPerformance } from './performance';

export async function monitorDatabasePerformance(
    model: mongoose.Model<any>,
    operation: string,
    query: object
) {
    if (process.env.NODE_ENV === 'development') {
      const startTime = Date.now();
      const stats = await analyzeQueryPerformance(model, query);
      const duration = Date.now() - startTime;
  
      console.log(`
        Operation: ${operation}
        Duration: ${duration}ms
        Docs Examined: ${stats.totalDocsExamined}
        Docs Returned: ${stats.nReturned}
        Indexes Used: ${stats.indexesUsed.join(', ') || 'None'}
      `);
    }
}