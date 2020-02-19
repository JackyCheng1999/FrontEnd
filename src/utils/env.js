import { isDeveloping } from "./constants"

class ReactEnv {
  constructor() {
    const reactEnv = window.env
    this._baseURL = reactEnv.API_BASE_URL
    this._testingBaseURL = reactEnv.TESTING_BASE_URL
    this._auth0Domain = reactEnv.AUTH0_DOMAIN
    this._auth0ClientID = reactEnv.AUTH0_CLIENT_ID
  }

  get baseURL() {
    return isDeveloping ? 
           this._testingBaseURL : 
           this._baseURL
  }

  get auth0Domain() {
    return this._auth0Domain
  }

  get auth0ClientID() {
    return this._auth0ClientID
  }
}

export const env = new ReactEnv()