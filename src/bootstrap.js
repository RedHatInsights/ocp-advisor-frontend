import React from 'react';
import { createRoot } from 'react-dom/client';
import AppEntry from './AppEntry';

const container = document.getElementById('root');
// FEC sassPrefix scopes app styles under these classes — ensure they exist on mount.
container?.classList.add('ocp-advisor', 'ocpAdvisor');

const root = createRoot(container);
root.render(<AppEntry />);
