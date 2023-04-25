export default () => ({
  updateDocumentTitle: () => undefined,
  isBeta: () => false,
  analytics: {
    track: () => fetch('/analytics/track'),
  },
});
