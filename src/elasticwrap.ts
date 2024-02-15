/**
 * MIT License
 *
 * Copyright (c) 2024 Smart Interactive Transformations Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

import {Client} from '@elastic/elasticsearch';
import {Utils} from '@sitinc/utils';
import * as T from '@elastic/elasticsearch/lib/api/types';
import * as TB from '@elastic/elasticsearch/lib/api/typesWithBodyKey';

/**
 * Class for decorating Elastic API client instances with useful utility
 * operations.
 * 
 * @author Justin Randall
 * @version 0.0.1
 */
export class ElasticWrap {
    private _client: Client;
    private _cloudId: string;
    private _apiKey: string;
    private _appName: string;

    /**
     * Construct a new instance.
     * 
     * @param cloudId The elastic cloud ID.
     * @param apiKey  The elastic API key.
     * @param appName The elastic information app name.
     */
    constructor(
        cloudId: string,
        apiKey: string,
        appName: string='elasticwrap-app') {
      // Validate inputs.
      if (Utils.isNotSet(cloudId)) {
        throw new Error('cloudId is required');
      }

      if (Utils.isNotSet(apiKey)) {
        throw new Error('apiKey is required');
      }

      // Persist inputs to class.
      this._cloudId = cloudId;
      this._apiKey = apiKey;
      this._appName = appName;

      // Init the Elastic API client.
      this._client = new Client({
        cloud: {id: cloudId},
        auth: {apiKey: apiKey},
      })

      // Because Javascript...
      this.toJSON = this.toJSON.bind(this);
      this.addIndexTemplate = this.addIndexTemplate.bind(this);
      this.checkAndAddIndexTemplate = this.checkAndAddIndexTemplate.bind(this);
      this.getIndexTemplate = this.getIndexTemplate.bind(this);
      this.getIndexTemplates = this.getIndexTemplates.bind(this);
      this.getInfo = this.getInfo.bind(this);
      this.ingestPayload = this.ingestPayload.bind(this);
    }

    /**
     * Get the value.
     * @returns the value.
     */
    public get cloudId() {
      return this._cloudId;
    }

    /**
     * Set the value
     */
    public set cloudId(value) {
      this._cloudId = value;
    }

    /**
     * Get the value.
     * @returns the value.
     */
    public get apiKey() {
      return this._apiKey;
    }

    /**
     * Set the value
     */
    public set apiKey(value) {
      this._apiKey = value;
    }

    /**
     * Get the value.
     * @returns the value.
     */
    public get appName() {
      return this._appName;
    }

    /**
     * Set the value
     */
    public set appName(value) {
      this._appName = value;
    }

    /**
     * Get the value.
     * @returns the value.
     */
    public get client() {
      return this._client;
    }

    /**
     * Set the value
     */
    public set client(value) {
      this._client = value;
    }

    /**
     * Get the JSON representation.
     * @returns the JSON representation.
     */
    public toJSON(): Object {
      return {
        cloudId: this._cloudId,
        apiKey: 'XXXXXXXX-XXXXXXXX-XXXXXXXX', // this._apiKey,
        appName: this._appName,
      };
    }

    /**
     * Adds an Elastic index template.
     *
     * @param {T.IndicesPutIndexTemplateRequest | TB.IndicesPutIndexTemplateRequest} template The Elastic index template.
     */
    public async addIndexTemplate(
      template: T.IndicesPutIndexTemplateRequest | TB.IndicesPutIndexTemplateRequest
      ): Promise<any> {
      return this.client.indices.putIndexTemplate(template);
    }

    /**
     * Adds an Elastic index template if necessary.
     *
     * @param {string} name     The Elastic index template name.
     * @param {string} pattern  The Elastic index template pattern.
     * @param {T.IndicesPutIndexTemplateRequest | TB.IndicesPutIndexTemplateRequest} template   The Elastic index template instance.
     */
    public async checkAndAddIndexTemplate(
        name: string,
        pattern: string,
        template: T.IndicesPutIndexTemplateRequest | TB.IndicesPutIndexTemplateRequest,
      ): Promise<any> {
      if (Utils.isNotSet(name)) {
        throw new Error('name is required');
      }
      if (Utils.isNotSet(pattern)) {
        throw new Error('pattern is required');
      }
      if (template === undefined) {
        throw new Error('template is required');
      }
      const finalTemplate = {
        name: name,
        body: {
          index_patterns: [ pattern, ],
          template: template,
        },
      };
  
      // Check if Add is required.
      let isAddRequired = false;
      try {
        const checkResult =
          await this.getIndexTemplate(finalTemplate.name);
  
        if (Utils.isNotSet(checkResult.index_templates)) {
          isAddRequired = true;
        }
      } catch (err) {
        if (err instanceof Error) {
          if (err.message.includes('resource_not_found_exception')) {
            isAddRequired = true;
          } else {
            console.error('Failed to create the index template: '+err.stack);
          }
        }
      }
  
      // Add only if necessary.
      let addResult: any = {};
      if (isAddRequired) {
        addResult =
          await this.client.indices.putIndexTemplate(finalTemplate);
      }

      return addResult;
    }

    /**
     * Get an Elastic index template.
     *
     * @param {string} name The Elastic index template name.
     * @returns the Elastic index template.
     */
    public async getIndexTemplate(name: string): Promise<any> {
      let result: any = {};
      let isError = false;
      let errorMessage = '';
      await this.client.indices.getIndexTemplate({
            name: name,
          })
          .then((response: any) => {
            result = response;
          })
          .catch((err: any) => {
            isError = true;
            errorMessage = `Failed to get Elastic index template ${name}: `+err.stack;
          });
  
      if (isError) {
        throw new Error(errorMessage);
      }

      return result;
    }

    /**
     * Get the Elastic index templates.
     *
     * @returns the Elastic index templates.
     */
    public async getIndexTemplates(): Promise<any> {
      let result: any = {};
      let isError = false;
      let errorMessage = '';
      await this.client.indices.getIndexTemplate()
          .then((response: any) => {
            result = response;
          })
          .catch((err: any) => {
            isError = true;
            errorMessage = 'Failed to get Elastic index templates: '+err.stack;
          });
  
      if (isError) {
        throw new Error(errorMessage);
      }

      return result;
    }

    /**
     * Get the Elastic cluster info.
     * @returns the Elastic cluster info.
     */
    public async getInfo(): Promise<any>{
      let result = {};
      let isError = false;
      let errorMessage = '';
      await this.client.info()
        .then((response: any) => {
          result = response;
        })
        .catch((err: Error) => {
          isError = true;
          errorMessage = 'Failed to get Elastic cluster info: '+err.stack;
        });
  
      if (isError) {
        throw new Error(errorMessage);
      }
      return result;
    }

    /**
     * Ingest a payload.
     *
     * @param {string} indexName  The index name.
     * @param {any} payload       The payload.
     */
    public async ingestPayload(indexName: string, payload: any) {
      const entry: any = {index: indexName, body: {}};
      for (const param in payload) {
        if (Object.prototype.hasOwnProperty.call(payload, param)) {
          entry.body[param] = payload[param];
        }
      }
      this.client.index(entry);
    }
}