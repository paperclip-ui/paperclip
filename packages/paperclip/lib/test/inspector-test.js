"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var dsl_1 = require("../dsl");
var chai_1 = require("chai");
var inspector_1 = require("../inspector");
var tandem_common_1 = require("tandem-common");
var ot_1 = require("../ot");
describe(__filename + "#", function () {
    var A_DEP_URI = "a.pc";
    var zeroIds = function (node) {
        var _i = 0;
        var map = function (node) { return (__assign(__assign({}, node), { id: "".concat(_i++), children: node.children.map(map) })); };
        return map(node);
    };
    var case1 = function () { return [
        "can change the element type without affecting the inspector",
        (0, dsl_1.createPCModule)([(0, dsl_1.createPCElement)("div")]),
        (0, dsl_1.createPCModule)([(0, dsl_1.createPCElement)("span")])
    ]; };
    var case2 = function () { return [
        "can replace a child node",
        (0, dsl_1.createPCModule)([(0, dsl_1.createPCElement)("div")]),
        (0, dsl_1.createPCModule)([(0, dsl_1.createPCTextNode)("text node here")])
    ]; };
    var case3 = function () {
        return [
            "Can insert a new slot into a component",
            (0, dsl_1.createPCModule)([(0, dsl_1.createPCComponent)(null, "div", {}, {})]),
            (0, dsl_1.createPCModule)([(0, dsl_1.createPCComponent)(null, "div", {}, {}, [(0, dsl_1.createPCSlot)()])])
        ];
    };
    var case4 = function () {
        var slotChild = (0, dsl_1.createPCTextNode)("a b");
        var slot = (0, dsl_1.createPCSlot)([slotChild]);
        var component = (0, dsl_1.createPCComponent)(null, "div", {}, {}, [slot]);
        var module = (0, dsl_1.createPCModule)([component]);
        var module2 = module;
        module2 = (0, tandem_common_1.replaceNestedNode)((0, dsl_1.createPCElement)("div"), slotChild.id, module2);
        return ["Can update the default children of a slot", module, module2];
    };
    var case5 = function () {
        var slotChild = (0, dsl_1.createPCTextNode)("a b");
        var slot = (0, dsl_1.createPCSlot)([slotChild]);
        var component = (0, dsl_1.createPCComponent)(null, "div", {}, {}, [slot]);
        var instance = (0, dsl_1.createPCComponentInstance)(component.id);
        var instance2 = (0, dsl_1.createPCComponentInstance)(component.id);
        var module = (0, dsl_1.createPCModule)([component, instance, instance2]);
        var module2 = module;
        module2 = (0, tandem_common_1.replaceNestedNode)((0, dsl_1.createPCElement)("div"), slotChild.id, module2);
        return ["Updates slot children of component instance", module, module2];
    };
    var case6 = function () {
        var element1 = (0, dsl_1.createPCElement)("div");
        var element2 = (0, dsl_1.createPCElement)("span");
        var module = (0, dsl_1.createPCModule)([element1, element2]);
        var module2 = module;
        module2 = (0, tandem_common_1.removeNestedTreeNode)(element2, module2);
        module2 = (0, tandem_common_1.insertChildNode)(element2, 0, module2);
        return ["Can move elements around", module, module2];
    };
    var case7 = function () {
        var slot = (0, dsl_1.createPCSlot)([(0, dsl_1.createPCTextNode)("abcd")]);
        var component = (0, dsl_1.createPCComponent)(null, "div", null, null, [slot]);
        var instance = (0, dsl_1.createPCComponentInstance)(component.id, null);
        var module = (0, dsl_1.createPCModule)([component, instance]);
        var module2 = module;
        instance = (0, tandem_common_1.appendChildNode)((0, dsl_1.createPCPlug)(slot.id, [(0, dsl_1.createPCElement)("span")]), instance);
        module2 = (0, tandem_common_1.replaceNestedNode)(instance, instance.id, module2);
        return ["Can insert a new plug", module, module2];
    };
    var case8 = function () {
        var slot = (0, dsl_1.createPCSlot)();
        var component = (0, dsl_1.createPCComponent)(null, "div", null, null, [slot]);
        var plug = (0, dsl_1.createPCPlug)(slot.id);
        var instance = (0, dsl_1.createPCComponentInstance)(component.id, null, null, [
            plug
        ]);
        var module = (0, dsl_1.createPCModule)([component, instance]);
        var module2 = module;
        plug = (0, tandem_common_1.insertChildNode)((0, dsl_1.createPCTextNode)("abc"), 0, plug);
        module2 = (0, tandem_common_1.replaceNestedNode)(plug, plug.id, module2);
        return ["Can insert a child into a plug", module, module2];
    };
    var case9 = function () {
        var component = (0, dsl_1.createPCComponent)(null, "div", null, null, [
            (0, dsl_1.createPCTextNode)("a"),
            (0, dsl_1.createPCSlot)([(0, dsl_1.createPCTextNode)("b")]),
            (0, dsl_1.createPCSlot)([(0, dsl_1.createPCTextNode)("c")])
        ]);
        var component2 = (0, dsl_1.createPCComponent)(null, "div", null, null, [
            (0, dsl_1.createPCTextNode)("d"),
            (0, dsl_1.createPCSlot)([(0, dsl_1.createPCTextNode)("e")]),
            (0, dsl_1.createPCSlot)([(0, dsl_1.createPCTextNode)("f")]),
            (0, dsl_1.createPCSlot)([(0, dsl_1.createPCTextNode)("g")])
        ]);
        var instance = (0, dsl_1.createPCComponentInstance)(component.id);
        var module = (0, dsl_1.createPCModule)([component, component2, instance]);
        var module2 = module;
        instance = __assign(__assign({}, instance), { is: component2.id });
        module2 = (0, tandem_common_1.replaceNestedNode)(instance, instance.id, module2);
        return ["Can change the type of a component", module, module2];
    };
    var case10 = function () {
        var component = (0, dsl_1.createPCComponent)(null, "div", null, null, [
            (0, dsl_1.createPCTextNode)("a"),
            (0, dsl_1.createPCSlot)([(0, dsl_1.createPCTextNode)("b")]),
            (0, dsl_1.createPCSlot)([(0, dsl_1.createPCTextNode)("c")])
        ]);
        var element = (0, dsl_1.createPCElement)("div");
        var module = (0, dsl_1.createPCModule)([component, element]);
        var module2 = module;
        element = __assign(__assign({}, element), { is: component.id, name: "component-instance" });
        module2 = (0, tandem_common_1.replaceNestedNode)(element, element.id, module2);
        return ["Can change an element into an instance", module, module2];
    };
    var case11 = function () {
        var component = (0, dsl_1.createPCComponent)(null, "div", null, null, []);
        var instance = (0, dsl_1.createPCComponentInstance)(component.id);
        var module = (0, dsl_1.createPCModule)([component, instance]);
        var module2 = module;
        component = (0, tandem_common_1.appendChildNode)((0, dsl_1.createPCSlot)([(0, dsl_1.createPCTextNode)("ABC")]), component);
        module2 = (0, tandem_common_1.replaceNestedNode)(component, component.id, module2);
        return ["Creating a new slot creates a new virtual plug", module, module2];
    };
    [
        case11(),
        case1(),
        case2(),
        case3(),
        case4(),
        case5(),
        case6(),
        case7(),
        case8(),
        case9(),
        case10()
    ].forEach(function (_a) {
        var label = _a[0], a = _a[1], b = _a[2];
        it(label, function () {
            var _a, _b;
            var graph = {
                a: (0, dsl_1.createPCDependency)("a", a)
            };
            var rootInspector = (0, inspector_1.createRootInspectorNode)();
            var sourceMap;
            _a = (0, inspector_1.refreshInspectorTree)(rootInspector, graph, ["a"], sourceMap), rootInspector = _a[0], sourceMap = _a[1];
            var newGraph = {
                a: __assign(__assign({}, graph.a), { content: (0, ot_1.patchTreeNode)((0, ot_1.diffTreeNode)(a, b), a) })
            };
            _b = (0, inspector_1.refreshInspectorTree)(rootInspector, newGraph, ["a"], sourceMap, graph), rootInspector = _b[0], sourceMap = _b[1];
            var newRootInspector = (0, inspector_1.createRootInspectorNode)();
            newRootInspector = (0, inspector_1.refreshInspectorTree)(newRootInspector, newGraph, [
                "a"
            ])[0];
            (0, chai_1.expect)(zeroIds(rootInspector)).to.eql(zeroIds(newRootInspector));
        });
    });
});
//# sourceMappingURL=inspector-test.js.map