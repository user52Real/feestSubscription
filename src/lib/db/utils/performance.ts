import mongoose from 'mongoose';

interface ExecutionStats {
  executionTimeMillis: number;
  totalDocsExamined: number;
  nReturned: number;
  indexesUsed: string[];
}

export async function analyzeQueryPerformance(
  model: mongoose.Model<any>,
  query: object,
  options: object = {}
): Promise<ExecutionStats> {
  try {
    const explanation = await model.find(query, null, options)
      .explain("executionStats") as any;

    return {
      executionTimeMillis: explanation.executionStats.executionTimeMillis,
      totalDocsExamined: explanation.executionStats.totalDocsExamined,
      nReturned: explanation.executionStats.nReturned,
      indexesUsed: explanation.queryPlanner.winningPlan.inputStage?.indexName 
        ? [explanation.queryPlanner.winningPlan.inputStage.indexName]
        : []
    };
  } catch (error) {
    console.error('Query performance analysis failed:', error);
    throw error;
  }
}