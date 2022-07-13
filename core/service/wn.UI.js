/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.js 4.3.1-201130-21-086c3328-1a04bc7d

*/
let Wincor;
(Wincor = window.Wincor || {}),
  (Wincor.UI = Wincor.UI || {}),
  (Wincor.UI.Service = Wincor.UI.Service || {}),
  (Wincor.ConvHexToStr = function (n) {
    return (function (n) {
      let r = null;
      if (
        (function (n) {
          return n.length % 2 == 0;
        })(n) &&
        (function (n) {
          for (let r = 0; r < n.length; r++) {
            let t = n[r];
            if (
              !(
                (t >= "A" && t <= "F") ||
                (t >= "a" && t <= "f") ||
                (t >= "0" && t <= "9")
              )
            )
              return !1;
          }
          return !0;
        })(n)
      ) {
        r = (function (n) {
          let r = "";
          for (let t = 0; t < n.length; t++)
            (t === n.length - 1 && 0 === n[t]) ||
              (r += String.fromCharCode(n[t]));
          return r;
        })(
          (function (n) {
            let r = [];
            for (let t = 0; t < n.length; t += 2) {
              let e = `0x${n[t]}${n[t + 1]}`;
              r.push(parseInt(e));
            }
            return r;
          })(n)
        );
      }
      return r;
    })(n);
  }),
  (window.Wincor = Wincor);
export default Wincor;
