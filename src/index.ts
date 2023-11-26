import express from 'express';
import FeatureFlagClient from './FeatureFlagClient';

const app = express();
const bankingAppVerificationFeatureFlagClient = new FeatureFlagClient(
  'banking-app',
  'verification-flags',
  'DEV'
);
bankingAppVerificationFeatureFlagClient.initialize();

app.get('/status', async (req: any, res: any) => {
  res.json({ ...bankingAppVerificationFeatureFlagClient.getFlagStatus() });
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
