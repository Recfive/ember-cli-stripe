import Ember from 'ember';
import StripeConfig from 'ember-cli-stripe/mixins/stripe-config';

var Stripe = Ember.Service.extend(Ember.Evented, StripeConfig, {

  init: function() {
    this._super(...arguments);
    this.setupOptions();
  },

  setupOptions: function() {
    const options = this.get('defaultOptions') || Stripe.defaultOptions;
    for (let key in options) {
      const optionValue = options[key];
      const value = this.getOptionOrDefault(key, optionValue);

      this.set(key, value);
    }
  },

  initHandler: function() {
    var self = this;
    const handler = StripeCheckout.configure({
      key: this.get('key'),
      locale: this.get('locale'),
      token: function(token) {
        self.trigger('token', token);
      },
      opened: function() {
       self.trigger('opened');
      },
      closed: function() {
        self.trigger('closed');
      }
    });

    this.set('handler', handler);
  },

  setTarget: function(component) {
    this.set('target', component);
  },

  open: function() {
    let options = this.getStripeOptions();
    this.getHandler().open(options);
  },

  close: function() {
    this.getHandler().close();
  },

  getHandler: function() {
    if (this.get('handler')) {
      return this.get('handler');
    }

    if (Ember.isNone(this.get('key'))) {
      throw [
        "Your Stripe key must be set to use the `ember-cli-stripe` addon. ",
        "Set the key in your environment.js file (ENV.stripe.key) or set the ",
        "key property on the component when instantiating it in your hbs template. ",
        "Find your Stripe publishable key at https://dashboard.stripe.com/account/apikeys"
      ].join('\n');
    }

    this.initHandler();

    return this.get('handler');
  },

  getStripeOptions: function() {
    const stripeConfigKeys = this.get('stripeConfigOptions');
    var options = this.getProperties(stripeConfigKeys);

    if (this.get('target')) {
      const componentOptions = this.get('target').getProperties(stripeConfigKeys);
      for (let key in componentOptions) {
        const optionValue = componentOptions[key];
        const value = this.getOptionOrDefault(key, optionValue);

        options[key] = value;
      }
    }

    return options;
  },

  getOptionOrDefault: function(key, value) {
    const defaultValue = this.get(key);
    if (Ember.isBlank(value)) {
       return defaultValue;
    }

    return value;
  },
});

export default Stripe.reopenClass({
  defaultOptions: {},

  property() {
    return Ember.computed(function() {
      return Stripe.create();
    });
  },

  setDefaultOptions: function(options) {
    this.defaultOptions = options;
  },
});
