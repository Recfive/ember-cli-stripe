/* globals StripeCheckout */
import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import config from '../../../config/environment';
import sinon from 'sinon';
import StripeService from 'ember-cli-stripe/services/stripe';

const stripeComponent = Ember.Object.create({
  name: 'Best product'
});

let service;
let stripeHandler = StripeCheckout.configure({ key: config.stripeConfig.key });

moduleFor('service:stripe', 'Unit | Service | stripe', {
  unit: true,

  beforeEach() {
    const { stripeConfig } = config;
    service = StripeService.create({
      stripeDefaultOptions: stripeConfig,
      _stripeHandler: stripeHandler
    });
  },

  afterEach() {
    Ember.run(() => service.destroy());
    service = null;
  }
});

test('getStripeOption() returns the requested key option', function(assert) {
  assert.equal(service.getStripeOption('key'), config.stripeConfig.key);
});

test('getStripeOption() returns all configuration options if no key param is set', function(assert) {
  assert.deepEqual(service.getStripeOption(), config.stripeConfig);
});

test('registerComponent() registers the component as target', function(assert) {
  service.registerComponent(stripeComponent);
  assert.equal(service.get('target'), stripeComponent);
});

test('open() opens the StripeCheckout modal with the correct stripe options', function(assert) {
  assert.expect(2);
  let openStripeCheckout = sinon.stub(stripeHandler, 'open');
  service.open();

  assert.ok(openStripeCheckout.calledOnce);
  assert.ok(openStripeCheckout.calledWith(service.get('stripeOptions')));

  openStripeCheckout.restore();
});

test('close() closes the StripeCheckout modal', function(assert) {
  let closeStripeCheckout = sinon.stub(stripeHandler, 'close');
  service.set('isOpened', true);
  service.close();

  assert.ok(closeStripeCheckout.calledOnce);

  closeStripeCheckout.restore();
});

// test('_getHandler() returns the existing StripeCheckout handler if it already exists', function(assert) {
  // assert.equal(service._getHandler(), stripeHandler);
// });

// test('_getHandler() throws when there\'s no API key set', function(assert) {
  // service = StripeService.create({
    // stripeDefaultOptions: {}
  // });

  // assert.throws(() => {
    // service._getHandler();
  // }, /Stripe key/);
// });

// test('_getHandler() creates a new instance of StripeCheckout with the current API key', function(assert) {
  // service.set('_stripeHandler', null);
  // assert.expect(2);
  // let configureStripeCheckout = sinon.stub(StripeCheckout, 'configure', function(options) {
    // assert.equal(options.key, config.stripeConfig.key);
    // return {};
  // });

  // service._getHandler();
  // assert.ok(Ember.typeOf(service.get('_stripeHandler')) === 'object');

  // configureStripeCheckout.restore();
// });
