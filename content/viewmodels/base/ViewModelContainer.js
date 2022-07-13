/**
 @preserve
 Copyright (c) 2001-2021 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.

 * @module ViewModelContainer
 * @since 1.0/00

$MOD$ ViewModelContainer.js 4.3.1-210521-21-5b4bc154-1a04bc7d
 */
define(["jquery","knockout","durandal/system","plugins/router","ui-content","vm-util/UICommanding","code-behind/ViewHelper","extensions","flexuimapping","vm-util/UIMovements"],(function(e,i,t,n,o,r,s,a,d,l){"use strict";console.log("AMD:ViewModelContainer");const c=Wincor.UI.Diagnostics.LogProvider,E=Wincor.UI.Service.Provider,h=E.ViewService;let v,_=!1;return Wincor.UI.Content.ViewModelContainer=new function(){if(this.serviceEventRegistrations=[],this.EVENT_ON_BEFORE_CLEAN="BEFORE_CLEAN",this.EVENT_ON_MESSAGE_AVAILABLE="MESSAGE_AVAILABLE",this.EVENT_ON_MESSAGE_LEVEL_AVAILABLE="MESSAGE_LEVEL_AVAILABLE",this.LIFE_CYCLE_MODE={DEFAULT:"DEFAULT",STATIC:"STATIC",VIEW_RELATED:"VIEW_RELATED",INDEPENDENT:"INDEPENDENT"},this.RESTORATION_STATE={NONE:"NONE",PRESERVED:"PRESERVED",RESTORED:"RESTORED"},v=this.RESTORATION_STATE.NONE,this.startup=!0,this.isSuspended=!1,this.adaModule=null,this.viewModelHelper=null,this.viewHelper=s,this.deactivatedDfd=a.Promises.deferred(),this.activatedDfd=a.Promises.deferred(),this.updateDfd=a.Promises.deferred(),this.preparedDfd=a.Promises.deferred(),this.activationStartedDfd=a.Promises.deferred(),this.viewActivated=!1,this.whenActivatedObservable=i.observable(!1),this.viewPrepared=!1,this.viewModels=[],this.designTimeRunner=null,this.currentViewKey="*",this.currentViewId="",this.currentBankingContext={},this.suspendedCommands={},this.activationWorkingQueue=(new Wincor.UI.AsyncJobQueue).setName("ActivationQueue"),this.activationWorkingPromise=this.activationWorkingQueue.add(this.activatedDfd.promise),this.preservedVMs=[],this.addActivationDelay=function(e,i,t){c.LOG_DETAIL&&c.log(c.LOG_DETAIL,"> ViewModelContainer::addActivationDelay()");let n=this.activationStartedDfd.promise.isPending();return n&&this.activationWorkingQueue.add(e,void 0,i,t),c.LOG_DETAIL&&c.log(c.LOG_DETAIL,"< ViewModelContainer::addActivationDelay returns "+n),n},this.shutdown=function(){this.viewModels=null,this.viewModelHelper.shutdown(),this.adaModule=null,this.viewHelper.shutdown(),this.viewHelper=null,this.viewModelHelper=null,this.suspendedCommands=null,this.designTimeRunner&&this.designTimeRunner.shutdown(),this.designTimeRunner=null,this.currentBankingContext=null,this.activationWorkingQueue=null,this.activationWorkingPromise=null,this.preservedVMs=null,this.serviceEventRegistrations=null,r.setViewModelContainer(null),d.shutdown(),Wincor.UI.Content.ViewModelContainer=null,c.LOG_ANALYSE&&c.log(c.LOG_ANALYSE,". ViewModelContainer::shutdown ready")},!o.designMode){let e=h.registerForServiceEvent(h.SERVICE_EVENTS.SHUTDOWN,function(){this.reset().then((()=>{this.suspend(),this.deactivate(!0).then((()=>{this.clean(!0),this.shutdown()})).catch((e=>E.propagateError("ViewModelContainer::processShutdown",`deactivate failed ${e}`)))})).catch((e=>E.propagateError("ViewModelContainer::processShutdown",`reset failed ${e}`)))}.bind(this),h.DISPOSAL_TRIGGER_SHUTDOWN);this.serviceEventRegistrations.push(e)}this.getById=function(e){const i=this.viewModels.concat(this.preservedVMs);if(!e){const e=[];for(let t=i.length-1;t>=0;t--)e.push(i[t].viewModel);return e}for(let t=i.length-1;t>=0;t--){let n=i[t];if(n.parameter[0]===e||n.viewModel.observableAreaId===e)return n.viewModel}return null},this.getMainViewModels=function(){const e=this.viewModels.concat(this.preservedVMs);let i=[];for(let t=e.length-1;t>=0;t--){let n=e[t],o=n.viewModel,r=o.lifeCycleMode;(r===this.LIFE_CYCLE_MODE.DEFAULT||r===this.LIFE_CYCLE_MODE.VIEW_RELATED&&0===n.viewKeysForActivation.length||r===this.LIFE_CYCLE_MODE.VIEW_RELATED&&n.viewKeysForActivation.includes(this.currentViewKey))&&i.push(o)}return i},this.isViewModelActive=function(e){let i=!0;if(e&&e.lifeCycleMode===this.LIFE_CYCLE_MODE.VIEW_RELATED)for(let t=this.viewModels.length-1;t>=0;t--){let n=this.viewModels[t];if(n.viewModel.observableAreaId===e.observableAreaId&&!n.viewKeysForActivation.includes(this.currentViewKey)){i=!1,c.LOG_DETAIL&&c.log(c.LOG_DETAIL,"< | VIEW ViewModelContainer::isViewModelActive "+i+" of viewModel="+e.observableAreaId);break}}return i},this.canParticipateOnLifeCycle=function(e){let i=e.viewModel,t=i.lifeCycleMode,n=e.viewKeysForActivation,o=t===this.LIFE_CYCLE_MODE.VIEW_RELATED&&(n.includes(this.currentViewKey)||0===n.length),r=t===this.LIFE_CYCLE_MODE.DEFAULT||t===this.LIFE_CYCLE_MODE.STATIC||t===this.LIFE_CYCLE_MODE.INDEPENDENT||o;return c.LOG_DETAIL&&c.log(c.LOG_DETAIL,"| VIEW ViewModelContainer::canParticipateOnLifeCycle paticipate "+r+" of viewModel="+i.observableAreaId),r},this.sendViewModelEvent=function(e,i){for(let t=this.viewModels.length-1;t>=0;t--)this.viewModels[t].viewModel.onViewModelEvent(e,i)},this.whenActivationStarted=function(e,i,t,n,o){return e&&this.activationStartedDfd.promise.isPending()&&this.activationWorkingQueue.add(e,void 0,i,t,n,o),this.activationStartedDfd.promise},this.whenActivated=function(){return this.activationWorkingPromise},this.whenPrepared=function(){return this.preparedDfd.promise},this.whenDeactivated=function(){return this.deactivatedDfd.promise},this.whenUpdated=function(){return this.updateDfd.promise},this.add=function(e,i,t){return e&&i?(c.LOG_INOUT&&c.log(c.LOG_INOUT,`> | VIEW ViewModelContainer::add(${i}) life-cycle mode=${e.lifeCycleMode}, viewKeysForActivation=${t}`),Array.isArray(i)||(i=[i]),e.__initializedTextAndData=!1,e.__initializedStarted=!1,e.__bindingStarted=!1,e.__bindingsApplied=!1,e.__isReactNextTime=!1,t=t||[],this.viewModels.push({viewModel:e,parameter:i,viewKeysForActivation:Array.isArray(t)?t:[t]})):c.error(" | VIEW Invalid parameter - ViewModelContainer::add()"),c.LOG_INOUT&&c.log(c.LOG_INOUT,"< | VIEW ViewModelContainer::add ->\n"+this.toString()),!0},this.getRestorationState=function(){return v},this.preserve=function(){return c.LOG_INOUT&&c.log(c.LOG_INOUT,"> | VIEW ViewModelContainer::preserve()"),0===this.preservedVMs.length&&(this.preservedVMs=this.viewModels.slice(),this.viewModels=[]),v=this.RESTORATION_STATE.PRESERVED,c.LOG_INOUT&&c.log(c.LOG_INOUT,`< | VIEW ViewModelContainer::preserve returns ${this.preservedVMs.length}`),this.preservedVMs.length},this.isPreserved=function(){return v===this.RESTORATION_STATE.PRESERVED||this.preservedVMs.length>1},this.restore=function(){c.LOG_INOUT&&c.log(c.LOG_INOUT,"> | VIEW ViewModelContainer::restore()");let e=!1;return this.preservedVMs.length>0?(this.viewModels=this.preservedVMs,this.preservedVMs=[],e=!0,v=this.RESTORATION_STATE.RESTORED):v=this.RESTORATION_STATE.NONE,c.LOG_INOUT&&c.log(c.LOG_INOUT,`< | VIEW ViewModelContainer::restore restored VMs: ${this.preservedVMs.length}`),e},this.deactivateViewModels=function(e,i=!1,t=!1){let n=0;return(t?this.viewModels.concat(this.preservedVMs):this.viewModels).forEach((t=>{let o=t.viewModel;if(o.lifeCycleMode!==this.LIFE_CYCLE_MODE.INDEPENDENT&&o.lifeCycleMode!==this.LIFE_CYCLE_MODE.VIEW_RELATED||i&&o.lifeCycleMode===this.LIFE_CYCLE_MODE.VIEW_RELATED||e){try{o.onDeactivated(),o.viewActivated(!1),o.__initializedTextAndData=!1,o.__initializedStarted=!1,o.__isReactNextTime=!0}catch(e){c.error("Problem in onDeactivated! "+e)}n++}else o.lifeCycleMode===this.LIFE_CYCLE_MODE.VIEW_RELATED&&o.__initializedTextAndData&&(o.__isReactNextTime=!0)})),n},this.deactivate=function(e,i=!1){return c.LOG_ANALYSE&&c.log(c.LOG_ANALYSE,"> | VIEW LifeCycle: 02 ViewModelContainer::deactivate()"),a.Promises.promise(((t,n)=>{this.viewModelHelper.clearTimer(),this.viewPrepared=!1,this.viewActivated=!1,this.whenActivatedObservable(!1),d.clean();let r=this.deactivateViewModels(e,i,!0),s=a.Promises.Promise.resolve();(r>0||this.getRestorationState()===this.RESTORATION_STATE.PRESERVED)&&(o.designMode||h.getTimeoutValue()!==h.immediateTimeout&&(this.adaModule.deactivatedForAda=!0),this.adaModule._adaTextMap.autoRepeatTimerActive&&(E.AdaService.autoRepeat(0,null),this.adaModule._adaTextMap.autoRepeatTimerActive=!1),-1!==this.adaModule._adaTextMap.delayedContentTimerActive&&(window.clearTimeout(this.adaModule._adaTextMap.delayedContentTimerActive),this.adaModule._adaTextMap.delayedContentTimerActive=-1),this.activatedDfd.reject("from ViewModelContainer::deactivate"),this.preparedDfd.reject("from ViewModelContainer::deactivate"),this.updateDfd.promise.isPending()&&this.updateDfd.resolve(),this.activatedDfd=a.Promises.deferred(),s=this.activationWorkingQueue.cancel("ViewModelContainer::deactivate").then((()=>{this.activationWorkingQueue&&(this.activationWorkingPromise=this.activationWorkingQueue.add(this.activatedDfd.promise))})).catch((e=>{c.error("Rejected ViewModelContainer::deactivate activationWorkingQueue.cancel failed: "+e),n(`Rejected ViewModelContainer::deactivate activationWorkingQueue.cancel failed: ${e}`)})),this.preparedDfd=a.Promises.deferred(),this.activationStartedDfd=a.Promises.deferred(),this.deactivatedDfd.resolve(),this.deactivatedDfd=a.Promises.deferred(),this.updateDfd=a.Promises.deferred(),this.viewPrepared=!1,this.viewActivated=!1),s.then((()=>{c.LOG_INOUT&&c.log(c.LOG_INOUT,`< | VIEW ViewModelContainer::deactivate - deactivated count: ${r}`),t()})).catch((e=>{c.error("Rejected ViewModelContainer::deactivate "+e),n(`Rejected ViewModelContainer::deactivate ${e}`)}))}))},this.cleanNodes=function(e=!1,t=!0){c.LOG_INOUT&&c.log(c.LOG_INOUT,"> | VIEW ViewModelContainer::cleanNodes()");(e||t?this.viewModels.concat(this.preservedVMs):this.viewModels).forEach((t=>{let n=t.viewModel;if(n.lifeCycleMode!==this.LIFE_CYCLE_MODE.INDEPENDENT&&n.lifeCycleMode!==this.LIFE_CYCLE_MODE.STATIC||e)try{n.__bindingsApplied=!1,n.observableArea&&i.cleanNode(n.observableArea),n.observableArea=null}catch(e){c.error("Exception during ViewModelContainer::cleanNodes  ViewKey: '"+this.currentViewKey+"'\n"+e.message)}})),c.LOG_INOUT&&c.log(c.LOG_INOUT,"< | VIEW ViewModelContainer::cleanNodes")},this.clean=function(e=!1,i=!0){this.startup=!1,c.LOG_INOUT&&c.log(c.LOG_INOUT,"> | VIEW ViewModelContainer::clean()");(e||i?this.viewModels.concat(this.preservedVMs):this.viewModels).forEach((i=>{let t=i.viewModel;if(t.lifeCycleMode!==this.LIFE_CYCLE_MODE.INDEPENDENT||e){t.__initializedTextAndData=!1,t.__initializedStarted=!1,t.__isReactNextTime=!1;try{(t.lifeCycleMode!==this.LIFE_CYCLE_MODE.STATIC||e)&&(t.onViewModelEvent(this.EVENT_ON_BEFORE_CLEAN),t.labels.removeAll(),t.clean(),r.removeCommand(t),r.removeCommand(r.getCommandsByViewModel(t)))}catch(e){c.error("Exception during ViewModelContainer::clean  ViewKey: '"+this.currentViewKey+"'\n"+e.message)}}})),this.viewHelper.clean(),c.LOG_INOUT&&c.log(c.LOG_INOUT,"< | VIEW ViewModelContainer::clean")},this.suspend=function(e=!0){return c.LOG_INOUT&&c.log(c.LOG_INOUT,"> | VIEW ViewModelContainer::suspend()"),this.isSuspended?c.LOG_INOUT&&c.log(c.LOG_INOUT,". | VIEW ViewModelContainer::suspend container already was suspended"):(this.isSuspended=!0,this.viewModelHelper.clearTimer(),this.suspendedCommands=r.suspend([],"vmc:deact",e)),c.LOG_INOUT&&c.log(c.LOG_INOUT,"< | VIEW ViewModelContainer::suspend returns "+JSON.stringify(this.suspendedCommands,null," ")),this.suspendedCommands},this.resume=function(e){c.LOG_INOUT&&c.log(c.LOG_INOUT,"> | VIEW ViewModelContainer::resume()");let i={};return this.isSuspended?(this.isSuspended=!1,i=r.resume(e||this.suspendedCommands)):c.LOG_INOUT&&c.log(c.LOG_INOUT,". | VIEW ViewModelContainer::resume container already was resumed"),c.LOG_INOUT&&c.log(c.LOG_INOUT,"< | VIEW ViewModelContainer::resume - resumed commands: "+Object.keys(i).length),i},this.remove=function(e,i=!0){let t=0;if(c.LOG_INOUT&&c.log(c.LOG_INOUT,"> | VIEW ViewModelContainer::remove("+(e?e.observableAreaId:"all non-static vms")+")"),e&&e.lifeCycleMode===this.LIFE_CYCLE_MODE.INDEPENDENT)return c.LOG_DETAIL&&c.log(c.LOG_DETAIL,"* | VIEW ViewModelContainer::remove - viewmodel is independent, do not remove from container"),-1;i&&this.restore();for(let i=this.viewModels.length-1;i>=0;i--){let n=this.viewModels[i].viewModel;if(n.lifeCycleMode!==this.LIFE_CYCLE_MODE.INDEPENDENT)if(e){if(n===e){e.lifeCycleMode!==this.LIFE_CYCLE_MODE.STATIC?(r.removeDelegate(e),t++,this.viewModels.splice(i,1)):(e.__initializedTextAndData=!1,e.__initializedStarted=!1,e.__isReactNextTime=!1,c.LOG_INOUT&&c.log(c.LOG_INOUT,"* | VIEW ViewModelContainer::remove - viewmodel is static, do not remove from container"));break}}else n.lifeCycleMode!==this.LIFE_CYCLE_MODE.STATIC?(c.LOG_DETAIL&&c.log(c.LOG_DETAIL,`. | VIEW removing vm for: ${n.parameter}`),t++,r.removeDelegate(n),this.viewModels.splice(i,1)):(n.__initializedTextAndData=!1,n.__initializedStarted=!1,n.__isReactNextTime=!1)}return c.LOG_INOUT&&c.log(c.LOG_INOUT,"< | VIEW ViewModelContainer::remove returns: "+t),t},this.removeAll=function(){c.LOG_INOUT&&c.log(c.LOG_INOUT,"> | VIEW ViewModelContainer::removeAll()"),this.remove(),c.LOG_INOUT&&c.log(c.LOG_INOUT,"< | VIEW ViewModelContainer::removeAll")},this.toString=function(){let e="";for(let i=this.viewModels.length-1;i>=0;i--)e+=`ViewModel[${i}]: observableAreaId:${this.viewModels[i].viewModel.observableAreaId} / parameter: ${this.viewModels[i].parameter}\n`;return e},this.setAttributes=function(e){try{if(c.LOG_INOUT&&c.log(c.LOG_INOUT,`> ViewModelContainer::setAttributes(${JSON.stringify(e)}) -  number of vms: ${this.viewModels.length}`),e)for(let i=this.viewModels.length-1;i>=0;i--)Object.assign(this.viewModels[i].viewModel,e);c.LOG_INOUT&&c.log(c.LOG_INOUT,"< ViewModelContainer::setAttributes")}catch(e){if(o.designMode)throw e;E.propagateError("ViewModelContainer::setAttributes","OTHER",e)}},this.setViewKey=function(e){this.currentViewKey=e,this.adaModule.setViewKey(e),this.viewModelHelper.setViewKey(e)},this.setViewId=function(e){this.currentViewId=e,t.setViewId(e)},this.size=function(){return this.viewModels.length},this.dispatch=function(e,i,t){let n;if(c.LOG_DETAIL&&c.log(c.LOG_DETAIL,"> ViewModelContainer::dispatch("+e+", "+i+")"),this.isSuspended)c.LOG_DETAIL&&c.log(c.LOG_DETAIL,". ViewModelContainer::dispatch functionName="+e+" will not be delivered. Container is suspended");else if(e){let r,s;void 0===i&&(i=[]),Array.isArray(i)||(i=[i]);const a=this.viewModels.concat(this.preservedVMs);for(let d=a.length-1;d>=0;d--)if(s=a[d],r=s.viewModel,r.lifeCycleMode!==this.LIFE_CYCLE_MODE.VIEW_RELATED||s.viewKeysForActivation.includes(this.currentViewKey))if(r[e]&&"function"==typeof r[e])try{if(n=r[e].apply(r,i),t)try{t(n,r)}catch(e){o.designMode?c.error("ViewModelContainer::dispatch callback failed: "+e):E.propagateError("ViewModelContainer::dispatch","OTHER",e)}}catch(e){c.error("ViewModelContainer::dispatch "+e)}else c.LOG_DETAIL&&c.log(c.LOG_DETAIL,". ViewModelContainer::dispatch functionName="+e+" not found or not a function ' parameter"+JSON.stringify(a[d].parameter))}else c.error("ViewModelContainer::dispatch functionName not given");c.LOG_DETAIL&&c.log(c.LOG_DETAIL,"< ViewModelContainer::dispatch")},this.initDesignTimeRunner=function(){const e=this;return a.Promises.promise((function(i,t){!o.designMode&&!o.designModeExtended||_?i():require(["vm-util/DesignTimeRunner"],(n=>{e.designTimeRunner=n,e.designTimeRunner.initialize().then((()=>{e.setAttributes({designTimeRunner:n}),_=!0,c.LOG_DETAIL&&c.log(c.LOG_DETAIL,". ViewModelContainer::initDesignTimeRunner initialized"),i()})).catch((e=>t(e)))}))}))},this.initialize=async function(){c.LOG_ANALYSE&&c.log(c.LOG_ANALYSE,"> | VIEW LifeCycle: 11 ViewModelContainer::initialize");try{return this.viewModelHelper.isPopupActive()&&(await this.viewModelHelper.hidePopupMessage(),v===this.RESTORATION_STATE.PRESERVED&&this.restore()),await this.prepareView(),this.viewPrepared=!0,await this.adaModule.initialize(),this.setAttributes({currentView:window.document.location.href}),this.preparedDfd.resolve(),o.designMode||h.firePrepared(),c.LOG_ANALYSE&&c.log(c.LOG_ANALYSE,"< | VIEW LifeCycle: 12 ViewModelContainer::initialize preparation ready!"),this.activatedDfd.promise}catch(e){this.activatedDfd.reject(`from ViewModelContainer::initialize ${this.currentViewKey}`),c.LOG_INOUT&&c.log(c.LOG_INOUT,`. | VIEW ViewModelContainer::initialize caught ${e}`)}},this.resetViewStates=function(){const e=this.viewModels.length;let i,t=o.designMode?{}:h.viewContext.viewConfig.commandconfig;for(let n=0;n<e;n++)i=this.viewModels[n].viewModel,r.resetViewStates(i,void 0,t)},this.refresh=async function(){c.LOG_INOUT&&c.log(c.LOG_INOUT,"> | VIEW ViewModelContainer::refresh()");const e=this;this.viewModelHelper.isPopupActive()&&(await this.viewModelHelper.hidePopupMessage(),v===this.RESTORATION_STATE.PRESERVED&&this.restore()),this.updateDfd.resolve(),await this.deactivate().then((()=>(this.resetViewStates(),this.doInit("refresh").then((()=>a.Promises.Promise.all(e.viewModels.map((i=>{const t=i.viewModel;return t.__initializedTextAndData&&t.__bindingsApplied||!e.canParticipateOnLifeCycle(i)?a.Promises.Promise.resolve():a.Promises.promise(function(e,i,n){if(e.__bindingsApplied)return e.initTextAndData().then((()=>{i()})).catch((e=>{n(e)}));e.__bindingStarted=!0,e.applyBindings(document.getElementById(t.observableAreaId)).then((()=>{e.__bindingStarted=!1,e.__initializedTextAndData?i():e.initTextAndData().then((()=>{i()})).catch((e=>{n(e)}))})).catch((e=>{n(e)}))}.bind(null,t))}))))).then((()=>{this.viewHelper.updateViewKey(this.currentViewKey);const i=n.activeItem();return n.trigger("router:navigation:composition-update",i,i,n),"softkey"===this.viewHelper.viewType&&this.viewHelper.moveSlideIndicator(0),i.compositionUpdated&&i.compositionUpdated(!0),l.triggerUpdate(),e.initialize()})).then((()=>{c.LOG_INOUT&&c.log(c.LOG_INOUT,"< | VIEW ViewModelContainer::refresh()")})).catch((e=>{c.error(`ViewModelContainer::refresh failed: ${e}`)}))))).catch((e=>{c.error(`ViewModelContainer::refresh failed while calling deactivate: ${e}`)}))},this.doInit=function(e){c.LOG_ANALYSE&&c.log(c.LOG_ANALYSE,"> | VIEW LifeCycle: 04 ViewModelContainer::doInit("+e+")");const i=this,t=this.viewModels.length;let n,r,s,l,v,_,u,I,w=[],T=a.Promises.Promise.resolve();return o.designModeExtended&&(T=a.Promises.promise(((e,i)=>{this.designTimeRunner.getFlowActionPlugIn().then((t=>{if(t&&t[0].onPrepare){let n={currentViewKey:()=>this.currentViewKey,viewConfig:h.viewContext.viewConfig,container:this,serviceProvider:E};t[0].onPrepare(n).then((()=>e())).catch((e=>{c.error(`ViewModelContainer::doInit Error during preparation of a business logic step for ${t[1]}`),i(`ViewModelContainer::doInit Error during preparation of a business logic step: ${e}`)}))}else e()})).catch((e=>{c.error(`ViewModelContainer::doInit Error loading flow action plugin, cause: ${e}`),i(`ViewModelContainer::doInit Error loading flow action plugin, cause: ${e}`)}))}))),a.Promises.Promise.all([d.getBankingContextData(this.currentViewKey,this),T]).then((e=>{for(let a=0;a<t;a++){if(n=i.viewModels[a],r=n.viewModel,s=r.__initializedTextAndData,v=n.parameter,_=r.lifeCycleMode,u=n.viewKeysForActivation,l=_===i.LIFE_CYCLE_MODE.VIEW_RELATED,I=l&&u.includes(i.currentViewKey),l&&r.__lastActiveViewKey!==i.currentViewKey&&(r.__initializedTextAndData=!1,r.__initializedStarted=!1,s=!1),r.setViewKey(i.currentViewKey),o.designMode)r.viewConfig=i.designTimeRunner.getViewConfig();else{let e=h.viewContext.viewConfig;r.viewConfig=e||{}}if(r.bankingContext=e[0],i.bankingContext=e[0],i.currentBankingContext=e[0],i.designTimeRunner&&!r.designTimeRunner&&(r.designTimeRunner=i.designTimeRunner),!s&&!r.__initializedStarted&&i.canParticipateOnLifeCycle(n)){r.__initializedStarted=!0,c.LOG_DATA&&c.log(c.LOG_DATA,". ViewModelContainer::doInit observing viewModel with '"+JSON.stringify(v)+"', lifeCycleMode="+_+", viewKeysForActivation="+(0===u.length?"*":u)),l&&(r.__lastActiveViewKey=i.currentViewKey);try{r.__isReactNextTime&&(_===i.LIFE_CYCLE_MODE.DEFAULT||_===i.LIFE_CYCLE_MODE.STATIC||I)&&r.onReactivated(),r.observe.apply(r,v);let e=r.onInitTextAndData.apply(r,[{textKeys:[],dataKeys:[]}]);e&&e.then?w.push(e):c.error("ViewModelContainer::doInit - onInitTextAndData of "+v+"/"+r.observableAreaId+" did not return promise!")}catch(e){if(r.__initializedStarted=!1,o.designMode)throw e;E.propagateError("ViewModelContainer::doInit","OTHER",e)}}}return c.LOG_INOUT&&c.log(c.LOG_INOUT,"< ViewModelContainer::doInit"),a.Promises.promise((function(e,t){a.Promises.Promise.all(w).then((()=>{c.LOG_ANALYSE&&c.log(c.LOG_ANALYSE,". | VIEW LifeCycle: 05 ViewModelContainer::doInit vmOnInitTextAndDataPromises resolved"),i.adaModule.baseInitialize().then((()=>{e(!0)}))})).catch((e=>{c.error("ViewModelContainer::doInit failed: "+e),t(`ViewModelContainer::doInit failed: ${e}`)}))}))})).catch((e=>E.propagateError("ViewModelContainer::doInit failed. Cause: "+e,null)))},this.doBind=function(i){const t=this;return c.LOG_ANALYSE&&c.log(c.LOG_ANALYSE,"> | VIEW LifeCycle: 06 ViewModelContainer::doBind("+i?.id+")"),a.Promises.promise(function(i,n,o){const r=t.viewModels.length;let s,d,l=[],E=e(i);try{for(let e=0;e<r;e++)s=t.viewModels[e].viewModel,d=null,i?.id===s.observableAreaId||s.observableAreaId&&(d=E.find(`#${s.observableAreaId}`)).length>0?s.__bindingsApplied||s.__bindingStarted||(s.__bindingStarted=!0,c.LOG_DETAIL&&c.log(c.LOG_DETAIL,". | VIEW ViewModelContainer::doBind calling binding for "+i?.id),l.push(s.applyBindings(d&&0!==d.length?d[0]:i).then(function(e){if(e.__bindingStarted=!1,!e.__initializedTextAndData)return c.LOG_DETAIL&&c.log(c.LOG_DETAIL,". | VIEW ViewModelContainer::doBind calling initTextAndData for "+e.observableAreaId),e.initTextAndData()}.bind(null,s)).catch((e=>{c.error("ViewModelContainer::doBind failed during binding of a viewmodel: "+e),o(!1)})))):t.startup||s.__initializedTextAndData||!t.canParticipateOnLifeCycle(t.viewModels[e])||(c.LOG_DETAIL&&c.log(c.LOG_DETAIL,". | VIEW ViewModelContainer::doBind vm!=view calling initTextAndData for "+s.observableAreaId),l.push(s.initTextAndData()))}catch(e){c.error("doBind error "+e),o(!1)}a.Promises.Promise.all(l).then((()=>{c.LOG_ANALYSE&&c.log(c.LOG_ANALYSE,"< | VIEW LifeCycle: 07 ViewModelContainer::doBind() activation promises resolved for "+i?.id),n(!1)})).catch((e=>o(`one of the promises in bindingPromiseArray has been rejected: ${e}`)))}.bind(null,i))},this.compositionComplete=function(){this.viewActivated||c.LOG_ANALYSE&&c.log(c.LOG_ANALYSE,". | VIEW LifeCycle: 09 container promise resolved ------ compositionComplete ------")},this.prepareView=function(){c.LOG_INOUT&&c.log(c.LOG_INOUT,"> | VIEW ViewModelContainer::prepareView");const e=this,i=o.designMode;try{return i?(c.LOG_INOUT&&c.log(c.LOG_INOUT,"< ViewModelContainer::prepareView"),a.Promises.promise((function(i,t){e.whenPrepared().then((()=>{e.activationStartedDfd.resolve(),e.whenActivated().then((()=>{e.resume(),e.dispatch("viewActivated",[!0]),e.whenActivatedObservable(!0),e.viewActivated=!0})).catch((e=>{t(e)})),e.activatedDfd.resolve()})).catch((e=>{t(e)})),i()}))):a.Promises.promise((function(i,t){let n=h.registerForServiceEvent(h.SERVICE_EVENTS.VIEW_USERINTERACTION_TIMEOUT,h.viewContext.viewConfig&&h.viewContext.viewConfig.popup.ontimeout?e.viewModelHelper.timeoutQuestion.bind(e.viewModelHelper):function(){let i=!1;return e.dispatch("onTimeout",[],(e=>{void 0!==e&&(i=i||e)})),t("prepareView promise rejected while dispatchTimeout on view service event VIEW_USERINTERACTION_TIMEOUT"),i},h.DISPOSAL_TRIGGER_UNLOAD);e.serviceEventRegistrations.push(n),n=h.registerForServiceEvent(h.SERVICE_EVENTS.TURN_ACTIVE,(function(){c.LOG_ANALYSE&&c.log(c.LOG_ANALYSE,"* | VIEW LifeCycle: 13 ------ TURN_ACTIVE arrived ------"),e.resume(),e.activationStartedDfd.resolve(),e.whenActivated().then((function(){e.dispatch("viewActivated",[!0]),e.whenActivatedObservable(!0),e.viewActivated?c.LOG_DETAIL&&c.log(c.LOG_DETAIL,"* | VIEW - already interactive"):(e.viewActivated=!0,c.LOG_ANALYSE&&c.log(c.LOG_ANALYSE,"* | VIEW LifeCycle: 14 ------ promise resolved fireActivated ------"),h.fireActivated())})).catch((function(i){e.reset(),E.propagateError("ViewModelContainer::dispatchActivate","ActivationWorkingQueue has been rejected: "+i)})),e.activatedDfd.resolve()}),h.DISPOSAL_TRIGGER_ONETIME),e.serviceEventRegistrations.push(n),n=h.registerForServiceEvent(h.SERVICE_EVENTS.VIEW_CLOSING,(function(){o.designModeExtended&&h.deregisterServiceEvents(h.DISPOSAL_TRIGGER_UNLOAD,h.SERVICE_EVENTS.VIEW_USERINTERACTION_TIMEOUT),e.suspend(),t("prepareView promise rejected while view service event VIEW_CLOSING")}),h.DISPOSAL_TRIGGER_ONETIME),e.serviceEventRegistrations.push(n),n=h.registerForServiceEvent(h.SERVICE_EVENTS.SUSPEND,(function(){e.suspend(!1)})),e.serviceEventRegistrations.push(n),n=h.registerForServiceEvent(h.SERVICE_EVENTS.RESUME,(function(){e.resume()})),e.serviceEventRegistrations.push(n),n=h.registerForServiceEvent(h.SERVICE_EVENTS.VIEW_BEFORE_CHANGE,(function(){c.LOG_DETAIL&&c.log(c.LOG_DETAIL,"SERVICE_EVENTS.VIEW_BEFORE_CHANGE fired removing all commanding event listeners"),r.removeListeners()}),h.DISPOSAL_TRIGGER_ONETIME),e.serviceEventRegistrations.push(n),n=h.registerForServiceEvent(h.SERVICE_EVENTS.CONTENT_UPDATE,(function(){c.LOG_DETAIL&&c.log(c.LOG_DETAIL,"SERVICE_EVENTS.CONTENT_UPDATE fired add delegate to all"),r.addDelegate({delegate:e.viewModelHelper.onButtonPressedBeepHandling,context:e.viewModelHelper,priority:!0,typeFilter:[r.CMDTYPES.BUTTON,r.CMDTYPES.CHECKBOX,r.CMDTYPES.RADIOBUTTON]})}),h.DISPOSAL_TRIGGER_UNLOAD),e.serviceEventRegistrations.push(n),n=h.registerForServiceEvent(h.SERVICE_EVENTS.VIEW_ACTIVATED,(function(){c.LOG_DETAIL&&c.log(c.LOG_DETAIL,"SERVICE_EVENTS.VIEW_ACTIVATED fired add delegate to all"),r.addDelegate({delegate:e.viewModelHelper.onButtonPressedBeepHandling,context:e.viewModelHelper,priority:!0,typeFilter:[r.CMDTYPES.BUTTON,r.CMDTYPES.CHECKBOX,r.CMDTYPES.RADIOBUTTON]})}),h.DISPOSAL_TRIGGER_UNLOAD),e.serviceEventRegistrations.push(n),i(),c.LOG_INOUT&&c.log(c.LOG_INOUT,"< | VIEW ViewModelContainer::prepareView")}))}catch(e){i||E.propagateError("ViewModelContainer::prepareView","OTHER",e)}},this.reset=function(){const e="ViewModelContainer::reset";return a.Promises.promise(((i,t)=>{c.LOG_INOUT&&c.log(c.LOG_INOUT,"> | VIEW ViewModelContainer::reset()"),this.serviceEventRegistrations.forEach((e=>h.deregisterFromServiceEvent(e))),this.serviceEventRegistrations=[],this.activationWorkingQueue.cancel(e).then((()=>r.cancelEppProcessing())).then((()=>{this.activationStartedDfd.reject(e),this.activationStartedDfd=a.Promises.deferred(),c.LOG_INOUT&&c.log(c.LOG_INOUT,"< | VIEW ViewModelContainer::reset"),i()})).catch((e=>{o.designMode||E.propagateError(" | VIEW ViewModelContainer::reset",e,null),t(e)}))}))}},r.setViewModelContainer(Wincor.UI.Content.ViewModelContainer),d.setViewModelContainer(Wincor.UI.Content.ViewModelContainer),Wincor.UI.Content.ViewModelContainer}));