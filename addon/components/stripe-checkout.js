import Ember from 'ember';
import layout from '../templates/components/stripe-checkout';
import { invokeAction } from 'ember-invoke-action';

/**
 * Stripe checkout component for accepting payments with
 * an embedded form.
 *
 * Stripe docs: https://stripe.com/docs/tutorials/checkout
 * List of possible Stripe options: https://stripe.com/docs/checkout#integration-simple-options
 *
 * Usage:
 * {{stripe-checkout
 *   description=billingPlan.description
 *   amount=billingPlan.amount
 * }}
 *
 */
export default Ember.Component.extend({
  classNames: ['stripe-checkout'],
  attributeBindings: ['isDisabled:disabled'],
  tagName: 'button',
  layout,

  stripe: Ember.inject.service(),
  source: Ember.computed.oneWay('stripe'),

  /**
   * Bind to this attribute to disable the stripe
   * button until the user completes prior requirements
   * (like choosing a plan)
   */
  isDisabled: false,

  label: 'Pay with card',

  /**
   * Kick up the modal if we're clicked
   */
  click(e) {
    e.preventDefault();
    this.openCheckout();
  },

  /**
   * Opens the Stripe modal for payment
   */
  openCheckout() {
    this.get('source').open();
  },

  closeCheckout() {
    this.get('source').close();
  },

  init() {
    this._super(...arguments);
    this.get('source').registerComponent(this);
  },

  willDestroyElement() {
    this._super(...arguments);

    this.closeCheckout();
    this.get('source').registerComponent(null);
  },

  actions: {
    onOpened() {
      invokeAction(this, 'onOpened');
    },

    onClosed() {
      invokeAction(this, 'onClosed');
    }
  }
});
