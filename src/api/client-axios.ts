// Stub implementation for apiClient

export const apiClient = {
  get: async () => ({ data: {} }),
  post: async () => ({ data: {} }),
  put: async () => ({ data: {} }),
  delete: async () => ({ data: {} }),
  settings: {
    testProviderConnection: async () => ({
      success: true,
      message: 'Connection successful',
      latency: 100,
    }),
  },
};
