/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.

$MOD$ wn.UI.Service.PTService.js 4.3.1-210127-21-34ae33df-1a04bc7d
 */

/**
 * @module
 */
import {default as Wincor} from "./wn.UI";
import {default as LogProvider} from "./wn.UI.Diagnostics.LogProvider";
import getExtensions from "../../lib/internal/wn.UI.extensions.js";
import {default as BaseService} from "./wn.UI.Service.js";
import {default as GetPTService} from "./lib/PTService.js";

const ext = getExtensions({Wincor, LogProvider});

// inject dependencies and export
/**
 * @function
 * @param {Wincor} Wincor
 * @param {Class} Class
 * @param {ext} ext
 * @param {LogProvider} LogProvider
 * @param {BaseService} BaseService
 */
const PTService = GetPTService({ Wincor, ext, LogProvider, BaseService });

export default PTService;
