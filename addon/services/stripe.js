/* global StripeCheckout */
import Ember from 'ember';
import stripeConfigOptions from '../utils/configuration-options';
import { invokeAction } from 'ember-invoke-action';

const {
  Service,
  computed,
  getWithDefault,
  assign,
  copy,
  typeOf,
  isBlank,
  RSVP
} = Ember;

let stripeScriptLoaded;

const Stripe = Service.extend({

  /**
   * If the true, the Stripe checkout modal is currently opened.
   */
  isOpened: false,

  componentOptions: computed('target', function() {
    if (!this.get('target')) {
      return {};
    }

    let componentStripeOptions = this.get('target').getProperties(stripeConfigOptions);
    return this._cleanupOptions(componentStripeOptions);
  }).readOnly(),

  stripeOptions: computed('componentOptions',  function() {
    let defaultOptions = getWithDefault(this, 'stripeDefaultOptions', {});
    let options = copy(defaultOptions);
    assign(options, this.get('componentOptions'));

    return this._cleanupOptions(options);
  }).readOnly(),

  _cleanupOptions(options) {
    let cleanedOptions = {};
    for (let key in options) {
      if (typeOf(options[key]) !== 'undefined') {
        cleanedOptions[key] = options[key];
      }
    }

    return cleanedOptions;
  },

  /*
   * Registers a component as the current target of this service
   * @public
   */
  registerComponent(component) {
    this.set('target', component);
  },

  /*
   * Open opens the StripeCheckout payment modal
   * @public
   */
  open() {
    const options = this.get('stripeOptions');
    this.getStripe().then((stripeHandler) => {
      stripeHandler.open(options);
    });
  },

  /*
   * Close closes the StripeCheckout payment modal.
   * @public
   */
  close() {
    if (this.get('isOpened')) {
      this.getStripe().then((stripeHandler) => {
        stripeHandler.close();
      });
    }
  },

  getStripeOption(key) {
    let stripeOptions = this.get('stripeOptions');
    if (isBlank(key)) {
      return stripeOptions;
    }

    return stripeOptions[key];
  },

  _invokeAction() {
    if (!this.get('target')) {
      return;
    }

    invokeAction(this.get('target'), ...arguments);
  },

  loadStripe() {
    if (stripeScriptLoaded) {
      return RSVP.resolve();
    }

    let script = document.createElement('script');
    script.src = 'https://checkout.stripe.com/checkout.js';
    script.async = true;
    script.type = 'text/javascript';

    stripeScriptLoaded = new RSVP.Promise((resolve, reject) => {
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        reject();
      };

      document.body.appendChild(script);
    });

    return stripeScriptLoaded;
  },

  getStripe() {
    if (this.get('_stripeHandler')) {
      return RSVP.resolve(this.get('_stripeHandler'));
    }

    let key = this.getStripeOption('key');
    if (Ember.isNone(key)) {
      throw new Error('Your Stripe key must be set to use the `ember-cli-stripe` addon.');
    }

    return this.loadStripe().then(() => {
      let self = this;
      const handler = StripeCheckout.configure({
        key,
        token(token) {
          self._invokeAction('onToken', token);
        },
        opened() {
          debugger;
          self.set('isOpened', true);
          self._invokeAction('onOpened');
        },
        closed() {
          self.set('isOpened', false);
          self._invokeAction('onClosed');
        }
      });

      this.set('_stripeHandler', handler);

      return handler;
    });
  }
});

export default Stripe.reopenClass({
  property() {
    return Ember.computed(function() {
      return Stripe.create();
    });
  }
});
