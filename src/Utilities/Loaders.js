import React from 'react';
import ContentLoader from 'react-content-loader';

const OneLineLoader = () => (
  <ContentLoader height={30}>
    <rect x="0" y="0" rx="4" ry="4" width="300" height="30" />
  </ContentLoader>
);

export { OneLineLoader };
