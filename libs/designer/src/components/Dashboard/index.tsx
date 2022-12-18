import React, { useCallback, useMemo, useState } from "react";
import * as styles from "@paperclip-ui/designer/src/styles/dashboard-page.pc";
import * as etcStyles from "@paperclip-ui/designer/src/styles/etc.pc";
import { TextInput } from "../TextInput";
import { useSelector } from "@paperclip-ui/common";
import { getResourceFilePaths } from "../../state";
import { useHistory } from "../../domains/history/react";

export const Dashboard = () => {
  const { onAddClick, onFilterChange, resourceFilePaths } = useDashboard();
  console.log(resourceFilePaths);
  return (
    <styles.Container
      controls={
        <>
          <TextInput placeholder="Filter..." onChange={onFilterChange} />
          <styles.AddFileButton onAddClick={onAddClick} />
        </>
      }
      items={resourceFilePaths.map((filePath) => (
        <Item key={filePath} filePath={filePath} />
      ))}
    />
  );
};

const useDashboard = () => {
  const [filter, setFilter] = useState<string>();
  const onAddClick = () => {};

  const onFilterChange = (value: string) => setFilter(value);
  const resourceFilePaths = useSelector(getResourceFilePaths);

  return { onAddClick, filter, onFilterChange, resourceFilePaths };
};

type ItemProps = {
  filePath: string;
};

const Item = (props: ItemProps) => {
  const { basename, onClick } = useItem(props);

  return <etcStyles.Item label={basename} onClick={onClick}></etcStyles.Item>;
};

const useItem = ({ filePath }: ItemProps) => {
  const history = useHistory();

  const { basename, dir } = useMemo(() => {
    const parts = filePath.split("/");
    const basename = parts.pop();
    return { basename, dir: parts.join("/") };
  }, [filePath]);

  const onClick = useCallback(() => {
    history.redirect(`/?file=${encodeURIComponent(filePath)}`);
  }, [history, filePath]);

  return { basename, dir, onClick };
};
