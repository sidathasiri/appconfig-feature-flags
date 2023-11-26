import {
  AppConfigDataClient,
  GetLatestConfigurationCommand,
  StartConfigurationSessionCommand,
} from '@aws-sdk/client-appconfigdata';

export default class FeatureFlagClient {
  client: AppConfigDataClient;
  nextToken: string | undefined;
  pollInterval: number;
  flagState = {};
  application: string;
  configProfile: string;
  env: string;

  constructor(
    application: string,
    configProfile: string,
    env: string,
    pollInterval = 15
  ) {
    this.client = new AppConfigDataClient({ region: 'us-east-1' });
    this.pollInterval = pollInterval;
    this.application = application;
    this.configProfile = configProfile;
    this.env = env;
  }

  async getInitialToken() {
    const getSession = new StartConfigurationSessionCommand({
      ApplicationIdentifier: this.application,
      ConfigurationProfileIdentifier: this.configProfile,
      EnvironmentIdentifier: this.env,
      RequiredMinimumPollIntervalInSeconds: this.pollInterval,
    });

    const sessionToken = await this.client.send(getSession);
    return sessionToken.InitialConfigurationToken || '';
  }

  async loadConfiguration() {
    const command = new GetLatestConfigurationCommand({
      ConfigurationToken: this.nextToken,
    });

    try {
      const data = await this.client.send(command);
      this.nextToken = data.NextPollConfigurationToken;
      return data.Configuration;
    } catch (error) {
      console.log('Error occurred:', error);
    }
  }

  async initialize() {
    if (this.nextToken) {
      throw new Error('Client already initialized');
    }
    this.nextToken = await this.getInitialToken();
    const initialConfig = await this.loadConfiguration();
    this.flagState = initialConfig
      ? JSON.parse(initialConfig.transformToString())
      : {};
    console.log('Configuration Data:', this.flagState);
    setInterval(async () => {
      try {
        const data = await this.loadConfiguration();
        let configurationData = data?.transformToString();
        if (configurationData) {
          this.flagState = JSON.parse(configurationData);
          console.log('Configuration Data:', this.flagState);
        } else {
          console.log('No flag changes');
        }
      } catch (error) {
        console.log('Error occurred:', error);
      }
    }, this.pollInterval * 1000);
  }

  getFlagStatus() {
    return this.flagState;
  }
}
