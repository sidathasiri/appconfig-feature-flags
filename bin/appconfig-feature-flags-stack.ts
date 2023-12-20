import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AppConfigDeployment } from './appconfig-deployment';

export class AppconfigFeatureFlagsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new AppConfigDeployment(this, 'appconfig-deployment');
  }
}
