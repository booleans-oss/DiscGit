import ConfigManager from '../src/utils/Config'
import { DEFAULT_CONFIG } from "../src/constants";
const requiredProperties = ["token", "repos"] as unknown as TemplateStringsArray;
const optionalProperties = ["secret", "port", "log"] as unknown as TemplateStringsArray;

const ConfigHandler = new ConfigManager();
describe('Testing Missing Properties', () => { 
  for(let i = 0; i < requiredProperties.length; i++){
    const defaultConfig = {
      "port": 3000,
      "token": "TEST_TOKEN",
      "secret": "DiscGit",
      "log": true,
      "repos": []
    };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete defaultConfig[requiredProperties[i]];
    it(`it should error missing ${requiredProperties[i]}`, () => {
      expect(() => { ConfigHandler.verify(defaultConfig) }).toThrow(Error(`Missing mandatory value: ${requiredProperties[i]} in config file.`))
    });
  }
});

describe('Testing default values', () => {
  for(let i = 0; i < optionalProperties.length; i++) {
    const defaultConfig = {
      "port": 3000,
      "token": "TEST_TOKEN",
      "secret": "DiscGit",
      "log": true,
      "repos": []
    };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete defaultConfig[optionalProperties[i]];
    it(`it should return object with default value for ${optionalProperties[i]}`, () => {
      let updatedConfig = Object.assign({}, defaultConfig);
      updatedConfig = updatePropertyValue(updatedConfig, optionalProperties[i] as never, DEFAULT_CONFIG[optionalProperties[i] as never]);
      expect(ConfigHandler.verify(defaultConfig)).toStrictEqual(updatedConfig);
    })
  }
})


export function updatePropertyValue<T, K extends keyof T>(
  object: T,
  index: K,
  value: T[K]
): T {
  object[index] = value
  return object;
}