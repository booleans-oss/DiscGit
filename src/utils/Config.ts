import Server from '../server';
import { ServerConfig, ConfigType } from '../server.d';
import { DEFAULT_CONFIG } from '../constants'
import fs from 'fs';
import { getPropertyValue, updatePropertyValue } from './util'
import path from 'path';
export default class Config {
    private _data: ServerConfig | undefined = undefined;

    registry():void {
        this._data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'discgit.config.json')) as unknown as string);
    }
    verify(app: Server): ServerConfig {
        this.registry();
        const MustHaveParams: Array<ConfigType> = ["port", "token", "secret", "owner"];
        for(let i = 0; i < MustHaveParams.length; i++) {
            const value = getPropertyValue(this._data, MustHaveParams[i] as never);
            if(!value) {
                app.logger.err(`Missing ${MustHaveParams[i]}`);
                updatePropertyValue(this._data, MustHaveParams[i] as never, getPropertyValue(DEFAULT_CONFIG, MustHaveParams[i]) as never);
            }
        }
        return this._data as ServerConfig;
    }
}