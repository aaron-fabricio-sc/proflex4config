/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ wn.UI.Service.FormatService.js 4.3.1-210203-21-1b8704b6-1a04bc7d
 */

/**
 * @module
 */
const getServiceClass = ({ jQuery, ext, LogProvider, PTService }) => {

    /**
     * @type {Wincor.UI.Diagnostics.LogProvider|*|Wincor.UI.Diagnostics.LogProvider|*}
     * @private
     */
    const _logger = LogProvider;

    let _localizeService;
    let _configService;

    function addGroupSeparator(nStr, decSep, separator) {
        nStr += '';
        let x = nStr.split(decSep);
        let x1 = x[0];
        let x2 = x.length > 1 ? decSep + x[1] : '';
        let rgx = /(\d+)(\d{3})/;
        while(rgx.test(x1)) {
            x1 = x1.replace(rgx, `$1${separator}$2`);
        }
        return x1 + x2;
    }

    return class FormatService extends PTService {

        /**
         * "FormatService" - the logical name of this service as used in the service-provider
         * @const
         * @type {string}
         */
        NAME = "FormatService";

        /**
         * Contains the current banking context data from the business logic.
         * It is set by {@link module:ProFlex4Op}.
         *
         * The FormatSerive uses the -currencyData attribute, which can look like this:
         * <br><code>
         *     bankingContext.currencyData = { iso: "EUR", text: "Euro", ada: "Euro", symbol: "€", exponent: "-2" }
         * </code>
         */
        bankingContext = {};

        /**
         * The configuration object contains language specific attributes which are necessary for general formatting.
         * To each supported ISO code, there is specific set of assigned parameters, which match the formatting parameters of the Localization configuration in the registry.
         * ```
         * config: {
         *   "de-DE": {
         *       "CurrDecimalSep": ",",
         *       "NumGroupSep": ".",
         *       "CurrServerValueOffset": -2,
         *       "NumDecimalSep": ",",
         *       "NumGrouping": 3,
         *       "CurrPositiveOrder": 1,
         *       "CurrGroupSep": ".",
         *       "CurrNegativeOrder": 8,
         *       "CurrNumDigits": 2,
         *       "NumNegativeOrder": 1,
         *       "NumNumDigits": 2,
         *       "CurrCurrencySymbol": "EUR",
         *       "CurrGrouping": 3,
         *       "NumLeadingZero": 1,
         *       "CurrLeadingZero": 1
         *   },
         *   "en-US": {
         *       "CurrDecimalSep": ".",
         *       "NumGroupSep": ",",
         *       "CurrServerValueOffset": -2,
         *       "NumDecimalSep": ".",
         *       "NumGrouping": 3,
         *       "CurrPositiveOrder": 0,
         *       "CurrGroupSep": ",",
         *       "CurrNegativeOrder": 8,
         *       "CurrNumDigits": 2,
         *       "NumNegativeOrder": 1,
         *       "NumNumDigits": 2,
         *       "CurrCurrencySymbol": "$",
         *       "NumLeadingZero": 1,
         *       "CurrLeadingZero": 1,
         *       "CurrGrouping": 3
         * }
         *   ```
         * @type {Object}
         */
        config = {};

        /**
         * See {@link Wincor.UI.Service.PTService#constructor}.
         * Inititializes the FormatService-specific FRM_RESOLVE_REQUEST parameters, so that the CCFormat module is used.
         *
         * @lifecycle service
         */
        constructor(...args) {
            super(...args);
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> FormatService::FormatService");

            this.FRM_RESOLVE_REQUEST.service = this.NAME;
            this.FRM_RESOLVE_REQUEST.FWName = "CCFormat";
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< FormatService::FormatService");
        }
        
        /**
         * This method formats the given value string depending on the formatOption.
         *
         * At least the format options, which are invoked synchronously, must be implemented in "formatHelper()".
         * But also for asynchronous requests we call "formatHelper()" if the format option is implemented there.
         *
         * @param {String | Object} value           The value to be formatted.<br>
         *                                          In case of synchronous format handling (isSynchronous must be true) this argument must be an object
         *                                          in the following format:    <br>
         *                                          <code>{raw: 'unformatted value'}</code>
         * @param {string} formatOption             The formatOption defines how to format the value.
         * @param {function({Object})} callback     The callback will get the result as an object:<br>
         *                                          <code> {raw: "unformatted value", result: "formatted value"} </code>
         * @param {boolean=} isSynchronous          True, if the caller needs to handle the format call in a synchronous way.<br>
         *                                          In this case the value argument must be a plain object where the result is turned back afterwards.
         *                                          Please note which formatOption can handle a synchronous format invocation:<br>
         * @example
         *                                          value=1000  (1000cent)
         *                                          <ul>
         *                                              <li>'#C' ->      10.00</li>
         *                                              <li>'#M' ->     € 10.00</li>
         *                                              <li>'#ATRM0' -> € 10</li>
         *                                              <li>'#aTRM0' -> 10</li>
         *                                              <li>'#SSN' -> 123-45-6789</li>
         *                                              <li>'#i' ->      10 -> deprecated, please use #aTRM0 instead</li>
         *                                              <li>'#X*' ->     **</li>
         *                                              <li>'#x+-4:4'->  xxxxxx1234 -> The char after the '#' is the char ('x') to mask with</li>
         *                                              <li>'#X+-4:4'->  XXXXXX1234 -> The char after the '#' is the char ('X') to mask with</li>
         *                                              <li>'#*+-4:4'->  ******1234 -> The char after the '#' is the char ('*') to mask with</li>
         *                                              <li>'#conditional{'key1':'val1','key2':'val2',...}' -> val1 if value===key1, val2 if value===key2, otherwise unchanged value</li>
         *                                          </ul>
         *                                          All other format options must be handled asynchronous, no matter if "isSynchronous" is true, false or even undefined.
         */
        format(value, formatOption, callback, isSynchronous) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> FormatService::format(value=${value}, formatOption='${formatOption}', isSynchronous=${isSynchronous})`);

            if (!isSynchronous && (!callback || typeof callback !== "function")) {
                _logger.error(`FormatService::format received non-function type <${typeof callback}> as callback argument!`);
                return;
            }

            function formatCallback(message) {
                try {
                    callback({result: message.param3, raw: typeof value === 'object' ? value.raw : value});
                } catch(exception) {
                    _logger.error(`format callback failed ${exception}`);
                }
            }

            // for the following options we use our own formatter currently...
            if(formatOption &&
                (formatOption === "#C" ||
                 formatOption === "#i" || // deprecated and thus will be removed later, behavior is now same as '#aTRM0'
                 formatOption === "#M" ||
                 formatOption === "#ATRM0" ||
                 formatOption === "#aTRM0" ||
                 formatOption === "#SSN" ||
                 formatOption.indexOf("#X") === 0 ||
                 formatOption.indexOf("+-") === 2) ||
                 formatOption.indexOf("#conditional") === 0) {

                if(!isSynchronous) {
                    _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, ". FormatService::format callback call");
                    //Issue 1746190: removed setTimeout (in previous revision), which called the callback. This was not needed and led high performance issues on some systems.
                    callback({result: this.formatHelper(typeof value === 'object' ? value.raw : value, formatOption) });
                } else if(typeof value === 'object' && value.raw !== void 0) {
                    value.result = this.formatHelper(value.raw, formatOption);
                } else {
                    _logger.error("Wrong format arguments. Please check argument in order to handle format call in a synchronous way.");
                }
            } else if(!formatOption) { // case with no format option given
                if(!isSynchronous) {
                    _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, ". FormatService::format callback call (no format option)");
                    callback({result: typeof value === 'object' ? value.raw : value});
                } else if(typeof value === 'object' && value.raw !== void 0) {
                    value.result = value.raw;
                } else {
                    _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, ". FormatService::format Warning: callback call (value is not an object or no 'raw' attribute given)");
                    if (callback) {
                        callback(value);
                    }
                }
            } else {
                if(isSynchronous) {
                    _logger.LOG_ANALYSE && _logger.log( _logger.LOG_ANALYSE, `Warning: Argument formatOption contains pattern '${formatOption}' which can not be handled in a synchronous way.`);
                    if(typeof value === 'object' && value.raw !== void 0) {
                        value.result = value.raw;
                    } else {
                        _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, ". FormatService::format Warning: callback call (value is not an object or no 'raw' attribute given)");
                        if (callback) {
                            callback(value);
                        }
                    }
                } else {
                    let expectedLength = value.length < 1024 ? 1024 : value.length * 2;

                    this.FRM_RESOLVE_REQUEST.FWFuncID = 3; //CCFORMAT_FUNC_FORMAT
                    this.FRM_RESOLVE_REQUEST.param1 = formatOption;
                    this.FRM_RESOLVE_REQUEST.meta1 = ["CHAR_ANSI", -1];
                    this.FRM_RESOLVE_REQUEST.param2 = value;
                    this.FRM_RESOLVE_REQUEST.meta2 = ["CHAR_ANSI", -1];
                    this.FRM_RESOLVE_REQUEST.param3 = "";
                    this.FRM_RESOLVE_REQUEST.meta3 = ["CHAR_ANSI", expectedLength];

                    this.FrmResolve(this.FRM_RESOLVE_REQUEST, formatCallback.bind(this));
                }
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< FormatService::format");
        }

        /**
         * Implements various format options. Will be called by "format()" {@link Wincor.UI.Service.FormatService#format}
         * to handle at least _all_ synchronous formatting, but also to handle implemented format options in an asynchronous way.
         *
         * Override this method in order to change the formatted output.
         *
         * @param {String} value The value to format.
         * @param {String} pattern The format option.
         * @returns {*}
         */
        formatHelper(value, pattern) {
            const languageISO = _localizeService.currentLanguage;
            const separator = this.config[languageISO].CurrDecimalSep;
            const groupSep = this.config[languageISO].CurrGroupSep || "";
            const order = this.config[languageISO].CurrPositiveOrder; //0: Prefix, 1: Suffix, 2+3 are not supported and treated as 0
            const currencyExtension = this.bankingContext.currencyData.symbol || this.bankingContext.currencyData.iso;

            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> FormatService::formatHelper(value=${value}, pattern='${pattern}), current languageISO=${languageISO}`);

            let output = value;
            let expAbs = Math.abs(this.bankingContext.currencyData.exponent); //Exponent
    
            if((pattern === "#C" || pattern === "#M") && jQuery.isNumeric(value)) { // 10.00 or 1,000.00 || € 10.00 or € 1,000.00
                output = parseInt(value);
                output /= Math.pow(10, expAbs);
                output = parseFloat(output).toFixed(expAbs);
                output = output.toString();
                output = output.replace(".", separator);
                output = addGroupSeparator(output, separator, groupSep); // 10.00 or 1,000.00
                if(pattern === "#M") { // € 10.00 or € 1,000.00
                    if(order === 1) {
                        output = `${output} ${currencyExtension}`;
                    } else { // 0 and others (2+3)
                        output = `${currencyExtension} ${output}`;
                    }
                }
            } else if((pattern === "#ATRM0" || pattern === "#aTRM0" || pattern === "#i") && jQuery.isNumeric(value)) { // € 0 or € 10 or € 1,000 (with group separator) or € 0.10 for a 10 cent coin instead of € 0.1
                output = parseInt(value);
                let fixIt = output && output < 100; // determine if its less than 1 EUR, but > 0
                output /= Math.pow(10, expAbs);
                if(fixIt) {
                    output = parseFloat(output).toFixed(expAbs); // we want 0.10 for a 10 cent coin instead of 0.1
                }
                output = output.toString();
                output = output.replace(".", separator);
                output = addGroupSeparator(output, separator, groupSep); // 10 or 100 or 1.000 (with group separator)
                if(pattern === "#ATRM0") { // € 0 or € 10 or € 1,000 (with group separator)
                    if(order === 1) {
                        output = `${output} ${currencyExtension}`;
                    } else { // 0 and others (2+3)
                        output = `${currencyExtension} ${output}`;
                    }
                } else if(pattern === "#i") {
                    _logger.error(`FormatService::format Deprecated use of pattern '#i' found for viewkey=${this.serviceProvider.ViewService.viewContext.viewKey}, please use '#aTRM0' instead.`);
                }
            } else if(pattern ==="#SSN" && jQuery.isNumeric(value)) { // 123-45-6789
                let outputSSNString = output.toString();
                output = output.toString();
                let len = outputSSNString.length;
                switch (len) {
                    case 1:
                    case 2:
                    case 3:
                        break;
                    case 4:
                    case 5: outputSSNString = `${output.substr(0, 3)}-${output.substr(3, len - 3)}`;
                        break;
                    case 6:
                    case 7:
                    case 8:
                    case 9:
                        outputSSNString = `${output.substr(0, 3)}-${output.substr(3, 2)}-${output.substr(5, len - 5)}`;
                        break;
                    default:
                        break;
                }
                output = outputSSNString;
            } else if(pattern.indexOf("+-") === 2) { // #x+-4:4 xxxxxxx1234 or #*+-4:4 *******1234, the char after the '#' is the char to mask with
                let len = value.length;
                let res = "";
                let maskChar = pattern.substr(1, 1);
                let remainingLen = parseInt(pattern.substring(pattern.indexOf(":") + 1));
                for(let i = 0; i < len - remainingLen; i++) {
                    res += maskChar;
                }
                output = res + value.substring(len - remainingLen, len);
            } else if(pattern.indexOf("#X") === 0) { // **********
                output = output.toString().replace(/./g, pattern.substr(2)); // the part after the '#X' is the char to replace with
            } else if(pattern.includes("#conditional")) {
                try {
                    let replacementObject = JSON.parse(pattern.replace("#conditional", ""));
                    if(value in replacementObject) {
                        output = replacementObject[value];
                    } else if("*" in replacementObject){
                        output = replacementObject["*"];
                    } else {
                        output = value;
                    }
                    if(typeof output === "string" && output.includes("$val")) {
                        output = output.replace("$val", value);
                    }
                } catch(e) {
                    _logger.error(`FormatService: Error formatting value=${value} with pattern=${pattern} exception: ${e.message}`);
                    output = value;
                }
            } else {
                if(value !== "" && pattern) { // in case of empty string we skip the log entry, since this could be the normal case in some circumstances
                    if (!jQuery.isNumeric(value)) {
                        _logger.error(`Can't format value='${value}' with pattern '${pattern}', because value is not a number`);
                    } else {
                        _logger.error(`Can't format value='${value}' with unknown pattern '${pattern}'`);
                    }
                }
                output = value; // return original value
            }

            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< FormatService::formatHelper return '${output}'`);
            return output;
        }

        /**
         * Reads the configuration for formatting from the Registry section "Activex\\GraphicalService\\PCHtmlGen\\(language)" and stores it in {@link Wincor.UI.Service.FormatService#config}
         * @param {Object} languageMapping the language mapping from the FormatService
         * @returns {Promise}
         */
        readConfiguration(languageMapping) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> FormatService::readConfiguration(${JSON.stringify(languageMapping)})`);

            const self = this;
            const configPromises = [];

            function confCallback(lang, formatConf) {
                _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `. FormatService::readConfiguration confCallback(${lang}) - ${JSON.stringify(formatConf)}`);
                for (const key in formatConf) {
                    if (formatConf.hasOwnProperty(key) && (key.startsWith("Curr") || (key.startsWith("Num")))) { //only use keys starting with "Curr" and "Num", because all other keys are not relevant for formatting
                        const langIso = languageMapping.nameToIso[lang] ;
                        if (!self.config[langIso]) {
                            self.config[langIso] = {}; //the first time we come here, "self.config.de-DE" or self.config.en-US" will not exist
                        }
                        self.config[languageMapping.nameToIso[lang]] [key] = formatConf[key];
                        //_logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, ". FormatService::readConfiguration callback(" + langIso + ") - " + formatConf + ": " + JSON.stringify(self.config));
                    }
                }
            }

            for (const lang in languageMapping.nameToIso) { //GERMAN, ENGLISH
                _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `. FormatService::readConfiguration for(${lang})`);
                if (languageMapping.nameToIso.hasOwnProperty(lang)) {
                    configPromises.push(_configService.getConfiguration(`Activex\\GraphicalService\\PCHtmlGen\\${lang}`, null).then(confCallback.bind(null, lang)));
                }
            }

            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< FormatService::readConfiguration()");
            return ext.Promises.Promise.all(configPromises);
        }

        /**
         * See {@link Wincor.UI.Service.BaseService#onServicesReady}.
         *
         * Stores references to the LocalizeSerivce and the ConfigService.
         * As soon as these services are ready, it stores the configuration,
         * which is retrived from the LocalizeService, see {@link Wincor.UI.Service.LocalizeService#getLanguageMapping}.
         *
         * @returns {Promise}
         * @eventhandler native
         * @lifecycle service
         */
        onServicesReady() {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> FormatService::onServicesReady()");
            _localizeService = this.serviceProvider.LocalizeService;
            _configService = this.serviceProvider.ConfigService;
            const servicesReady = [_localizeService.whenReady, _configService.whenReady]; //LocalizeService must be ready, because we need the mapping. ConfigService is needed when we call readConfiguration

            return ext.Promises.Promise.all(servicesReady).then(() => {
                return this.readConfiguration(_localizeService.getLanguageMapping()).then(result => {
                    _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* FormatService:  ${JSON.stringify(this.config)}, result: ${JSON.stringify(result)}`);
                    _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< FormatService::onServicesReady");
                    return super.onServicesReady();
                });
            });
        }
    }
};

/**
 * This service provides possibilities to format values according to specified format options.
 *
 * @function getServiceClass
 * @param {Wincor} Wincor
 * @param {ext} ext
 * @param {LogProvider} LogProvider
 * @param {PTService} PTService
 * @returns {Wincor.UI.Service.FormatService}
 * @class
 * @since 1.0/00
 */
export default getServiceClass;
