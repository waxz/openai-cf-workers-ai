# <h1 align="center">⚡️ OpenAI for Workers AI 🧠</h1>

### <p align="center">Simple, quick, and dirty implementation of OpenAI's API on Cloudflare's new Workers AI platform.</p>

## API
- [x] Openai api
- [x] Ollama api(New Update)

## Dev
<a href="https://studio.firebase.google.com/import?url=https%3A%2F%2Fgithub.com%2Fwaxz%2Fopenai-cf-workers-ai">
  <picture>
    <source
      media="(prefers-color-scheme: dark)"
      srcset="https://cdn.firebasestudio.dev/btn/open_dark_32.svg">
    <source
      media="(prefers-color-scheme: light)"
      srcset="https://cdn.firebasestudio.dev/btn/open_light_32.svg">
    <img
      height="32"
      alt="Open in Firebase Studio"
      src="https://cdn.firebasestudio.dev/btn/open_blue_32.svg">
  </picture>
</a>


## Why?

I think that in the near future, smaller, cheaper LLMs will be a legitimate competitor to OpenAI's GPT-3.5 and GPT-4 APIs. Most developers will not want to rewrite their entire codebase in order to use these up-and-coming models. I also think that Cloudflare Workers are a neat way to host AI and APIs, so I implemented the OpenAI API on Workers AI. This allows developers to use the OpenAI SDKs with the new LLMs without having to rewrite all of their code. This code, as is Workers AI, is not production ready but will be semi-regularly updated with new features as they roll out to Workers AI.

## Compatibility

Here are all the APIs I would like to implement or have implemented that are currently possible with the Workers AI platform.

* [x] Completions
* [x] Chat Completions
* [x] Audio Transcription
* [x] Embeddings
* [x] Audio Translation
  + Uses Whisper to transcribe, Llama 2 to identify the language, and m2m-100 to translate.
* [x] Images
  + [x] Image Generation
* [ ] Files
  + Needed for Assistants.
  + Use a D1 database for metadata, R2 for the actual file.
* [ ] Assistants
  + [ ] Assistants
    - Store assistants in a D1 database.
    - File support may be just limited to text files if there is any at all.
  + [ ] Threads
    - Use a D1 database to store threads. Relate them to an assistant.
  + [ ] Messages
    - Store messages in a D1 database. Relate them to a thread.
  + [ ] Runs
    - Use a queue to handle runs. Get messages from a D1 database, return results to database.

Here are the APIs that I would like to implement but are not currently possible with the Workers AI platform.

* [ ] Fine Tuning
* [ ] Images
  + [ ] Image Editing
  + [ ] Image Variants

Here are the APIs that could probably be implemented but I don't have the need to implement them.

* [ ] Moderation
  + Use Llama 2 to classify. May be difficult to prompt engineer.

## Deploying

First, clone the repository.

```bash
git clone https://github.com/chand1012/openai-cf-workers-ai
cd openai-cf-workers-ai
```

Then modify the `CLOUDFLARE_ACCOUNT_ID` variable in the `wrangler.toml` file to match your Cloudflare Account ID.

```toml
[vars]
CLOUDFLARE_ACCOUNT_ID = "c8c30db3dddc4ad31065d336368c7905" # replace with your own.
```

```bash
sed -i -e "s#CLOUDFLARE_ACCOUNT_ID.*#CLOUDFLARE_ACCOUNT_ID = \"$CLOUDFLARE_ACCOUNT_ID\"#" ./wrangler.toml
```

Next, install the dependencies and deploy to your account. If you are not logged in to wrangler, you will be prompted to log in.

```bash
yarn
yarn init-prod # only needs run the first time!!!
yarn deploy
```

