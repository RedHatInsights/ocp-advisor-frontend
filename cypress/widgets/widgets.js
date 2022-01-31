/**
 * Widgets are holders of elements
 * and other Widgets
 */
class Widget {
  locator = null;
  constructor(locator = null) {
    if (locator) {
      this.locator = locator;
    }
  }
  locate() {
    console.log('>>>', this.locator, this.parent);
    if (this.parent && this.parent.locator) {
      // first locate references View, second cypress
      return this.parent.locate().locate(this.locator);
    } else {
      return cy.locate(this.locator);
    }
  }
  static nested(parent, it, ...args) {
    if (it instanceof Widget) {
      // already instanciated object
      it.parent = parent;
      return it;
    } else {
      // instanciate it
      const inst = new it(...args);
      inst.parent = parent;
      return inst;
    }
  }
}

export { Widget };
