/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Service.ValidateServiceMock.js 4.3.1-210203-21-1b8704b6-1a04bc7d

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

    let _viewService;

    return class ValidateServiceMock extends BaseService {

        /**
         * "ValidateServiceMock" - the logical name of this service as used in the service-provider
         * @const
         * @type {string}
         */
        NAME = "ValidateService";

        /**
         * See {@link Wincor.UI.Service.BaseServiceMock#constructor}.
         * @lifecycle service
         */
        constructor(...args) {
            super(...args);
            _logger.log(_logger.LOG_SRVC_INOUT, `> ValidateServiceMock::ValidateServiceMock`);
            _logger.log(_logger.LOG_SRVC_INOUT, `< ValidateServiceMock::ValidateServiceMock`);
        }
        
        /**
         * This method is called by the {@link Wincor.UI.Service.Provider#propagateError} if an error occurred in any service. It logs the error to the console.
         *
         *
         * @param {String} serviceName  The name of this service.
         * @param {String} errorType    As defined in {@link Wincor.UI.Service.BaseService#ERROR_TYPE}.
         */
        onError(serviceName, errorType) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> ValidateServiceMock::onError(${serviceName}, ${errorType})`);
            _logger.log(_logger.LOG_SRVC_INOUT, `< ValidateServiceMock::onError`);
        }

        /**
         * Checks if a given value is a number. Will returns true, if it is a number, otherwise false.
         * @param {string} value - Parameter to be checked
         * @return {Boolean}
         */
        isNumbers(value) {
            //Problem: isNaN(5-2) = false
            //var isNum = value !== "" && !isNaN(value);
            let isNum = false;

            try {
                var array = value.split("");

                if(value === "") {
                    isNum = false;
                }
                else {
                    // Start with the last value of the array
                    for(var i = array.length - 1; i >= 0; i--) {
                        if(!isNaN(array[i])) {
                            isNum = true;
                        }
                        else {
                            isNum = false;
                            break;
                        }
                    }
                }
            } catch(e) {
                //pass
            }
            !_viewService.viewContext.viewConfig.privateInput &&
            _logger.log(_logger.LOG_DETAIL, `ValidateServiceMock::isNumbers: ${isNum} for ${value}`);
            return isNum;
        }

        /**
         * Checks if a given value is a char sequence. Will return true, if it is a char sequence, otherwise false.
         * @param {string} value - Parameter to be checked
         * @return {Boolean}
         */
        isChars(value) {
            const re = /[0-9]/;
            const isChar = value !== "" && !re.test(value);

            !_viewService.viewContext.viewConfig.privateInput &&
            _logger.log(_logger.LOG_DETAIL, `ValidateServiceMock::isChars: ${isChar} for ${value}`);
            return isChar;
        }

        /**
         * Checks if a given value is a mail address. Will return true, if it is a mail address, otherwise false.
         * @param {string} value - Parameter to be checked
         * @return {Boolean}
         */
        isEmail(value) {
            // http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
            const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            const isEMail = re.test(value);

            !_viewService.viewContext.viewConfig.privateInput &&
            _logger.log(_logger.LOG_DETAIL, `ValidateServiceMock::isEmail: ${isEMail} for ${value}`);
            return isEMail;
        }

        /**
         * Checks if a given value has a valid date format. Will return true, if it has a valid date format, otherwise false.
         * @param {string} value - Parameter to be checked
         * @param {string} [pattern=""] - Valid date format e.g. yyyy/mm/dd Currently not used. Browser-known patterns only.
         * @return {Boolean}
         */
        isDateFormat(value, pattern="") {     /*TODO: date pattern must be known, to check if a date is valid*/
            const date = new Date(value);

            const isDate = date.toString() !== "Invalid Date";

            !_viewService.viewContext.viewConfig.privateInput &&
            _logger.log(_logger.LOG_DETAIL, `ValidateServiceMock(isDateFormat): ${isDate} for ${value}`);
            return isDate;
        }

        /**
         * Checks if a given value is within a valid period. Will return true, if it is within the period, otherwise false.
         * @param {string} value - Parameter to be checked
         * @param {string} from - Earliest date
         * @param {string} to - Latest date
         * @param {string=} pattern - Valid date format e.g. yyyy/mm/dd
         * @return {Boolean}
         */
        isDateInRange(value, from, to, pattern) {
            let isDateInRange = false;

            if(this.isDateFormat(value) && this.isDateFormat(from) && this.isDateFormat(to)) {
                isDateInRange = (value !== "") && (value >= from) && (value <= to);
            }

            !_viewService.viewContext.viewConfig.privateInput &&
            _logger.log(_logger.LOG_DETAIL, `ValidateServiceMock(isDateFormat): ${isDateInRange} for ${value}`);
            return isDateInRange;
        }

        /**
         * Checks if a given value is in range. Will return true, if it is in range, otherwise false.
         * @param {string} value - Parameter to be checked
         * @param {number} min - Minimum value
         * @param {number} max - Maximum value
         * @param {number=} stepLen - Value for modulo function e.g. '100' for full amounts, default = 1
         * @return {Boolean}
         */
        isInRange(value, min, max, stepLen) {
            if (stepLen === void 0) {
                stepLen = 1;
            }

            let inRange = (value !== "") && (value >= min) && (value <= max) && ((value % (stepLen)) === 0);

            !_viewService.viewContext.viewConfig.privateInput &&
            _logger.log(_logger.LOG_DETAIL, `ValidateServiceMock::isInRange: ${inRange} for ${value}`);
            return inRange;
        }

        /**
         * Checks if a given value is higher than the minimum. <BR>
         * Will return true, if it is higher than or equal to the minimum, otherwise false.
         * @param {string} value - Parameter to be checked
         * @param {number} min - Minimum value
         * @return {Boolean}
         */
        isMin(value, min) {
            const resultMin = (value !== "") && (value >= min);

            !_viewService.viewContext.viewConfig.privateInput &&
            _logger.log(_logger.LOG_DETAIL, `ValidateServiceMock::isMin: ${resultMin} for ${value}`);
            return resultMin;
        }

        /**
         * Checks if a given value is lower than the maximum. <BR>
         * Will return true, if it is lower than or equal to the maximum, otherwise false.
         * @param {string} value - Parameter to be checked
         * @param {number} max - Maximum value
         * @return {Boolean}
         */
        isMax(value, max) {
            let resultMax = (value !== "") && (value <= max);

            !_viewService.viewContext.viewConfig.privateInput &&
            _logger.log(_logger.LOG_DETAIL, `ValidateServiceMock::isMax: ${resultMax} for ${value}`);
            return resultMax;
        }

        /**
         * Checks if a given value is in step length. Will return true, if it is in step length, otherwise false.
         * @param {string} value - Parameter to check
         * @param {number} stepLen - Value for modulo function e.g. '100' for full amounts || '60' for number of minutes
         * @return {Boolean}
         */
        isStepLen(value, stepLen) {
            const stepLength = (value !== "") && (value % stepLen === 0);

            !_viewService.viewContext.viewConfig.privateInput &&
            _logger.log(_logger.LOG_DETAIL, `ValidateServiceMock::isStepLen: ${stepLength} for ${value}`);
            return stepLength;
        }

        /**
         * Checks if the length of a given value is greater than or equal to a minimum length. <BR>
         * Will return true, if it is greater than / equal to the minLen, otherwise false.
         * @param {string} value - Parameter to be checked
         * @param {number} [minLen=0] - minimum length
         * @return {Boolean}
         */
        isWithinMinLength(value, minLen=0) {
            if (value === void 0) {
                _logger.error(`ValidateServiceMock::isWithinMinLength - value is undefined`);
                return false;
            }
            if (value === null ) {
                _logger.error(`ValidateServiceMock::isWithinMinLength - value is null`);
                return false;
            }

            let isWithin = true;
            if (minLen >= 0) {
                isWithin = value.length >= minLen;
            }
            !_viewService.viewContext.viewConfig.privateInput &&
            _logger.log(_logger.LOG_DETAIL, `ValidateServiceMock::isWithinMinLength (input=${value}, minLen=${minLen}, isWithin=${isWithin})`);
            return isWithin;
        }

        /**
         * Checks if the length of a given value is smaller than or equal to a maximum length. <BR>
         * Will return true, if it is smaller than / equal to the maxLen, otherwise false.
         * @param {string} value - Parameter to be checked
         * @param {number} [maxLen=Infinity] - maximum length
         * @return {Boolean}
         */
        isWithinMaxLength(value, maxLen=Infinity) {
            if (value === void 0 ) {
                _logger.error(`ValidateServiceMock::isWithinMaxLength - value is undefined`);
                return false;
            }
            if (value === null ) {
                _logger.error(`ValidateServiceMock::isWithinMaxLength - value is null`);
                return false;
            }

            let isWithin = true;
            if (maxLen >= 0) {
                isWithin = value.length <= maxLen;
            }
            !_viewService.viewContext.viewConfig.privateInput &&
            _logger.log(_logger.LOG_DETAIL, `ValidateServiceMock::isWithinMaxLength (input=${value}, maxLen=${maxLen}, isWithin=${isWithin})`);
            return isWithin;
        }

        /**
         * Checks if the length of a given value is smaller than or equal to a maximum length <BR>
         * and greater than / equal to a minimum length. <BR>
         * Will return true, if it is smaller than / equal to the maxLen and greater than / equal to the minLen, <BR>
         * otherwise false.
         * @param {string} value - Parameter to be checked
         * @param {number} [minLen=0] - minimum length
         * @param {number} [maxLen=Infinity] - maximum length
         * @return {Boolean}
         */
        isWithinLength(value, minLen=0, maxLen=Infinity) {
            if (value === void 0 ) {
                _logger.error(`ValidateServiceMock::isWithinLength - value is undefined`);
                return false;
            }
            if (value === null ) {
                _logger.error(`ValidateServiceMock::isWithinLength - value is null`);
                return false;
            }
            const isWithin = this.isWithinMinLength(value, minLen) && this.isWithinMaxLength(value, maxLen);

            !_viewService.viewContext.viewConfig.privateInput &&
            _logger.log(_logger.LOG_DETAIL, `ValidateServiceMock::isWithinLength (input=${value}, minLen=${minLen}, maxLen=${maxLen}, isWithin=${isWithin})`);
            return isWithin;
        }

        /**
         * Checks if a given value starts with a '0'. <BR>
         * Will return false, if the first digit is '0' and it is not allowed to be '0', otherwise it will return true.
         * @param {string} value - Parameter to be checked
         * @param {Boolean} allowLeadingZero - Flag that determines whether a leading zero is allowed (true) or not (false)
         * @return {Boolean}
         */
        checkLeadingZero(value, allowLeadingZero) {
            let zeroCheck = true;

            if ( ( allowLeadingZero === false ) && ( value.length >= 1 ) && ( value[0] === "0" )  ) {
                zeroCheck = false;
            }
            !_viewService.viewContext.viewConfig.privateInput &&
            _logger.log(_logger.LOG_DATA, `ValidateServiceMock::checkLeadingZero (input=${value}, allowLeadingZero=${allowLeadingZero}, zeroCheck=${zeroCheck})`);
            return zeroCheck;
        }

        /**
         * Checks whether the given value is in line with a regular expression.
         * @param {string} value - Parameter to be checked
         * @param {string} forbiddenPattern - reg. expression
         * @return {Boolean}
         */
        matchesForbiddenPattern(value, forbiddenPattern) {
            let isForbidden = false;

            if (!(forbiddenPattern === "" || forbiddenPattern === undefined || forbiddenPattern === null)) {

                // Examples:
                // forbiddenPattern = "^\\s+$" --> will not accept string only consisting of blanks
                // forbiddenPattern = "gr[" --> will throw exception

                try {
                    const pattern = new RegExp(forbiddenPattern);
                    isForbidden = pattern.test(value);
                    !_viewService.viewContext.viewConfig.privateInput &&
                    _logger.log(_logger.LOG_DATA, `ValidateServiceMock::matchesForbiddenPattern - after test() call: (input=${value}, forbiddenPattern=${forbiddenPattern}, isForbidden=${isForbidden})`);
                } catch(e){
                    isForbidden = false;
                    _logger.log(_logger.LOG_DATA, `ValidateServiceMock::matchesForbiddenPattern: exception: forbiddenPattern=${forbiddenPattern} is invalid`);
                }
            }
            !_viewService.viewContext.viewConfig.privateInput &&
            _logger.log(_logger.LOG_DATA, `ValidateServiceMock::matchesForbiddenPattern (input=${value}, forbiddenPattern=${forbiddenPattern}, isForbidden=${isForbidden}`);
            return isForbidden;
        }


        /**
         * See {@link Wincor.UI.Service.BaseServiceMock#onSetup}
         *
         * @param {object} message      See {@link Wincor.UI.Service.BaseServiceMock#onSetup}
         * @returns {Promise}
         * @lifecycle service
         */
        onSetup(message) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> ValidateServiceMock::onSetup('${JSON.stringify(message)}')`);
            return ext.Promises.promise((resolve, reject) => {
                resolve();
                _logger.log(_logger.LOG_SRVC_INOUT, `< ValidateServiceMock::onSetup`);
            });
        }

        /**
         * See {@link Wincor.UI.Service.BaseServiceMock#onServicesReady}
         * @async
         * @lifecycle service
         */
        async onServicesReady() {
            _logger.log(_logger.LOG_SRVC_INOUT, `> ValidateServiceMock::onServicesReady()`);
            _viewService = this.serviceProvider.ViewService;
            await super.onServicesReady();
            _logger.log(_logger.LOG_SRVC_INOUT, `< ValidateServiceMock::onServicesReady`);
        }
    }
};

/**
 * The ValidateServiceMock owns the same validation routines as the real validation service.
 *
 * @function getServiceClass
 * @param {Class} Class
 * @param {BaseService} BaseService
 * @param {ext} ext
 * @param {LogProvider} LogProvider
 * @returns {Wincor.UI.Service.Provider.ValidateService}
 * @class
 * @since 2.0/00
 */
export default getServiceClass;
