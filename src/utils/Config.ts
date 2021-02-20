import Server from '../server';
import { ServerConfig, ConfigType } from '../server.d';
import { DEFAULT_CONFIG } from '../constants'
import fs from 'fs';
import { getPropertyValue, updatePropertyValue, hasPropertyValue } from './util'
import path from 'path';
export default class Config {
    private _data: ServerConfig | undefined = undefined;

    registry():void {
        this._data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'discgit.config.json')) as unknown as string);
    }
    verify(app: Server): ServerConfig {
        this.registry();
        const ConfigFields: Array<ConfigType> = ["secret", "token", "repos", "port", "log"];
        for(let i = 0; i < ConfigFields.length; i++) {
            const value = getPropertyValue(this._data, ConfigFields[i] as never);
            if(!value) {
                if(!hasPropertyValue(DEFAULT_CONFIG, ConfigFields[i] as never)) {
                    throw `Missing mandatory value: ${ConfigFields[i]} in config file.`
                }
                updatePropertyValue(this._data, ConfigFields[i] as never, getPropertyValue(DEFAULT_CONFIG, ConfigFields[i] as never));
            }
        }
        return this._data as ServerConfig;
    }
}
