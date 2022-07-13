define(['durandal/system', 'jquery', 'extensions', 'config/Config'], function(system, jQuery, ext, config) {

    const ANIMATION_TYPES = [
        'bounce',
        'bounceIn',
        'bounceInDown',
        'bounceInLeft',
        'bounceInRight',
        'bounceInUp',
        'bounceOut',
        'bounceOutDown',
        'bounceOutLeft',
        'bounceOutRight',
        'bounceOutUp',
        'fadeIn',
        'fadeInDown',
        'fadeInDownBig',
        'fadeInLeft',
        'fadeInLeftBig',
        'fadeInRight',
        'fadeInRightBig',
        'fadeInUp',
        'fadeInUpBig',
        'fadeOut',
        'fadeOutDown',
        'fadeOutDownBig',
        'fadeOutLeft',
        'fadeOutLeftBig',
        'fadeOutRight',
        'fadeOutRightBig',
        'fadeOutUp',
        'fadeOutUpBig',
        'flip',
        'flipInX',
        'flipInY',
        'flipOutX',
        'flipOutY',
        'lightSpeedIn',
        'lightSpeedOut',
        'rollIn',
        'rollOut',
        'rotateIn',
        'rotateInDownLeft',
        'rotateInDownRight',
        'rotateInUpLeft',
        'rotateInUpRight',
        'rotateOut',
        'rotateOutDownLeft',
        'rotateOutDownRight',
        'rotateOutUpLeft',
        'rotateOutUpRight',
        'hinge',
        'jello',
        'flash',
        'pulse',
        'rubberBand',
        'shake',
        'swing',
        'tada',
        'wiggle',
        'wobble',
        'whirlOut',
        'slideInDown',
        'slideInUp',
        'slideInLeft',
        'slideInRight',
        'slideOutDown',
        'slideOutUp',
        'slideOutLeft',
        'slideOutRight',
        'zoomIn',
        'zoomInDown',
        'zoomInUp',
        'zoomInRight',
        'zoomInLeft',
        'zoomOut',
        'zoomOutDown',
        'zoomOutUp',
        'zoomOutRight',
        'zoomOutLeft'
    ];

    const ANIMATION_END_EVENTS = "animationend";
    const ANIMATION_SETTINGS = {"animation-duration": config.TRANSITION_DURATION + 's', "animation-fill-mode": "both"};
    const App = {
        duration: 1000 * config.TRANSITION_DURATION, // milli seconds
        create: function(context) {
            context = ensureSettings(context);
            return doTrans(context);
        }
    };

    function animValue(type) {
        return typeof type === 'string' ? type : ANIMATION_TYPES[type];
    }

    function ensureSettings(settings) {
        settings.inAnimation = settings.inAnimation || 'fadeInRight';
        settings.outAnimation = settings.outAnimation || 'fadeOut';
        return settings;
    }

    function doTrans(context) {
            const OUT_AN = animValue(context.outAnimation);
            const IN_AN = animValue(context.inAnimation);
            let newChild = context.child,
                $previousView = jQuery(context.activeView),
                $newView = jQuery(newChild).removeClass([OUT_AN, IN_AN]);

        return ext.Promises.promise(function(resolve) {

            function endTransistion(animProms) {
                $previousView.off();
                $newView.off();
                if(!animProms) {
                    resolve();
                }
                else {
                    ext.Promises.Promise.all(animProms).then(() => resolve());
                }
            }

            function newOutTransition() {
                if(config.TRANSITION_ON && ANIMATION_TYPES.includes(OUT_AN)) {
                    let timerId;
                    // proceed after OUT animation
                    function afterOutAnim() {
                        $previousView.css("display", "none");
                        $previousView.removeClass(OUT_AN);
                        $previousView.off();
                        $previousView.css("animation-duration", "");
                        newInTransition();
                    }
                    // install animation end handler
                    $previousView.on(ANIMATION_END_EVENTS, () => {
                        clearTimeout(timerId);
                        afterOutAnim();
                    });
                    // start the OUT animation
                    $previousView.css(ANIMATION_SETTINGS);
                    $previousView.addClass(OUT_AN);
                    // install a supervisor timer
                    timerId = setTimeout(() => {
                        system.log("Warning: transitionHelper::newOutTransition transition failed!");
                        afterOutAnim();
                    }, App.duration * 2);
                }
                else { // transition animation off
                    newInTransition();
                }
            }

            function newInTransition() {
                context.triggerAttach();
                system.updateViewId();
                $newView.css("display", "");
                if(config.TRANSITION_ON && ANIMATION_TYPES.includes(IN_AN)) {
                    let timerId;
                    // proceed after IN animation
                    function afterInAnim() {
                        $newView.removeClass(IN_AN);
                        $newView.off();
                        $previousView.css("animation-duration", "");
                        endTransistion();
                    }
                    // install animation end handler
                    $newView.on(ANIMATION_END_EVENTS, () => {
                        clearTimeout(timerId);
                        afterInAnim();
                    });
                    // start the IN animation
                    $newView.css(ANIMATION_SETTINGS);
                    $newView.addClass(IN_AN);
                    // install a supervisor timer
                    timerId = setTimeout(() => {
                        system.log("Warning: transitionHelper::newInTransition transition failed!");
                        afterInAnim();
                    }, App.duration * 2);
                }
                else { // transition animation off
                    $newView.removeClass(IN_AN + " " + OUT_AN);
                    endTransistion();
                }
            }

            function startTransition() {
                if(context.activeView) {
                    newOutTransition();
                }
                else {
                    newInTransition();
                }
            }

            if(newChild) {
                startTransition();
            }
            else {
                endTransistion();
            }
        });
    }

    return App;
});