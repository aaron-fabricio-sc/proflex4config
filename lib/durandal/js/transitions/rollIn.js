define(['durandal/system', 'transitions/transitionHelper', 'config/Config'], function(system, helper, config) {
    const settings = {
        inAnimation: config.ANIMATION_IN,
        outAnimation: config.ANIMATION_OUT
    };

    return function(context) {
        system.extend(context, settings);
        return helper.create(context);
    };
});