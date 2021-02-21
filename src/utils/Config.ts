import Server from "../server";
import { ServerConfig, ConfigType } from "../server.d";
import { DEFAULT_CONFIG, ConfigRootpath } from "../constants";
import fs from "fs";
import {
  Utils
} from "./";
import path from "path";

/**
 * Config Manager
 * @class Config
 */
export default class Config {
  /**
   * Configuration data
   * @private
   */
  private _data: ServerConfig | undefined = undefined;

  /**
   * Parse the config file in order to fetch information
   * @return {void} Set {@link this._data} to result config
   * @throw if no config file found
   */
  registry(): void {
    const ConfigFile = fs.readFileSync(ConfigRootpath);
    if(!ConfigFile) throw `No config file!`
    this._data = JSON.parse(ConfigFile as unknown as string);
  }

  /**
   * Check the original config file
   * If missing required property, throw error of the specific property
   * If missing non-required property, set it with {@link DEFAULT_CONFIG}
   * @param {Server} HTTP Server
   * @returns {ServerConfig}
   * @throws if missing required field
   */
  verify(app: Server): ServerConfig {
    this.registry();
    const ConfigFields: Array<ConfigType> = [
      "secret",
      "token",
      "repos",
      "port",
      "log",
    ];
    for (let i = 0; i < ConfigFields.length; i++) {
      const value = Utils.getPropertyValue(this._data, ConfigFields[i] as never);
      if (!value) {
        if (!Utils.hasPropertyValue(DEFAULT_CONFIG, ConfigFields[i] as never)) {
          throw `Missing mandatory value: ${ConfigFields[i]} in config file.`;
        }
        Utils.updatePropertyValue(
          this._data,
          ConfigFields[i] as never,
          Utils.getPropertyValue(DEFAULT_CONFIG, ConfigFields[i] as never)
        );
      }
    }
    return this._data as ServerConfig;
  }
}
