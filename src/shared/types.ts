export interface IPackageJson {
  exports?: IPackageJsonExports;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export type IPackageJsonExports = {
  [key: string]: IPackageJsonExportsNode;
};
export type IPackageJsonExportsNode =
  string | null | Array<IPackageJsonExportsNode> | IPackageJsonExports;
