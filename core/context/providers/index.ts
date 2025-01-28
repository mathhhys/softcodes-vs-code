import { ContextProviderName } from "../../index.js";
import { BaseContextProvider } from "../index.js";
import CodeContextProvider from "./CodeContextProvider.js";
import SoftcodesProxyContextProvider from "./SoftcodesProxyContextProvider.js";
import CurrentFileContextProvider from "./CurrentFileContextProvider.js";
import DatabaseContextProvider from "./DatabaseContextProvider.js";
import DiffContextProvider from "./DiffContextProvider.js";
import DocsContextProvider from "./DocsContextProvider.js";
import FileTreeContextProvider from "./FileTreeContextProvider.js";
import FolderContextProvider from "./FolderContextProvider.js";
import GitHubIssuesContextProvider from "./GitHubIssuesContextProvider.js";
import GitLabMergeRequestContextProvider from "./GitLabMergeRequestContextProvider.js";
import GoogleContextProvider from "./GoogleContextProvider.js";
import HttpContextProvider from "./HttpContextProvider.js";
import JiraIssuesContextProvider from "./JiraIssuesContextProvider/index.js";
import LocalsProvider from "./LocalsProvider.js";
import OSContextProvider from "./OSContextProvider.js";
import OpenFilesContextProvider from "./OpenFilesContextProvider.js";
import PostgresContextProvider from "./PostgresContextProvider.js";
import ProblemsContextProvider from "./ProblemsContextProvider.js";
import SearchContextProvider from "./SearchContextProvider.js";
import TerminalContextProvider from "./TerminalContextProvider.js";
import URLContextProvider from "./URLContextProvider.js";


const Providers: (typeof BaseContextProvider)[] = [
  DiffContextProvider,
  FileTreeContextProvider,
  GitHubIssuesContextProvider,
  GoogleContextProvider,
  TerminalContextProvider,
  LocalsProvider,
  OpenFilesContextProvider,
  HttpContextProvider,
  SearchContextProvider,
  OSContextProvider,
  ProblemsContextProvider,
  FolderContextProvider,
  DocsContextProvider,
  GitLabMergeRequestContextProvider,
  JiraIssuesContextProvider,
  PostgresContextProvider,
  DatabaseContextProvider,
  CodeContextProvider,
  CurrentFileContextProvider,
  URLContextProvider,
  SoftcodesProxyContextProvider,
];

export function contextProviderClassFromName(
  name: ContextProviderName,
): typeof BaseContextProvider | undefined {
  return Providers.find((cls) => cls.description.title === name);
}
