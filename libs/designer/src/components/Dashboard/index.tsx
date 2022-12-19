import React, { useCallback, useMemo, useState } from "react";
import * as styles from "@paperclip-ui/designer/src/styles/dashboard-page.pc";
import * as etcStyles from "@paperclip-ui/designer/src/styles/etc.pc";
import { TextInput } from "../TextInput";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import { getGraph, getResourceFilePaths, getScreenshotUrls } from "../../state";
import { useHistory } from "../../domains/history/react";
import { routes } from "../../state/routes";
import { DesignerEvent } from "../../events";

export const Dashboard = () => {
  const {
    onAddClick,
    onFilterChange,
    dependencies,
    resourceFilePaths,
    filter,
    screenshotUrls,
  } = useDashboard();
  return (
    <styles.Container
      controls={
        <>
          <TextInput
            placeholder="Filter..."
            autoFocus
            onChange={onFilterChange}
          />
          <styles.AddFileButton onAddClick={onAddClick} />
        </>
      }
      items={dependencies
        .filter((dep) => {
          return filter
            .toLowerCase()
            .split(/\s+/g)
            .every((part) => dep.path.includes(part));
        })
        .map((dep) => (
          <Item
            key={dep.document.id}
            filePath={dep.path}
            screenshotUrl={screenshotUrls[dep.document.id]}
          />
        ))}
    />
  );
};

const useDashboard = () => {
  const [filter, setFilter] = useState<string>("");
  const dispatch = useDispatch<DesignerEvent>();
  const onAddClick = () => {
    const name = prompt(`Design file name`);
    if (!name) {
      return;
    }
    dispatch({ type: "ui/dashboardAddFileConfirmed", payload: { name } });
  };

  const onFilterChange = (value: string) => setFilter(value);
  const resourceFilePaths = useSelector(getResourceFilePaths);
  const screenshotUrls = useSelector(getScreenshotUrls);
  const graph = useSelector(getGraph);

  return {
    onAddClick,
    filter,
    onFilterChange,
    resourceFilePaths,
    screenshotUrls,
    dependencies: Object.values(graph.dependencies),
  };
};

type ItemProps = {
  filePath: string;
  screenshotUrl: string;
};

const Item = (props: ItemProps) => {
  const { screenshotUrl } = props;
  const { basename, onClick } = useItem(props);

  return (
    <etcStyles.Item
      label={basename}
      previewStyle={{ backgroundImage: `url(${screenshotUrl})` }}
      onClick={onClick}
    ></etcStyles.Item>
  );
};

const useItem = ({ filePath }: ItemProps) => {
  const history = useHistory();

  const { basename, dir } = useMemo(() => {
    const parts = filePath.split("/");
    const basename = parts.pop();
    return { basename, dir: parts.join("/") };
  }, [filePath]);

  const onClick = useCallback(() => {
    history.redirect(routes.editor(filePath));
  }, [history, filePath]);

  return { basename, dir, onClick };
};
