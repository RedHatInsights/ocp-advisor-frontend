import React from 'react';
import ContentLoader from 'react-content-loader';

const OneLineLoader = () => (
  <ContentLoader height={20}>
    <rect x="0" y="0" rx="4" ry="4" width="300" height="20" />
  </ContentLoader>
);

export { OneLineLoader };
