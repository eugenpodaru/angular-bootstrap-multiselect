angular.module('btorfs.multiselect.templates', ['multiselect.html']);

angular.module("multiselect.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("multiselect.html",
    "<div class=\"{{::containerClass}}\">\n" +
    "    <button type=\"button\" class=\"{{::toggleClass}}\" ng-click=\"toggleDropdown()\" ng-disabled=\"disabled\">\n" +
    "        {{getButtonText()}}&nbsp;<span class=\"caret\"></span>\n" +
    "    </button>\n" +
    "    <ul class=\"{{::dropdownClass}}\" ng-style=\"{display: open ? 'block' : 'none'}\">\n" +
    "\n" +
    "        <li ng-show=\"showSelectAll\">\n" +
    "            <a ng-click=\"selectAll()\" href=\"\">\n" +
    "                <span class=\"glyphicon glyphicon-ok\"></span> Select All\n" +
    "            </a>\n" +
    "        </li>\n" +
    "        <li ng-show=\"showUnselectAll\">\n" +
    "            <a ng-click=\"unselectAll()\" href=\"\">\n" +
    "                <span class=\"glyphicon glyphicon-remove\"></span> Unselect All\n" +
    "            </a>\n" +
    "        </li>\n" +
    "        <li ng-show=\"(showSelectAll || showUnselectAll)\" class=\"divider\">\n" +
    "        </li>\n" +
    "        \n" +
    "        <li ng-if=\"selectedOptions.length > displayLimit\" ng-class=\"{disabled: selectedDisplayIndex - displayLimit < 0}\">\n" +
    "            <a href=\"\" ng-click=\"selectedDisplayIndex = pageUp(selectedDisplayIndex); $event.stopPropagation()\" class=\"text-center\">\n" +
    "                <span class=\"glyphicon glyphicon-chevron-up\"></span>\n" +
    "            </a>\n" +
    "        </li>\n" +
    "        <li role=\"presentation\" ng-repeat=\"option in selectedOptions | limitTo : displayLimit : selectedDisplayIndex\" class=\"active\"\n" +
    "            ng-if=\"selectionLimit && selectionLimit > 1\">\n" +
    "            <a class=\"item-selected\" href=\"\" ng-click=\"toggleItem(option); $event.stopPropagation()\">\n" +
    "                <span class=\"glyphicon glyphicon-remove\"></span> {{getDisplay(option)}}\n" +
    "            </a>\n" +
    "        </li>\n" +
    "        <li ng-if=\"selectedOptions.length > displayLimit\" ng-class=\"{disabled: selectedDisplayIndex + displayLimit > selectedOptions.length}\">\n" +
    "            <a href=\"\" ng-click=\"selectedDisplayIndex = pageDown(selectedDisplayIndex, selectedOptions.length); $event.stopPropagation()\" class=\"text-center\">\n" +
    "                <span class=\"glyphicon glyphicon-chevron-down\"></span>\n" +
    "            </a>\n" +
    "        </li>\n" +
    "        <li ng-show=\"selectedOptions.length > 0\" class=\"divider\"></li>\n" +
    "\n" +
    "        <li ng-show=\"showSearch\">\n" +
    "            <div class=\"dropdown-header\">\n" +
    "                <input type=\"text\" class=\"form-control input-sm\" style=\"width: 100%;\" ng-model=\"searchFilter\" placeholder=\"Search...\" ng-change=\"updateOptions()\"\n" +
    "                />\n" +
    "            </div>\n" +
    "        </li>\n" +
    "\n" +
    "        <li ng-show=\"showSearch\" class=\"divider\"></li>\n" +
    "        <li ng-if=\"unselectedOptions.length > displayLimit\" ng-class=\"{disabled: unselectedDisplayIndex - displayLimit < 0}\">\n" +
    "            <a href=\"\" ng-click=\"unselectedDisplayIndex = pageUp(unselectedDisplayIndex); $event.stopPropagation()\" class=\"text-center\">\n" +
    "                <span class=\"glyphicon glyphicon-chevron-up\"></span>\n" +
    "            </a>\n" +
    "        </li>\n" +
    "        <li role=\"presentation\" ng-repeat=\"option in unselectedOptions | filter:search() | limitTo: displayLimit : unselectedDisplayIndex\"\n" +
    "            ng-if=\"!isSelected(option)\" ng-class=\"{disabled : selectionLimit && selectionLimit > 1 && selectedOptions.length >= selectionLimit}\">\n" +
    "            <a class=\"item-unselected\" href=\"\" ng-click=\"toggleItem(option); $event.stopPropagation()\">\n" +
    "                {{getDisplay(option)}}\n" +
    "            </a>\n" +
    "        </li>\n" +
    "        <li ng-if=\"unselectedOptions.length > displayLimit\" ng-class=\"{disabled: unselectedDisplayIndex + displayLimit > unselectedOptions.length}\">\n" +
    "            <a href=\"\" ng-click=\"unselectedDisplayIndex = pageDown(unselectedDisplayIndex, unselectedOptions.length); $event.stopPropagation()\" class=\"text-center\">\n" +
    "                <span class=\"glyphicon glyphicon-chevron-down\"></span>\n" +
    "            </a>\n" +
    "        </li>\n" +
    "\n" +
    "        <li class=\"divider\" ng-show=\"selectionLimit > 1\"></li>\n" +
    "        <li role=\"presentation\" ng-show=\"selectionLimit > 1\">\n" +
    "            <a>{{selectedOptions.length || 0}} / {{selectionLimit}} selected</a>\n" +
    "        </li>\n" +
    "\n" +
    "    </ul>\n" +
    "</div>");
}]);
