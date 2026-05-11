const config = {
  logEndpoint: 'http://4.224.186.213/evaluation-service/logs',
  // Token must be injected through environment; never hardcoded
  get bearerToken(): string {
    return process.env.LOG_BEARER_TOKEN ?? '';
  },
};

export default config;
