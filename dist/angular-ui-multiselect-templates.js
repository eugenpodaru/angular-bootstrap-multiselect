angular.module('ui.multiselect.templates', ['multiselect.html']);

angular.module("multiselect.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("multiselect.html",
    "<input id=\"{{vm.options.formElement}}\" name=\"{{vm.options.formElement}}\" hidden=\"hidden\" ng-model=\"vm.ngModel.$viewValue\" ng-if=\"vm.options.formElement\"/>\n" +
    "<div class=\"{{::vm.options.containerClass}}\">\n" +
    "    <button type=\"button\" class=\"{{::vm.options.toggleClass}}\" ng-click=\"vm.toggleDropdown()\" ng-disabled=\"vm.options.disabled\">\n" +
    "        {{vm.getButtonText()}}&nbsp;<span class=\"caret\"></span>\n" +
    "    </button>\n" +
    "    <ul class=\"{{::vm.options.dropdownClass}}\" ng-show=\"vm.open\" style=\"display:block\"\n" +
    "        ng-mouseenter=\"vm.isMouseOver = true\" ng-mouseleave=\"vm.isMouseOver = false\">\n" +
    "\n" +
    "        <li ng-show=\"vm.options.showSelectAll\">\n" +
    "            <a ng-click=\"vm.selectAll()\" href=\"\">\n" +
    "                <span class=\"glyphicon glyphicon-ok\"></span> Select All\n" +
    "            </a>\n" +
    "        </li>\n" +
    "        <li ng-show=\"vm.options.showUnselectAll\">\n" +
    "            <a ng-click=\"vm.unselectAll()\" href=\"\">\n" +
    "                <span class=\"glyphicon glyphicon-remove\"></span> Unselect All\n" +
    "            </a>\n" +
    "        </li>\n" +
    "        <li ng-show=\"(vm.options.showSelectAll || vm.options.showUnselectAll)\" class=\"divider\">\n" +
    "        </li>\n" +
    "\n" +
    "        <li ng-if=\"vm.hasSelectedPageUp\" ng-class=\"{disabled: !vm.canSelectedPageUp}\">\n" +
    "            <a href=\"\" ng-click=\"vm.selectedPageUp(); $event.stopPropagation()\" class=\"text-center\">\n" +
    "                <span class=\"glyphicon glyphicon-chevron-up\"></span>\n" +
    "            </a>\n" +
    "        </li>\n" +
    "        <li role=\"presentation\" ng-repeat=\"item in vm.selectedItemsView\" class=\"active\">\n" +
    "            <a class=\"item-selected\" href=\"\" ng-click=\"vm.toggleItem(item); $event.stopPropagation()\">\n" +
    "                <span class=\"glyphicon glyphicon-remove\" ng-if=\"vm.options.selectionLimit !== 1\"></span> {{vm.getDisplay(item)}}\n" +
    "            </a>\n" +
    "        </li>\n" +
    "        <li ng-if=\"vm.hasSelectedPageDown\" ng-class=\"{disabled: !vm.canSelectedPageDown}\">\n" +
    "            <a href=\"\" ng-click=\"vm.selectedPageDown(); $event.stopPropagation()\" class=\"text-center\">\n" +
    "                <span class=\"glyphicon glyphicon-chevron-down\"></span>\n" +
    "            </a>\n" +
    "        </li>\n" +
    "        <li ng-show=\"vm.selectedItems.length > 0\" class=\"divider\"></li>\n" +
    "\n" +
    "        <li ng-show=\"vm.options.showSearch && vm.unselectedItems.length > 0\">\n" +
    "            <div class=\"dropdown-header\">\n" +
    "                <input type=\"text\" class=\"{{::vm.options.searchClass}}\" ng-model=\"vm.searchFilter\" placeholder=\"Search...\" ng-change=\"vm.update()\" />\n" +
    "            </div>\n" +
    "        </li>\n" +
    "        <li ng-show=\"vm.options.showSearch && vm.unselectedItems.length > 0\" class=\"divider\"></li>\n" +
    "        \n" +
    "        <li ng-if=\"vm.hasUnselectedPageUp\" ng-class=\"{disabled: !vm.canUnselectedPageUp}\">\n" +
    "            <a href=\"\" ng-click=\"vm.unselectedPageUp(); $event.stopPropagation()\" class=\"text-center\">\n" +
    "                <span class=\"glyphicon glyphicon-chevron-up\"></span>\n" +
    "            </a>\n" +
    "        </li>\n" +
    "        <li role=\"presentation\" ng-repeat=\"item in vm.unselectedItemsView\" ng-class=\"{disabled : !vm.canSelectItem}\">\n" +
    "            <a class=\"item-unselected\" href=\"\" ng-click=\"vm.toggleItem(item); $event.stopPropagation()\">\n" +
    "                {{vm.getDisplay(item)}}\n" +
    "            </a>\n" +
    "        </li>\n" +
    "        <li ng-if=\"vm.hasUnselectedPageDown\" ng-class=\"{disabled: !vm.canUnselectedPageDown}\">\n" +
    "            <a href=\"\" ng-click=\"vm.unselectedPageDown(); $event.stopPropagation()\" class=\"text-center\">\n" +
    "                <span class=\"glyphicon glyphicon-chevron-down\"></span>\n" +
    "            </a>\n" +
    "        </li>\n" +
    "\n" +
    "        <li class=\"divider\" ng-show=\"vm.options.selectionLimit > 1\"></li>\n" +
    "        <li role=\"presentation\" ng-show=\"vm.options.selectionLimit > 1\">\n" +
    "            <a>{{vm.selectedItems.length || 0}} / {{vm.options.selectionLimit}} selected</a>\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "</div>\n" +
    "<div ng-show=\"false\" ng-transclude></div>");
}]);
