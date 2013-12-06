define([
    'Underscore'
    , 'tau/core/view-base'
    , 'tau/components/component.container'
    , 'tau/cf.constraints/configurations/configuration.cf.constraints'
], function(_, ViewBase, ComponentContainer, ConfigurationCFConstraints) {

    return ViewBase.extend({
        init: function(config) {
            this._super(config);
        },

        initialize: function() {
            //LEFT BLANK SINCE WORKFLOW CHANGED
        },

        "bus beforeInit": function() {

            var configurator = this.config.context.configurator;
            configurator.getTitleManager().setTitle('CF Constraints');
            var configService = configurator.service('cf.constraints.config');
            var appConfig = this.config;
            var containerConfig = _.extend(appConfig, (new ConfigurationCFConstraints()).getConfig(configService));

            this.container = ComponentContainer.create({
                name: 'cf constraints page container',

                layout: containerConfig.layout,
                template: containerConfig.template,

                extensions: _.union([], containerConfig.extensions || []),
                context: _.extend(appConfig.context, {
                    getCustomFields: function() {
                        return configService.customFields
                    },
                    entity: configService.entity,
                    applicationContext: configService.applicationContext
                })
            });

            this.container.on('afterInit', this['container afterInit'], this);
            this.container.on('afterRender', this['container afterRender'], this);
            this.container.on('componentsCreated', this['container componentsCreated'], this);
            this.container.on('destroy', this['container destroy'], this, {entityDeferred: configService.entityDeferred});

            this.container.initialize(containerConfig);
        },

        'container destroy': function(evtArgs) {
            var entityDeferred = evtArgs.listenerData.entityDeferred;
            if (entityDeferred.state() == 'pending') {
                entityDeferred.reject({
                    response: {
                        Message: "You need to specify required custom fields to perform action"
                    },
                    status: 400
                });
            }
        },

        "container afterInit": function() {
            this.fireAfterInit();
        },

        "container componentsCreated": function(evtArgs) {
            this.fire(evtArgs.name, evtArgs.data);
        },

        "container afterRender": function(evtArgs) {
            this.fireBeforeRender();
            this.element = evtArgs.data.element;
            this.fireAfterRender();
        },

        lifeCycleCleanUp: function() {
            this.destroyContainer();
            this._super();
        },

        destroyContainer: function() {
            if (!this.container) {
                return;
            }

            this.container.destroy();
            this.container = null;
        },

        destroy: function() {
            this.destroyContainer();
            this._super();
        }
    });
});