Finally, set the `ACCESS_TOKEN` and `CLOUDFLARE_API_TOKEN` variables using wrangler. To get your Cloudflare API token, go to the [Cloudflare dashboard](https://dash.cloudflare.com/profile/api-tokens) and create a new token with the `Workers AI` template. `ACCESS_TOKEN` can be any string you want, but I recommend creating a random string with `openssl rand -hex 32` .

```bash
wrangler secret put ACCESS_TOKEN # put the access token here
wrangler secret put CLOUDFLARE_API_TOKEN # put the Cloudflare API token here
```

Now you're ready to use the API! You can find the URL in the output of the `yarn deploy` command.

## Development

Before Testing, copy `.dev.vars.example` to `.dev.vars` and populate the variables with the appropriate values. See [Deploying](#deploying) for more information.

As of 07/10/2023 testing locally does not work. However, you can test remotely using the following command:

```bash
yarn init-dev # only needs run the first time!!!
yarn dev
```

This will start a local server that will proxy requests to your deployed API. You can then use the API as you normally would, but with the local server's URL instead of the deployed URL.

## Usage

#### Openai api

See the [OpenAI API docs](https://platform.openai.com/docs/api-reference/introduction) for more information on the API. Here's an example from the OpenAI docs:

```bash
curl https://openai-cf.yourusername.workers.dev/llm/openai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{
    "model": "@cf/meta/llama-3.2-1b-instruct",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "Hello!"
      }
    ]
  }'
# {"id":"7612ca48-7a9b-40cd-b952-a5d76ff35ccb","model":"@cf/meta/llama-3.2-1b-instruct","created":1749784650,"object":"chat.completion","choices":[{"index":0,"message":{"role":"assistant","content":"Hello! It's nice to meet you. Is there something I can help you with or would you like to chat?"},"finish_reason":"stop"}],"usage":{"prompt_tokens":0,"completion_tokens":0,"total_tokens":0}}
```

If you want to use this with the OpenAI Python or JavaScript SDK, you can use the following code, replace the base URL with your own. For example:

```python
import openai
openai.api_base = 'https://openai-cf.yourusername.workers.dev/v1'

# rest of code
```

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
    baseURL: 'https://openai-cf.yourusername.workers.dev/v1',
    ...
});

// rest of code
```

#### Ollama api

```bash
curl https://user:<ACCESS_TOKEN>openai-cf.yourusername.workers.dev/llm/ollama/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "@cf/meta/llama-3.2-1b-instruct",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "Hello!"
      }
    ]
  }'

# {"created_at":"2025-06-13T03:13:20.859Z","model":"@cf/meta/llama-3.2-1b-instruct","message":{"role":"assistant","content":"Hello"},"stop":false}
# {"created_at":"2025-06-13T03:13:20.859Z","model":"@cf/meta/llama-3.2-1b-instruct","message":{"role":"assistant","content":"!"},"stop":false}
# {"created_at":"2025-06-13T03:13:20.859Z","model":"@cf/meta/llama-3.2-1b-instruct","message":{"role":"assistant","content":" How"},"stop":false}
# {"created_at":"2025-06-13T03:13:20.859Z","model":"@cf/meta/llama-3.2-1b-instruct","message":{"role":"assistant","content":" can"},"stop":false}
# {"created_at":"2025-06-13T03:13:20.859Z","model":"@cf/meta/llama-3.2-1b-instruct","message":{"role":"assistant","content":" I"},"stop":false}
# {"created_at":"2025-06-13T03:13:20.859Z","model":"@cf/meta/llama-3.2-1b-instruct","message":{"role":"assistant","content":" assist"},"stop":false}
# {"created_at":"2025-06-13T03:13:20.859Z","model":"@cf/meta/llama-3.2-1b-instruct","message":{"role":"assistant","content":" you"},"stop":false}
# {"created_at":"2025-06-13T03:13:20.859Z","model":"@cf/meta/llama-3.2-1b-instruct","message":{"role":"assistant","content":" today"},"stop":false}
# {"created_at":"2025-06-13T03:13:20.859Z","model":"@cf/meta/llama-3.2-1b-instruct","message":{"role":"assistant","content":"?"},"stop":false}
# {"created_at":"2025-06-13T03:13:20.859Z","model":"@cf/meta/llama-3.2-1b-instruct","message":{"role":"assistant","content":""},"stop":false}
# {"created_at":"2025-06-13T03:13:20.859Z","model":"@cf/meta/llama-3.2-1b-instruct","message":{"role":"assistant","content":""},"stop":false}
# {"created_at":"2025-06-13T03:13:20.859Z","model":"@cf/meta/llama-3.2-1b-instruct","message":{"role":"assistant","content":""},"stop":true,"done_reason":"stop"}
```

## Compromises

There were a few compromises I had to make in order to create the API.

The first is that the API does not count tokens, and will always return zero for the `usage` attribute in the return object. It will always return it for compatibility reasons, but until tokenization is added for the respective model, we cannot count tokens. Each model tokenizes differently, so we can't use tiktoken. It may be possible to tokenize using HuggingFace transformers, but that may take too long and not allow free users to deploy the API. More investigation is needed.

Stop tokens are also non-functional. There is no way to specify a stop reason or token with the current API. It will be ignored. Sometimes these stop tokens can leak through to the final response. This is a known issue and will be fixed in the future.

## License

Licensed under the [MIT License](LICENSE).
