'use strict';

import dom from '../../src/dom/dom';
import Component from '../../src/component/Component';
import ComponentRegistry from '../../src/component/ComponentRegistry';
import ComponentCollector from '../../src/component/ComponentCollector';

class TestComponent extends Component {
  constructor(opt_config) {
    super(opt_config);
  }
}
ComponentRegistry.register('TestComponent', TestComponent);
TestComponent.ATTRS = {
  bar: {}
};

describe('ComponentCollector', function() {
  it('should not create components on element without data-component attribute', function() {
    var element = createComponentElement();
    element.removeAttribute('data-component');

    var collector = new ComponentCollector();
    collector.extractComponents(element, {});

    assert.deepEqual({}, collector.getComponents());
  });

  it('should not create components on element without their creation data', function() {
    var element = createComponentElement();

    var collector = new ComponentCollector();
    collector.extractComponents(element, {});

    assert.deepEqual({}, collector.getComponents());
  });

  it('should instantiate extracted components', function() {
    var parent = document.createElement('div');
    var element = createComponentElement(parent);

    var collector = new ComponentCollector();
    var creationData = {
      data: {
        bar: 1
      },
      name: 'TestComponent',
      ref: 'comp'
    };
    collector.extractComponents(element, {comp: creationData});

    var components = collector.getComponents();
    assert.strictEqual(1, Object.keys(components).length);
    assert.ok(components.comp instanceof TestComponent);
    assert.strictEqual(1, components.comp.bar);
    assert.strictEqual(parent, components.comp.element.parentNode);
  });

  it('should update extracted component instances', function() {
    var parent = document.createElement('div');
    var element = createComponentElement(parent);

    var collector = new ComponentCollector();
    var creationData = {
      data: {
        bar: 1
      },
      name: 'TestComponent',
      ref: 'comp'
    };
    collector.extractComponents(element, {comp: creationData});

    parent.innerHTML = '';
    dom.append(parent, element);
    creationData.data.bar = 2;
    collector.extractComponents(element, {comp: creationData});

    var components = collector.getComponents();
    assert.strictEqual(2, components.comp.bar);
    assert.strictEqual(parent, components.comp.element.parentNode);
  });

  it('should instantiate extracted component children', function() {
    var element = createComponentElement();

    var collector = new ComponentCollector();
    var creationData = {
      child1: {
        data: {},
        name: 'TestComponent',
        ref: 'child1'
      },
      child2: {
        children: {content: '<div data-component data-ref="child1"></div>'},
        data: {},
        name: 'TestComponent',
        ref: 'child2'
      },
      comp: {
        children: {content: '<div data-component data-ref="child2"></div>'},
        data: {},
        name: 'TestComponent',
        ref: 'comp'
      }
    };
    collector.extractComponents(element, creationData);

    var components = collector.getComponents();
    assert.strictEqual(3, Object.keys(components).length);
    assert.ok(components.comp instanceof TestComponent);
    assert.ok(components.child1 instanceof TestComponent);
    assert.ok(components.child2 instanceof TestComponent);
    assert.deepEqual([components.child2], components.comp.children);
    assert.deepEqual([components.child1], components.child2.children);
  });

  it('should update extracted component children instances', function() {
    var parent = document.createElement('div');
    var element = createComponentElement(parent);

    var collector = new ComponentCollector();
    var creationData = {
      child1: {
        data: {},
        name: 'TestComponent',
        ref: 'child1'
      },
      child2: {
        data: {},
        name: 'TestComponent',
        ref: 'child2'
      },
      comp: {
        children: {
          content: '<div data-component data-ref="child1"></div>' +
            '<div data-component data-ref="child2"></div>'
        },
        data: {},
        name: 'TestComponent',
        ref: 'comp'
      }
    };
    collector.extractComponents(element, creationData);

    parent.innerHTML = '';
    dom.append(parent, element);
    creationData.child1.data.bar = 'child1';
    collector.extractComponents(element, creationData);

    var components = collector.getComponents();
    assert.strictEqual('child1', components.child1.bar);
  });

  it('should separately return components that are not children of others', function() {
    var element = createComponentElement();

    var collector = new ComponentCollector();
    var creationData = {
      child1: {
        data: {},
        name: 'TestComponent',
        ref: 'child1'
      },
      comp: {
        children: {content: '<div data-component data-ref="child1"></div>'},
        data: {},
        name: 'TestComponent',
        ref: 'comp'
      }
    };
    collector.extractComponents(element, creationData);

    var components = collector.getMainComponents();
    assert.strictEqual(1, Object.keys(components).length);
    assert.ok(components.comp instanceof TestComponent);
  });

  function createComponentElement(parent) {
    parent = parent || document.createElement('div');
    var element = document.createElement('div');
    element.setAttribute('data-component', true);
    element.setAttribute('data-ref', 'comp');
    dom.append(parent, element);
    return element;
  }
});