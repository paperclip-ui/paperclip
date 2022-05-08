import * as React from "react";
import { openProjectButtonClicked, createProjectButtonClicked, linkClicked } from "../../../actions";
import { ProjectPill } from "./view.pc";
import { StarterKitFormOptions } from "../../../starter-kits";
import { templates, createProjectFiles } from "tandem-starter-kits";
var Page;
(function (Page) {
    Page["START"] = "start";
    Page["CREATE_PROJECT"] = "createProject";
    Page["NEW_PROJECT_OPTIONS"] = "newProjectOptions";
})(Page || (Page = {}));
export default (Base) => class WelcomeController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = {
            page: Page.START,
            selectedTemplate: null,
            hoveringTemplate: null
        };
        this.onOpenProjectButtonClick = () => {
            this.props.dispatch(openProjectButtonClicked());
        };
        this.onCreateProjectButtonClick = () => {
            this.setState({ page: Page.CREATE_PROJECT });
        };
        this.onPillClick = (selectedTemplate) => {
            this.setState({ page: Page.NEW_PROJECT_OPTIONS, selectedTemplate });
        };
        this.onPillMouseOver = (hoveringTemplate) => {
            this.setState(Object.assign(Object.assign({}, this.state), { hoveringTemplate }));
        };
        this.onPillMouseLeave = () => {
            this.setState(Object.assign(Object.assign({}, this.state), { hoveringTemplate: null }));
        };
        this.onOptionsChange = (options) => {
            this.props.dispatch(createProjectButtonClicked(options.directory, createProjectFiles(this.state.selectedTemplate.id, options)));
        };
        this.onTutorialsButtonClick = () => {
            this.props.dispatch(linkClicked(`https://www.youtube.com/playlist?list=PLCNS_PVbhoSXOrjiJQP7ZjZJ4YHULnB2y`));
        };
    }
    render() {
        const { onOpenProjectButtonClick, onCreateProjectButtonClick, onPillClick, onOptionsChange, onPillMouseLeave, onTutorialsButtonClick, onPillMouseOver } = this;
        const { dispatch, selectedDirectory } = this.props;
        const { page, selectedTemplate, hoveringTemplate } = this.state;
        const options = templates.map(template => {
            return (React.createElement(ProjectPill, { onClick: () => onPillClick(template), onMouseOver: () => onPillMouseOver(template), onMouseLeave: () => onPillMouseLeave(), labelProps: { text: template.label }, icon: template.icon && React.createElement("img", { src: template.icon }) }));
        });
        return (React.createElement(Base, { variant: page, tutorialsButtonProps: { onClick: onTutorialsButtonClick }, openProjectButtonProps: { onClick: onOpenProjectButtonClick }, createProjectButtonProps: { onClick: onCreateProjectButtonClick }, options: options, projectDescriptionProps: {
                text: (hoveringTemplate && hoveringTemplate.description) || " "
            }, newProjectOptions: page === Page.NEW_PROJECT_OPTIONS ? (React.createElement(StarterKitFormOptions, { selectedDirectory: selectedDirectory, dispatch: dispatch, template: selectedTemplate, onChangeComplete: onOptionsChange })) : null }));
    }
};
//# sourceMappingURL=controller.js.map