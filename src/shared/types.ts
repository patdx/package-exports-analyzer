export interface IPackageJson {
  exports?: Record<string, any>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}
