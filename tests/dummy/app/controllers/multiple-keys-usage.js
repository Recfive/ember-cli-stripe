import Ember from 'ember';
import Stripe from 'ember-cli-stripe/services/stripe';

export default Ember.Controller.extend({
  stripeSource: Stripe.property()
});
