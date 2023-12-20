import { Handler } from 'aws-cdk-lib/aws-lambda';

export const handler: Handler = async (event: any) => {
  const applicationId = process.env.APPCONFIG_APPLICATION_ID;
  const environment = process.env.APPCONFIG_ENVIRONMENT;
  const configurationId = process.env.APPCONFIG_CONFIGURATION_ID;
  const featureFlag = process.env.FEATURE_FLAG_NAME;

  const url = `http://localhost:2772/applications/${applicationId}/environments/${environment}/configurations/${configurationId}`;

  try {
    const response = await fetch(url);
    const responseData = await response.json();

    console.log('data:', JSON.stringify(responseData));
  } catch (error) {
    console.log(console.error);
  }
};
