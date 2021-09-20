import { mount } from '@cypress/react'
import React from 'react';
import {IntlProvider} from 'react-intl';

import { ClusterRules } from './ClusterRules';
import {MemoryRouter} from 'react-router-dom';


it('renders ClusterRules', () => {
    mount(
        <MemoryRouter>
            <IntlProvider locale="en">
                <ClusterRules reports={[]}/>
            </IntlProvider>
        </MemoryRouter>
    )
})