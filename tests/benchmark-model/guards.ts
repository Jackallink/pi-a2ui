export const MODEL={provider:'volcengine-ark',id:'glm-5.3-flash',baseUrl:'https://ark.cn-beijing.volces.com/api/plan/v3'} as const;
export class RequestBudget {
 attempts=0; stopped=false;
 constructor(readonly limit=5){}
 admit(url:string,model:typeof MODEL):void { this.attempts++; }
}
