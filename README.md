# Stripe checkout for Ember [![Build Status](https://travis-ci.org/sweettooth/ember-cli-stripe.svg?branch=master)](http://travis-ci.org/sweettooth/ember-cli-stripe)

![Preview](https://www.sweettoothrewards.com/wp-content/uploads/stripe-checkout.png)

## Description
This Ember CLI addon provides a component for adding Stripe checkout functionality to your app and a Stripe service that can be used to dynamically open the Stripe checkout. See https://stripe.com/docs/checkout

## Installation
```sh
npm install ember-cli-stripe --save-dev
```

## Setup
Idealy, you should add at least your Stripe **publishable key** to your app's config, but this can be set as a property on the component too. Any other options you want from the list supported by [Stripe Checkout](#options) can also be specified here.

**environment.js**

```javascript
module.exports = function(environment) {
  var ENV = {
    // ...
    APP: {
    },
    // ...
    stripe: {
        key: 'pk_test_C0sa3IlkLWBlrB8laH2fbqfh'
    },

  };
  // ...

  return ENV;
};
```
**Note:** Using ember-cli version lower than v0.1.2? [Do this extra setup step](https://github.com/sweettooth/ember-cli-stripe#notes-for-ember-cli-pre-v012)

**Important**: Currently this addon does no support using multiple different Stripe keys. If you are intersted in this please open a new issue and we'll see what we can do.

## Component Usage

### Basic Usage
```handlebars
{{stripe-checkout
  image="/square-image.png"
  name="Demo Site"
  description="2 widgets ($20.00)"
  amount=2000
  action="processStripeToken"
}}
```

### Advanced Usage

```handlebars
{{stripe-checkout
  class="btn btn-primary"
  image="/images/logo.png"
  name="Sweet Tooth"
  description=selectedPlan.name
  amount=selectedPlan.price_cents
  label="Subscribe now" 
  panelLabel="Subscribe for {{amount}}/mo"
  isDisabled=payButtonDisabled
  action="processStripeToken"
}}
```

#### Options
The `{{stripe-checkout}}` component supports all [Stripe Checkout options](#options) as well as following component specific ones:

Property              | Purpose
--------------------- | -------------
`isDisabled`          | Whether or not the button is disabled or not
`source`              | A Stripe service instance. When using the Stripe service, for all secondary `{{stripe-checkout}}` components this is required. Check [Using the service with multiple components](#using-service-with-multiple-components)

#### Actions

The primary `action` of this component is called when the Stripe checkout succeeds. Its only param is a [Stripe Token](https://stripe.com/docs/api#tokens) object.

```javascript
import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    /**
     * Receives a Stripe token after checkout succeeds
     * The token looks like this https://stripe.com/docs/api#tokens
     */
    processStripeToken: function(token) {
      // Send token to the server to associate with account/user/etc
    }
  }
});
```

Other supported actions are following [Stripe Checkout](https://stripe.com/docs/checkout#integration-custom)'s callbacks

Action                | Purpose
--------------------- | -------------
`opened`              | The callback to invoke when Checkout is opened (not supported in IE6 and IE7).
`closed`              | The callback to invoke when Checkout is closed (not supported in IE6 and IE7).

## Service Usage
The `{{stripe-checkout}}` component uses a Stripe service under the hood, which can be used to dynamically control the Stripe Checkout. For example, opening the checkout automatically based on a query param that is bound to `showCheckout` property

**Component**

```javascript
import Ember from 'ember';

export default Ember.Component.extend({
  // inject the Stripe service  
  stripe: Ember.inject.service(),
  
  showCheckout: true,
  
  openCheckout: Ember.on('didInsertElement', function() {
    if (this.get('showCheckout')) {
      this.get('stripe').open();
    }
  }),
});
```
**Note:** The Stripe checkout does not necessarily requires you to use it together with a component, but this implies that all configuration options are in the app's `environment.js`.

### Using the service with multiple components<a name="using-service-with-multiple-components"></a>

When using the service to dynamically open the Stripe checkout with multiple `{{stripe-checkout}}` components on the same page, only one of them can be accessed using the injected service. For all the others, you will need to provide a source property, so secondary components should be used as follows:

**Template**

```hbs
{{stripe-checkout source=property}}
```

```js
export default Ember.Component.extend({
  property: Stripe.property(), // or this.set('property', Stripe.create())
  
  showCheckout: true,
  
  openCheckout: Ember.on('didInsertElement', function() {
    if (this.get('showCheckout')) {
      this.get('property').open();
    }
  }),
});
```

## Options<a name="options"></a>
All options from https://stripe.com/docs/checkout are supported.

These options have the default values as mentioned in the official Stripe documentation and can be overwritten in your app's `environment.js` config file or by the component, the later one having priority over the other.


## Notes for ember-cli pre v0.1.2
If you're ember-cli version is pre v0.1.2 add the following script tag to your `index.html`. This script tag is added automatically by the addon for later ember-cli versions.
```html
<script src="https://checkout.stripe.com/checkout.js"></script>
```

## Contributing
PRs welcome!
