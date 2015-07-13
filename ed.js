//# Bridge

/*jshint browser:true */
/*globals define */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['backbone', 'underscore', 'bebop'], function (Backbone, _, bebop) {
            // Also create a global in case some scripts
            // that are loaded still are looking for
            // a global even when an AMD loader is in use.
            return (bebop.ed = factory(Backbone, _, bebop));
        });
    } else {
        // Browser globals
        root.bebop.ed = factory(root.Backbone, root._, root.bebop);
        root.bebop.ready(function() {
            bebop.ed.bootstrap(document);
        });
    }
}(self, function (Backbone, _, $) {
    'use strict';

    var definedViews = {};
    var definedModels = {
        'default' : Backbone.Model
    };
    var numRE = /^(\-?[0-9]+|\-?[0-9]*(\.[0-9]+)+)$/;
    // parseVal tries to convert the val from markup to a simple data-type<br/>
    // supported are
    // * `undefined`
    // * `null`
    // * `true`
    // * `false`
    // * `numbers`
    // * `strings`
    // arrays and objects are not supported
    function parseVal(str) {
        if (!str || str === 'undefined') {
            return;
        }
        if (str === 'null') {
            return null;
        }
        if (str === 'true') {
            return true;
        }
        if (str === 'false') {
            return false;
        }
        if (numRE.test(str)) {
            return parseFloat(str);
        }
        return str;
    }

    // parse a string into an object
    // ##### input:
    // `"a:b;c:d;e:f"`
    // ##### output:
    // `{a:"b", c:"d", e:"f"}`
    function getAttrs(propString) {
        var props = propString.split(';');
        return _.reduce(props, function(propMap, prop) {
            var keyval = prop.split(':');
            var k = keyval[0];
            propMap[k] = parseVal(keyval[1]);
            return propMap;
        }, {});
    }

    // finds all targets in the specified context (`element`)
    // and on the element itself
    function getTargets(element) {
        var ret = [];
        var targets = element.all('[data-bebop-target]');
        targets.forEach(function(target) {
            var val = target.data('bebop-target');
            ret.push(val.substring(1, val.length));
        });
        if (element.data('bebop-target')) {
            var val = element.data('bebop-target');
            ret.push(val.substring(1, val.length));
        }
        return _.uniq(ret);
    }

    return {
        // this is the initial logic to be called on an element to bootstrap
        // this looks for all `[data-bb-view]`-elements in the context and inits them
        bootstrap     : function(el) {
            $.all('[data-bebop-view]', el).forEach(function(dec) {
                var name;
                var definition;
                var attrs = {};
                var model;
                var _View;
                if (dec.prop('_view')) {
                    return;
                }

                // get the name of the view, and check if it has been registered
                name = dec.data('bebop-view');
                definition = definedViews[name];
                if (!definition) {
                    window.console.warn('View "' + name + '" not registered');
                    return;
                }

                // is there a model-attribute, and if yes prefill the model for the view
                if (dec.hasAttr('data-bebop-model')) {
                    _.extend(attrs, getAttrs(dec.data('bebop-model')));
                }
                model = new definition.Model(attrs);

                // are there model-targets inside the view, and if so, bind it.
                var targets = getTargets(dec);

                // if we have "bebop.ein", we can establish 2-way data-binding for the model
                if(bebop.ein) {
                    _View = definedViews[name].View.extend({
                        initialize: function () {
                            // we do binding here
                            this.name = name;
                            _.map(targets, function (target) {
                                return binder.call(this, target);
                            }, this);
                            return definedViews[name].View.prototype.initialize.apply(this, arguments);
                        }
                    });
                } else {
                    _View = definedViews[name].View;
                }

                new _View({ // jshint: -W031
                    el    : dec._node,
                    model : model
                });
                // specify on the element, that the view has been initialized
                dec.prop('_view', true);
            });
        },
        // the method in 99.9% of the time to use.
        // this registers a view under the specified name.
        // a model can tell which model to use - if any
        registerView  : function(name, model, definition) {
            if (typeof model === 'function') {
                definition = model;
                model = 'default';
            }
            definedViews[name] = {
                Model : definedModels[model],
                View  : definition
            };
        },
        // this method registers a specific model which then can be used in a view.
        // it is really not that necessary a regular model in backbone can be extended with properties at runtime
        // only do that if you need a model with specific functions that are not already in the default model
        registerModel : function(name, definition) {
            definedModels[name] = definition;
        }
    };
}));