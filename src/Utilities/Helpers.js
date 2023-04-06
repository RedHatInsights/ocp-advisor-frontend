import React from 'react';

export const strong = (str) => <strong>{str}</strong>;

export const setSearchParameter = (name, value) => {
  const current = new URLSearchParams(window.location.search);
  current.set(name, value);
  window.history.replaceState(
    null,
    '',
    window.location.pathname + '?' + current.toString()
  );

  return current.toString();
};
