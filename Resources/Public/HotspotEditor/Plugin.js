(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // node_modules/@neos-project/neos-ui-extensibility/dist/readFromConsumerApi.js
  function readFromConsumerApi(key) {
    return (...args) => {
      if (window["@Neos:HostPluginAPI"] && window["@Neos:HostPluginAPI"][`@${key}`]) {
        return window["@Neos:HostPluginAPI"][`@${key}`](...args);
      }
      throw new Error("You are trying to read from a consumer api that hasn't been initialized yet!");
    };
  }
  var init_readFromConsumerApi = __esm({
    "node_modules/@neos-project/neos-ui-extensibility/dist/readFromConsumerApi.js"() {
    }
  });

  // node_modules/@neos-project/neos-ui-extensibility/plugin-api.js
  var manifest, plugin_api_default, SynchronousRegistry, SynchronousMetaRegistry;
  var init_plugin_api = __esm({
    "node_modules/@neos-project/neos-ui-extensibility/plugin-api.js"() {
      init_readFromConsumerApi();
      manifest = readFromConsumerApi("manifest");
      plugin_api_default = manifest;
      ({ SynchronousRegistry, SynchronousMetaRegistry } = readFromConsumerApi("NeosProjectPackages")().NeosUiRegistry);
    }
  });

  // node_modules/@neos-project/neos-ui-extensibility/dist/shims/vendor/react/index.js
  var require_react = __commonJS({
    "node_modules/@neos-project/neos-ui-extensibility/dist/shims/vendor/react/index.js"(exports, module) {
      init_readFromConsumerApi();
      module.exports = readFromConsumerApi("vendor")().React;
    }
  });

  // node_modules/@neos-project/neos-ui-extensibility/dist/shims/vendor/prop-types/index.js
  var require_prop_types = __commonJS({
    "node_modules/@neos-project/neos-ui-extensibility/dist/shims/vendor/prop-types/index.js"(exports, module) {
      init_readFromConsumerApi();
      module.exports = readFromConsumerApi("vendor")().PropTypes;
    }
  });

  // node_modules/@neos-project/neos-ui-extensibility/dist/shims/neosProjectPackages/react-ui-components/index.js
  var require_react_ui_components = __commonJS({
    "node_modules/@neos-project/neos-ui-extensibility/dist/shims/neosProjectPackages/react-ui-components/index.js"(exports, module) {
      init_readFromConsumerApi();
      module.exports = readFromConsumerApi("NeosProjectPackages")().ReactUiComponents;
    }
  });

  // src/HotspotEditor.js
  var import_react, import_prop_types, import_react_ui_components, HotspotEditor;
  var init_HotspotEditor = __esm({
    "src/HotspotEditor.js"() {
      import_react = __toESM(require_react());
      import_prop_types = __toESM(require_prop_types());
      import_react_ui_components = __toESM(require_react_ui_components());
      HotspotEditor = class extends import_react.PureComponent {
        static propTypes = {
          value: import_prop_types.default.oneOfType([import_prop_types.default.string, import_prop_types.default.number]),
          identifier: import_prop_types.default.string,
          commit: import_prop_types.default.func.isRequired
        };
        componentDidMount() {
          window.addEventListener("fd-hotspot-editor:hotspotDragged", this.handleHotspotDragged);
        }
        componentWillUnmount() {
          window.removeEventListener("fd-hotspot-editor:hotspotDragged", this.handleHotspotDragged);
        }
        handleChangeCoordinates = (coordinateValue) => {
          this.props.commit(coordinateValue);
          const customEvent = new CustomEvent(
            "fd-hotspot-editor:hotspotInspectorValueChanged",
            {
              detail: {
                coordinateId: this.props.identifier,
                coordinateValue
              }
            }
          );
          window.dispatchEvent(customEvent);
        };
        handleHotspotDragged = (event) => {
          const pos = event.detail?.Payload?.pos;
          if (!pos || pos[this.props.identifier] === void 0) {
            return;
          }
          this.props.commit(pos[this.props.identifier]);
          setTimeout(() => {
            document.getElementById("neos-Inspector-Apply")?.click();
          }, 400);
        };
        render() {
          return /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement(import_react_ui_components.TextInput, { value: this.props.value, onChange: this.handleChangeCoordinates }));
        }
      };
    }
  });

  // src/manifest.js
  var manifest_exports = {};
  var init_manifest = __esm({
    "src/manifest.js"() {
      init_plugin_api();
      init_HotspotEditor();
      plugin_api_default("FormatD.HotspotEditor:HotspotEditor", {}, (globalRegistry) => {
        const editorsRegistry = globalRegistry.get("inspector").get("editors");
        editorsRegistry.set("FormatD.HotspotEditor/HotspotEditor", {
          component: HotspotEditor
        });
      });
    }
  });

  // src/index.js
  init_manifest();
})();
