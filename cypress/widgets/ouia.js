import { Widget } from './widgets';

class GenericWidget extends Widget {
  constructor(type, id = null) {
    if (id) {
      super(
        `[data-ouia-component-type="${type}"][data-ouia-component-id="${id}"]`
      );
    } else {
      super(`[data-ouia-component-type="${type}"]`);
    }
  }
}

class Button extends GenericWidget {
  constructor(id = null) {
    const type = 'PF4/Button';
    super(type, id);
  }
}

export { GenericWidget, Button };
