import { Duration } from 'aws-cdk-lib';
import {
  CfnApplication,
  CfnConfigurationProfile,
  CfnDeployment,
  CfnEnvironment,
  CfnHostedConfigurationVersion,
} from 'aws-cdk-lib/aws-appconfig';
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';

export class AppConfigDeployment extends CfnDeployment {
  constructor(scope: Construct, id: string) {
    const appConfigLambdaLayerArn =
      'arn:aws:lambda:us-east-1:027255383542:layer:AWS-AppConfig-Extension:128';

    const application = new CfnApplication(scope, `AppConfig Application`, {
      name: 'e-commerce-app',
    });

    const environment = new CfnEnvironment(scope, `AppConfig Environment`, {
      applicationId: application.ref,
      name: 'DEV',
    });

    const configurationProfile = new CfnConfigurationProfile(
      scope,
      `AppConfig ConfigurationProfile`,
      {
        applicationId: application.ref,
        locationUri: 'hosted',
        name: 'login',
        type: 'AWS.AppConfig.FeatureFlags',
      }
    );

    const configurationVersion = new CfnHostedConfigurationVersion(
      scope,
      `AppConfig ConfigurationProfileVersion`,
      {
        applicationId: application.ref,
        configurationProfileId: configurationProfile.ref,
        contentType: 'application/json',
        content: JSON.stringify({
          flags: {
            flagkey: {
              name: 'sso_enabled',
            },
          },
          values: {
            flagkey: {
              enabled: true,
            },
          },
          version: '1',
        }),
        versionLabel: 'version5',
        latestVersionNumber: 5,
      }
    );

    super(scope, id, {
      applicationId: application.ref,
      configurationProfileId: configurationProfile.ref,
      configurationVersion: configurationVersion.ref,
      deploymentStrategyId: 'AppConfig.AllAtOnce',
      environmentId: environment.ref,
    });

    const lambdaFunction = new NodejsFunction(this, 'my-lambda-fn', {
      entry: join(__dirname, '../src/lambdaHandler.ts'),
      runtime: Runtime.NODEJS_18_X,
      handler: 'handler',
      timeout: Duration.seconds(5),
      environment: {
        APPCONFIG_APPLICATION_ID: application.ref,
        APPCONFIG_ENVIRONMENT: environment.name,
        APPCONFIG_CONFIGURATION_ID: configurationProfile.ref,
        FEATURE_FLAG_NAME: 'sso_enabled',
      },
    });

    lambdaFunction.addLayers(
      LayerVersion.fromLayerVersionArn(
        this,
        'AppConfigExtension',
        appConfigLambdaLayerArn
      )
    );

    lambdaFunction.role?.attachInlinePolicy(
      new Policy(this, 'PermissionsForAppConfig', {
        statements: [
          new PolicyStatement({
            actions: [
              'appconfig:StartConfigurationSession',
              'appconfig:GetLatestConfiguration',
            ],
            resources: ['*'],
          }),
        ],
      })
    );
  }
}
