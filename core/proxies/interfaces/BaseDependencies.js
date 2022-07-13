import { default as Wincor } from "../../service/wn.UI";
import { default as LogProvider } from "../../service/wn.UI.Diagnostics.LogProvider";
import PTService from "../../service/wn.UI.Service.PTService.js";
import getExtensions from "../../../lib/internal/wn.UI.extensions.js";
import getGateway from "../../service/wn.UI.Gateway.js";
import getWebSocket from "../../service/wn.UI.Gateway.WebSocket.js";
import getGatewayProvider from "../../service/wn.UI.GatewayProvider.js";

const Class = window.Class;
const jQuery = window.jQuery;
const ext = getExtensions({ Wincor, LogProvider });
const Gateway = getGateway({ Wincor, LogProvider });
const Websocket = getWebSocket({ Wincor, ext, Gateway });
const GatewayProvider = getGatewayProvider({ Wincor, LogProvider, Websocket });

export { Wincor, Class, jQuery, ext, PTService, LogProvider, GatewayProvider, Gateway };
