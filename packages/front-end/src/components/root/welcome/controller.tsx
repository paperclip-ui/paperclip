import * as React from "react";
import {
  openProjectButtonClicked,
  createProjectButtonClicked,
  linkClicked
} from "../../../actions";
import { BaseWelcomeProps, ProjectPill } from "./view.pc";
import { Dispatch } from "redux";
import { StarterKitFormOptions } from "../../../starter-kits";
import {
  ProjectTemplate,
  templates,
  createProjectFiles
} from "tandem-starter-kits";
import { Options as FormOptions } from "../../../starter-kits/form-controller";

export type Props = {
  selectedDirectory: string;
  dispatch: Dispatch<any>;
};

enum Page {
  START = "start",
  CREATE_PROJECT = "createProject",
  NEW_PROJECT_OPTIONS = "newProjectOptions"
}

type State = {
  page: Page;
  selectedTemplate?: ProjectTemplate;
  hoveringTemplate?: ProjectTemplate;
};

export default (Base: React.ComponentClass<BaseWelcomeProps>) =>
  class WelcomeController extends React.PureComponent<Props, State> {
    state = {
      page: Page.START,
      selectedTemplate: null,
      hoveringTemplate: null
    };

    onOpenProjectButtonClick = () => {
      this.props.dispatch(openProjectButtonClicked());
    };
    onCreateProjectButtonClick = () => {
      this.setState({ page: Page.CREATE_PROJECT });
    };

    onPillClick = (selectedTemplate: ProjectTemplate) => {
      this.setState({ page: Page.NEW_PROJECT_OPTIONS, selectedTemplate });
    };

    onPillMouseOver = (hoveringTemplate: ProjectTemplate) => {
      this.setState({ ...this.state, hoveringTemplate });
    };

    onPillMouseLeave = () => {
      this.setState({ ...this.state, hoveringTemplate: null });
    };

    onOptionsChange = (options: FormOptions) => {
      this.props.dispatch(
        createProjectButtonClicked(
          options.directory,
          createProjectFiles(this.state.selectedTemplate.id, options)
        )
      );
    };

    onTutorialsButtonClick = () => {
      this.props.dispatch(
        linkClicked(
          `https://www.youtube.com/playlist?list=PLCNS_PVbhoSXOrjiJQP7ZjZJ4YHULnB2y`
        )
      );
    };

    render() {
      const {
        onOpenProjectButtonClick,
        onCreateProjectButtonClick,
        onPillClick,
        onOptionsChange,
        onPillMouseLeave,
        onTutorialsButtonClick,
        onPillMouseOver
      } = this;
      const { dispatch, selectedDirectory } = this.props;
      const { page, selectedTemplate, hoveringTemplate } = this.state;
      const options = templates.map(template => {
        return (
          <ProjectPill
            onClick={() => onPillClick(template)}
            onMouseOver={() => onPillMouseOver(template)}
            onMouseLeave={() => onPillMouseLeave()}
            labelProps={{ text: template.label }}
            icon={template.icon && <img src={template.icon} />}
          />
        );
      });
      return (
        <Base
          variant={page}
          tutorialsButtonProps={{ onClick: onTutorialsButtonClick }}
          openProjectButtonProps={{ onClick: onOpenProjectButtonClick }}
          createProjectButtonProps={{ onClick: onCreateProjectButtonClick }}
          options={options}
          projectDescriptionProps={{
            text: (hoveringTemplate && hoveringTemplate.description) || " "
          }}
          newProjectOptions={
            page === Page.NEW_PROJECT_OPTIONS ? (
              <StarterKitFormOptions
                selectedDirectory={selectedDirectory}
                dispatch={dispatch}
                template={selectedTemplate}
                onChangeComplete={onOptionsChange}
              />
            ) : null
          }
        />
      );
    }
  };
