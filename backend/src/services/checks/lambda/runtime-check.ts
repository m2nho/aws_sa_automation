import { BaseCheck } from '../base-check';
import { TrustAdvisorCheck } from '../../../types/checks';

export class LambdaRuntimeCheck extends BaseCheck {
  checkId = 'lambda-runtime';
  checkName = 'Lambda 런타임 버전 검사';
  category = 'security';
  severity = 'MEDIUM' as const;

  private deprecatedRuntimes = ['python2.7', 'nodejs8.10', 'nodejs10.x', 'dotnetcore2.1'];

  async execute(functions: any[]): Promise<TrustAdvisorCheck[]> {
    console.log('Lambda runtime check - functions count:', functions.length);
    const results: TrustAdvisorCheck[] = [];

    if (functions.length === 0) {
      results.push(this.createCheck(
        'lambda-no-functions',
        'Lambda 함수 없음',
        'ok',
        '계정에 Lambda 함수가 없습니다.',
        []
      ));
      return results;
    }

    for (const func of functions) {
      console.log('Checking function:', func.FunctionName, 'Runtime:', func.Runtime);
      
      if (this.deprecatedRuntimes.includes(func.Runtime)) {
        results.push(this.createCheck(
          `lambda-${func.FunctionName}`,
          `Lambda 함수: ${func.FunctionName}`,
          'warning',
          `지원 종료된 런타임(${func.Runtime})을 사용하고 있습니다.`,
          [func.FunctionName]
        ));
      } else {
        results.push(this.createCheck(
          `lambda-${func.FunctionName}`,
          `Lambda 함수: ${func.FunctionName}`,
          'ok',
          `지원되는 런타임(${func.Runtime})을 사용하고 있습니다.`,
          [func.FunctionName]
        ));
      }
    }

    console.log('Lambda check results:', results.length);
    return results;
  }
}