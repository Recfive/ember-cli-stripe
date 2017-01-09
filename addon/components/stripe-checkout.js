import Ember from 'ember';
import layout from '../templates/components/stripe-checkout';
import StripeConfig from 'ember-cli-stripe/mixins/stripe-config';

/**
 * Stripe checkout component for accepting payments with
 * an embedded form.
 *
 * Stripe docs: https://stripe.com/docs/tutorials/checkout
 *
 * Usage:
 * {{stripe-checkout
 *   description=billingPlan.description
 *   amount=billingPlan.amount
 * }}
 */
export default Ember.Component.extend(StripeConfig, {
  layout: layout,
  tagName: 'button',
  classNames: ['stripe-checkout'],
  attributeBindings: ['isDisabled:disabled'],

  stripe: Ember.inject.service(),
  source: Ember.computed.oneWay('stripe'),

  /**
   * Bind to this attribute to disable the stripe
   * button until the user completes prior requirements
   * (like choosing a plan)
   */
  isDisabled: false,

  /**
   * By default we add stripe button classes.
   * Set to false to disable Stripe styles
   *
   * TODO: Need to load stripe styles in order for this to apply
   */
  useStripeStyles: true,

  setupStripe: Ember.on('init', function() {
    this.get('source').setTarget(this);

    // setup event listeners
    ['opened', 'closed', 'token'].forEach((eventName) => {
      if (this.get(eventName) || eventName === 'token') {
        const eventListener = 'on' + eventName.classify();
        this.get('source').on(eventName, this, eventListener);
      }
    });
 }),

  closeOnDestroy: Ember.on('willDestroyElement', function() {
    this.get('source').setTarget(null);

    ['opened', 'closed', 'token'].forEach((eventName) => {
      if (this.get(eventName)) {
        this.get('source').off(eventName);
      }
    });

    // Close modal if the user navigates away from page
    this.closeCheckout();
  }),

  /**
   * Kick up the modal if we're clicked
   */
  click: function(e) {
    this.openCheckout();
    e.preventDefault();
  },

  /**
   * Opens the Stripe modal for payment
   */
  openCheckout: function() {
    this.get('source').setTarget(this);
    this.get('source').open();
  },

  closeCheckout: function() {
    this.get('source').setTarget(this);
    this.get('source').close();
  },

  /**
   * Send component 'opened' action when the Stripe checkout modal is opened.
   */
  onOpened: function() {
    this.sendAction('opened');
  },

  /**
   * Sends component 'closed' action when the Stripe checkout modal is closed.
   */
  onClosed: function() {
    this.sendAction('closed');
  },

  /**
   * Sends component default action ('action') with the Stripe token when checkout succeeds.
   * Source: https://stripe.com/docs/api#tokens
   */
  onToken: function(token) {
    this.sendAction('action', token, this.get('actionData'));
  },

  hasBlock: Ember.computed.bool('template').readOnly(),
});
