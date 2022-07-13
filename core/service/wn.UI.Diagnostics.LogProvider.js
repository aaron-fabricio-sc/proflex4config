/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Diagnostics.LogProvider.js 4.3.1-210204-21-e1b78e33-1a04bc7d

*/
import{default as Wincor}from"./wn.UI.js";import{default as consoleLogger}from"./wn.UI.Diagnostics.ConsoleLogger.js";const TRACEBITS={20:"LOG_ANALYSE",21:"LOG_EXCEPTION",22:"LOG_ERROR",23:"LOG_WARNING",24:"LOG_INFO",25:"LOG_INOUT",26:"LOG_DATA",27:"LOG_SRVC_INOUT",28:"LOG_SRVC_DATA",29:"LOG_DETAIL"};Wincor.UI.Diagnostics.LogProvider=class{LOG_ANALYSE=20;LOG_EXCEPTION=21;LOG_ERROR=22;LOG_WARNING=23;LOG_INFO=24;LOG_INOUT=25;LOG_DATA=26;LOG_SRVC_INOUT=27;LOG_SRVC_DATA=28;LOG_DETAIL=29;logger=null;loggerHasTraceBits=!0;LOGGER_TYPE_CONSOLE="CONSOLE";LOGGER_TYPE_TRACELOG="TRACELOG";NAME="LogProvider";constructor(){this.setLogger(consoleLogger)}log(r,e){try{this.loggerHasTraceBits?this.logger.log(r,e):this.logger.log(e)}catch(r){consoleLogger.log(e)}}error(r){try{this.logger.error(r)}catch(e){consoleLogger.log(`*** ERROR *** ${r}`)}}onTraceBitsChanged(r){Object.keys(r).forEach((e=>this[TRACEBITS[e]]=r[e]?parseInt(e,10):0))}setLogger(r){this.logger&&this.logger.detachLogger&&this.logger.detachLogger(),this.logger=r,this.logger.attachLogger&&this.logger.attachLogger(),this.loggerHasTraceBits=void 0!==r.isTraceBitSet,this.loggerHasTraceBits&&r.registerTraceBitsChangedHandler&&(r.registerTraceBitsChangedHandler(this.onTraceBitsChanged.bind(this)),this.logger.readCurrentTraceBitStates()),console.log(`. setLogger - loggerHasTraceBits=${this.loggerHasTraceBits}`)}},Wincor.UI.Diagnostics.LogProvider=new Wincor.UI.Diagnostics.LogProvider;export default Wincor.UI.Diagnostics.LogProvider;