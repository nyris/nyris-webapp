import NyrisAPI from "@nyris/nyris-api";
import {Epic} from "redux-observable";
import {AppAction, AppState} from "../types";
import {History} from "history";

export interface EpicsDependencies {
    api: NyrisAPI,
    history: History
}

export type EpicConf = Epic<AppAction, AppAction, AppState, EpicsDependencies>;

