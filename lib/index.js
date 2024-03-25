import SpatialNavigation from "./spatial_navigation.js";
import "focus-options-polyfill";
import "scroll-behavior-polyfill";

const vueSpatialNavigation = {
  install(Vue, config) {
    const globalConfig = {
      selector: `[data-focusable=true]`
    };
    Object.assign(globalConfig, config);
    SpatialNavigation.init();
    SpatialNavigation.set(globalConfig);
    Vue.prototype.$SpatialNavigation = SpatialNavigation;

    const assignConfig = (sectionId, config) => {
      let sectionConfig = Object.assign({}, globalConfig);
      if (config) {
        Object.assign(sectionConfig, config);
      }
      sectionConfig.selector = `[data-section-id="${sectionId}"] [data-focusable=true]`;
      return sectionConfig;
    };

    // focus section directive
    Vue.directive("focus-section", {
      bind(el, binding) {
        let sectionId = null;
        if (binding.arg) {
          sectionId = binding.arg;
          try {
            SpatialNavigation.add(sectionId, {});
          } catch (error) {}
        } else {
          sectionId = SpatialNavigation.add({});
        }

        // set sectionid to data set for removing when unbinding
        el.dataset.sectionId = sectionId;
        SpatialNavigation.set(sectionId, assignConfig(sectionId, binding.value));
        // set default section
        if (binding.modifiers.default) {
          SpatialNavigation.setDefaultSection(sectionId);
        }
      },
      update(el, binding) {
        let sectionId = el.dataset.sectionId;
        if (binding.arg && sectionId != binding.arg) {
          sectionId = binding.arg;
          el.dataset.sectionId = sectionId;
        }
        if (binding.value) {
          try {
            SpatialNavigation.set(sectionId, binding.value);
          } catch (error) {
            SpatialNavigation.add(sectionId, assignConfig(sectionId, binding.value));
          }
        }
      },
      unbind(el) {
        SpatialNavigation.remove(el.dataset.sectionId);
      }
    });

    const disableSection = (sectionId, disable) => {
      if (disable == false) {
        SpatialNavigation.enable(sectionId);
      } else {
        SpatialNavigation.disable(sectionId);
      }
    };
    // diasble focus section directive
    Vue.directive("disable-focus-section", {
      bind(el, binding) {
        disableSection(el.dataset.sectionId, binding.value);
      },
      update(el, binding) {
        disableSection(el.dataset.sectionId, binding.value);
      }
    });

    const disableElement = (el, focusable) => {
      focusable = focusable == false ? false : true;
      if (!el.dataset.focusable || el.dataset.focusable != focusable + "") {
        el.dataset.focusable = focusable;
        if (focusable) el.tabIndex = -1;
      }
    };
    // focusable directive
    Vue.directive("focus", {
      bind(el, binding) {
        disableElement(el, binding.value);
      },
      update(el, binding) {
        disableElement(el, binding.value);
      },
      unbind(el) {
        el.removeAttribute("data-focusable");
      }
    });

    // from https://github.com/Syncronet-APS/zome-vjsn
    
    // It can be expensive to check through this list for every events registered for every button.
    // With typescript this could be done with typedefinition
    const EVENTS = [
      "willmove",
      "willunfocus",
      "unfocused",
      "willfocus",
      "focused",
      "navigatefailed",
      "enter-down",
      "enter-up",
    ];

    // At some point we might need the handling of what happens with eventlistener when the binding is updated.
    // This might also be split into different directives to handle remove eventlisteners
    Vue.directive("focus-events", {
      bind(el, binding) {
        console.log(el);
        Object.keys(binding.value).forEach((key, i) => {
          if (EVENTS.includes(key))
            el.addEventListener('sn:' + key, binding.value[key]);
        });
      },
    });
  }
};

export default vueSpatialNavigation;
