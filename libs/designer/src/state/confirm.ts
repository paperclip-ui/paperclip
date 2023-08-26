export enum ConfirmKind {
  DeleteFile,
}

export type BaseConfirmDetails<Kind extends ConfirmKind> = {
  kind: Kind;
};

export type DeleteFileConformDetails =
  BaseConfirmDetails<ConfirmKind.DeleteFile> & {
    filePath: string;
  };

export type ConfirmDetails = DeleteFileConformDetails;

export type Confirm = {
  title: string;
  okLabel: string;
  text: string;
  details: ConfirmDetails;
};

export const newDeleteFileConformation = (filePath: string): Confirm => ({
  details: { kind: ConfirmKind.DeleteFile, filePath },
  title: "Move file to trash",
  text: "Are you sure you want to move this file to trash?",
  okLabel: "Move file to trash",
});
