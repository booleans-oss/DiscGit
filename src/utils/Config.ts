
import { ServerConfig, ConfigType } from "../server.d";
import { DEFAULT_CONFIG } from "../constants";
import {
  Utils
} from "./";

/**
 * Config Manager
 * @class Config
 */
export default class ConfigManager {
  /**
   * Configuration data
   */
  _data: ServerConfig | undefined = undefined;

  /**
   * Parse the config file in order to fetch information
   * Set {@link this._data} to result config
   * @return {Promise<ServerConfig>} Return the new ServerConfig
   * @throws if no config file found
   */
  async registry(): Promise<ServerConfig> {
    const configPath = Utils.resolveConfigPath();
    const { default: configFile} = await import(configPath);
      if(!configFile) throw new Error(`No config file!`);
      this._data = configFile;
      this.verify();
      return this._data as ServerConfig;
  }

  /**
   * Check the original config file
   * If missing required property, throw error of the specific property
   * If missing non-required property, set it with {@link DEFAULT_CONFIG}
   * @param {ServerConfig} configObject - Actual Config
   * @returns {ServerConfig}
   * @throws if missing required field
   */
  verify(configObject: ServerConfig | undefined = this._data): ServerConfig {
    const ConfigFields: Array<[ConfigType, boolean]> = [[
      "secret", false],
      ["token", true],
      ["repos", true],
      ["port", false],
      ["log", false]
    ];
    for(let i = 0; i < ConfigFields.length; i++) {
      const value = Utils.getPropertyValue(configObject, ConfigFields[i][0] as never);
      if(!value) {
        if(ConfigFields[i][1] && !Utils.hasPropertyValue(configObject, ConfigFields[i][0] as never)) {
          throw new Error(`Missing mandatory value: ${ConfigFields[i][0]} in config file.`);
        }
        if(!ConfigFields[i][1]) {
          configObject = Utils.updatePropertyValue(configObject, ConfigFields[i][0] as never, DEFAULT_CONFIG[ConfigFields[i][0] as never]);
        }
      }
    }
    return configObject as ServerConfig;
  }
}
