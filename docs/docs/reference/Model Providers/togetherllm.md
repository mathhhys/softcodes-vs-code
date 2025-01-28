# TogetherLLM

The Together API is a cloud platform for running large AI models. You can sign up [here](https://api.together.xyz/signup), copy your API key on the initial welcome screen, and then hit the play button on any model from the [Together Models list](https://docs.together.ai/docs/models-inference). Change `~/.softcodes/config.json` to look like this:

```json title="~/.softcodes/config.json"
{
  "models": [
    {
      "title": "Together CodeLlama",
      "provider": "together",
      "model": "codellama-13b",
      "apiKey": "YOUR_API_KEY"
    }
  ]
}
```
