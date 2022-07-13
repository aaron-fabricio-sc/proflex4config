/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.

$MOD$ wn.UI.Service.FormatServiceMock.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

/**
 * @module
 */
const getServiceClass = ({ BaseService, ext, LogProvider }) => {

    /**
     *
     * @type {Wincor.UI.Diagnostics.LogProvider|*|Wincor.UI.Diagnostics.LogProvider|*}
     * @private
     */
    const _logger = LogProvider;
    let _localizeService;

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

    return class FormatServiceMock extends BaseService {

        /**
         * "FormatServiceMock" - the logical name of this service as used in the service-provider
         * @const
         * @type {string}
         */
        NAME = "FormatService";
    
        /**
         * See {@link Wincor.UI.Service.FormatService#config}.
         */
        config = {};

        /**
         * See {@link Wincor.UI.Service.FormatService#bankingContext}.
         */
        bankingContext = {};
    
        /**
         * See {@link Wincor.UI.Service.BaseServiceMock#constructor}.
         * @lifecycle service
         */
        constructor(...args) {
            super(...args);
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> FormatServiceMock::FormatServiceMock");
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< FormatServiceMock::FormatServiceMock");
        }
        
        /**
         * This method is called by the {@link Wincor.UI.Service.Provider#propagateError} if an error occurred in any service. It logs the error to the console.
         *
         *
         * @param {String} serviceName  The name of this service.
         * @param {String} errorType    As defined in {@link Wincor.UI.Service.BaseService#ERROR_TYPE}.
         */
        onError(serviceName, errorType) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> FormatServiceMock::onError(${serviceName}, ${errorType})`);
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< FormatServiceMock::onError");
        }

        /**
         * See {@link Wincor.UI.Service.FormatService#format}.
         *
         * In contrast to the ProTopas FormatService, asynchronous requests, whose format options are not implemented in formatHelper(),
         * can not be supported by anyone else (for the ProTopas FormatService they _could_ possibly supported by the ProTopas FormatFW),
         * so there will be an error immediately.
         */
        format(value, formatOption, callback, isSynchronous) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> FormatService::format(value=${value}, formatOption='${formatOption}', isSynchronous=${isSynchronous})`);
            let self = this;
            function generateSpecificResponse() {
                return self.formatHelper(typeof value === 'object' ? value.raw : value, formatOption);
            }
            if(!isSynchronous) {
                callback({ result: generateSpecificResponse.bind(this)(), raw: typeof value === 'object' ? value.raw : value });
            } else if(typeof value === "object") {
                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< FormatServiceMock::format");
                value.result = this.formatHelper(value.raw, formatOption);
            } else {
                _logger.error("Wrong format arguments. Please check arguments in order to handle format in a right way.");
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< FormatServiceMock::format");
        }

        /**
         * See {@link Wincor.UI.Service.FormatService#formatHelper}.
         */
        formatHelper(value, pattern) {
            const languageISO = _localizeService.currentLanguage;
            if(!this.config[languageISO]) {
                _logger.error(`Can't format value '${value}', because no language specific format configuration is available for ISO language culture name '${languageISO}'.`);
                return value;
            }
            const separator = this.config[languageISO].CurrDecimalSep;
            const groupSep = this.config[languageISO].CurrGroupSep || "";
            const order = this.config[languageISO].CurrPositiveOrder; //0: Prefix, 1: Suffix, 2+3 are not supported and treated as 0
            const currencyExtension = this.bankingContext.currencyData.symbol || this.bankingContext.currencyData.iso;

            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> FormatServiceMock::formatHelper(value=${value}, pattern='${pattern}), current languageISO=${languageISO}`);

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
            // #i is deprecated and thus will be removed later, behavior is now same as '#aTRM0'
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
                    case 5: outputSSNString = output.substr(0, 3) + "-" + output.substr(3, len-3);
                        break;
                    case 6:
                    case 7:
                    case 8:
                    case 9:
                        outputSSNString = output.substr(0, 3) + "-" + output.substr(3, 2)  + "-" + output.substr(5, len-5);
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
            } else if(pattern.indexOf("#X") !== -1) { // **********
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
    
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< FormatServiceMock::formatHelper return '${output}'`);
            return output;
        }

        /**
         * See {@link Wincor.UI.Service.BaseServiceMock#onSetup}
         *
         * @param {object} message      See {@link Wincor.UI.Service.BaseServiceMock#onSetup}
         * @returns {Promise}
         * @lifecycle service
         */
        onSetup(message) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> FormatServiceMock::onSetup('${JSON.stringify(message)}')`);
            return ext.Promises.promise(resolve => {
                resolve();
                _logger.log(_logger.LOG_SRVC_INOUT, "< FormatServiceMock::onSetup");
            });
        }

        /**
         * See {@link Wincor.UI.Service.BaseServiceMock#onServicesReady}
         
         * Stores references to the LocalizeSerivce.
         * As soon as this services is ready, it stores the configuration,
         * which is retrived from the LocalizeService, see {@link Wincor.UI.Service.LocalizeService#getLanguageSpecifications}.
         *
         * @returns {Promise}
         * @lifecycle service
         */
        onServicesReady() {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> FormatServiceMock::onServicesReady()");
            _localizeService = this.serviceProvider.LocalizeService;
            const self = this;
            return _localizeService.whenReady.then(() => {
                self.config = _localizeService.getLanguageSpecifications();
                _logger.log(_logger.LOG_DETAIL, `* FormatServiceMock:  ${JSON.stringify(self.config)}`);
                return super.onServicesReady();
            });
        }
    }
};

/**
 * The FormatServiceMock provides standard format patterns for number formatting.
 *
 * @function getServiceClass
 * @param {Class} Class
 * @param {BaseService} BaseService
 * @param {ext} ext
 * @param {LogProvider} LogProvider
 * @returns {Wincor.UI.Service.Provider.FormatService}
 * @class
 * @since 1.2/00
 */
export default getServiceClass;
