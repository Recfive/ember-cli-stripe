import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import config from '../../../config/environment';
import { invokeAction } from 'ember-invoke-action';

// Stub Stripe service
const stripeStub = Ember.Service.extend({
  stripeOptions: Ember.computed(function() {
    return config.stripeConfig;
  }),

  registerComponent(component) {
    this.set('target', component);
  },
  close() {},
  open() {
    invokeAction(this.get('target'), 'onOpened');
  }
});

moduleForComponent('stripe-checkout', 'Integration | Component | stripe checkout', {
  integration: true,

  beforeEach: function () {
    this.register('config:stripe', config.stripeConfig);
    this.register('service:stripe', stripeStub);
    this.inject.service('stripe', { as: 'stripe' });
  }
});

test('it renders non-block version', function(assert) {
  assert.expect(1);

  this.render(hbs`{{stripe-checkout}}`);

  assert.equal(this.$().text().trim(), 'Pay with card');
});

test('it renders in block form', function(assert) {
  assert.expect(1);

  // Test
  this.render(hbs`
    {{#stripe-checkout name="Demo Site" amount=2000}}
      template block text
    {{/stripe-checkout}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});

test('clicking the button opens the Stripe checkout modal', function(assert) {
  assert.expect(1);

  this.set('externalOnOpened', () => {
    assert.ok(true);
  });

  this.render(hbs`{{stripe-checkout key=config.stripeConfig.key onOpened=(action externalOnOpened)}}`);

  this.$('button').click();
});

