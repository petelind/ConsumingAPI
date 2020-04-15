"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events = require("@aws-cdk/aws-events");
const targets = require("@aws-cdk/aws-events-targets");
const lambda = require("@aws-cdk/aws-lambda");
const dynamodb = require("@aws-cdk/aws-dynamodb");
const cdk = require("@aws-cdk/core");
const path = require("path");
class LambdaCronStack extends cdk.Stack {
    constructor(app, id) {
        super(app, id);
        const ApiTOKEN = new cdk.CfnParameter(this, "ApiTOKEN", { type: "String",
            description: "iexcloud api token" });
        const TestENVIRONMENT = new cdk.CfnParameter(this, "TestENVIRONMENT", { type: "String",
            description: "iexcloud test environment toggle", default: 'False' });
        const TestSTOCKS = new cdk.CfnParameter(this, "TestSTOCKS", { type: "String",
            description: "iexcloud test stocks environment toggle", default: 'False' });
        const JsonLOGS = new cdk.CfnParameter(this, "JsonLOGS", { type: "String",
            description: "iexcloud json logs environment toggle", default: 'True' });
        const layer = new lambda.LayerVersion(this, 'Dependencies', {
            code: lambda.Code.fromAsset(path.join(__dirname, '.build/reqs')),
            compatibleRuntimes: [lambda.Runtime.PYTHON_3_8],
            description: 'ConsumingAPI dependecies',
        });
        const dynamoTable = new dynamodb.Table(this, 'CDKIexSnapshot', {
            partitionKey: {
                name: 'symbol',
                type: dynamodb.AttributeType.STRING
            },
            tableName: 'CDKIexSnapshot',
            // The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
            // the new table, and it will remain in your account until manually deleted. By setting the policy to 
            // DESTROY, cdk destroy will delete the table (even if it has data in it)
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
        const lambdaFn = new lambda.Function(this, 'ConsumingApi', {
            code: lambda.Code.fromAsset(path.join(__dirname, 'src')),
            handler: 'handler.lambda_handler',
            timeout: cdk.Duration.seconds(300),
            runtime: lambda.Runtime.PYTHON_3_8,
            layers: [layer],
            environment: {
                TABLE: dynamoTable.tableName,
                TEST_ENVIRONMENT: TestENVIRONMENT.toString(),
                API_TOKEN: ApiTOKEN.toString(),
                TEST_STOCKS: TestSTOCKS.toString(),
                JSON_LOGS: JsonLOGS.toString(),
            },
        });
        lambdaFn.currentVersion.addAlias('live');
        // Run every day at 6PM UTC
        // See https://docs.aws.amazon.com/lambda/latest/dg/tutorial-scheduled-events-schedule-expressions.html
        const rule = new events.Rule(this, 'Rule', {
            schedule: events.Schedule.expression('cron(0 18 ? * MON-FRI *)')
        });
        dynamoTable.grantReadWriteData(lambdaFn);
        rule.addTarget(new targets.LambdaFunction(lambdaFn));
    }
}
exports.LambdaCronStack = LambdaCronStack;
const app = new cdk.App();
new LambdaCronStack(app, 'LambdaCronExample');
app.synth();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUErQztBQUMvQyx1REFBd0Q7QUFDeEQsOENBQStDO0FBQy9DLGtEQUFtRDtBQUNuRCxxQ0FBc0M7QUFDdEMsNkJBQThCO0FBRTlCLE1BQWEsZUFBZ0IsU0FBUSxHQUFHLENBQUMsS0FBSztJQUM1QyxZQUFZLEdBQVksRUFBRSxFQUFVO1FBQ2xDLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFZixNQUFNLFFBQVEsR0FBRyxJQUFJLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUFDLElBQUksRUFBRSxRQUFRO1lBQ3ZFLFdBQVcsRUFBRSxvQkFBb0IsRUFBQyxDQUFDLENBQUM7UUFDcEMsTUFBTSxlQUFlLEdBQUcsSUFBSSxHQUFHLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRSxFQUFDLElBQUksRUFBRSxRQUFRO1lBQ3JGLFdBQVcsRUFBRSxrQ0FBa0MsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFDLENBQUMsQ0FBQztRQUNwRSxNQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxFQUFDLElBQUksRUFBRSxRQUFRO1lBQzNFLFdBQVcsRUFBRSx5Q0FBeUMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFDLENBQUMsQ0FBQztRQUMzRSxNQUFNLFFBQVEsR0FBRyxJQUFJLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUFDLElBQUksRUFBRSxRQUFRO1lBQ3ZFLFdBQVcsRUFBRSx1Q0FBdUMsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztRQUV4RSxNQUFNLEtBQUssR0FBRyxJQUFJLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRTtZQUMxRCxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDaEUsa0JBQWtCLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQztZQUMvQyxXQUFXLEVBQUUsMEJBQTBCO1NBQ3hDLENBQUMsQ0FBQztRQUdILE1BQU0sV0FBVyxHQUFHLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7WUFDN0QsWUFBWSxFQUFFO2dCQUNaLElBQUksRUFBRSxRQUFRO2dCQUNkLElBQUksRUFBRSxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU07YUFDcEM7WUFDRCxTQUFTLEVBQUUsZ0JBQWdCO1lBRTNCLGdHQUFnRztZQUNoRyxzR0FBc0c7WUFDdEcseUVBQXlFO1lBQ3pFLGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLE9BQU87U0FDekMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxRQUFRLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDekQsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3hELE9BQU8sRUFBRSx3QkFBd0I7WUFDakMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUNsQyxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVO1lBQ2xDLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQztZQUNmLFdBQVcsRUFBRTtnQkFDWCxLQUFLLEVBQUUsV0FBVyxDQUFDLFNBQVM7Z0JBQzVCLGdCQUFnQixFQUFFLGVBQWUsQ0FBQyxRQUFRLEVBQUU7Z0JBQzVDLFNBQVMsRUFBRSxRQUFRLENBQUMsUUFBUSxFQUFFO2dCQUM5QixXQUFXLEVBQUUsVUFBVSxDQUFDLFFBQVEsRUFBRTtnQkFDbEMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxRQUFRLEVBQUU7YUFDL0I7U0FDRixDQUFDLENBQUM7UUFDSCxRQUFRLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN6QywyQkFBMkI7UUFDM0IsdUdBQXVHO1FBQ3ZHLE1BQU0sSUFBSSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFO1lBQ3pDLFFBQVEsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQywwQkFBMEIsQ0FBQztTQUNqRSxDQUFDLENBQUM7UUFFSCxXQUFXLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUN2RCxDQUFDO0NBQ0Y7QUF6REQsMENBeURDO0FBRUQsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDMUIsSUFBSSxlQUFlLENBQUMsR0FBRyxFQUFFLG1CQUFtQixDQUFDLENBQUM7QUFDOUMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGV2ZW50cyA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1ldmVudHMnKTtcbmltcG9ydCB0YXJnZXRzID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWV2ZW50cy10YXJnZXRzJyk7XG5pbXBvcnQgbGFtYmRhID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWxhbWJkYScpO1xuaW1wb3J0IGR5bmFtb2RiID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWR5bmFtb2RiJyk7XG5pbXBvcnQgY2RrID0gcmVxdWlyZSgnQGF3cy1jZGsvY29yZScpO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbmV4cG9ydCBjbGFzcyBMYW1iZGFDcm9uU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihhcHA6IGNkay5BcHAsIGlkOiBzdHJpbmcpIHtcbiAgICBzdXBlcihhcHAsIGlkKTtcblxuICAgIGNvbnN0IEFwaVRPS0VOID0gbmV3IGNkay5DZm5QYXJhbWV0ZXIodGhpcywgXCJBcGlUT0tFTlwiLCB7dHlwZTogXCJTdHJpbmdcIixcbiAgICBkZXNjcmlwdGlvbjogXCJpZXhjbG91ZCBhcGkgdG9rZW5cIn0pO1xuICAgIGNvbnN0IFRlc3RFTlZJUk9OTUVOVCA9IG5ldyBjZGsuQ2ZuUGFyYW1ldGVyKHRoaXMsIFwiVGVzdEVOVklST05NRU5UXCIsIHt0eXBlOiBcIlN0cmluZ1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcImlleGNsb3VkIHRlc3QgZW52aXJvbm1lbnQgdG9nZ2xlXCIsIGRlZmF1bHQ6ICdGYWxzZSd9KTtcbiAgICBjb25zdCBUZXN0U1RPQ0tTID0gbmV3IGNkay5DZm5QYXJhbWV0ZXIodGhpcywgXCJUZXN0U1RPQ0tTXCIsIHt0eXBlOiBcIlN0cmluZ1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcImlleGNsb3VkIHRlc3Qgc3RvY2tzIGVudmlyb25tZW50IHRvZ2dsZVwiLCBkZWZhdWx0OiAnRmFsc2UnfSk7XG4gICAgY29uc3QgSnNvbkxPR1MgPSBuZXcgY2RrLkNmblBhcmFtZXRlcih0aGlzLCBcIkpzb25MT0dTXCIsIHt0eXBlOiBcIlN0cmluZ1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcImlleGNsb3VkIGpzb24gbG9ncyBlbnZpcm9ubWVudCB0b2dnbGVcIiwgZGVmYXVsdDogJ1RydWUnfSk7XG4gICAgXG4gICAgY29uc3QgbGF5ZXIgPSBuZXcgbGFtYmRhLkxheWVyVmVyc2lvbih0aGlzLCAnRGVwZW5kZW5jaWVzJywge1xuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KHBhdGguam9pbihfX2Rpcm5hbWUsICcuYnVpbGQvcmVxcycpKSxcbiAgICAgIGNvbXBhdGlibGVSdW50aW1lczogW2xhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzhdLFxuICAgICAgZGVzY3JpcHRpb246ICdDb25zdW1pbmdBUEkgZGVwZW5kZWNpZXMnLFxuICAgIH0pO1xuXG4gICAgXG4gICAgY29uc3QgZHluYW1vVGFibGUgPSBuZXcgZHluYW1vZGIuVGFibGUodGhpcywgJ0NES0lleFNuYXBzaG90Jywge1xuICAgICAgcGFydGl0aW9uS2V5OiB7XG4gICAgICAgIG5hbWU6ICdzeW1ib2wnLFxuICAgICAgICB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklOR1xuICAgICAgfSxcbiAgICAgIHRhYmxlTmFtZTogJ0NES0lleFNuYXBzaG90JyxcblxuICAgICAgLy8gVGhlIGRlZmF1bHQgcmVtb3ZhbCBwb2xpY3kgaXMgUkVUQUlOLCB3aGljaCBtZWFucyB0aGF0IGNkayBkZXN0cm95IHdpbGwgbm90IGF0dGVtcHQgdG8gZGVsZXRlXG4gICAgICAvLyB0aGUgbmV3IHRhYmxlLCBhbmQgaXQgd2lsbCByZW1haW4gaW4geW91ciBhY2NvdW50IHVudGlsIG1hbnVhbGx5IGRlbGV0ZWQuIEJ5IHNldHRpbmcgdGhlIHBvbGljeSB0byBcbiAgICAgIC8vIERFU1RST1ksIGNkayBkZXN0cm95IHdpbGwgZGVsZXRlIHRoZSB0YWJsZSAoZXZlbiBpZiBpdCBoYXMgZGF0YSBpbiBpdClcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksIC8vIE5PVCByZWNvbW1lbmRlZCBmb3IgcHJvZHVjdGlvbiBjb2RlXG4gICAgfSk7XG5cbiAgICBjb25zdCBsYW1iZGFGbiA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0NvbnN1bWluZ0FwaScsIHtcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChwYXRoLmpvaW4oX19kaXJuYW1lLCAnc3JjJykpLFxuICAgICAgaGFuZGxlcjogJ2hhbmRsZXIubGFtYmRhX2hhbmRsZXInLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzAwKSxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzgsXG4gICAgICBsYXllcnM6IFtsYXllcl0sXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBUQUJMRTogZHluYW1vVGFibGUudGFibGVOYW1lLFxuICAgICAgICBURVNUX0VOVklST05NRU5UOiBUZXN0RU5WSVJPTk1FTlQudG9TdHJpbmcoKSxcbiAgICAgICAgQVBJX1RPS0VOOiBBcGlUT0tFTi50b1N0cmluZygpLFxuICAgICAgICBURVNUX1NUT0NLUzogVGVzdFNUT0NLUy50b1N0cmluZygpLFxuICAgICAgICBKU09OX0xPR1M6IEpzb25MT0dTLnRvU3RyaW5nKCksXG4gICAgICB9LFxuICAgIH0pO1xuICAgIGxhbWJkYUZuLmN1cnJlbnRWZXJzaW9uLmFkZEFsaWFzKCdsaXZlJyk7XG4gICAgLy8gUnVuIGV2ZXJ5IGRheSBhdCA2UE0gVVRDXG4gICAgLy8gU2VlIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9sYW1iZGEvbGF0ZXN0L2RnL3R1dG9yaWFsLXNjaGVkdWxlZC1ldmVudHMtc2NoZWR1bGUtZXhwcmVzc2lvbnMuaHRtbFxuICAgIGNvbnN0IHJ1bGUgPSBuZXcgZXZlbnRzLlJ1bGUodGhpcywgJ1J1bGUnLCB7XG4gICAgICBzY2hlZHVsZTogZXZlbnRzLlNjaGVkdWxlLmV4cHJlc3Npb24oJ2Nyb24oMCAxOCA/ICogTU9OLUZSSSAqKScpXG4gICAgfSk7XG5cbiAgICBkeW5hbW9UYWJsZS5ncmFudFJlYWRXcml0ZURhdGEobGFtYmRhRm4pO1xuICAgIHJ1bGUuYWRkVGFyZ2V0KG5ldyB0YXJnZXRzLkxhbWJkYUZ1bmN0aW9uKGxhbWJkYUZuKSk7XG4gIH1cbn1cblxuY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcbm5ldyBMYW1iZGFDcm9uU3RhY2soYXBwLCAnTGFtYmRhQ3JvbkV4YW1wbGUnKTtcbmFwcC5zeW50aCgpOyJdfQ==