# appconfig-feature-flags

This repository contains a very simple express server that utilizes the AWS AppConfig feature flags capability

## Configuration

Setup the correct AppConfig application, config profile and the environment that you need to use with the feature flag client.

`new FeatureFlagClient(
  'banking-app',
  'verification-flags',
  'DEV'
);`

## Setting up

1. `npm install`
2. `npm start`
3. Visit `http://localhost:3000/status`
