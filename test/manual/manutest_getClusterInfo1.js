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

const {Client} = require('@elastic/elasticsearch');
// Create/populate the below file before use.
require('dotenv').config({path: './scratch/dev.env'});

const elasticCloudId = process.env.ELASTIC_CLOUD_ID;
const elasticApiKey = process.env.ELASTIC_API_KEY;

// Create the client.
const elasticClient = new Client({
  cloud: {id: elasticCloudId},
  auth: {apiKey: elasticApiKey},
});

/**
 * Get the cluser info.
 *
 * @return {Object} the cluster info.
 */
async function getClusterInfo() {
  try {
    let result = {};
    await elasticClient.info()
        .then((response) => {
          result = response;
        })
        .catch((err) => {
          console.error('Failed to Get the cluser info: '+err.stack);
        });

    console.log(`result: ${JSON.stringify(result)}`);

    return result;
  } catch (err) {
    console.error('Unhandled Error in Get the cluser info: '+err.stack);
  }
}

getClusterInfo();
