# appconfig-feature-flags

This repository contains a very simple implementation to use AppConfig feature flags with AWS lambda. Infrastructure is maintained by AWS CDK

## How to Deploy
- Setup the AWS credentials
- Setup the AWS account id and the region you want to deploy in `bin/appconfig-feature-flags.ts``
- Run `npm install`
- Run `cdk deploy`